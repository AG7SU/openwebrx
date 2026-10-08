# Modernization roadmap

Created: 2026-10-08

Status: implementation in progress; phases 1 and 2 are underway.

## Direction

Preserve the SDR/DSP engine and existing OpenWebRX+ capabilities while building a
distinct receiver interface, adding Data2G as an isolated receive decoder, and
modernizing transport, security, packaging, and deployment incrementally.

This checkout is OpenWebRX+, rather than the original OpenWebRX. Preserve its
scanning, recording, image decoding, maps, chat, and supported receiver hardware.
Assess maintenance and compatibility separately for each upstream dependency.

## Phase 1 — Reproducible baseline

- [ ] Inventory Python packages, vendored JavaScript, native SDR libraries, and
      external decoder binaries, including versions and licenses.
      A reproducible direct Python-import scanner and its initial snapshot are
      documented in
      `MODERNIZATION_BASELINE.md`; source asset evidence is in
      `THIRD_PARTY_NOTICES.md`. Deployed package versions, some vendor provenance
      and license texts remain. The legacy chroma bundle reports version 2.0.3
      internally; the location-picker version is still unknown. GPL-3.0 and
      LGPL-3.0 texts are now included for the identified location-picker and
      lamejs licenses. The host baseline collector now records candidate
      SDR/DSP shared libraries and optional Python module origins, but it has not
      been run on the receiver and does not capture hardware or every binary version.
- [ ] Move packaging metadata to `pyproject.toml` and select a supported Python
      baseline after checking native-library compatibility. Project metadata,
      entry point, package discovery/data, and a Python `>=3.11` floor now live
      in PEP 621 `pyproject.toml`; `setup.py` is a compatibility stub. Python
      3.11 is the oldest CPython branch still receiving security fixes as of
      2026-10; Debian control metadata reflects it, and Debian builds require
      setuptools 61+. Legacy `distutils.version` imports were replaced by the
      declared `packaging>=23.0` runtime dependency. Native receiver compatibility,
      isolated frontend/install validation remain open. The PEP 517 backend is
      now pinned to setuptools 84.0.0 and CI asserts that pin; Debian native and
      runtime dependencies remain managed and versioned separately. A clean
      isolated build with setuptools 84.0.0 produced a 338-entry wheel with core
      receiver modules, local frontend assets, and the declared Python floor;
      installation/runtime behavior and native receiver compatibility remain
      unverified.
- [ ] Pin release dependencies and container images. `uv.lock` now pins and
      hash-checks the declared pure-Python dependency; Debian/native receiver
      packages, optional decoders, and container images still need a deployment
      baseline before they can be pinned safely. CI verifies the lock and runs
      Python tests in its locked environment.
- [ ] Provide a reproducible development environment and Docker Compose deployment.
- [ ] Establish recorded signal fixtures and browser smoke checks for tuning,
      listening, reconnects, bookmarks, recording, and representative decoders.
- [ ] Measure tuning latency, audio interruptions, waterfall frame rate, memory,
      and CPU per active receiver.
- [ ] Add CI for existing tests, frontend builds, security checks, and decoder fixtures.
      `.github/workflows/ci.yml` now runs the Python suite on 3.11/3.14, checks
      frontend JavaScript syntax, runs the DOM-based malicious metadata rendering
      regression tests, builds a PEP 517 wheel, and verifies its Python floor,
      declared pure-Python dependency, vendored map resources, and cache-file
      exclusion, and runs DOM checks for metadata and pinned map/plugin behavior.
      CI audits the hash-pinned Python dependency exported from `uv.lock`;
      native Debian/package, vendored JavaScript,
      and container scans, native/frontend builds, and decoder fixtures remain open.
      Leaflet and its four map plugins now load from locally shipped, pinned
      assets with full license texts and checksum regression checks. Google Maps
      and map tile providers remain external runtime dependencies; both Google
      Maps loaders encode administrator-configured keys as a single query value.
      Relative map
      timestamps now use `Intl.RelativeTimeFormat` rather than remote Moment.js.
      Showdown 2.1.0 had three npm advisories with no fixed release, so the
      feature report now uses markdown-it 15.0.2, which passed `npm audit` with
      zero vulnerabilities. A DOM regression test pins the parser checksum and
      retains the report's allowlist sanitizer. CI also runs npm audit against
      the lockfile inventory for versioned vendored browser packages; unversioned
      assets remain outside that automated scan.
      The 115-test Python suite also passed under uv-managed CPython 3.11.13
      locally; the system pyenv 3.11 shim itself is broken, so this check used an
      isolated temporary environment.
