const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');

const source = fs.readFileSync(path.join(__dirname, '../htdocs/lib/MetaPanel.js'), 'utf8');
assert(!source.includes('$.fn.metaPanel'), 'metadata panels should not register a jQuery plugin');
const dom = new JSDOM(`<!doctype html><body>
  <section id="openwebrx-panel-metadata-test" class="openwebrx-meta-panel"><div class="openwebrx-meta-slot"></div></section>
  <section id="openwebrx-panel-metadata-other" class="openwebrx-meta-panel"><div class="openwebrx-meta-slot"></div></section>
</body>`, {runScripts: 'outside-only'});
const {window} = dom;
window.$ = element => ({
    jquery: true,
    0: element,
    find() { return {removeClass() { return this; }}; }
});
window.eval(source);

const firstElement = window.document.querySelector('#openwebrx-panel-metadata-test');
const first = window.OpenWebRXMetaPanels.create(firstElement);
assert.equal(window.OpenWebRXMetaPanels.create(firstElement), first, 'metadata panel construction should be idempotent');
assert.equal(window.OpenWebRXMetaPanels.initialize().length, 2);
let updated = 0;
window.OpenWebRXMetaPanels.updateAll({protocol: 'test'});
window.OpenWebRXMetaPanels.forEach(panel => { panel.update = () => { updated++; }; });
window.OpenWebRXMetaPanels.updateAll({protocol: 'test'});
assert.equal(updated, 2, 'updates should be delivered to each initialized panel');
window.OpenWebRXMetaPanels.clearAll();
assert.equal(typeof window.$.fn, 'undefined', 'metadata initialization should not extend jQuery');
dom.window.close();
console.log('Explicit metadata panel factory checks passed');
