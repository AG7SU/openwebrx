const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');

const source = fs.readFileSync(path.join(__dirname, '../htdocs/lib/DemodulatorPanel.js'), 'utf8');
assert(!source.includes('$.fn.demodulatorPanel'), 'demodulator panel should not register a jQuery plugin');
const dom = new JSDOM(`<!doctype html><body><section id="receiver">
    <div class="openwebrx-modes"></div>
    <div class="webrx-actual-freq"></div><div class="webrx-mouse-freq"></div>
    <input class="openwebrx-squelch-slider"><div class="openwebrx-squelch-auto"></div>
  </section></body>`, {runScripts: 'outside-only'});
const {window} = dom;
window.Modes = {
    registerModePanel() {},
    getModes() { return [
        {modulation: 'usb', type: 'analog', name: '<img src=x>'},
        {modulation: 'lsb', type: 'analog', name: 'LSB'},
        {modulation: 'test-digital', type: 'digimode', name: 'Test digital'}
    ]; },
    findByModulation(modulation) {
        const mode = this.getModes().find(mode => mode.modulation === modulation);
        return mode?.type === 'digimode' ? {...mode, underlying: ['usb', 'lsb']} : mode;
    }
};
window.OpenWebRXFrequencyDisplay = {
    createTuneable() { return {setFrequency() {}, setTuningPrecision() {}}; },
    create() { return {setFrequency() {}, setTuningPrecision() {}}; }
};
window.eval(source);

const element = window.document.querySelector('#receiver');
const panel = window.OpenWebRXDemodulatorPanel.create(element);
assert.equal(window.OpenWebRXDemodulatorPanel.create(element), panel, 'panel initialization should be idempotent');
assert.throws(() => window.OpenWebRXDemodulatorPanel.create(null), /requires a DOM element/);
assert.equal(typeof window.$, 'undefined', 'panel setup should work without jQuery');
let selectedMode;
panel.setMode = mode => { selectedMode = mode; };
panel.render();
assert.equal(element.querySelector('.openwebrx-modes img'), null, 'mode labels should render as text');
assert.equal(element.querySelector('[data-modulation="usb"]').tagName, 'DIV');
assert.equal(element.querySelector('.openwebrx-secondary-demod-listbox option[value="test-digital"]').textContent, 'Test digital');
element.querySelector('[data-modulation="usb"]').dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
assert.equal(selectedMode, 'usb', 'native delegated clicks should select demodulator modes');
const fakeDemodulator = {
    get_modulation: () => 'usb', get_secondary_demod: () => 'test-digital'
};
panel.demodulator = fakeDemodulator;
panel.mode = {squelch: true};
panel.updateButtons();
assert(element.querySelector('[data-modulation="usb"]').classList.contains('highlighted'));
assert(element.querySelector('.openwebrx-button-dig').classList.contains('highlighted'));
assert(element.querySelector('.openwebrx-secondary-demod-listbox').value === 'test-digital');
assert(element.querySelector('[data-modulation="lsb"]').classList.contains('same-mod'));
assert.equal(element.querySelector('.openwebrx-squelch-slider').disabled, false);
dom.window.close();
console.log('Explicit demodulator panel factory checks passed');
