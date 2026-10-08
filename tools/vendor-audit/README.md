# Vendored browser package audit

This manifest is an advisory-scan inventory for browser libraries with a
recorded upstream package and version. It is not an npm build for OpenWebRX and
does not install these packages into the application. `package-lock.json` pins
the scanned package graph; CI runs `npm audit` against it.

Compare this list with `../../THIRD_PARTY_NOTICES.md` before releases. The exact
upstream identity of the legacy chroma bundle remains unverified even though its
runtime reports version 2.0.3. The legacy location-picker bundle has no known
version and cannot be represented accurately here. The nanoScroller browser
bundle is also omitted: npm's 0.8.7 package pulls a CSS parser dependency for its
package graph that is not shipped in this standalone browser bundle. These
assets still require provenance review and direct source inspection.

Update the manifest only when a package/version corresponds to an asset in the
notices inventory. A clean npm audit does not cover Debian/native packages,
Google's provider-managed Maps API, map tiles, or unversioned assets.
