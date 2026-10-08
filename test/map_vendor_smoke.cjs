// Smoke-check that the pinned local Leaflet libraries compose without a CDN.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');

const root = path.resolve(__dirname, '..');
const dom = new JSDOM('<div id="map"></div>', {
    runScripts: 'outside-only',
    pretendToBeVisual: true
});
const window = dom.window;

for (const file of [
    'htdocs/lib/leaflet/leaflet.js',
    'htdocs/lib/leaflet/leaflet.textpath-1.2.3.js',
    'htdocs/lib/leaflet.geodesic-2.7.2.min.js',
    'htdocs/lib/leaflet/L.Terminator-1.1.0.js',
    'htdocs/lib/leaflet-maidenhead-c15c07b.js'
]) {
    window.eval(fs.readFileSync(path.join(root, file), 'utf8'));
}

assert.equal(typeof window.L.map, 'function');
assert.equal(typeof window.L.Polyline.prototype.setText, 'function');
assert.equal(typeof window.L.Geodesic, 'function');
assert.equal(typeof window.L.terminator, 'function');
assert.equal(typeof window.L.maidenhead, 'function');
assert(window.L.maidenhead({color: 'rgba(100, 100, 100, 0.6)'}));
dom.window.close();
console.log('Pinned Leaflet libraries loaded and exposed required APIs');
