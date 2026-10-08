# Modernization baseline inventory

Reviewed: 2026-10-08

This is a source-tree inventory, not a complete runtime bill of materials. The
receiver's optional capabilities depend on host-installed native libraries,
executables, and SDR drivers; those vary by installation and must be inventoried
on a deployment before producing a lockfile or security attestation.

## Packaging and runtime

- Canonical Python project metadata is now in PEP 621 `pyproject.toml`, with a
  compatibility `setup.py` stub for legacy setuptools and Debian pybuild.
  Python requires is `>=3.11`: Python 3.9 and 3.10 are end-of-life, and 3.11
  remains in security-fix support through October 2027. This exceeds the source
  API floor (`importlib.resources.files()` requires 3.9), but native receiver
  compatibility is not yet established. The required `packaging` version
  parser is declared as a runtime dependency; the DSP/native stack remains
  managed by Debian packages, with optional Python integrations as system
  recommendations.
- Source uses `importlib.resources.files()` in the HTTP asset/template paths, an
  API introduced in Python 3.9; this establishes the initial source API floor,
  not compatibility of native SDR bindings or every supported host package.
- A local interpreter probe on 2026-10-08 found system Python 3.14.4 and
  `importlib.resources.files()` available. A prior runtime use of
  `distutils.version` has been removed; decoder version checks now use the
  declared `packaging` dependency, avoiding reliance on setuptools' compatibility
  shim in Python 3.12+.
- Debian packaging declares the native and optional runtime dependency set;
  `pyproject.toml` declares the pure-Python `packaging` runtime dependency.
  `debian/control` declares Python `>=3.11`, `owrx-connector >=0.6.5`,
  `python3-csdr >=0.18.40`,
  and optional decoder packages. Debian builds require setuptools 61+ to consume
  PEP 621 metadata. Build tooling uses debhelper, dh-python, and setuptools.
- A source AST import scan (2026-10-08; direct imports only, not dynamic imports
  or the dependency closure) identified these non-standard Python modules. It can
  be regenerated with `python3.14 tools/inventory_python_imports.py`; that tool
  requires Python 3.10+ for the standard-library classification and emits all
  three groups (stdlib, in-tree, external) as JSON:

  ```sh
  python3.14 tools/inventory_python_imports.py --output python-imports.json
  ```

  | Imported modules | Use and package mapping |
  | --- | --- |
  | `pycsdr.modules`, `pycsdr.types` | Core DSP/source/audio bindings; provided by the Debian `python3-csdr` dependency. |
  | `packaging.version` | PEP 440 application/decoder version parsing; required dependency `packaging>=23.0`, Debian `python3-packaging >=23.0`. |
  | `digiham.ambe`, `digiham.modules` | Optional digital-voice demodulation; Debian recommendation `python3-digiham`. |
  | `csdreti.modules` | Optional DAB ETI decode; Debian recommendation `python3-csdr-eti`. |
  | `js8py`, `js8py.frames`, `js8py.version` | Optional JS8 payload decode; Debian recommendation `python3-js8py`. |
  | `paho.mqtt`, `paho.mqtt.client` | Optional MQTT reporting; Debian recommendation `python3-paho-mqtt`. |
  | `Cryptodome.Cipher`, `Cryptodome.Util` | Optional Meshtastic decryption; Debian recommendation `python3-pycryptodome`. |
  | `google.protobuf.json_format`, `meshtastic`, `meshtastic.protobuf` | Optional Meshtastic payload parsing; Debian recommendation `python3-meshtastic` supplies this stack. |

  Runtime feature detection also invokes external commands and conditionally
  imports decoder modules, so this is a source-import snapshot rather than a
  complete Python SBOM. Debian package metadata owns the native and optional
  runtime dependency declarations; PEP 621 declares the pure-Python
  `packaging>=23.0` dependency.
- `uv.lock` pins `packaging` 26.3 with PyPI sdist and wheel SHA-256 values. CI
  checks it using uv 0.8.13 and runs the Python unit suite in that locked
  environment. This lock covers only PEP 621 project dependencies; it does not
  lock Debian packages, SDR bindings, optional decoder integrations, external
  binaries, or build tools installed outside the PEP 517 build-system pin.
