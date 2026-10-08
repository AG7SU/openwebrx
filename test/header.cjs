const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'htdocs/lib/Header.js'), 'utf8');
assert(!source.includes('.header('), 'shared header should not expose a jQuery plugin');

const dom = new JSDOM(`<!doctype html><html><head></head><body>
  <div class="webrx-top-container" data-csrf-token="csrf" data-session-timeout="15" data-usage-policy-url="policy">
    <section class="openwebrx-main-buttons">
      <button data-toggle-panel="existing-panel"></button>
      <button data-toggle-panel="missing-panel"></button>
    </section>
    <h1 class="webrx-rx-title"></h1><div class="webrx-rx-desc"></div>
    <div class="webrx-rx-photo-title"></div><div class="webrx-rx-photo-desc"></div>
    <div class="openwebrx-description-container"></div>
    <a class="openwebrx-rx-details-arrow openwebrx-rx-details-arrow--down"></a>
    <img class="openwebrx-photo-trigger"><a class="openwebrx-photo-trigger" href="/help"></a>
  </div><div id="existing-panel"></div>
</body></html>`, {runScripts: 'outside-only', url: 'https://receiver.example/'});
const w = dom.window;
const panelCalls = [];
let prefilter;
let prefilterRegistrations = 0;
w.toggle_panel = (...args) => panelCalls.push(args);
w.jQuery = {ajaxPrefilter: callback => { prefilter = callback; prefilterRegistrations++; }};
w.eval(source);
w.OpenWebRXHeader.initialize();

const buttons = w.document.querySelectorAll('.openwebrx-main-buttons button');
assert.equal(buttons[0].style.display, 'block');
assert.equal(buttons[1].style.display, '');
buttons[0].click();
assert.deepEqual(panelCalls, [['existing-panel']]);

assert.equal(w.OpenWebRXHeader.setDetails({
    receiver_name: '<em>Station</em>', receiver_location: 'Somewhere', locator: 'CN87',
    receiver_asl: 42, photo_title: 'Title', photo_desc: '<img src=x>'
}), true);
assert.equal(w.document.querySelector('.webrx-rx-title').textContent, '<em>Station</em>');
assert.equal(w.document.querySelector('.webrx-rx-title em'), null);
assert.equal(w.document.title, 'OpenWebRX+ | <em>Station</em>');
assert.equal(w.document.querySelector('.webrx-rx-desc').textContent, 'Somewhere | Loc: CN87, ASL: 42 m');
assert.equal(w.document.querySelector('.webrx-rx-photo-desc').textContent, '<img src=x>');

const triggers = w.document.querySelectorAll('.openwebrx-photo-trigger');
triggers[0].click();
assert(w.document.querySelector('.openwebrx-description-container').classList.contains('expanded'));
assert(w.document.querySelector('.openwebrx-rx-details-arrow').classList.contains('openwebrx-rx-details-arrow--up'));
triggers[1].click();
assert(w.document.querySelector('.openwebrx-description-container').classList.contains('expanded'), 'link clicks should not toggle details');
triggers[0].click();
assert(!w.document.querySelector('.openwebrx-description-container').classList.contains('expanded'));

let requestHeader;
prefilter({}, {}, {setRequestHeader: (...args) => { requestHeader = args; }});
assert.deepEqual(requestHeader, ['X-CSRF-Token', 'csrf']);

w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
assert.equal(prefilterRegistrations, 1, 'header initialization and CSRF prefilter should be idempotent');
const refresh = w.document.head.querySelector('meta[http-equiv="refresh"]');
assert(refresh);
assert.equal(refresh.content, '15; url=policy');

dom.window.close();
console.log('Native-DOM shared header checks passed');
