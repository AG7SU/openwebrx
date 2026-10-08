# Modern receiver island

This is the first Svelte + TypeScript island in the receiver. It mounts alongside
the legacy receiver and uses a small typed adapter for frequency, mode, socket,
audio controls, recording actions, waterfall zoom, and range controls.
Waterfall rendering, audio buffering, encoding, and saved files remain owned by
OpenWebRX+.

The island depends on `window.OpenWebRXReceiver`, a compatibility bridge that
contains legacy global and profile DOM access. Keep new components on this typed
boundary instead of adding direct dependencies on `UI`, `Modes`, or jQuery.

Use Node.js 22.12 or newer:

```sh
npm ci
npm run check
npm run build
```

The build writes `htdocs/modern/receiver-ui.js` and
`htdocs/modern/receiver-ui.css`; those files are loaded by the receiver template
through the existing static asset route. Keep the built files synchronized with
the source in this directory.