- [ ] Define versioned configuration migrations, backup/export, and rollback.

Completion: a fresh environment can reproduce the build and checks, and baseline
measurements make regressions detectable. A successful build alone does not prove
receiver or audio behavior.

## Phase 2 — Complete security hardening

Use `SECURITY_AUDIT.md` as the starting inventory of existing fixes and remaining
risks. Verify those fixes through the deployed browser/proxy path.

- [x] Replace administrative GET mutations with POST/DELETE. SDR/profile deletion,
      profile moves, and logout were changed to POST. An audit of the router found
      no other GET routes configured to invoke state-changing actions.
- [x] Add session-bound CSRF tokens for authenticated state changes. Browser and
      proxy-path verification remains open.
- [x] Add login throttling, bounded sessions, and expiry. This pass bounds each
      process to 2048 sessions and throttles a peer after eight failed attempts in
      fifteen minutes; these controls are in-memory and process-local.
- [x] Invalidate sessions after password changes/resets and account disablement,
      including other processes through persisted credential versions/account IDs.
      Multi-process session revocation itself remains process-local.
- [x] Rehash legacy cleartext passwords with a per-user salt on successful login.
- [x] Bound passwords to 1024 UTF-8 bytes and reject empty/oversized values before
      PBKDF2 verification or creation; login and password-change forms also expose
      a 1024-character browser-side cap.
- [ ] Benchmark and raise the current PBKDF2 work factor or migrate to Argon2id.
      Password records now persist PBKDF2 iteration counts; older records without
      the field continue to use 100,000 iterations, and successful logins rehash
      records below the selected target. Stored costs are bounded to prevent
      unbounded login work. `tools/benchmark_password_hash.py` measures the actual
      `HashedPassword.is_valid` path at candidate costs and emits host metadata.
      A local development sample measured medians of 44 ms at 100,000, 130 ms at
      300,000, and 276 ms at 600,000 iterations under CPython 3.13.6; this is not
      receiver-host evidence. OWASP currently recommends 600,000 iterations for
      PBKDF2-HMAC-SHA256 when PBKDF2 is selected. The target remains 100,000 until
      the receiver host is measured and concurrent login cost is assessed.
- [ ] Verify `OWRX_TRUSTED_PROXIES` with HAProxy and ensure proxied public requests
      cannot inherit local configuration privileges. The allowlist parsing is now
      implemented, and client-IP accounting now uses the same trusted-chain
      resolver (including for bans and per-IP limits). A focused regression case
      covers direct peers, trusted proxies, and malformed chains; the real HAProxy
      chain and local-configuration boundary still need deployment verification.
      Remote configuration now defaults off; `OWRX_ADMIN_NETWORKS` can explicitly
      admit additional admin CIDRs such as the configured NetBird range. Regression
      tests also confirm both the public login page and login POST return 403 when
      remote configuration is disabled. Existing authenticated sessions are now
      subject to the same locality/explicit-remote check on every admin route.
      A deployment guide documents the HAProxy/NetBird boundary and verification
      steps; actual firewall and proxy behavior remains to be tested on the host.
- [x] Configure secure cookies behind HTTPS with direct TLS detection or the
      explicit `OWRX_SECURE_COOKIES=true` proxy setting. Verify proxy deployment.
