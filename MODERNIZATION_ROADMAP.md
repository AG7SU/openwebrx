# Modernization roadmap

Created: 2026-10-08

Status: The Phase 3 receiver experience is cohesive and its browser regressions
pass. RSPduo hardware verification remains open. Phase 4's Data2G receive path
passes generated-WAV and synthetic-IQ integration checks; live SDR/RF verification
remains open. Earlier security and deployment follow-ups remain tracked below.

## Direction

Preserve the SDR/DSP engine and existing OpenWebRX+ capabilities while building a
distinct receiver interface, adding Data2G as an isolated receive decoder, and
modernizing transport, security, packaging, and deployment incrementally.

This checkout is OpenWebRX+, rather than the original OpenWebRX. Preserve its
scanning, recording, image decoding, maps, chat, and supported receiver hardware.
Assess maintenance and compatibility separately for each upstream dependency.

High-priority hardware track: use both RSPduo tuners as concurrent, independently
tuned receiver sources. The SDRplay configuration now exposes explicit Master /
Slave and tuner selections; real-device operation and dual-source lifecycle are
still unverified. Always-on source initialization now opens Master before Slave
regardless of saved entry order without changing profile order; a regression
test covers reversed configuration. `buildall.sh` pins architecture-specific
SoapySDRPlay3 commits whose source supports the configured mode codes. Parameter
mapping has unit coverage, and the websocket profile mechanism provides a
documented two-client software check.
The modern interface offers a side-by-side dual-receiver view, and global source
shutdown now closes RSPduo Slave sources before Master sources. Hardware operation
and live dual-source lifecycle are still unverified. See
`docs/rspduo-dual-tuner.md`.

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
      The 68 static HTML style attributes have been moved into local stylesheets;
      CI now asserts templates remain free of inline style attributes. JavaScript-
      generated style attributes and runtime CSSOM assignments still need review
      before a style policy can be enforced. This item remains open until those
      trust boundaries and deployed browser behavior are verified.
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

- [x] Establish initial design tokens and receiver component styles. The first
      receiver-only visual layer gives the main page a charcoal/cyan instrument
      identity, clearer focus rings, reduced-motion support, and a more usable
      mobile viewport. It is a foundation, not the finished redesign; typography,
      iconography, waterfall hierarchy, and cross-page styling remain open. The
      Compose-built application was rendered in headless Chromium at 1440×1000 and
      390×844. The phone layout keeps the receiver island and waterfall in the
      document flow, moves legacy gain/filter controls into a bounded bottom
      sheet, and closes that sheet on Escape. This was a no-SDR smoke deployment;
      physical phone and hardware behavior remain open.
- [x] Introduce TypeScript and Vite; use Svelte for controls and panels, subject
      to a small integration prototype. `frontend/receiver-modern` now builds a
      production Svelte island with pinned Vite/Svelte/TypeScript dependencies,
      type-checking, dependency audit, and CI build parity. The island exposes
      direct frequency entry, step tuning, and separate connection/audio/mode
      indicators while leaving the legacy waterfall and audio engine in control.
      This proves the incremental mount path; the full receiver shell remains
      incomplete. CI runs Svelte/TypeScript diagnostics, a production build,
      frontend dependency audit, and a jsdom test of frequency and adapter behavior.
- [x] Wrap existing waterfall/audio engines behind adapters initially.
      `OpenWebRXReceiver` now exposes separate `audio` and `waterfall` adapters
      for modern controls and receiver transport. Audio status, output rates,
      startup/resume, compression, buffer clearing, gain, recording, and normal/
      HD packet input go through the audio adapter; waterfall zoom/range, clearing,
      primary/secondary FFT lines go through the waterfall adapter with runtime
      buffer checks. Legacy UI and demodulator callers use these same boundaries;
      the underlying WebAudio and canvas implementations remain intact behind
      the compatibility facade. DOM integration tests cover lifecycle delegation,
      recording permission, packet routing, and waterfall operations. DSP
      spectrum/scanner processing and ownership of the render lifecycle remain
      candidates for a later renderer migration.
