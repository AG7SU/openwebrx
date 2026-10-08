import asyncio
import json
import os
import socket
import sys
import threading
import time
import unittest
from urllib.error import HTTPError
from urllib.request import urlopen
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch

from owrx import mcp_server

try:
    from mcp import Client
    from mcp.client.stdio import StdioServerParameters, stdio_client
    from mcp.client.streamable_http import streamable_http_client
    import httpx2
    import uvicorn
except ImportError:  # The MCP SDK is intentionally optional for normal installs.
    Client = None


STATUS = {
    "receiver": {
        "name": "Test station",
        "admin": "private@example.invalid",
        "gps": {"lat": 48.0, "lon": 11.0},
        "location": "private location",
    },
    "version": "test-version",
    "max_clients": 12,
    "sdrs": [{
        "name": "RSPduo",
        "type": "sdrplay",
        "profiles": [{"name": "Tuner A", "center_freq": 145500000, "sample_rate": 2000000}],
    }],
}


class McpStatusTests(unittest.TestCase):
    def test_endpoint_validation_defaults_to_loopback_and_status_path(self):
        self.assertEqual(
            mcp_server._validated_status_url(None),
            "http://127.0.0.1:8073/status.json",
        )
        self.assertEqual(
            mcp_server._validated_status_url("https://radio.example:8443"),
            "https://radio.example:8443/status.json",
        )

    def test_endpoint_validation_rejects_unsafe_or_ambiguous_origins(self):
        for url in (
            "http://radio.example",
            "http://user:password@127.0.0.1:8073",
            "http://127.0.0.1:8073/status.json",
            "http://127.0.0.1:8073?token=secret",
            "file:///etc/passwd",
        ):
            with self.subTest(url=url), self.assertRaises(ValueError):
                mcp_server._validated_status_url(url)

    def test_status_fetch_does_not_follow_redirects(self):
        private_requests = []

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                if self.path == "/status.json":
                    self.send_response(302)
                    self.send_header("Location", "/private")
                    self.end_headers()
                else:
                    private_requests.append(self.path)
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(b"{}")

            def log_message(self, *_args):
                pass

        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            with self.assertRaises(RuntimeError):
                mcp_server.fetch_status(f"http://127.0.0.1:{server.server_port}")
            self.assertEqual(private_requests, [])
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=2)

    def test_status_fetch_rejects_non_json_and_oversized_payloads(self):
        response = {"content_type": "application/json", "body": b"{}", "content_length": None}

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                self.send_response(200)
                self.send_header("Content-Type", response["content_type"])
                if response["content_length"] is not None:
                    self.send_header("Content-Length", str(response["content_length"]))
                self.end_headers()
                try:
                    self.wfile.write(response["body"])
                except BrokenPipeError:
                    # fetch_status intentionally stops reading after its byte cap.
                    pass

            def log_message(self, *_args):
                pass

        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        url = f"http://127.0.0.1:{server.server_port}"
        try:
            response["content_type"] = "text/plain"
            with self.assertRaisesRegex(RuntimeError, "did not return JSON"):
                mcp_server.fetch_status(url)

            response.update({
                "content_type": "application/json",
                "body": b"{}",
                "content_length": mcp_server.MAX_STATUS_BYTES + 1,
            })
            with self.assertRaisesRegex(RuntimeError, "too large"):
                mcp_server.fetch_status(url)

            response.update({
                "body": b" " * (mcp_server.MAX_STATUS_BYTES + 1),
                "content_length": None,
            })
            with self.assertRaisesRegex(RuntimeError, "too large"):
                mcp_server.fetch_status(url)
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=2)

    def test_station_summary_omits_private_location_and_admin_fields(self):
        result = mcp_server.station_summary(STATUS)
        self.assertEqual(result, {
            "receiver_name": "Test station",
            "version": "test-version",
            "max_clients": 12,
            "active_receiver_count": 1,
        })
        self.assertNotIn("gps", result)
        self.assertNotIn("admin", result)

    def test_receiver_profile_projection_keeps_only_operational_fields(self):
        self.assertEqual(mcp_server.receiver_profiles(STATUS), [{
            "name": "RSPduo",
            "type": "sdrplay",
            "profiles": [{
                "name": "Tuner A",
                "center_frequency_hz": 145500000,
                "sample_rate_hz": 2000000,
            }],
        }])

    def test_http_auth_middleware_rejects_missing_or_wrong_bearer_token(self):
        async def exercise(token):
            calls = []
            responses = []

            async def app(_scope, _receive, _send):
                calls.append("called")

            middleware = mcp_server.BearerTokenMiddleware(app, "a" * 32)
            scope = {"type": "http", "headers": [] if token is None else [(b"authorization", token)]}

            async def receive():
                return {"type": "http.request", "body": b"", "more_body": False}

            async def send(message):
                responses.append(message)

            await middleware(scope, receive, send)
            return calls, responses

        calls, responses = asyncio.run(exercise(None))
        self.assertEqual(calls, [])
        self.assertEqual(responses[0]["status"], 401)
        self.assertIn((b"www-authenticate", b"Bearer"), responses[0]["headers"])
        calls, _ = asyncio.run(exercise(b"Bearer " + b"b" * 32))
        self.assertEqual(calls, [])
        calls, _ = asyncio.run(exercise(b"Bearer " + b"a" * 32))
        self.assertEqual(calls, ["called"])