- [x] Enforce WebSocket origin checks; verify them through the deployed proxy.
- [ ] Audit remaining radio metadata, chat, map, and filename rendering paths.
      Shared callsign/JS8/MapLocators paths, map popups, receiver details,
      chat/log output, profile/mode options, and bookmark settings now escape
      dynamic content. ADS-B table values, including emergency and squawk labels,
      now escape decoded text before HTML insertion. Shared header values now
      escape HTML output, help/policy URLs reject unsafe schemes, and the policy
      refresh uses a DOM-created meta element instead of HTML interpolation.
      Settings breadcrumbs and exception text are escaped before rendering. The
      connected-client table now escapes client names, addresses, and profile
      labels; its GeoIP link is restricted to HTTP(S). The service table escapes
      configured SDR/profile labels. Form section titles and validation messages
      also escape dynamic settings/user values. Form labels, values, and help text
      are context-escaped or sanitized; field-control regression tests cover
      active markup in saved multiline values, links, options, and selectors.
      Photo descriptions retain basic formatting through an HTML allowlist;
      scripts, active embeds, event handlers, and unsafe URL schemes are removed.
      WSJT, POCSAG/FLEX, HFDL, DSC, ISM, Meshtastic, and APRS message fields now
      escape decoder-provided text before insertion; message colors and APRS
      sprite offsets are constrained. SSTV/FAX frames use generated canvas IDs,
      sanitized download names, bounded dimensions/scanlines, and bounded
      base64/RLE scanline decoding. Remaining
      template/plugin paths still need review and browser verification. Dynamic
      HDR/DAB programme options are now assembled as DOM nodes instead of HTML
      strings. UI section toggles now update text through `textContent` rather
      than reparsing the section header as HTML. Google Maps receiver-location
      popups now render the configured receiver name as text in DOM-built nodes.
      The feature report builds rows through DOM APIs and filters Markdown output
      through a tag and URL allowlist before insertion; tests cover malicious HTML,
      event attributes, unsafe links, and feature/requirement names.
      JS8-thread and CW/RTTY-skimmer decoder output now have separate malicious
      payload DOM regression coverage in CI. Skimmer output uses `textContent` for
      decoded content, frequency display, and safer browser/test consistency.
      Remaining `.html()`/`innerHTML` sites still require a full context-by-context
      review and browser verification.
- [x] Decode/re-encode uploaded images and limit decoder process resources.
      Image uploads now normalize through ImageMagick with per-process pixel,
      memory, disk, thread, time, dimension, and output-size limits. Other decoder
      workers now have a 10-second wall-clock kill deadline plus 8 MiB total and
      256 KiB per-line stdout limits. Resource limits for every other external
      process and runtime behavior remain to be reviewed. Optional feature/version
      probes now have a 10-second deadline and kill their process group on timeout.
- [ ] Introduce a restrictive Content Security Policy as inline scripts are
      removed. Responses now enforce nonce-based `script-src` with
      `strict-dynamic`; tests verify per-response policy and that every template
      script/stylesheet tag carries the nonce placeholder. Static HTML has no
      inline scripts or event-handler attributes. The default HTML policy now
      omits `'unsafe-eval'`; the source trace confines that exception to Google
      Maps and settings pages, whose location picker loads Google's API. The
      dynamic plugin loader can still execute admin-selected remote scripts
      under `strict-dynamic`, and Google Maps browser compatibility is unverified.
      Inline style attributes and CSSOM usage need a separate style policy; this
      item remains open until those trust boundaries and deployed browser
      behavior are verified.
- [ ] Scan Python, frontend, native, and container dependencies. CI now runs
      `pip-audit` against `pyproject.toml` and `npm audit` against versioned
      vendored browser package inventory; Debian/native package and container
      scans and provenance for legacy assets remain open.
- [ ] Separate public listening from private administration; document HAProxy
      ingress and NetBird administration deployment.

See `MODERNIZATION_BASELINE.md` for the current inventory and the limits of these
initial changes.

Completion: public and administrative access boundaries work through HAProxy;
authentication, CSRF, uploads, and malicious metadata have meaningful verification.

## Phase 3 — Distinct modern interface

Visual direction: a modern radio instrument with charcoal surfaces, restrained
cyan/amber accents, crisp typography, and a dominant waterfall.

Proposed desktop layout:

- Top: station identity, receiver selector, connection state, large frequency display.
- Center: spectrum/waterfall with clear passband handles.
- Side: tuning, mode, bandwidth, gain, squelch, and audio controls.
- Bottom: expandable decoded-message timeline, recordings, and bookmarks.

Mobile: full-width waterfall, persistent frequency/audio controls, and a bottom
sheet for adjustments.

- [ ] Establish a new identity, design tokens, typography, icons, and component styles.
- [ ] Introduce TypeScript and Vite; use Svelte for controls and panels, subject
      to a small integration prototype.
- [ ] Wrap existing waterfall/audio engines behind adapters initially.
- [ ] Replace frontend globals and jQuery plugins component by component.
- [ ] Add searchable mode selection with capabilities and unavailable-decoder reasons.
- [ ] Preserve direct frequency entry and keyboard tuning; improve touch targets,
      focus states, contrast, and accessibility.
