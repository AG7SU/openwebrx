"""Optional, read-only MCP tools for an OpenWebRX status endpoint.

This process never opens SDR hardware or changes receiver configuration. It
reads the public status JSON from an already-running OpenWebRX instance.
"""

import ipaddress
import argparse
import json
import os
import secrets
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener


DEFAULT_BASE_URL = "http://127.0.0.1:8073"
STATUS_PATH = "/status.json"
MAX_STATUS_BYTES = 1024 * 1024
REQUEST_TIMEOUT_SECONDS = 4
DEFAULT_MCP_HOST = "127.0.0.1"
DEFAULT_MCP_PORT = 8765


def _validated_status_url(base_url=None):
    base_url = base_url or os.environ.get("OPENWEBRX_MCP_BASE_URL", DEFAULT_BASE_URL)
    try:
        parsed = urlsplit(base_url)
        port = parsed.port
    except (TypeError, ValueError) as error:
        raise ValueError("OPENWEBRX_MCP_BASE_URL must be a valid HTTP(S) origin") from error

    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        raise ValueError("OPENWEBRX_MCP_BASE_URL must be a valid HTTP(S) origin")
    if parsed.username is not None or parsed.password is not None:
        raise ValueError("Credentials must not be embedded in OPENWEBRX_MCP_BASE_URL")
    if parsed.path not in ("", "/") or parsed.query or parsed.fragment:
        raise ValueError("OPENWEBRX_MCP_BASE_URL must contain only an origin, without path or query")

    hostname = parsed.hostname.lower()
    is_loopback = hostname == "localhost"
    try:
        is_loopback = is_loopback or ipaddress.ip_address(hostname).is_loopback
    except ValueError:
        pass
    if parsed.scheme != "https" and not is_loopback:
        raise ValueError("Non-loopback OpenWebRX endpoints require HTTPS")

    authority = hostname if port is None else f"{hostname}:{port}"
    if ":" in hostname and not hostname.startswith("["):
        authority = f"[{hostname}]" if port is None else f"[{hostname}]:{port}"
    return f"{parsed.scheme}://{authority}{STATUS_PATH}"


class _NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, message, headers, new_url):
        return None


