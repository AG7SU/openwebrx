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

The optional `openwebrx-mcp` service defaults to local stdio and reads the public
`/status.json` endpoint. It returns only station name/version/client limit,
active SDR type, and profile frequency/sample-rate metadata. It omits GPS,
location, and administrator contact information; external status origins require
HTTPS, redirects are rejected, and response size/time are bounded. Its opt-in
Streamable HTTP mode requires a shared bearer token, binds to loopback by
default, and retains SDK Host/Origin checks; any wider bind requires an explicit
host allowlist and deployment firewall/TLS policy. It has no write, tuning,
transmit, or PTT tools. Static bearer authentication does not provide OAuth
login/discovery; use a trusted client configured with that header, and add an
OAuth verifier before offering general-purpose remote access.

The follow-up adds `test/security_radio_rendering.cjs` to CI. It injects active
HTML payloads through JS8 thread messages and CW/RTTY skimmer messages, then
checks that they remain text and create no active elements. Skimmer output now
uses `textContent` for decoded text and frequency display. This covers those two
rendering paths in jsdom; it does not replace the broader context review or
real-browser verification of all remaining HTML sinks.

- Login throttling, the in-process session bound, session expiry, CSRF tokens, and
  POST-only administrative mutations are implemented in the follow-up below. Their
  behavior still needs browser verification through the deployed proxy. Session and
  throttle state remain process-local; credential-version checks reject stale sessions
  across processes after a user-file reload, but do not share revocation state itself.
- The application supports plain HTTP. At a TLS-terminating proxy, set
  `OWRX_SECURE_COOKIES=true`, preserve the public Host header, and verify the actual
  HAProxy chain. `OWRX_TRUSTED_PROXIES` must list only the immediate trusted proxy
  addresses; do not rely on `allow_remote_config` alone to protect public administration.
  Client accounting, per-IP limits, and bans now use the same allowlist and
  right-to-left trusted-chain resolver as HTTP local-address classification;
  missing or malformed forwarded chains fall back to the socket peer for
  accounting, while HTTP admin classification fails closed and treats that
  request as non-local. Focused tests cover direct peers, trusted proxies,
  malformed chains, and an explicitly allowed VPN CIDR. Verify the actual HAProxy
  chain before enabling this configuration. Remote settings
  access now defaults off. Standard loopback, RFC1918, and link-local ranges
  remain local; `OWRX_ADMIN_NETWORKS` accepts additional comma-separated CIDRs
  for VPN administrators. Use the actual NetBird network range and
  list the HAProxy socket peer in `OWRX_TRUSTED_PROXIES` so public clients retain
  their real source address for the local-admin decision. Existing installations
  with a persisted `allow_remote_config=true` value keep that explicit setting;
  review it during upgrade. Administrators can enable it again when unrestricted
  remote settings access is an intentional choice. Admin route authorization now
  checks locality/that explicit setting even when a valid session cookie is
  present. A regression case covers an already-authenticated public request;
  deployment instructions and an external verification list are in
  `docs/deployment-security.md`.
- Origin checks allow requests with no Origin, Referer, or relevant Fetch Metadata for
  non-browser compatibility. CSRF tokens now protect state-changing authenticated
  requests and the anonymous login flow, but deployed browser/proxy verification remains.
- Configurable command bases/static pipeline fragments remain trusted administrator
  input. Filesystem containment assumes untrusted local processes cannot modify asset,
  data, or temporary directories during access; it is not a descriptor-based sandbox.
- Image uploads now decode/re-encode with resource limits. External decoder processes,
  configured outbound URLs, remaining map/message renderers, deployment privileges,
  and bundled libraries still warrant targeted review.