- [x] Establish a typed adapter boundary for the modern receiver and migrate
      primary receiver controls incrementally. The modern receiver now talks
      through one typed `OpenWebRXReceiver` bridge instead of reaching into `UI`,
      `Modes`, `audioEngine`, zoom globals, or profile-select DOM directly. The
      bridge centralizes those compatibility calls. The legacy receiver's
      delegated event layer now also routes tuning, profile selection,
      volume/mute/recording, zoom, waterfall range/color, themes, noise reduction,
      opacity, spectrum, and display settings through adapters. Chat send/keyboard
      actions, tuning-step/jump controls, shared header, frequency readout/entry,
      and demodulator-panel setup use explicit adapter/factory or native-DOM APIs.
      Tests cover event routing,
      chat, header/CSRF behavior, frequency entry, SI suffixes, wheel tuning, and
      formatting. The core mode selector now uses native delegated events and
      DOM rendering with text-only labels. Demodulator and metadata panel
      initialization now use explicit idempotent factories; receiver mode events
      and labels use native DOM behavior. Receiver status progress bars also use
      native-DOM factories and text-only status labels. Remaining legacy pages and
      specialized decoder panel internals still use globals and jQuery; this does
      not claim their migration is complete.
- [ ] Continue replacing remaining frontend globals and jQuery plugins
      component by component.
      Specialized message panels and settings/admin pages still use globals and
      jQuery plugins; migrate each when its behavior can be preserved and covered
      by focused browser tests.
- [x] Add searchable mode selection with capabilities and unavailable-decoder reasons.
      The modern island searches client modes, labels analog demodulators and
      digital decoders, and displays missing software requirements for
      unavailable decoders. A separate websocket capability message preserves
      the legacy available-only mode list. Python capability tests and a DOM
      smoke check cover both selection and unavailable-mode feedback; direct
      browser/device verification remains open.
- [x] Preserve direct frequency entry and keyboard tuning; improve touch targets,
      contrast, and accessibility. Arrow keys tune by one configured step and
      PageUp/PageDown by ten steps; apply, nudge, bookmark, and mute controls now
      meet a 44 px minimum. Focus visibility, color contrast, reduced motion, and
      zoomable mobile viewport are implemented. Headless Chromium verified the
      responsive layout and RF-controls sheet at 390×844, plus the desktop layout
      at 1440×1000. Physical phone, keyboard, and live receiver verification
      remain open.
- [x] Add saved layouts and bookmarks. The modern receiver island opens the
      existing bookmark editor for the tuned frequency and mode, and adds
      profile-scoped browser-local layouts that restore frequency and mode
      without switching SDR sources. Layout save/apply/remove, unavailable-mode
      handling, and storage scoping are covered by its DOM smoke check. The
      legacy BookmarkBar still owns bookmark storage, and direct browser/device
      verification remains open.
- [x] Show separate connection, audio, and decoder status. The modern island
      distinguishes decoder off, a selected digital decoder with no recent
      output, and decoder output received within the last 15 seconds. The legacy
      `secondary_demod` websocket event supplies activity; UI smoke tests cover
      all three states. Live receiver/browser verification remains open.
- [x] Apply consistent styling to settings, maps, login, and administration.
      `static/css/modern-shell.css` now extends the receiver's charcoal, cyan,
      and amber design across settings subpages, clients/services/features,
      received files, login/password change, policy, and both map renderers.
      It styles controls, panels, tables, and responsive layouts while loading
      after each page's existing stylesheets. Package metadata and CI assert the
      stylesheet ships in the wheel; mocked Chromium layouts were reviewed at
      desktop and 390 px widths. Live application and map-provider review remains
      open.
- [x] Present two source-distinct receivers in an opt-in, responsive dual-pane
      view while preserving the single-receiver flow for other devices. The
      second same-origin receiver session selects a profile from a different SDR
      source and exposes its own waterfall, tuning, mode, status, and audio
      controls. Closing the pane removes that receiver session. DOM coverage
      verifies source-distinct selection and pane lifecycle; source tests verify
      Master-first initialization and Slave-first shutdown. Driver commits are
      pinned and checked for the required mode codes. The `Open separate window`
      path remains available.
- [ ] Verify both RSPduo sources simultaneously on hardware with independent
      tuning, status, and audio. Actual browser/audio/hardware concurrency
      verification remains open; follow the acceptance procedure in
      `docs/rspduo-dual-tuner.md`.

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

- [x] Pin and inspect an exact Data2G host candidate and its supported interfaces.
      `docs/data2g-integration.md` records source commit
      `3a859720911469cf5164bfc9d7de6ac63c169fd8`, Python/native host distinctions,
      KISS and command-channel behavior, and pipe audio. This is an evaluation pin;
      the project does not yet declare it as a production dependency.