@unittest.skipIf(Client is None, "install the optional MCP extra to run protocol tests")
class McpProtocolTests(unittest.IsolatedAsyncioTestCase):
    async def test_server_exposes_read_only_tools_and_returns_filtered_data(self):
        with patch.object(mcp_server, "fetch_status", return_value=STATUS):
            server = mcp_server.create_server()
            async with Client(server) as client:
                tools = await client.list_tools()
                self.assertEqual(
                    {tool.name for tool in tools.tools},
                    {"get_station_status", "list_receivers"},
                )
                station = await client.call_tool("get_station_status")
                self.assertFalse(station.is_error)
                station_result = json.loads(station.content[0].text)
                self.assertEqual(station_result["receiver_name"], "Test station")
                self.assertNotIn("gps", station_result)
                receivers = await client.call_tool("list_receivers")
                self.assertFalse(receivers.is_error)
                self.assertEqual(receivers.structured_content["result"][0]["name"], "RSPduo")

    async def test_stdio_server_reads_existing_status_endpoint(self):
        status_bytes = json.dumps(STATUS).encode("utf-8")

        class StatusHandler(BaseHTTPRequestHandler):
            def do_GET(self):
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(status_bytes)))
                self.end_headers()
                self.wfile.write(status_bytes)

            def log_message(self, *_args):
                pass

        endpoint = ThreadingHTTPServer(("127.0.0.1", 0), StatusHandler)
        thread = threading.Thread(target=endpoint.serve_forever, daemon=True)
        thread.start()
        try:
            parameters = StdioServerParameters(
                command=sys.executable,
                args=["-m", "owrx.mcp_server"],
                env={
                    "PATH": os.environ.get("PATH", ""),
                    "OPENWEBRX_MCP_BASE_URL": f"http://127.0.0.1:{endpoint.server_port}",
                },
                cwd=Path(__file__).resolve().parents[1],
            )
            async with Client(stdio_client(parameters)) as client:
                tools = await client.list_tools()
                self.assertEqual({tool.name for tool in tools.tools}, {"get_station_status", "list_receivers"})
                result = await client.call_tool("get_station_status")
                self.assertEqual(json.loads(result.content[0].text)["receiver_name"], "Test station")
        finally:
            endpoint.shutdown()
            endpoint.server_close()
            thread.join(timeout=2)

    def test_http_mode_refuses_to_start_without_a_strong_token(self):
        server = mcp_server.create_server()
        for token in (None, "short", "a" * 31, "a" * 32 + " "):
            with self.subTest(token="unset" if token is None else "invalid"), self.assertRaises(ValueError):
                mcp_server.create_http_app(server, token or "", "127.0.0.1", 8765)

    async def test_streamable_http_requires_bearer_and_serves_tools(self):
        server = mcp_server.create_server()
        with socket.socket() as listener:
            listener.bind(("127.0.0.1", 0))
            port = listener.getsockname()[1]
        token = "mcp-test-token-" + "a" * 32
        app = mcp_server.create_http_app(server, token, "127.0.0.1", port)
        http_server = uvicorn.Server(uvicorn.Config(
            app,
            host="127.0.0.1",
            port=port,
            log_level="critical",
            access_log=False,
        ))
        thread = threading.Thread(target=http_server.run, daemon=True)
        thread.start()
        try:
            deadline = time.monotonic() + 5
            while not http_server.started and time.monotonic() < deadline:
                await asyncio.sleep(0.02)
            self.assertTrue(http_server.started, "Streamable HTTP server failed to start")
            endpoint = f"http://127.0.0.1:{port}/mcp"
            with self.assertRaises(HTTPError) as unauthenticated:
                urlopen(endpoint, timeout=2)
            self.assertEqual(unauthenticated.exception.code, 401)

            async with httpx2.AsyncClient(headers={"Authorization": f"Bearer {token}"}) as http_client:
                async with Client(streamable_http_client(endpoint, http_client=http_client)) as client:
                    tools = await client.list_tools()
                    self.assertEqual(
                        {tool.name for tool in tools.tools},
                        {"get_station_status", "list_receivers"},
                    )
        finally:
            http_server.should_exit = True
            thread.join(timeout=3)


if __name__ == "__main__":
    unittest.main()