- [ ] Add saved layouts and bookmarks.
- [ ] Show separate connection, audio, and decoder status.
- [ ] Apply consistent styling to settings, maps, login, and administration.

Completion: a visibly distinct desktop/mobile receiver retains tuning, passband,
audio, recording, and decoder behavior, verified in rendered browsers.

## Phase 4 — Data2G receive integration

KISS carries decoded frames, not the SDR audio Data2G needs to decode.

```text
SDR → tuned demodulator → clean PCM → Data2G host
                                      ↓
                                KISS + status
                                      ↓
                           payload adapters → browser
```

- [ ] Pin and inspect the exact Data2G host revision and supported interfaces.
- [ ] Prove recorded-WAV decoding through that host before connecting live SDR audio.
- [ ] Select a supported server-side audio input mechanism, or add a PCM ingestion
      API if the host lacks one.
- [ ] Feed audio before listening-volume changes and noise effects; explicitly
      configure sample rate, filtering, and levels.
- [ ] Enforce receive-only behavior in the host: no automatic replies, rate reports,
      CAT, or PTT. Browser controls alone are insufficient.
- [ ] Generalize `owrx/aprs/kiss.py`, which currently accepts only command byte
      `0x00`, to handle Data2G's multiple KISS ports and data-command classification.
- [ ] Bound frames and buffers; handle malformed escapes, reconnects, and host failures.
- [ ] Route AX.25/APRS payloads to APRS parsing; give other application frames
      separate typed handlers.
- [ ] Show receive activity when available and promote validated decoded messages
      only after host decoding completes.
- [ ] Run a restartable decoder worker independently of the receiver.
- [ ] Share equivalent decoder sessions where possible and cap concurrent workers.
- [ ] Verify WAV fixtures, host reconnects, live SDR audio ingestion, and reception
      from a separate transmitter, reporting each verification boundary separately.

Completion: recorded bursts appear correctly in the browser, receive-only behavior
is enforced, and live ingestion is verified. A KISS connection alone is not completion.

## Phase 5 — Backend transport and performance

- [ ] Replace custom HTTP/WebSocket handling incrementally with a maintained ASGI
      stack after a compatibility prototype.
- [ ] Keep DSP subprocesses outside the request loop.
- [ ] Define versioned decoder events and strict input validation.
- [ ] Add bounded queues, subprocess supervision, restart backoff, and overload behavior.
- [ ] Prevent slow clients from accumulating unlimited waterfall data.
- [ ] Refine existing AudioWorklet support and measure buffering/reconnect behavior.
- [ ] Move waterfall work to a worker or GPU renderer only where profiling supports it.
- [ ] Compare new behavior against Phase 1 latency, CPU, memory, and audio baselines.

Completion: reliable reconnects and predictable behavior under load without receiver
regressions. Avoid simultaneous rewrites of DSP, browser audio, and transport.

## Phase 6 — Release packaging and useful extensions

- [ ] Compose services with optional decoders, explicit device access, health checks,
      persistent volumes, resource limits, and pinned releases.
- [ ] Provide repeatable releases, configuration backups, upgrade notes, and rollback.
- [ ] Preserve license notices and attribution when introducing the new identity.
- [ ] Add receiver health reporting for decoder failures, audio drops, and device state.
- [ ] Add searchable reception history with frequency, timestamp, mode, and content.
- [ ] Attach short audio pre-roll to interesting receptions.
- [ ] Add scheduled monitoring of bookmarked frequencies.
- [ ] Add recording quotas and retention policies.
- [ ] Expose authenticated webhook or MQTT events for Node-RED, n8n, and Home Assistant.

Completion: repeatable deployment and recovery, with optional features that remain
bounded in storage and CPU use.

## First milestone

Combine four deliverables:

1. Reproducible Compose deployment and baseline checks.
2. Remaining authentication/proxy/CSRF fixes.
3. A new receiver shell around existing tuning, waterfall, and audio behavior.
4. A recorded-WAV Data2G receive proof with KISS output displayed in the browser.

This establishes the foundation, visibly differentiates the app, and resolves the
largest Data2G integration uncertainty before committing to live audio architecture.

## Verification status

The roadmap comes from a source and documentation review. Live receiver/audio
operation, deployed proxy authentication, and Data2G interoperability were not
tested during planning. Existing audit results in `SECURITY_AUDIT.md` are recorded
results, not newly executed checks under this roadmap.