- [x] Prove recorded-WAV decoding through that host before connecting live SDR audio.
      `tools/data2g_rx_smoke.py` creates a standards-compliant mono PCM WAV using
      Data2G's KISS broadcast encoder, converts it to the native host's documented
      raw float32/8 kHz pipe format, and asserts the exact frame arrives on KISS
      without enabling the ARQ listener. It passed against the native host built
      from the pinned candidate commit, with its default decode worker. This proves
      offline host interoperability only; it does not exercise an SDR or RF.
- [x] Select a supported server-side audio input mechanism, or add a PCM ingestion
      API if the host lacks one. The native host's `--audio-io pipe:IN,OUT`
      accepts raw float32 mono at 8 kHz and was exercised by the recorded-WAV
      smoke check. `Data2GDemodulator` now requests the demodulator's fixed 8 kHz
      output and tees its pre-client `audioBuffer` into a native-host FIFO.
- [x] Verify the Data2G feed through the actual CSDR chain before listening-
      volume/noise processing. `test/data2g_csdr_tap_smoke.py` ran inside the
      current receiver image with synthetic 1 kHz USB IQ and confirmed finite,
      non-silent float32 audio at 8 kHz reached the native-host FIFO. This
      verifies the pycsdr chain and tap placement without SDR hardware.
- [ ] Verify live SDR ingestion and dual-tuner operation with Data2G on a
      receiver installation; synthetic IQ does not prove device lifecycle or RF.
- [x] Enforce receive-only behavior at the host boundary: no automatic replies,
      rate reports, CAT, or PTT. The worker no longer sends `LISTEN ON`, so the
      host's ARQ listener and automatic replies stay disabled while broadcast
      KISS receive continues. It starts with `--no-rig`, rigctld port 0, loopback
      command/KISS listeners, and `/dev/null` as audio output. The native-host
      generated-WAV integration test receives the exact 42-byte frame without
      enabling ARQ; no CAT/PTT or audio path to RF exists. The host KISS API
      still accepts local transmit frames, but they cannot reach RF in this
      launch configuration. Protocol-level TX rejection and a broader command
      audit remain follow-up work.
- [x] Generalize `owrx/aprs/kiss.py`, which previously accepted only command byte
      `0x00`, to preserve KISS port and command fields. A standalone decoder now
      handles all 16 ports, escaped/chunked payloads, ACKMODE classification,
      malformed escapes, and a 1 MiB frame cap; five focused regression cases pass.
- [x] Bound worker buffers and handle host reconnects and failures. The native
      worker now has a 64 KiB PCM queue (two seconds at 8 kHz), 256 KiB maximum
      input chunks, a 1 MiB KISS frame cap, bounded startup/shutdown, and a
      two-process limit. It reports queue drops and process/socket errors; an
      independent supervisor retries startup and restarts failed sessions with
      bounded exponential backoff. Unit coverage checks bounded nonblocking
      enqueue and supervisor retry; an integration test against the pinned native
      host kills the first process and confirms the supervisor starts a second.
      Startup cleanup now also releases its global slot and temporary resources
      if FIFO or port setup fails; a regression test covers that failure path.
      This exercises host-process recovery without an SDR, not receiver audio or
      RF; broader live-chain verification remains open.
- [x] Route recognized AX.25/APRS messages through the existing APRS parsers,
      and preserve other KISS frames as typed raw-frame events. A generated
      AX.25 position frame exercises the real `Ax25Parser` and `AprsParser`
      through `_Data2GAudioInput._on_frame`; the test checks callsigns,
      coordinates, message content, multi-port raw frames, and ACKMODE
      classification. Browser DOM tests cover presentation. Map/reporting hooks
      are stubbed in this parser test, so operational integration remains open.
      Dedicated handlers for other application protocols are still needed. The
      legacy packet path continues to receive only port-0 KISS data payload bytes.
- [x] Show receive activity when available and promote validated decoded messages
      only after host decoding completes. The worker subscribes to Data2G command
      notifications and reports channel busy/clear plus HEARD/LOST/MISSED/DROPPED
      burst outcomes through bounded, schema-versioned events. The modern UI keeps
      a bounded activity timeline while complete KISS/APRS messages remain gated
      on host decoding. Parser and DOM tests cover valid and malformed status
      events. The generated-waveform OpenWebRX-worker smoke test against the pinned
      native host received both the exact KISS frame and its `BCAST HEARD` status.
      This validates the offline host/worker path; live SDR audio and RF behavior
      remain unverified.
