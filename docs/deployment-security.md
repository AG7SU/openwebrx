# Public receiver and private administration

OpenWebRX+ listens on TCP 8073 by default. `openwebrx.conf` binds to all
interfaces unless `web.bind_address` is set. Keep the receiver's public listening
pages available through HAProxy, but restrict the backend port and admin routes to
the proxy and the actual NetBird administration network.

## Application settings

Keep `allow_remote_config = False` in the persisted OpenWebRX+ settings. The
default is false, but installations that previously enabled remote configuration
retain that stored choice. Review the saved value during an upgrade.

Set these environment variables for the service using a systemd drop-in or the
deployment's normal service configuration. Replace the placeholders with observed
addresses and networks from this deployment:

```ini
OWRX_TRUSTED_PROXIES=<HAProxy-backend-source-IP-or-CIDR>
OWRX_ADMIN_NETWORKS=<actual-NetBird-admin-CIDR>
OWRX_SECURE_COOKIES=true
```

`OWRX_TRUSTED_PROXIES` should contain only the immediate socket peer that
connects to OpenWebRX+. Never trust every source address. `OWRX_ADMIN_NETWORKS`
should contain only the NetBird network or administrator peers that are meant to
reach settings. The application also treats loopback, RFC1918, and link-local
addresses as local, so the backend firewall must prevent untrusted networks from
reaching TCP 8073 directly.

If HAProxy runs on the same host, bind `web.bind_address` to loopback and use
127.0.0.1 as the trusted proxy. If HAProxy runs on pfSense or another host, bind
to the receiver's private backend address and firewall TCP 8073 so only that
proxy and the chosen NetBird administration path can connect.

## HAProxy forwarding

Preserve the public `Host` header. For a listener that receives connections
directly from clients, overwrite forwarded identity headers from the socket
source instead of accepting client-supplied values:

```haproxy
http-request set-header X-Forwarded-For %[src]
http-request set-header X-Forwarded-Proto https if { ssl_fc }
```

The `X-Forwarded-For` address must represent the real browser peer. If another
trusted proxy sits in front of HAProxy, configure and test the complete
right-to-left chain, and list each actual trusted hop as required. Do not copy
these direct-client rules unchanged behind a CDN or upstream proxy.

Expose the receiver page on the public frontend. Keep administration reachable
only through either a dedicated frontend bound to a NetBird-reachable address and
restricted to the NetBird administrator CIDR, or a direct NetBird connection to
the restricted backend. Public requests may still reach the receiver; with
`allow_remote_config` disabled, login and every admin route reject public
requests, including requests carrying an existing session cookie.

## Deployment verification

Run these checks from the relevant network locations after applying firewall and
proxy configuration. Do not use a copied browser session cookie for tests; verify
an already-authenticated public request using the browser's normal session and
confirm it receives no admin content.

1. From an unrelated public network, load `/` and confirm receiver listening
   works. Request `/settings`, follow the login redirect, and confirm the login
   page returns 403.
2. Authenticate from the NetBird administration path and confirm settings pages
   work. Then access the public frontend from a separate browser/network and
   confirm the existing session cannot open settings or invoke an admin action.
3. Confirm a NetBird administrator can still sign in through the chosen admin
   path. Verify a state-changing form requires its CSRF token and that a
   cross-origin request is rejected.
4. Confirm TCP 8073 is unreachable from the public internet and reachable only
   from the intended proxy/admin paths. Verify the secure session cookie has the
   `Secure`, `HttpOnly`, and `SameSite` attributes on the HTTPS frontend.
5. In the browser, verify the WebSocket connects through HAProxy, retains the
   expected client identity, and rejects a foreign `Origin`.

Source tests cover trusted-chain resolution, malformed forwarding headers,
public login denial, and rejection of authenticated public admin requests. They
do not prove this deployment's HAProxy headers, firewall rules, cookies, browser
behavior, or NetBird routing; record those results separately.
