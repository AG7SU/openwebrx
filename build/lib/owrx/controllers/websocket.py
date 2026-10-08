from . import Controller
from owrx.security import cross_site_request
from owrx.websocket import WebSocketConnection
from owrx.connection import HandshakeMessageHandler


class WebSocketController(Controller):
    def indexAction(self):
        if cross_site_request(self.request.headers):
            self.send_response("cross-site websocket forbidden", code=403)
            return
        conn = WebSocketConnection(self.handler, HandshakeMessageHandler())
        # enter read loop
        conn.handle()
