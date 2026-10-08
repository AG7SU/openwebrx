# Security audit and remediation — 2026-10-08

This was a source review and local remediation pass over HTTP routing, authentication,
file serving/uploads/deletion, SDR command construction, WebSocket framing, and selected
radio-metadata rendering. The starting worktree was clean. No running services or host
configuration were changed. Severity below is an assessment of the code paths, not a
claim of exploitation on a deployed receiver.

## Remediated findings

| Severity | Finding | Remediation |
| --- | --- | --- |
| High | HD/DAB/DRM/TETRA metadata and RDS homepage values reached HTML or HTML attributes without escaping. Malicious received metadata could inject browser content. | Build image/link/option elements with DOM APIs, allow HTTP(S) RDS links, and escape dynamic DRM/TETRA text. |
| High | SDR option and positional values were interpolated into command strings; sources using shell pipelines could interpret shell metacharacters. | Quote each dynamic argument with `shlex.quote`; preserve trusted application pipeline syntax. |
| High | Upload previews accepted arbitrary temporary-directory paths, and image installation accepted filenames by prefix, including path components and arbitrary extensions. | Require exact generated image filenames, allowed extensions, matching image IDs, and paths confined to the temporary directory. Use exclusive creation for uploads. |
| High | Stored-file deletion used prefix regex matching and an unrestricted joined path. A filename starting with a valid name could append traversal components. | Require full filename matching for deletion/listing/cleanup and confine storage paths. |
| Medium | Asset paths had no filesystem-level containment checks. Router normalization covered basic traversal but did not protect against symlinks outside asset roots. | Confine resolved static/APRS paths to their configured roots. Adapt the favicon route to produce a relative asset name. |
| Medium | Login and forced-password-change redirects accepted external `//host` targets; password-change redirects also accepted unrestricted targets. | Allow local absolute paths only, reject backslashes and control characters. |
| Medium | Session cookies lacked explicit HttpOnly/SameSite/Path attributes; logout did not revoke sessions. | Set HttpOnly, SameSite=Strict, Path=/; revoke the current session and expire its cookie on logout. Fix cookie clearing scope for authorization failures. |
| Medium | Browser-origin checks were absent, including WebSocket upgrade requests and administrative GET mutations. | Reject cross-site/same-site Fetch Metadata on sensitive actions and WebSockets; compare Origin or Referer authority to Host. Public GET navigation remains available. |
| Medium | Default HTTP body reads were unbounded; negative lengths could request an unlimited read. | Default 4 MiB limit, preserve smaller upload limits, reject negative/malformed lengths, unsupported transfer encoding, and truncated bodies. Dispatch returns 413 for uncaught body errors. |
| Medium | WebSocket 64-bit lengths were not decoded; malformed/unmasked frames were accepted; payloads lacked a cap. | Decode extended lengths; cap received payloads at 1 MiB; enforce masks, control-frame limits, supported opcodes, and complete frames; close on invalid UTF-8. Count UTF-8 bytes for outgoing text. Fragmented messages remain unsupported and are now explicitly rejected. |
| Low | Password comparisons used ordinary equality. | Use constant-time comparisons for hashed and legacy cleartext passwords. |
| Low | Responses lacked MIME-sniffing protection and malformed conditional-date headers could raise exceptions. | Add `X-Content-Type-Options: nosniff`; tolerate invalid conditional dates. |

## Validation

- `/usr/bin/python3 -m unittest discover -s test`: **101 tests passed** (86 existing, 15 added).
- `/usr/bin/python3 -m compileall -q owrx csdr test`: passed.
- `node --check htdocs/lib/MetaPanel.js`: passed.
- Metadata DOM regression tests with the repository's jQuery and jsdom: passed.
- `git diff --check`: passed.

To rerun the DOM checks without adding dependencies to the application:

```sh
npm install --prefix /tmp/owrx-security-js --no-audit --no-fund jsdom@22.1.0
NODE_PATH=/tmp/owrx-security-js/node_modules node test/security_metadata.cjs
```

Tests cover path/symlink escapes, upload filename restrictions, redirect attacks,
body limits, origin dispatch, cookie attributes, session revocation, literal command
arguments, deletion suffixes, invalid/oversized WebSocket frames, extended-length
parsing, UTF-8 framing, and malicious metadata rendered into the DOM.

The environment's pyenv Python executable is unusable; validation used system Python
3.14. Full application imports require missing `pycsdr`. Upload/settings controller
integration, live HTTP/browser authentication, actual SDR pipelines, older supported
Python versions, and receiver/audio operation were not exercised. DOM tests are not
an end-to-end browser or RF test. No installed-system or comprehensive vendored-library
CVE scan was performed; this is not an exhaustive audit of all frontend sinks.

## Remaining risks and deployment work

- Deploy behind HTTPS. The application still supports plain HTTP, so cookies are not
  unconditionally marked Secure. At an HTTPS-only reverse proxy, add Secure to the
  session cookie and preserve the public Host header. Forwarded headers are not trusted
  by this patch; an altered Host can cause legitimate origin checks to fail.
- Login has no throttling, session storage has no global bound, and password changes
  do not revoke all other sessions. Use ingress connection/rate limits until these
  receive a dedicated implementation.
- Origin/Fetch Metadata checks allow requests with neither Origin nor Referer nor
  relevant Fetch Metadata, for existing non-browser clients. This is defense in depth,
  not a complete token-based CSRF implementation for every legacy client. Administrative
  delete/move routes still use GET and should eventually become POST with CSRF tokens.
- `allow_remote_config` treats private peer addresses as local. A reverse proxy can
  make public traffic appear local. Restrict administrative routes at ingress; do not
  rely on that flag as the sole public-access boundary.
- Configurable command bases/static pipeline fragments remain trusted administrator
  input. Filesystem containment assumes untrusted local processes cannot modify the
  asset/data/temp directories during access; it is not a descriptor-based sandbox.
- Uploaded images are checked by signatures, not decoded/re-encoded. External decoder
  processes, configured outbound URLs, other map/message renderers, deployment
  privileges, and bundled libraries warrant additional targeted review.

The browser checks follow the principles in the [OWASP CSRF prevention guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).
Frame limits and masking checks follow [RFC 6455](https://www.rfc-editor.org/rfc/rfc6455.html).
