import io
import os
import tempfile
import unittest
from http.cookies import SimpleCookie
from types import SimpleNamespace
from unittest.mock import patch

import shlex
from owrx.command import Option, Argument
from owrx.storage import Storage
from owrx.security import confined_path, upload_path, local_redirect, cross_site_request
from owrx.controllers import Controller, BodySizeError
from owrx.controllers.assets import OwrxAssetsController, AprsSymbolsController
from owrx.controllers.session import SessionController, SessionStorage
from owrx.users import User, HashedPassword
from owrx.websocket import WebSocketConnection, OPCODE_TEXT_MESSAGE


def request(method="GET", headers=None, query=None):
    return SimpleNamespace(method=method, headers=headers or {}, query=query or {}, cookies=SimpleCookie(), local=True)


class SecurityTests(unittest.TestCase):
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