- The receiver requires the `csdr`/`pycsdr` bindings at runtime. Hardware and
  decoder support is discovered from host executables and Python modules in
  `owrx/feature.py`.
- The systemd unit runs as the dedicated `openwebrx` user and restarts the service.
- `pyproject.toml` selects the PEP 517 setuptools backend at exactly version
  84.0.0 and owns PEP 621 project metadata; package discovery includes the
  receiver's implicit Python subpackages and static `htdocs` namespace trees.
  `setup.py` remains a zero-configuration compatibility stub.
  `.github/workflows/ci.yml` checks the unittest suite, frontend JS syntax, a
  jsdom-based metadata and radio-rendering security regression tests, PEP 517 wheel build, wheel
  metadata, and `pip-audit` scan of the hash-pinned dependency export on Python
  3.11/3.14. `uv.lock` locks the pure-Python project dependency. There is
  no Dockerfile or Compose file. CI does not yet scan Debian/native package
  vulnerabilities, vendored frontend assets, or container images, build native
  SDR bindings, or exercise decoder fixtures. The Python audit does not cover
  receiver packages installed through Debian metadata.
- The locked Python suite was run locally under uv-managed CPython 3.11.13 on
  2026-10-08: all 115 tests passed. The host's pyenv `python3.11` shim was
  unusable, so the managed interpreter was installed into uv's user cache and
  the isolated project environment was kept under `/tmp/openwebrx-py311`.
- `tools/benchmark_password_hash.py` measures `HashedPassword.is_valid` and
  reports synthetic measurements without printing or storing the test password
  or hash. A development-host sample under CPython 3.13.6 measured medians of
  44.278 ms (100,000), 129.608 ms (300,000), and 276.292 ms (600,000) iterations.
  This is not a receiver benchmark and does not justify raising the production
  work factor; run the tool on the actual receiver under expected CPU load.
- Wheels were built with setuptools 78.1.1 under system Python 3.14 and, after
  pinning, with setuptools 84.0.0 in uv's isolated Python 3.12 build environment.
  The latter wheel has 338 entries and the source archive has 387; both include
  core receiver modules and vendored assets, and the wheel advertises
  `Requires-Python: >=3.11` without generated Python cache files. CI asserts wheel
  contents and the exact build-backend pin. Neither artifact was installed or
  exercised at runtime. Native Debian packages are managed separately and need
  to remain compatible with the receiver host's package manager and native stack.
- `docker.sh` references `docker/Dockerfiles/*` and
  `docker/deb_based/Dockerfile`, but neither directory nor any Dockerfile exists
  in this checkout, so it cannot currently produce the documented container
  images. `buildall.sh` clones mutable branches, removes local build/output
  directories, and installs packages with `sudo`; it is a host build workflow,
  not a reproducible or safe default developer setup. Do not use either script
  as the Compose/development baseline without redesigning and validating it.
- No recorded signal fixtures or browser smoke harness were identified in the
  existing `test/` tree. Tests there are Python unit/property tests and jsdom
  checks for metadata/radio rendering, receiver UI events, and pinned map assets.

## Browser assets

- JavaScript and CSS are served from `htdocs/`; there is no frontend build
  manifest or runtime package installation. `tools/vendor-audit/` is an
  advisory-only manifest and lock for known-version vendored packages, not a
  frontend build system.
- A repository inventory of vendored frontend assets, version/license evidence,
  local hashes, and runtime-loaded map libraries is in
  THIRD_PARTY_NOTICES.md. Several minified assets still lack version or exact
  upstream provenance. Leaflet 1.9.4, Geodesic 2.7.2, TextPath 1.2.3, Terminator
  1.1.0, and Maidenhead at pinned commit `c15c07b` are now shipped locally with
  license texts and recorded hashes. The alternate Google Maps page still loads
  a provider-managed API; map tiles remain remote data dependencies. The feature
  report ships markdown-it 15.0.2 locally and sanitizes generated markup through a
  tag and URL allowlist, with regression tests for active HTML and unsafe links.
  Relative map timestamps use `Intl.RelativeTimeFormat`, removing the external
  Moment script from both map pages.
- The receiver uses WebSocket, Web Audio, Canvas, and an existing AudioWorklet
  path (`htdocs/lib/AudioEngine.js`).