- [x] Verify the restartable decoder worker independently of the receiver. The
      native worker and restart supervisor run outside browser DSP pumps, drain
      PCM while starting/restarting, and stop with the secondary demodulator. A
      process-kill integration test confirms restart against the pinned native
      host without initializing receiver/DSP services. Synthetic IQ now verifies
      the pycsdr audio tap; live SDR ingestion and SDR-host shutdown lifecycle
      remain unverified.
- [ ] Share equivalent decoder sessions where possible; same-source sessions
      still run separate host processes.
- [x] Cap concurrent Data2G decoder workers. A process-wide limit of two native
      host processes is enforced. The native-host integration proof now also
      starts two independent OpenWebRX workers concurrently and requires both to
      receive the exact generated KISS frame and `BCAST HEARD` status. This
      validates two decoder processes in software, not two live tuner audio paths.
- [ ] Verify WAV fixtures, host reconnects, live SDR audio ingestion, and reception
      from a separate transmitter, reporting each verification boundary separately.
      The current generated-WAV proof was rerun with the no-rig/discard-output
      boundary above; live SDR and RF checks remain outstanding.

Completion: recorded bursts appear correctly in the browser, receive-only behavior
is enforced, and live ingestion is verified. A KISS connection alone is not completion.

## Phase 5 — Backend transport and performance

- [ ] Replace custom HTTP/WebSocket handling incrementally with a maintained ASGI
      stack after a compatibility prototype.
- [x] Keep DSP subprocesses outside the request loop. Recorded-audio decoder jobs
      run `Popen` from dedicated `DecoderQueue` worker threads; a regression test
      verifies the process launch does not run on the submitting thread. Data2G
      native hosts launch from their independent receive-worker supervisor, and
      SDR source processes use source lifecycle threads. Image-upload conversion
      remains a request-triggered non-DSP subprocess and is outside this item.
- [ ] Define versioned decoder events and strict input validation.
      Data2G's `data2g_frame`, `data2g_aprs`, and `data2g_status` events now use
      schema version 1. The browser rejects unknown versions, invalid KISS port/
      command values, inconsistent or malformed bounded hex payloads, malformed
      APRS fields, and unknown status states; receiver DOM tests cover valid and
      rejected events. Data2G status now includes bounded channel/burst activity
      fields. Decoder failures now have a bounded, versioned server event while
      retaining the legacy string message during migration. Backend producer,
      browser validation, and DOM tests cover unknown versions and oversized
      errors. Generic legacy digital-decoder output now also emits a small v1
      activity event with timestamp and bounded modulation identity while
      preserving its existing opaque payload for panels; the browser validates
      and projects that output to modern status consumers.
      Rich per-decoder payload schemas and strict field validation still need
      migration before this item is complete. See `docs/data2g-integration.md`.
- [ ] Add bounded queues, subprocess supervision, restart backoff, and overload behavior.
- [x] Prevent slow clients from accumulating unlimited waterfall data. The
      outbound websocket queue now caps both item count (100) and serialized
      queued bytes (4 MiB); overload clears the backlog and closes that client
      connection instead of allowing stale waterfall data to grow without bound.
      Close now atomically blocks new producers before placing its stop sentinel,
      and rejects non-serializable or non-finite messages. Focused tests cover
      byte-budget rejection, dequeue accounting, item limits, close races, and
      backlog discard on shutdown.
- [x] Refine existing AudioWorklet support and measure buffering/reconnect behavior.
      The worklet ring now tracks exact occupancy (including the full-buffer
      state), rejects overflow without overwriting unread samples, acknowledges
      accepted/dropped chunks, and reports buffered/dropped sample counts. Main-
      thread messages in flight are capped to one second of samples; the
      ScriptProcessor fallback reports bounded-queue drops too. Websocket close
      flushes stale queued audio before reconnection. `test/audio_worklet.cjs`
      exercises ring wrap, full/overflow, underflow silence, drop accounting,
      in-flight admission, fallback limits, and reconnect flush with controlled
      audio blocks. Browser/device playback latency and audible reconnect quality
      still need measurement on a live receiver.
