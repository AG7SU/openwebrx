from datetime import datetime, timezone
import hmac
import secrets
from urllib.parse import parse_qs


class BodySizeError(Exception):
    pass


class Controller(object):
    csp_unsafe_eval = False

    def __init__(self, handler, request, options):
        self.handler = handler
        self.request = request
        self.options = options
        self.responseCookies = None
        self._request_body = None
        self.csp_nonce = secrets.token_urlsafe(18)

    def send_response(
        self, content, code=200, content_type="text/html", last_modified: datetime = None, max_age=None, headers=None
    ):
        self.handler.send_response(code)
        if headers is None:
            headers = {}
        headers.setdefault("X-Content-Type-Options", "nosniff")
        headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        if content_type == "text/html":
            unsafe_eval = " 'unsafe-eval'" if self.csp_unsafe_eval else ""
            csp = (
                "base-uri 'self'; object-src 'none'; "
                "script-src 'nonce-{0}' 'strict-dynamic' 'self' https:{1} blob:"
            ).format(self.csp_nonce, unsafe_eval)
        else:
            csp = "base-uri 'self'; object-src 'none'"
        headers.setdefault("Content-Security-Policy", csp)
        if content_type is not None:
            headers["Content-Type"] = content_type
            if content_type.startswith("text/"):
                headers["Content-Type"] += "; charset=utf-8"
        if last_modified is not None:
            headers["Last-Modified"] = last_modified.astimezone(tz=timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT")
        if max_age is not None:
            headers["Cache-Control"] = "max-age={0}".format(max_age)
        for key, value in headers.items():
            self.handler.send_header(key, value)
        self._send_response_cookies()
        self.handler.end_headers()
        if type(content) == str:
            content = content.encode()
        while len(content):
            try:
                w = self.handler.wfile.write(content)
                content = content[w:]
            except BrokenPipeError:
                break

    def send_redirect(self, location, code=303):
        self.handler.send_response(code)
        self._send_response_cookies()
        self.handler.send_header("Location", location)
        self.handler.end_headers()

    def _send_response_cookies(self):
        if self.responseCookies is not None:
            for cookie in self.responseCookies.values():
                self.handler.send_header("Set-Cookie", cookie.OutputString())

    def set_response_cookies(self, cookies):
        self.responseCookies = cookies

    def get_body(self, max_size=4 * 1024 * 1024):
        if self.handler.headers.get("Transfer-Encoding"):
            raise BodySizeError("unsupported transfer encoding")
        try:
            length = int(self.handler.headers.get("Content-Length", "0"))
        except ValueError:
            raise BodySizeError("invalid content length")
        if length < 0 or length > max_size:
            raise BodySizeError("HTTP body exceeds maximum allowed size")
        if self._request_body is None:
            body = self.handler.rfile.read(length)
            if len(body) != length:
                raise BodySizeError("incomplete HTTP body")
            self._request_body = body
        if len(self._request_body) > max_size:
            raise BodySizeError("HTTP body exceeds maximum allowed size")
        return self._request_body

    def get_csrf_token(self):
        session_cookie = self.request.cookies.get("owrx-session")
        if session_cookie is None:
            return None
        from owrx.controllers.session import SessionStorage
        return SessionStorage.getSharedInstance().getCsrfToken(session_cookie.value)

    def has_valid_csrf_token(self, login_action=False):
        expected = self.get_csrf_token()
        if expected is None and login_action:
            login_cookie = self.request.cookies.get("owrx-login-csrf")
            expected = login_cookie.value if login_cookie is not None else None
        if expected is None:
            return False
        supplied = self.request.headers.get("X-CSRF-Token")
        if supplied is None:
            content_type = self.request.headers.get("Content-Type", "").split(";", 1)[0].strip().lower()
            if content_type == "application/x-www-form-urlencoded":
                try:
                    body = self.get_body().decode("utf-8")
                    supplied = parse_qs(body, keep_blank_values=True).get("csrf_token", [None])[0]
                except (UnicodeDecodeError, BodySizeError):
                    return False
        return isinstance(supplied, str) and hmac.compare_digest(expected, supplied)

    def handle_request(self):
        action = "indexAction"
        if "action" in self.options:
            action = self.options["action"]
        from owrx.security import cross_site_request
        protected = self.request.method not in ("GET", "HEAD") or hasattr(self, "authentication")
        if protected and cross_site_request(self.request.headers):
            self.send_response("cross-site request forbidden", code=403)
            return
        if self.request.method in ("POST", "PUT", "PATCH", "DELETE"):
            if not self.has_valid_csrf_token(action == "processLoginAction"):
                self.send_response("invalid or missing CSRF token", code=403)
                return
        try:
            getattr(self, action)()
        except BodySizeError:
            self.send_response("invalid or oversized request body", code=413)
