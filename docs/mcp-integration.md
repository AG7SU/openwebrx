# Optional MCP server

OpenWebRX+ includes an optional, read-only Model Context Protocol server for
local or trusted-network MCP clients. It uses the existing `/status.json`
endpoint, so it does not open SDR hardware or share the receiver process. The
initial tools are:

- `get_station_status`: receiver name, software version, configured client
  limit, and active source count.
- `list_receivers`: active SDR source types and their configured profile names,
  center frequencies, and sample rates.

The tools intentionally omit station GPS/location and administrator contact
details. The server exposes no tuning, configuration, transmit, or PTT tools.

## Install and run

Install the optional extra into the project environment:

```sh
uv sync --extra mcp
```

Configure an MCP client to launch the server over stdio. For example, use the
installed project script:

```json
{
  "mcpServers": {
    "openwebrx": {
      "command": "/path/to/openwebrx/.venv/bin/openwebrx-mcp"
    }
  }
}
```

By default, the MCP process reads `http://127.0.0.1:8073/status.json`. Set
`OPENWEBRX_MCP_BASE_URL` to another origin when the MCP client runs on a
different host:

```sh
OPENWEBRX_MCP_BASE_URL=https://radio.example.net
```

Non-loopback endpoints require HTTPS. The value must be an origin without a
path, credentials, query, or fragment. The server does not follow redirects,
limits responses to 1 MiB, and uses a four-second request timeout. The status
endpoint is public, and the tools can only disclose the filtered fields listed
above.

## Streamable HTTP for trusted-network clients

HTTP mode requires a shared bearer token and binds to loopback by default. Use a
long random token and pass it through a protected environment file or secret
manager; never put it in a command history, MCP configuration file, or source
control. For example, after exporting `OPENWEBRX_MCP_TOKEN` in the service
environment:

```sh
uv run --extra mcp openwebrx-mcp --transport streamable-http
```

The endpoint is `http://127.0.0.1:8765/mcp`. To serve it behind HAProxy, bind
explicitly to an address reachable by the proxy, then restrict direct access
with the host firewall and NetBird policy:

```sh
OPENWEBRX_MCP_HOST=0.0.0.0 \
OPENWEBRX_MCP_ALLOWED_HOSTS=radio.example.net \
uv run --extra mcp openwebrx-mcp --transport streamable-http
```

Terminate TLS at HAProxy and forward the `Authorization: Bearer …` header
unchanged. MCP clients must support a configured static bearer header; this
first HTTP mode does not provide OAuth login/discovery. The token is checked
before MCP requests are parsed, comparisons use constant-time equality, and the
SDK's DNS-rebinding host/origin checks remain enabled. Configure additional
proxy hostnames and browser origins with `OPENWEBRX_MCP_ALLOWED_HOSTS` and
`OPENWEBRX_MCP_ALLOWED_ORIGINS` as comma-separated allowlists. Do not expose the
HTTP port directly to the public internet.

## Development checks

```sh
uv run --extra mcp python -m unittest test.test_mcp_server
uv run --extra mcp openwebrx-mcp
```

The second command waits for an MCP client on stdin/stdout. Use the official MCP
Inspector or a configured desktop client to exercise it. Do not invoke the
stdio command in a terminal expecting a normal status page.