The browser checks follow the principles in the [OWASP CSRF prevention guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).
Frame limits and masking checks follow [RFC 6455](https://www.rfc-editor.org/rfc/rfc6455.html).

## Follow-up implementation — 2026-10-08

The modernization work after this source-review snapshot has added CSRF tokens,
bounded in-process sessions and login throttling, persisted credential-version
checks for cross-process revocation, secure-cookie controls, and trusted-proxy
address parsing. It also converted the identified administrative mutations to
POST. Map popup metadata now escapes through a default-safe list-item helper;
only generated links and country flag markup opt into HTML. Receiver details,
chat/log output, dynamic mode/profile labels, and both server-rendered and
client-imported bookmark fields now use escaped text or DOM APIs. The broader
template/plugin scan and these changes have not been browser- or deployment-
verified. See `MODERNIZATION_BASELINE.md` for the current status and outstanding
receiver-host checks.

This pass also closed a stored-XSS path in editable bookmarks: persisted names,
descriptions, modulation labels, and mode JSON had been interpolated directly
into server HTML; browser-imported bookmark fields had the same issue. Server
templates now HTML-escape interpolated values, and client imports build cells
with text/attribute DOM APIs.

A follow-up sink review found ADS-B emergency and squawk labels, along with
other decoded table values, were inserted into the aircraft table as HTML.
Those text fields are now escaped before markup assembly. The table still uses
HTML for fixed structure and generated links; browser verification and the
remaining template/plugin review are open.

The shared page header also interpolated receiver configuration into HTML
without context escaping and embedded the usage-policy URL inside a JavaScript
string that generated a meta-refresh element. Header text and attribute values
are now escaped, help and policy links reject unsafe schemes, and the refresh
element is built with DOM APIs. The administrator-configurable photo description
retains basic formatting through the allowlist sanitizer described below; the
rest of the template/plugin surface remains under review.

Section toggles previously replaced an arrow by reading and rewriting their
entire header through `innerHTML`. They now update `textContent`, with the DOM
regression test checking that the symbol changes without creating active markup.

The Google Maps receiver-location InfoWindow previously interpolated the
configured receiver name into HTML. It now supplies a DOM node and assigns the
name through `textContent`; the jsdom regression test covers an HTML payload.
Map feature symbols received from map updates are parsed only when they match a
numeric character entity or one of the three named entities used by the app;
other values render as text. The browser regression test covers markup payloads
and supported entity symbols.

The feature report previously concatenated feature names into table markup and
inserted Markdown parser output as HTML. It now builds rows through DOM APIs and copies
only a formatting allowlist from parsed Markdown; links must resolve to HTTP(S),
and are assigned `noopener noreferrer`. Script/style/embedded content and event
attributes are dropped. npm audit found three advisories affecting Showdown
2.1.0 ([ReDoS](https://github.com/advisories/GHSA-rmmh-p597-ppvv),
[metadata XSS](https://github.com/advisories/GHSA-cr32-g25g-vxjj), and
[table-header XSS](https://github.com/advisories/GHSA-22g5-r2x5-97cx)); the
registry had no fixed npm release. The feature report now uses markdown-it 15.0.2,
vendored with its MIT notice; the parser's bundle hash is checked by the DOM
regression test. An npm audit of the versioned vendored-package inventory found
no known vulnerabilities at the time of review. Unknown-version legacy assets are
not represented in that npm lock.
The jsdom regression test exercises active HTML, unsafe links, and injected
feature and requirement names; this is a DOM regression check, not a full browser
test of the report page.

Settings breadcrumbs now escape configured labels and link targets, and
exception text in the settings error card is HTML-escaped before rendering.
Connected-client names, addresses, and profile labels are also escaped; GeoIP
links are limited to HTTP(S) and use `noopener noreferrer`. Configured service
and SDR profile labels are escaped in the services table. Form section titles
and validation messages now escape dynamic values before HTML insertion. Settings
field labels, IDs, values, textarea contents, option labels, and option values
are escaped for their HTML contexts; help text passes through the formatting
allowlist sanitizer. Device gain, scheduler, waterfall, location, image, and
WSJT form controls apply the same escaping to dynamic configuration and hardware
values. Regression tests cover textarea payloads, unsafe help links, dropdown
option injection, and optional-field selectors.
Photo descriptions retain basic formatting through an HTML allowlist; scripts,
active embeds, event handlers, and unsafe URL schemes are removed before the
header is rendered. The sanitizer has only received syntax/source review so far;
malformed HTML and browser behavior still need verification.

HTML responses now include `base-uri 'self'`, `object-src 'none'`, and a
nonce-based `script-src` with `strict-dynamic`, plus
`Referrer-Policy: strict-origin-when-cross-origin`. Every server-rendered
external script and stylesheet receives a per-response nonce. Inline style
attributes and CSSOM styling remain outside a `style-src` policy.

The original 2026-10-08 CSP feasibility inventory found one inline `<script>`
block, 42 inline event-handler attributes, and 68 inline `style` attributes
across 14 HTML/include files. The header script now runs from `Header.js`, and
the receiver controls use a fixed data-action dispatcher in
`ReceiverUiEvents.js`. The jsdom regression scans every HTML template under
`htdocs` and currently finds zero inline scripts and zero event-handler
attributes. The enforcing script policy uses a nonce and `strict-dynamic`; the
default HTML policy no longer includes `'unsafe-eval'`. The exception is scoped
to the Google Maps page and settings pages because both load Google's Maps API
for map display or location selection. Google Maps documents nonce propagation
for dynamically inserted scripts and styles. The policy retains `https:`,
`'self'`, and `blob:` for legacy compatibility. The existing trusted plugin
loader can still execute administrator-selected remote plugin code under
`strict-dynamic`; review
and constrain that trust boundary before claiming that the policy limits remote
script origins. All 68 static inline style attributes found in the original
template scan have now been moved to local stylesheets, and a DOM-source
regression check prevents new inline style attributes in HTML templates. Style
attributes still occur in JavaScript-generated markup, and runtime CSSOM writes
remain outside a `style-src` policy. Verify both map providers and the dynamic
style paths in browsers before enforcing a style policy.

Password creation and verification now reject empty values and values over 1024
UTF-8 bytes. Verification checks this bound before PBKDF2, preventing a large
password field from forcing expensive hashing; login and forced-change forms
also cap input at 1024 characters. This does not raise the PBKDF2 work factor,
which remains a separate receiver-host benchmark decision.

New password records now persist their PBKDF2 iteration count. Existing records
without the field continue to use the historical 100,000 iterations, and
successful logins rehash records whose algorithm or cost is below the current
target. Persisted iteration counts are bounded from 1 through 10,000,000 before
verification. The target remains 100,000 until latency is measured on the
receiver host.

`tools/benchmark_password_hash.py` now provides a repeatable receiver-side
measurement of the application's `HashedPassword.is_valid` path at candidate
iteration counts. A development-host run measured 276 ms median at 600,000
iterations, but this is not evidence for the receiver target. OWASP's current
Password Storage Cheat Sheet recommends 600,000 iterations for PBKDF2-HMAC-
SHA256 when PBKDF2 is selected; verify that cost against receiver latency and
concurrent login load before changing the target.

The pre-follow-up audit findings above describe the original state at review time;
the follow-up and remaining-risk sections supersede those findings where they
record implemented changes.

Avatar and receiver-photo uploads now require successful ImageMagick decoding
and are re-encoded as bounded PNGs. The conversion applies pixel-cache, area,
time, thread, disk, dimension, and output-size limits. ImageMagick is a Debian
recommendation rather than a hard dependency, so uploads fail closed with a
service-unavailable response when no converter is installed. This has not been
verified against deployed ImageMagick policies or malicious image fixtures.

Queued digital decoder jobs now have a wall-clock kill deadline and bounded
stdout and line sizes. The deadline kills the decoder's process group, avoiding
an indefinitely blocked worker if the child stops producing output. Other SDR
and decoder subprocesses still need a process-by-process resource review.

Optional feature/version probes in `owrx/feature.py` now use a 10-second
deadline and run in a separate process group; timeout cleanup kills that group.
This prevents several startup capability checks from blocking indefinitely.
Probe output is captured for version/driver parsing but is not separately
size-bounded, and active SDR/decoder runtime processes have different lifetimes.