def fetch_status(base_url=None):
    """Fetch bounded status JSON without following redirects."""
    status_url = _validated_status_url(base_url)
    request = Request(status_url, headers={"Accept": "application/json"})
    opener = build_opener(_NoRedirect())
    try:
        with opener.open(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
            content_type = response.headers.get_content_type()
            if content_type != "application/json":
                raise RuntimeError("OpenWebRX status endpoint did not return JSON")
            content_length = response.headers.get("Content-Length")
            if content_length and int(content_length) > MAX_STATUS_BYTES:
                raise RuntimeError("OpenWebRX status response is too large")
            payload = response.read(MAX_STATUS_BYTES + 1)
    except (HTTPError, URLError, TimeoutError, OSError) as error:
        raise RuntimeError("Could not read the OpenWebRX status endpoint") from error

    if len(payload) > MAX_STATUS_BYTES:
        raise RuntimeError("OpenWebRX status response is too large")
    try:
        status = json.loads(payload)
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise RuntimeError("OpenWebRX returned invalid status JSON") from error
    if not isinstance(status, dict):
        raise RuntimeError("OpenWebRX returned an unexpected status document")
    return status


def station_summary(status):
    """Return a deliberately small station summary without location/admin data."""
    receiver = status.get("receiver", {})
    if not isinstance(receiver, dict):
        receiver = {}
    return {
        "receiver_name": str(receiver.get("name", "")),
        "version": str(status.get("version", "")),
        "max_clients": status.get("max_clients"),
        "active_receiver_count": len(status.get("sdrs", [])) if isinstance(status.get("sdrs", []), list) else 0,
    }


def receiver_profiles(status):
    """Return active source/profile metadata, excluding sensitive station fields."""
    receivers = status.get("sdrs", [])
    if not isinstance(receivers, list):
        return []

    result = []
    for receiver in receivers:
        if not isinstance(receiver, dict):
            continue
        profiles = receiver.get("profiles", [])
        clean_profiles = []
        if isinstance(profiles, list):
            for profile in profiles:
                if not isinstance(profile, dict):
                    continue
                clean_profiles.append({
                    "name": str(profile.get("name", "")),
                    "center_frequency_hz": profile.get("center_freq"),
                    "sample_rate_hz": profile.get("sample_rate"),
                })
        result.append({
            "name": str(receiver.get("name", "")),
            "type": str(receiver.get("type", "")),
            "profiles": clean_profiles,
        })
    return result


def create_server():
    """Build the optional MCP server lazily so base installs need no MCP SDK."""
    try:
        from mcp.server import MCPServer
    except ImportError as error:
        raise RuntimeError("Install OpenWebRX with the 'mcp' extra to run openwebrx-mcp") from error

    from mcp.server.mcpserver.exceptions import ToolError
    from owrx.version import openwebrx_version

    server = MCPServer("OpenWebRX", version=openwebrx_version, log_level="WARNING")

    @server.tool()
    def get_station_status() -> dict:
        """Read public station name, OpenWebRX version, client limit, and source count."""
        try:
            return station_summary(fetch_status())
        except (RuntimeError, ValueError) as error:
            raise ToolError(str(error)) from error

    @server.tool()
    def list_receivers() -> list[dict]:
        """List active SDR sources and their configured profile frequency/sample rates."""
        try:
            return receiver_profiles(fetch_status())
        except (RuntimeError, ValueError) as error:
            raise ToolError(str(error)) from error

    return server


class BearerTokenMiddleware:
    """Require a configured shared bearer token before parsing MCP requests."""

    def __init__(self, app, token):
        self.app = app
        self.expected = f"Bearer {token}".encode("ascii")

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            supplied = next(
                (value for key, value in scope.get("headers", []) if key.lower() == b"authorization"),
                b"",
            )
            if not secrets.compare_digest(supplied, self.expected):
                body = b'{"error":"unauthorized"}'
                await send({
                    "type": "http.response.start",
                    "status": 401,
                    "headers": [
                        (b"content-type", b"application/json"),
                        (b"content-length", str(len(body)).encode("ascii")),
                        (b"www-authenticate", b"Bearer"),
                        (b"cache-control", b"no-store"),
                    ],
                })
                await send({"type": "http.response.body", "body": body})
                return
        await self.app(scope, receive, send)


def create_http_app(server, token, host, port, allowed_hosts=None, allowed_origins=None):
    """Build an authenticated Streamable HTTP app with DNS-rebinding checks."""
    from mcp.server.transport_security import TransportSecuritySettings

    if (
        not token
        or len(token) < 32
        or len(token) > 512
        or not token.isascii()
        or any(character.isspace() or not character.isprintable() for character in token)
    ):
        raise ValueError("OPENWEBRX_MCP_TOKEN must be 32 to 512 printable ASCII characters without spaces")
    if not 1 <= port <= 65535:
        raise ValueError("MCP port must be between 1 and 65535")

    default_hosts = [f"127.0.0.1:{port}", f"localhost:{port}", f"[::1]:{port}"]
    for address in ("127.0.0.1", "::1", "localhost"):
        try:
            if ipaddress.ip_address(host).is_loopback and address == host:
                default_hosts.append(f"{address}:{port}")
        except ValueError:
            pass
    settings = TransportSecuritySettings(
        enable_dns_rebinding_protection=True,
        allowed_hosts=allowed_hosts or default_hosts,
        allowed_origins=allowed_origins or [],
    )
    app = server.streamable_http_app(
        streamable_http_path="/mcp",
        json_response=True,
        stateless_http=True,
        transport_security=settings,
        host=host,
    )
    app.add_middleware(BearerTokenMiddleware, token=token)
    return app


def main(argv=None):
    parser = argparse.ArgumentParser(description="OpenWebRX read-only MCP server")
    parser.add_argument("--transport", choices=("stdio", "streamable-http"), default="stdio")
    parser.add_argument("--host", default=os.environ.get("OPENWEBRX_MCP_HOST", DEFAULT_MCP_HOST))
    parser.add_argument("--port", type=int, default=int(os.environ.get("OPENWEBRX_MCP_PORT", DEFAULT_MCP_PORT)))
    args = parser.parse_args(argv)

    server = create_server()
    if args.transport == "stdio":
        server.run(transport="stdio")
        return

    token = os.environ.get("OPENWEBRX_MCP_TOKEN", "")
    allowed_hosts = [value.strip() for value in os.environ.get("OPENWEBRX_MCP_ALLOWED_HOSTS", "").split(",") if value.strip()]
    allowed_origins = [value.strip() for value in os.environ.get("OPENWEBRX_MCP_ALLOWED_ORIGINS", "").split(",") if value.strip()]
    app = create_http_app(server, token, args.host, args.port, allowed_hosts, allowed_origins)
    try:
        import uvicorn
    except ImportError as error:
        raise RuntimeError("Install OpenWebRX with the 'mcp' extra to run Streamable HTTP") from error
    uvicorn.run(app, host=args.host, port=args.port, log_level="info")


if __name__ == "__main__":
    main()
