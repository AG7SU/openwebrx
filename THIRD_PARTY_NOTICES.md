# Third-party frontend inventory

Reviewed: 2026-10-08

This is an evidence inventory for assets shipped or fetched by the browser. It
is not a legal review or a vulnerability scan. Local SHA-256 values identify
the exact checked-in artifacts; matching upstream releases are not established
unless stated below.

## Checked-in vendor assets

| Asset | Recorded version | License evidence | SHA-256 |
| --- | --- | --- | --- |
| htdocs/lib/jquery-3.7.1.min.js | 3.7.1 in filename and banner | Header points to jQuery's license page; no separate license file is stored here. | fc9a93dd241f6b045cbff0481cf4e1901becd0e12fb45166a8f17f95823f0b1a |
| htdocs/lib/bootstrap.bundle.min.js | 4.5.0 in banner | MIT stated for Bootstrap; bundled Popper component version and notice still need confirmation. | 5054562e6bad08ee5c3fe8e99ef645c9e539426080e24bd690a3004bae0a3de3 |
| htdocs/css/bootstrap.min.css | Bootswatch 4.5.0 and Bootstrap 4.5.0 in banner | MIT stated in banner for Bootswatch and Bootstrap. | 7fc8a1dae1155b1882d01e646a9dc2bc3ce0dee9d34983c97b3010c93997608a |
| htdocs/lib/chroma.min.js | 2.0.3 in the minified runtime (`h.version`); upstream release match unverified | Banner includes a BSD-style three-condition notice and ColorBrewer attribution. | 1c9374b3415be8db0758965cdd50d2d23928ac67d2d584be8223506e2bdab1fb |
| htdocs/lib/jquery.nanoscroller.min.js | 0.8.7 in banner | MIT stated in banner. | 50b63ee79f8b149f32e87d97620128e452d66ae2e606668aa1e6a9c027e176c7 |
| htdocs/lib/nanoscroller.css | 0.8.7 package companion to jquery.nanoscroller.min.js | MIT attribution comes from the paired nanoScrollerJS bundle banner and [upstream v0.8.7 package metadata](https://github.com/jamesflorentino/nanoScrollerJS/tree/v0.8.7). | bf0352a290c90912333f2e239cdb4d4035a873460218c6ff58e23d364de558fc |
| htdocs/lib/nite-overlay.js | 1.7 in source header | [Upstream project](https://github.com/rossengeorgiev/nite-overlay) identifies an MIT license; full text ships at `htdocs/lib/licenses/Nite-Overlay-MIT.txt`. | 92f548378692fc7617e822093636783aa091eb377f74e23c9219789c36e4801c |
| htdocs/lib/location-picker.min.js | Legacy UMD bundle; upstream release/version not recorded | File banner identifies cyphercodes, says GPLv3, and notes included upstream PR #11 for zero latitude/longitude. GPL-3.0 text ships at `htdocs/lib/licenses/GPL-3.0.txt`. | 7f230f5026d1f8a8b77ab2ee3e40af763a9c18410a1bb8db740504082a76a8cb |
| htdocs/lib/lame.min.js | 1.2.1 per matching upstream package metadata | Local SHA-256 matches the upstream lamejs master asset checked 2026-10-08. [Upstream package metadata](https://github.com/zhuker/lamejs/blob/master/package.json) reports LGPL-3.0; LGPL-3.0 text ships at `htdocs/lib/licenses/LGPL-3.0.txt`. | 15d285e2587b3bdbfd18a68de6ce07cc074f7480a82c3815da2dc1c348ec6df4 |
| htdocs/lib/markdown-it-15.0.2.min.js | 15.0.2 npm package UMD browser build | Vendored from [markdown-it@15.0.2](https://www.npmjs.com/package/markdown-it/v/15.0.2), npm tarball SHA-512 `q4IGxMv56jCqT4OCRCADBoDP3LO4MhmTXjFbphHPXs4g3j9Xg5RDnxqN8IF/3vIWEU+VCnUq+7JUg/cfy2E6Qw==`; MIT text ships at `htdocs/lib/licenses/Markdown-it-MIT.txt`. Local SHA-256: `635972b985228e8af9f0143647c68616b7a3bb09f6946e7e4a52e43dcf5e7be5`. |

Keep full upstream license texts and notices with redistributed artifacts as
required by each license. The chroma.js runtime identifies itself as 2.0.3, but
its exact upstream release remains unverified. The legacy location-picker bundle
has no version marker; its lineage includes upstream PR #11. lame.min.js matches
the current upstream repository file by hash; pin a release/commit before the
next release.

## Runtime-loaded browser code

| Dependency | Current source in checkout | Pinning/integrity status |
| --- | --- | --- |
| Svelte runtime | bundled into `htdocs/modern/receiver-ui.js`, version 5.57.2 | Pinned by `frontend/receiver-modern/package-lock.json`; MIT text ships at `htdocs/lib/licenses/Svelte-MIT.txt`. The runtime is bundled; Vite and TypeScript are build-only. |
| Leaflet CSS and JavaScript | htdocs/lib/leaflet/leaflet.{css,js}, version 1.9.4 | Vendored from the [leaflet@1.9.4 npm package](https://www.npmjs.com/package/leaflet/v/1.9.4) (`sha512-nxS1ynzJOmOlHp+iL3FyWqK89GtNL8U8rvlMOsQdTTssxZwCXh8N2NB3GDQOL+YR3XnWyZAxwQixURb+FA74PA==`); BSD-2-Clause text ships at `htdocs/lib/leaflet/licenses/Leaflet-BSD-2-Clause.txt`. JS SHA-256: `db49d009c841f5ca34a888c96511ae936fd9f5533e90d8b2c4d57596f4e5641a`; CSS SHA-256: `a7837102824184820dfa198d1ebcd109ff6d0ff9a2672a074b9a1b4d147d04c6`. |
| Leaflet.Geodesic | htdocs/lib/leaflet.geodesic-2.7.2.min.js | Vendored [2.7.2 release](https://github.com/henrythasler/Leaflet.Geodesic/releases/tag/v2.7.2); upstream asset SHA-512 `xpefEm742/sELYn8wdYCejRseXu24rGp5BxGShPo1lN+UxwPPIYNiskHW8GIJvFAicvqpzH62fltgly0eaAbOA==` verified. GPL-3.0 text ships at `htdocs/lib/licenses/Leaflet-Geodesic-GPL-3.0.txt`; local SHA-256: `60944f24c4db35a8b8930ec47d995dc7031251391ad9cea678421c7fcfa6b282`. |
| Leaflet.TextPath | htdocs/lib/leaflet/leaflet.textpath-1.2.3.js | Vendored from the [leaflet-textpath@1.2.3 npm package](https://www.npmjs.com/package/leaflet-textpath/v/1.2.3) (`sha512-mPb5m2MlihNkLlo762j8S8FJCUyLvDU2fJTjjmDWKfqqyUQkV3ca3IzrxwsfzYz2DXrV2ytCVHb5+DjQymF+8w==`); MIT text ships at `htdocs/lib/leaflet/licenses/Leaflet-TextPath-MIT.txt`; local SHA-256: `296db08583608ef852b8186cb5a5eb52b264a8a43954766fe7322e5dac38903b`. |
| Leaflet.Terminator | htdocs/lib/leaflet/L.Terminator-1.1.0.js | Vendored from the [@joergdietrich/leaflet.terminator@1.1.0 npm package](https://www.npmjs.com/package/@joergdietrich/leaflet.terminator/v/1.1.0) (`sha512-Bq/dBECmVH6nf8V0zVSS7dUJA4bqe0Czl0DWzV1O1kTl5hMXGGc4EuyhTMft6KMLTU0GTLr4dvEa3YfXJWUUTQ==`); MIT text ships at `htdocs/lib/leaflet/licenses/Leaflet-Terminator-MIT.txt`; local SHA-256: `85f6682ca1e8bfcc3fa00d7551cd06ae0ea54533aec93198ee078a3e76276a78`. |
| Leaflet.Maidenhead | htdocs/lib/leaflet-maidenhead-c15c07b.js | Vendored from [upstream commit c15c07b](https://github.com/ha8tks/Leaflet.Maidenhead/commit/c15c07bacbde2ef2e8a274a65594ecaa43e00de0); MIT text ships at `htdocs/lib/licenses/Leaflet-Maidenhead-MIT.txt`; local SHA-256: `3cbc6ede686d49a93165ee9b045fff8ba2292a8a9f1dc579ba59e3b43408403a`. |
| Google Maps JavaScript API | maps.googleapis.com/maps/api/js?key=... in htdocs/map-google.js and settings | Provider-hosted API is not version-pinned in the URL; API keys are encoded as a single query parameter; governed by Google Maps Platform terms. |

The Leaflet map and its plugins now load from local, checksum-recorded assets.
The feature report ships its pinned markdown-it parser locally and sanitizes
generated markup before adding it to the report table.
External map tile providers remain runtime data dependencies, and the alternate
Google Maps page still loads Google's provider-managed JavaScript API. Keep those
network requirements in the CSP/deployment review.

## Inventory follow-up

- Match chroma.js 2.0.3 and the legacy location-picker bundle to exact upstream
  releases/commits; pin lamejs to a release/commit.
- Scan vendored package versions. The previous Showdown 2.1.0 bundle was
  replaced after npm audit identified advisories with no fixed Showdown release;
  markdown-it 15.0.2 passed the npm advisory audit at the time of this review.
  CI checks the versioned package inventory in `tools/vendor-audit`; that
  inventory does not claim coverage for unknown-provenance assets.
- Inventory libraries included by plugins, themes, or generated asset bundles.
- Review the provider-managed Google Maps API and remote map tile providers for
  CSP/network policy and availability.
- Scan pinned Python/frontend/native dependencies and deployment images for
  known vulnerabilities before release.
