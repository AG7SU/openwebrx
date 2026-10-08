const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');

const source = fs.readFileSync(path.join(__dirname, '../htdocs/lib/ProgressBar.js'), 'utf8');
assert(!source.includes('$.fn.progressbar'), 'progress bars should not register a jQuery plugin');
const dom = new JSDOM(`<!doctype html><body>
  <div id="clients" class="openwebrx-progressbar" data-type="clients"></div>
  <div id="cpu" class="openwebrx-progressbar" data-type="cpu"></div>
  <div id="audio" class="openwebrx-progressbar" data-type="audiobuffer"></div>
</body>`, {runScripts: 'outside-only'});
const {window} = dom;
window.audio_buffer_maximal_length_sec = 1;
window.eval(source);

const clientsElement = window.document.querySelector('#clients');
const clients = window.OpenWebRXProgressBar.create(clientsElement);
assert.equal(window.OpenWebRXProgressBar.create(clientsElement), clients, 'progress bar setup should be idempotent');
clients.setClients(9);
clients.setMaxClients(10);
assert.equal(clientsElement.textContent, 'Clients [9]');
assert(clientsElement.classList.contains('openwebrx-progressbar--over'));
assert.equal(clients.innerBar.style.transform, 'translate(-10%) translateZ(0)');

const cpu = window.OpenWebRXProgressBar.create('cpu');
cpu.setTemp(48);
cpu.setUsage(0.9);
assert.equal(cpu.el.textContent, 'Server CPU [90%/48°C]');
assert(cpu.el.classList.contains('openwebrx-progressbar--over'));
cpu.setText('<img src=x>');
assert.equal(cpu.el.querySelector('img'), null, 'progress labels should stay text-only');

const audio = window.OpenWebRXProgressBar.create('audio');
audio.setSampleRate(8000);
audio.setBuffersize(4000);
assert.equal(audio.el.textContent, 'Audio buffer [0.5 s]');
assert.equal(typeof window.$, 'undefined', 'progress bar creation should work without jQuery');
dom.window.close();
console.log('Native-DOM progress bar checks passed');
