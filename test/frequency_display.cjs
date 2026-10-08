const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');

const source = fs.readFileSync(path.join(__dirname, '../htdocs/lib/FrequencyDisplay.js'), 'utf8');
assert(!source.includes('$.fn'), 'frequency display should not install jQuery plugins');
const dom = new JSDOM('<!doctype html><body><div id="tune"></div><div id="mouse"></div></body>', {
    runScripts: 'outside-only', url: 'https://receiver.example/'
});
const {window} = dom;
window.eval(source);
const tune = window.document.querySelector('#tune');
const display = window.OpenWebRXFrequencyDisplay.createTuneable(tune);
assert.equal(window.OpenWebRXFrequencyDisplay.createTuneable(tune), display, 'creation should be idempotent');
display.setFrequency(145500000);
assert.equal(tune.querySelector('.input-group').style.display, 'none');
assert.equal(tune.querySelector('.input-group select').options.length, 5);

let changed;
tune.addEventListener('frequencychange', event => { changed = event.detail; });
tune.querySelector('.digit').dispatchEvent(new window.WheelEvent('wheel', {deltaY: -1, bubbles: true, cancelable: true}));
assert.equal(changed, 245500000, 'wheel tuning should retain the place-value increment');

display.displayContainer.click();
assert.equal(tune.querySelector('input[type="number"]').value, '145.5');
assert.equal(tune.querySelector('.input-group').style.display, '');
const input = tune.querySelector('input[type="number"]');
input.value = '146';
input.dispatchEvent(new window.KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
assert.equal(changed, 146000000, 'Enter should submit the selected SI suffix');
assert.equal(tune.querySelector('.input-group').style.display, 'none');

const mouse = window.OpenWebRXFrequencyDisplay.create(window.document.querySelector('#mouse'));
mouse.setTuningPrecision(1);
mouse.setFrequency(1234);
assert.match(mouse.element.textContent, /1\.23 kHz/);
dom.window.close();
console.log('Native-DOM frequency display checks passed');