## Native and optional decoder surface

`owrx/feature.py` enumerates runtime checks and optional tools, including CSDR,
SoapySDR connectors and device drivers, Direwolf, WSJT-X, JS8Call, digital-voice
decoders, dump1090/dump978, ACARS/VDL2/HFDL decoders, ImageMagick, MQTT, Hamlib,
and other receiver-specific features. The Debian `Recommends` list is the
installable package snapshot, but it does not establish what binaries or shared
libraries exist on an actual host.

Before selecting a supported Python baseline or pinning native components:

1. Inspect the deployment's OS release and installed package versions.
2. Record `openwebrx --version`, Python, CSDR/pycsdr, connector, SDR drivers,
   decoder binaries, and shared-library versions.
3. Exercise configured SDR types and optional decoders against sample data.
4. Check build and runtime support across the intended Debian/Ubuntu releases.

`python3 tools/capture_modernization_baseline.py --output host-baseline.json`
captures OS, kernel, architecture, Python, selected executable paths, and Debian
package versions without starting receiver or decoder processes. It also records
the selected Python module origins and shared libraries registered in `ldconfig`
(filtered to known SDR/DSP/codec libraries). Run it on the actual receiver host
and review the resulting file before sharing it. The collector does not query SDR
hardware, statically linked libraries, or versions for every executable.

The collectors were rerun from the development workspace on 2026-10-08. The
import scan classified 16 external direct-import modules (alongside 165 in-tree
and 66 standard-library modules). The host collector identified Ubuntu 26.04.1,
x86_64, Python 3.14.4, 22 candidate shared-library names, and seven listed
executables. `openwebrx`, `csdr`, and `pycsdr` are absent here. The JSON reports
were kept in `/tmp` rather than committed as receiver inventory. This confirms
the tools work locally while showing this environment is not a functional
receiver baseline; capture the actual receiver separately before choosing
Python/native compatibility or claiming runtime coverage.

Do not infer a current secure version from a package minimum in `debian/control`.
Use an OS/package vulnerability scan and review the vendored browser libraries
before publishing a release.

## Security changes made under phases 1–2

