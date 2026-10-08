import io
import hashlib
import os
import tempfile
import unittest
from http.cookies import SimpleCookie
from types import SimpleNamespace
from unittest.mock import patch

import shlex
from owrx.client import ClientRegistry
from owrx.command import Option, Argument
from owrx.storage import Storage
from owrx.security import (
    confined_path,
    upload_path,
    local_redirect,
    cross_site_request,
    is_local_admin_address,
    resolve_request_identity,
)
from owrx.config.defaults import defaultConfig
from owrx.controllers import Controller, BodySizeError
from owrx.controllers.admin import AuthorizationMixin
from owrx.controllers.template import WebpageController, MapController
from owrx.controllers.assets import OwrxAssetsController, AprsSymbolsController
from owrx.controllers.session import SessionController, SessionStorage
from owrx.users import User, HashedPassword, Password, PasswordException
from owrx.websocket import WebSocketConnection, OPCODE_TEXT_MESSAGE


def request(method="GET", headers=None, query=None):
    return SimpleNamespace(method=method, headers=headers or {}, query=query or {}, cookies=SimpleCookie(), local=True)


class SecurityTests(unittest.TestCase):
    def test_authenticated_admin_access_still_requires_local_or_explicit_remote_access(self):
        user = SimpleNamespace(is_enabled=lambda: True, must_change_password=False)
        controller = SimpleNamespace(
            user=user,
            request=SimpleNamespace(local=False),
        )
        with patch("owrx.controllers.admin.Config.get", return_value={"allow_remote_config": False}):
            self.assertFalse(AuthorizationMixin.isAuthorized(controller))
        with patch("owrx.controllers.admin.Config.get", return_value={"allow_remote_config": True}):
            self.assertTrue(AuthorizationMixin.isAuthorized(controller))
        controller.request.local = True
        with patch("owrx.controllers.admin.Config.get", return_value={"allow_remote_config": False}):
            self.assertTrue(AuthorizationMixin.isAuthorized(controller))

    def test_password_hash_iteration_metadata_is_backward_compatible_and_bounded(self):
        current = HashedPassword("secret")
        data = current.toJson()
        self.assertEqual(data["iterations"], 100000)
        self.assertFalse(current.needs_rehash())

        legacy = dict(data)
        del legacy["iterations"]
        restored = Password.from_dict(legacy)
        self.assertEqual(restored.iterations, 100000)
        self.assertTrue(restored.is_valid("secret"))

        upgraded_cost = dict(data, iterations=99999)
        upgraded_cost["value"] = hashlib.pbkdf2_hmac(
            "sha256", b"secret", bytes.fromhex(data["salt"]), 99999
        ).hex()
        restored = Password.from_dict(upgraded_cost)
        self.assertTrue(restored.needs_rehash())
        self.assertTrue(restored.is_valid("secret"))

        for invalid in (0, -1, 10_000_001, True, "100000"):
            with self.subTest(iterations=invalid):
                with self.assertRaises(PasswordException):
                    Password.from_dict(dict(data, iterations=invalid))

    def test_command_arguments_are_literal(self):
        for value in ['device with spaces', '$(touch /tmp/should-not-exist)', 'x; echo injected', 'a"b', "a'b", 'x|cat']:
            self.assertEqual(shlex.split(Option("-d").map(value)), ["-d", value])
            self.assertEqual(shlex.split(Argument().map(value)), [value])
            self.assertEqual(shlex.split(Option("--device").setSpacer("=").map(value)), ["--device=" + value])

    def test_storage_delete_rejects_trailing_path(self):
        storage = Storage()
        with patch("owrx.storage.os.unlink") as unlink:
            storage.deleteFile("ABC-123-123.png/../../users.json")
            storage.deleteFile("ABC-123-123.png.html")
            unlink.assert_not_called()

    def test_redirects(self):
        for target in ["//evil.test", "/\\evil.test", "https://evil.test", "/\r\nX: y", "///evil.test", ""]:
            with self.subTest(target=target):
                self.assertEqual(local_redirect(target), "/settings")
        self.assertEqual(local_redirect("/settings?foo=bar"), "/settings?foo=bar")

    def test_confined_paths(self):
        with tempfile.TemporaryDirectory() as root, tempfile.TemporaryDirectory() as outside:
            os.symlink(outside, os.path.join(root, "link"))
            for name in ["../secret", outside + "/secret", "link/secret"]:
                with self.assertRaises(FileNotFoundError):
                    confined_path(root, name)
            self.assertEqual(confined_path(root, "a.png"), os.path.join(root, "a.png"))

    def test_upload_paths(self):
        name = "receiver_avatar-" + "a" * 32 + ".png"
        with tempfile.TemporaryDirectory() as root:
            self.assertEqual(upload_path(root, name), os.path.join(root, name))
            for invalid in ["../users.json", "receiver_avatar/../../users.json", name + ".html", "other-" + "a" * 32 + ".png"]:
                with self.assertRaises(FileNotFoundError):
                    upload_path(root, invalid)
            with self.assertRaises(FileNotFoundError):
                upload_path(root, name, "receiver_top_photo")

    def test_asset_and_upload_controllers_confine_paths(self):
        assets = OwrxAssetsController(None, request(query={"mapped": ["false"]}), {})
        with self.assertRaises(FileNotFoundError):
            assets.getFilePath("../../users.json")
        aprs = AprsSymbolsController.__new__(AprsSymbolsController)
        aprs.path = "/tmp/symbols/"
        with self.assertRaises(FileNotFoundError):
            aprs.getFilePath("../secret")

    def test_body_limits_before_read(self):
        for length in ["-1", "invalid", "4194305"]:
            stream = io.BytesIO(b"hello")
            controller = Controller(SimpleNamespace(headers={"Content-Length": length}, rfile=stream), request(), {})
            with self.assertRaises(BodySizeError):
                controller.get_body()
            self.assertEqual(stream.tell(), 0)
        controller = Controller(SimpleNamespace(headers={"Transfer-Encoding": "chunked"}, rfile=io.BytesIO()), request(), {})
        with self.assertRaises(BodySizeError):
            controller.get_body()

    def test_html_responses_get_per_response_nonce_csp(self):
        class Handler:
            def __init__(self):
                self.headers = {}
                self.wfile = io.BytesIO()

            def send_response(self, code):
                self.code = code

            def send_header(self, key, value):
                self.headers[key] = value

            def end_headers(self):
                pass

        handler = Handler()
        controller = Controller(handler, request(), {})
        nonce = controller.csp_nonce
        controller.send_response('<html></html>')
        self.assertRegex(nonce, r'^[A-Za-z0-9_-]+$')
        self.assertEqual(
            handler.headers['Content-Security-Policy'],
            "base-uri 'self'; object-src 'none'; script-src 'nonce-{}' 'strict-dynamic' 'self' https: blob:".format(nonce),
        )

        maps_handler = Handler()
        maps_controller = Controller(maps_handler, request(), {})
        maps_controller.csp_unsafe_eval = True
        maps_controller.send_response('<html></html>')
        self.assertIn("'unsafe-eval'", maps_handler.headers['Content-Security-Policy'])

        asset_handler = Handler()
        Controller(asset_handler, request(), {}).send_response('window.x = 1;', content_type='text/javascript')
        self.assertEqual(
            asset_handler.headers['Content-Security-Policy'],
            "base-uri 'self'; object-src 'none'",
        )

    def test_unsafe_eval_default_and_map_specific_csp_exception(self):
        self.assertFalse(Controller.csp_unsafe_eval)

        for map_type, expected in [("google", True), ("leaflet", False)]:
            controller = MapController.__new__(MapController)
            controller.map_type = lambda: map_type
            controller.template_variables = lambda: {}
            controller.serve_template = lambda template, **variables: None
            controller.indexAction()
            self.assertEqual(controller.csp_unsafe_eval, expected)

    def test_rendered_page_script_nonce_matches_response_csp(self):
        class Handler:
            def __init__(self):
                self.headers = {}
                self.wfile = io.BytesIO()

            def send_response(self, code):
                self.code = code

            def send_header(self, key, value):
                self.headers[key] = value

            def end_headers(self):
                pass

        class Details:
            def __dict__(self):
                return {
                    "receiver_name": "Test receiver",
                    "receiver_help": "",
                    "receiver_location": "",
                    "receiver_asl": 0,
                    "receiver_gps": "",
                    "locator": "AA00aa",
                    "photo_title": "",
                    "photo_desc": "",
                    "usage_policy_url": "policy",
                    "session_timeout": 0,
                    "keep_files": 0,
                }

        handler = Handler()
        req = SimpleNamespace(
            path="/", method="GET", headers={}, query={}, cookies=SimpleCookie(), local=True
        )
        controller = WebpageController(handler, req, {})
        with patch("owrx.controllers.template.ReceiverDetails", Details):
            variables = controller.template_variables()
        page = controller.render_template("index.html", **variables)
        self.assertIn(f'<script nonce="{controller.csp_nonce}" src="compiled/receiver.js">', page)
        controller.send_response(page)
        self.assertIn(
            f"'nonce-{controller.csp_nonce}' 'strict-dynamic'",
            handler.headers["Content-Security-Policy"],
        )
        self.assertNotIn("'unsafe-eval'", handler.headers["Content-Security-Policy"])

    def test_body_valid_missing_and_truncated(self):
        for headers, body, expected in [({}, b"", b""), ({"Content-Length": "3"}, b"abc", b"abc")]:
            c = Controller(SimpleNamespace(headers=headers, rfile=io.BytesIO(body)), request(), {})
            self.assertEqual(c.get_body(), expected)
        c = Controller(SimpleNamespace(headers={"Content-Length": "3"}, rfile=io.BytesIO(b"a")), request(), {})
        with self.assertRaises(BodySizeError):
            c.get_body()

    def test_cross_site_checks(self):
        for headers in [{"Sec-Fetch-Site": "cross-site"}, {"Origin": "null"}, {"Host": "radio.test", "Origin": "https://evil.test"}]:
            self.assertTrue(cross_site_request(headers))
        self.assertFalse(cross_site_request({"Host": "radio.test", "Origin": "https://radio.test"}))

    def test_client_ip_uses_only_the_trusted_forwarded_chain(self):
        registry = ClientRegistry.__new__(ClientRegistry)
        trusted_proxy = SimpleNamespace(
            client_address=("10.0.0.2", 8080),
            headers={"X-Forwarded-For": "198.51.100.9"},
        )
        untrusted_peer = SimpleNamespace(
            client_address=("198.51.100.7", 8080),
            headers={"X-Forwarded-For": "10.0.0.1"},
        )
        malformed_chain = SimpleNamespace(
            client_address=("10.0.0.2", 8080),
            headers={"X-Forwarded-For": "not-an-ip"},
        )
        with patch.dict(os.environ, {"OWRX_TRUSTED_PROXIES": "10.0.0.2/32"}):
            self.assertEqual(registry.getIp(trusted_proxy), "198.51.100.9")
            self.assertEqual(registry.getIp(untrusted_peer), "198.51.100.7")
            self.assertEqual(registry.getIp(malformed_chain), "10.0.0.2")

    def test_local_admin_networks_include_explicit_vpn_cidrs(self):
        with patch.dict(os.environ, {"OWRX_ADMIN_NETWORKS": "100.64.0.0/10"}):
            self.assertTrue(is_local_admin_address("192.168.1.20"))
            self.assertTrue(is_local_admin_address("100.100.1.20"))
            self.assertFalse(is_local_admin_address("8.8.8.8"))
            self.assertFalse(is_local_admin_address("198.51.100.20"))
        with patch.dict(os.environ, {"OWRX_ADMIN_NETWORKS": ""}):
            self.assertFalse(is_local_admin_address("100.100.1.20"))

    def test_request_identity_requires_trusted_proxy_for_forwarded_admin_ip(self):
        with patch.dict(os.environ, {
            "OWRX_TRUSTED_PROXIES": "10.0.0.2/32",
            "OWRX_ADMIN_NETWORKS": "100.64.0.0/10",
        }):
            self.assertEqual(
                resolve_request_identity("10.0.0.2", "8.8.8.8"),
                ("8.8.8.8", False),
            )
            self.assertEqual(
                resolve_request_identity("10.0.0.2", "100.100.1.20"),
                ("100.100.1.20", True),
            )
            self.assertEqual(
                resolve_request_identity("10.0.0.2", "invalid"),
                (None, False),
            )
            self.assertEqual(
                resolve_request_identity("8.8.8.8", "192.168.1.20"),
                ("8.8.8.8", False),
            )
        self.assertFalse(defaultConfig["allow_remote_config"])

    def test_public_login_is_denied_when_remote_configuration_is_disabled(self):
        with patch("owrx.controllers.session.Config.get", return_value={"allow_remote_config": False}):
            for method, action in (("GET", "loginAction"), ("POST", "processLoginAction")):
                req = request(method)
                req.local = False
                controller = SessionController(None, req, {})
                responses = []
                controller.send_response = lambda body, code=200: responses.append((body, code))
                getattr(controller, action)()
                self.assertEqual(responses, [("access forbidden", 403)])

    def test_cross_site_dispatch_blocks_mutation_but_allows_public_get(self):
        c = Controller(None, request("POST", {"Sec-Fetch-Site": "cross-site"}), {})
        c.indexAction = lambda: self.fail("action executed")
        c.send_response = lambda content, code: self.assertEqual(code, 403)
        c.handle_request()
        c = Controller(None, request("GET", {"Sec-Fetch-Site": "cross-site"}), {})
        called = []
        c.indexAction = lambda: called.append(True)
        c.handle_request()
        self.assertEqual(called, [True])

    def test_login_cookie_and_external_redirect(self):
        user = User("admin", True, HashedPassword("secret"))
        handler = SimpleNamespace(headers={"Content-Length": "26"}, rfile=io.BytesIO(b"user=admin&password=secret"))
        handler.headers["Content-Length"] = str(len(handler.rfile.getvalue()))
        c = SessionController(handler, request("POST", query={"ref": ["//evil.test"]}), {})
        targets = []
        c.send_redirect = targets.append
        with patch("owrx.controllers.session.UserList.getSharedInstance", return_value={"admin": user}):
            c.processLoginAction()
        self.assertEqual(targets, ["/settings"])
        cookie = c.responseCookies["owrx-session"]
        self.assertTrue(cookie["httponly"])
        self.assertEqual(cookie["samesite"], "Strict")
        self.assertEqual(cookie["path"], "/")

    def test_login_rehashes_password_below_current_cost(self):
        old = HashedPassword("secret")
        data = old.toJson()
        data["iterations"] = 50000
        data["value"] = hashlib.pbkdf2_hmac(
            "sha256", b"secret", bytes.fromhex(data["salt"]), data["iterations"]
        ).hex()
        user = User("admin", True, HashedPassword(data))

        class FakeUserList(dict):
            def __init__(self, *args, **kwargs):
                super().__init__(*args, **kwargs)
                self.stores = 0

            def store(self):
                self.stores += 1

        userlist = FakeUserList(admin=user)
        body = b"user=admin&password=secret"
        handler = SimpleNamespace(
            headers={"Content-Length": str(len(body))}, rfile=io.BytesIO(body)
        )
        c = SessionController(handler, request("POST"), {})
        c.send_redirect = lambda target: None
        with patch("owrx.controllers.session.UserList.getSharedInstance", return_value=userlist), \
                patch("owrx.controllers.session.SessionStorage.getSharedInstance", return_value=SessionStorage()):
            c.processLoginAction()

        self.assertEqual(user.password.iterations, 100000)
        self.assertFalse(user.password.needs_rehash())
        self.assertEqual(userlist.stores, 1)

    def test_logout_revokes_session(self):
        storage = SessionStorage()
        key = storage.startSession({"user": "admin"})
        req = request()
        req.cookies["owrx-session"] = key
        c = SessionController(None, req, {})
        c.send_redirect = lambda target: self.assertEqual(target, "/")
        with patch("owrx.controllers.session.SessionStorage.getSharedInstance", return_value=storage):
            c.logoutAction()
        self.assertIsNone(storage.getSession(key))
        self.assertEqual(c.responseCookies["owrx-session"]["max-age"], 0)

    def test_websocket_utf8_length(self):
        c = WebSocketConnection.__new__(WebSocketConnection)
        sent = []
        c._sendBytes = sent.append
        c.send("é")
        self.assertEqual(sent[0], bytes([0x81, 2]) + "é".encode())

    def test_websocket_valid_masked_64bit_frame(self):
        payload = b"hello"
        mask = b"abcd"
        frame = bytes([0x81, 0xff]) + len(payload).to_bytes(8, "big") + mask
        frame += bytes(value ^ mask[i % 4] for i, value in enumerate(payload))
        c = WebSocketConnection.__new__(WebSocketConnection)
        c.handler = SimpleNamespace(rfile=io.BytesIO(frame))
        c.interruptPipeRecv = SimpleNamespace(recv=lambda: (_ for _ in ()).throw(EOFError()), close=lambda: None)
        c.interruptPipeSend = SimpleNamespace(close=lambda: None)
        c.resetPing = lambda: None
        c.socketError = False
        received = []
        def receive(connection, message):
            received.append(message)
            connection.open = False
        c.messageHandler = SimpleNamespace(handleTextMessage=receive)
        with patch("owrx.websocket.select.select", return_value=([c.handler.rfile], [], [])):
            c.read_loop()
        self.assertEqual(received, ["hello"])
        self.assertFalse(c.socketError)

    def test_websocket_invalid_frames_and_large_lengths(self):
        # Only the advertised header is supplied: oversized payloads must be rejected before reading them.
        for frame in [b"\x81\x01", b"\x81\xff" + (2 ** 40).to_bytes(8, "big"), b"\x89\xfe\x00\x7e", b"\x01\x80", b"\x81\x81abcd\x9e"]:
            c = WebSocketConnection.__new__(WebSocketConnection)
            c.handler = SimpleNamespace(rfile=io.BytesIO(frame))
            c.interruptPipeRecv = SimpleNamespace(recv=lambda: (_ for _ in ()).throw(EOFError()), close=lambda: None)
            c.interruptPipeSend = SimpleNamespace(close=lambda: None)
            c.resetPing = lambda: None
            c.socketError = False
            c.messageHandler = SimpleNamespace(handleTextMessage=lambda *args: self.fail("invalid frame delivered"))
            with patch("owrx.websocket.select.select", return_value=([c.handler.rfile], [], [])):
                c.read_loop()
            self.assertTrue(c.socketError)


if __name__ == "__main__":
    unittest.main()
