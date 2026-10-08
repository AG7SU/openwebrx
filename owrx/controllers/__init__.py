from datetime import datetime, timezone


class BodySizeError(Exception):
    pass


class Controller(object):
    def __init__(self, handler, request, options):
        self.handler = handler
        self.request = request
        self.options = options
        self.responseCookies = None

    def send_response(
        self, content, code=200, content_type="text/html", last_modified: datetime = None, max_age=None, headers=None
    ):
        self.handler.send_response(code)
        if headers is None:
            headers = {}
        headers.setdefault("X-Content-Type-Options", "nosniff")
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
        if self.responseCookies is not None:
            self.handler.send_header("Set-Cookie", self.responseCookies.output(header=""))
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
        if self.responseCookies is not None:
            self.handler.send_header("Set-Cookie", self.responseCookies.output(header=""))
        self.handler.send_header("Location", location)
        self.handler.end_headers()

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
        body = self.handler.rfile.read(length)
        if len(body) != length:
            raise BodySizeError("incomplete HTTP body")
        return body

    def handle_request(self):
        action = "indexAction"
        if "action" in self.options:
            action = self.options["action"]
        from owrx.security import cross_site_request
        protected = self.request.method not in ("GET", "HEAD") or hasattr(self, "authentication")
        if protected and cross_site_request(self.request.headers):
            self.send_response("cross-site request forbidden", code=403)
            return
        try:
            getattr(self, action)()
        except BodySizeError:
            self.send_response("invalid or oversized request body", code=413)