- Responses now include `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and a nonce-based
  `script-src` using `strict-dynamic`, alongside `base-uri 'self'` and
  `object-src 'none'`. HTML templates receive a unique per-response nonce on
  their external script and stylesheet elements. Inline styles remain allowed
  because a style-source policy has not yet been introduced. The CSP has not
  been verified in a deployed browser, particularly with Google Maps and remote
  plugins.
- Administrative SDR device/profile deletion, profile moves, and logout now
  require POST. Their UI controls submit POST requests. Existing cross-site
  request checks apply to authenticated requests and state-changing methods.
- In-memory sessions now have a hard capacity and expired records are pruned
  during allocation. The oldest-expiring session is evicted when at capacity.
- CSRF tokens are generated per session; POST/PUT/PATCH/DELETE requests must
  supply the matching hidden form field or `X-CSRF-Token` header. Anonymous login
  uses a SameSite pre-auth token cookie and rotates to a new authenticated session
  on success. Settings forms, password changes, and AJAX admin actions receive
  the token.
- Password changes/resets, user deletion, and disabling an account revoke prior
  sessions in the current process. User records now carry a credential version,
  and a stable account ID, so sessions from other processes are rejected after
  a password change/reset, disable operation, or account deletion/recreation
  reloads the changed user file. A self-service password
  change issues a fresh session ID after revocation so the user can continue
  without signing in again. Sessions created before this version field was added
  must sign in again.
- Legacy cleartext password records are converted to the existing salted PBKDF2
  representation after a successful login. The current 100,000-iteration work
  factor still needs a receiver-host benchmark and upgrade decision.
- Password creation and verification reject empty inputs and inputs larger than
  1024 UTF-8 bytes; verification applies the bound before PBKDF2. The login and
  forced-change forms also cap inputs at 1024 characters. This reduces oversized
  password CPU abuse but does not replace request throttling or a work-factor review.
- Shared callsign links now escape labels/tooltips and accept only HTTP(S) target
  URLs with `noopener noreferrer`. JS8 text, map popup and locator fields,
  receiver details, chat/log messages, profile/mode options, and bookmark names
  are rendered as text or escaped. Bookmark settings rows escape persisted values
  in both server HTML and client-side imports. The map list-item helper escapes
  by default and permits HTML only for generated links and country flags. The
  ADS-B aircraft table now escapes decoded emergency, squawk, and other text
  fields before HTML insertion. Shared header text/attributes are escaped, URL
  schemes are constrained, and timeout refresh markup is built through DOM APIs.
  Settings breadcrumbs and exception messages are escaped before insertion.
  Connected-client names and profile labels are escaped, GeoIP links are
  HTTP(S)-only, service table labels are escaped, and settings section titles
  and validation messages are escaped.
  Photo descriptions retain basic formatting through an allowlist sanitizer.
  WSJT, POCSAG/FLEX, HFDL, DSC, ISM, Meshtastic, and APRS message text now escapes
  decoder-provided values; colors and APRS sprite offsets are constrained.
  SSTV/FAX canvases use generated IDs, sanitized download names, and bounded
  dimensions/scanlines.
  The frontend sink review is still source-level and targeted; browser verification
  and review of the remaining template/plugin surface remain open.
- Login failures are throttled per remote peer after eight attempts in a
  fifteen-minute window. Throttle records are bounded and expire in memory.
- Session cookies receive the Secure attribute when the app is directly using
  TLS, or when an operator explicitly sets `OWRX_SECURE_COOKIES=true` behind a
  TLS-terminating proxy. Do not trust an arbitrary forwarded-proto header.
- `OWRX_TRUSTED_PROXIES` accepts comma-separated IPs/CIDRs. Forwarded client
  addresses are considered only when the immediate socket peer matches this
  allowlist. If that proxy omits or sends an invalid `X-Forwarded-For` chain,
  the request is not treated as local. Configure HAProxy to append the actual
  client address (or overwrite untrusted input) before enabling this setting.

These controls remain process-local. Restarting the app clears throttle/session
state, and multiple workers do not share it. Behind HAProxy, the socket peer is
the proxy unless trusted proxy handling is configured; do not enable forwarded
client identity until the proxy address is explicitly trusted.

## Remaining baseline/security work

- Add pinned build/release dependencies, a reproducible Compose deployment, CI,
  recorded receiver fixtures, browser checks, and performance measurements.
- Migrate remaining package metadata from `setup.py`, select supported Python/OS
  versions, and pin build/release dependencies after compatibility review.
- Browser and proxy-path verification of the CSRF and session-revocation flows.
- Persist sessions/rate limits or use a shared store if multi-process deployment
  becomes supported.
- Verify trusted-proxy behavior with the actual HAProxy configuration and public
  request path; forwarded scheme remains untrusted and Secure cookies must be
  enabled with `OWRX_SECURE_COOKIES=true` for TLS termination.
- Remote administration defaults to disabled. Loopback, RFC1918, and link-local
  addresses are treated as local; configure additional VPN CIDRs through
  `OWRX_ADMIN_NETWORKS`. Configure the actual proxy socket address in
  `OWRX_TRUSTED_PROXIES` and test a request through HAProxy before exposing a
  public receiver. Review persisted
  `allow_remote_config` values during upgrade; a saved `true` continues to allow
  arbitrary remote settings access.
- Complete decoder process resource limits, a CSP, comprehensive frontend sink
  review, and dependency/CVE scanning.
- Uploaded avatars and header photos now require ImageMagick to decode and
  re-encode PNG/JPEG/WebP input to bounded PNG output. Debian lists ImageMagick
  as a recommendation; without it the upload endpoint rejects new image uploads
  with a service-unavailable response. Other decoder workers do not yet have
  equivalent centralized resource limits.
- Queued digital decoders now run in their own process group with a 10-second
  wall-clock deadline, an 8 MiB stdout cap, and a 256 KiB per-line cap. This
  bounds those jobs' wait time and retained output; it does not yet apply CPU or
  memory rlimits to every SDR/decoder subprocess.
- Optional executable capability/version probes now have a 10-second deadline
  and kill their process group on timeout. Their captured output is not separately
  size-bounded; receiver and decoder runtime processes remain outside this probe
  timeout policy.