- [ ] Move waterfall work to a worker or GPU renderer only where profiling supports it.
- [ ] Compare new behavior against Phase 1 latency, CPU, memory, and audio baselines.

Completion: reliable reconnects and predictable behavior under load without receiver
regressions. Avoid simultaneous rewrites of DSP, browser audio, and transport.

## Phase 6 — Release packaging and useful extensions

- [ ] Compose services with optional decoders, explicit device access, health checks,
      persistent volumes, resource limits, and pinned releases. `Dockerfile` overlays
      this checkout's Python/browser assets on the digest-pinned OpenWebRX+ 1.2.126
      runtime, and `compose.yaml` defines persistent config/data volumes, a
      loopback-only published port, SDR-aware health checks, shutdown grace, and
      CPU/memory limits. SoftMBE and USB access are separate opt-in Compose
      overlays (`compose.softmbe.yaml`, `compose.sdr.yaml`); the base service has no
      device mapping. Default image build, isolated startup, and `/status.json`
      passed locally; all three Compose variants parse. The SoftMBE image also
      built and reached healthy status with a successful `/status.json` response.
      Actual USB access, hardware/decoder operation, and upgrade/rollback against
      an existing deployment still require separate verification.
- [x] Provide repeatable releases, configuration backups, upgrade notes, and rollback.
      `tools/compose_backup.sh` creates verified, checksum-backed archives of both
      actual Compose volumes, records the image and source revision, and restarts
      the receiver after success or failure. `docs/deployment-operations.md`
      documents unique image tags, health checks, image rollback, and volume
      restore. Restore was documented but not rehearsed against a disposable copy.
- [x] Preserve license notices and attribution when introducing the new identity.
      The existing AGPLv3-only project license and author notices remain in the
      source, project metadata, and container labels. `THIRD_PARTY_NOTICES.md`
      inventories checked-in and bundled frontend code, and required Svelte and
      vendor license texts ship under `htdocs/lib/licenses` and
      `htdocs/lib/leaflet/licenses`; CI checks the license assets in the built
      wheel. Exact provenance for several older vendored assets remains an
      inventory follow-up in `THIRD_PARTY_NOTICES.md`.
- [x] Add receiver health reporting for decoder failures, audio drops, and device state.
      Versioned `receiver_health` websocket events now expose selected SDR source
      state, failures, disablement, and shutdown separately from websocket
      connection state. Generic decoder errors and AudioWorklet/ScriptProcessor
      dropped-sample counts also appear in the modern status area; Data2G worker
      state and errors remain in its receive panel. UI tests cover source state,
      decoder failure, and audio drops. Actual hardware failure transitions still
      need verification on an SDR host.
- [x] Add searchable reception history with frequency, timestamp, mode, and content.
      Completed decoder outputs now enter a versioned browser event and are
      validated before persistence. The modern history panel stores the most
      recent 500 entries locally, with a 2,048-character content bound, and
      searches time, frequency, mode, profile, and decoded content. DOM tests
      cover persistence/reload, same-origin pane synchronization, each searchable
      field, clear, schema rejection, and content limits. This is per-browser
      storage, not station-wide or cross-device history; see
      `docs/receiver-history.md`.
- [ ] Attach short audio pre-roll to interesting receptions.
- [ ] Add scheduled monitoring of bookmarked frequencies.
- [ ] Add recording quotas and retention policies.
- [x] Expose authenticated MQTT reporting for Node-RED, n8n, and Home Assistant.
      The existing MQTT reporter publishes decoder reports as JSON, supports
      broker username/password and TLS, and allows inbound report categories to
      be selected independently. `docs/mqtt-integration.md` now documents topic
      semantics, broker ACLs, and client setup; authentication and TLS behavior
      still require verification against the deployment's broker.
- [x] Add an optional read-only MCP interface for local automation and assistants.
      `openwebrx-mcp` uses stdio and reads the existing public status endpoint;
      its two tools expose filtered station and active receiver-profile metadata.
      An opt-in Streamable HTTP mode requires a shared bearer token, defaults to
      loopback, and retains SDK host/origin checks. The service does not open
      SDRs or provide receiver-control, TX, or PTT tools. OAuth login/discovery,
      event subscriptions, and richer receiver controls remain future work.
      Regression checks now cover redirect refusal, JSON content type, and the
      1 MiB status-response bound; see `docs/mcp-integration.md`.

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
