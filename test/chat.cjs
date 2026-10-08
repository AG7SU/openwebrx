const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'htdocs/lib/Chat.js'), 'utf8');
assert(!source.includes('$('), 'chat component should not depend on jQuery selectors');

const dom = new JSDOM(`<!doctype html><html><body>
  <input id="openwebrx-chat-name"><input id="openwebrx-chat-message">
  <div id="openwebrx-panel-log"></div><div id="openwebrx-messages"></div>
</body></html>`, {runScripts: 'outside-only'});
const w = dom.window;
const saved = {};
const sent = [];
w.LS = {
    has: key => Object.prototype.hasOwnProperty.call(saved, key),
    loadStr: key => saved[key],
    save: (key, value) => { saved[key] = value; }
};
w.Utils = {HHMMSS: () => '12:34:56'};
w.toggle_panel = (id, visible) => { w.lastPanelToggle = [id, visible]; };
w.divlog = value => {
    const line = w.document.createElement('div');
    if (value instanceof w.Node) line.append(value);
    else line.textContent = String(value ?? '');
    w.document.querySelector('#openwebrx-messages').append(line);
};
w.ws = {send: value => sent.push(JSON.parse(value))};
w.eval(source);

saved.chatname = 'N0CALL';
w.Chat.loadSettings();
assert.equal(w.document.querySelector('#openwebrx-chat-name').value, 'N0CALL');

w.document.querySelector('#openwebrx-chat-name').value = ' N1TEST ';
w.document.querySelector('#openwebrx-chat-message').value = ' hello radio ';
w.Chat.send();
assert.deepEqual(sent, [{type: 'sendmessage', name: 'N1TEST', text: 'hello radio'}]);
assert.equal(saved.chatname, 'N1TEST');
assert.equal(w.document.querySelector('#openwebrx-chat-message').value, '');

w.document.querySelector('#openwebrx-chat-message').value = 'enter sends';
let prevented = false;
w.Chat.keyPress({key: 'Enter', preventDefault: () => { prevented = true; }});
assert(prevented);
assert.equal(sent[1].text, 'enter sends');

w.Chat.recvMessage('N0CALL', '<img src=x onerror=alert(1)>');
assert.deepEqual(w.lastPanelToggle, ['openwebrx-panel-log', true]);
assert.equal(w.document.querySelector('#openwebrx-messages').textContent,
    '12:34:56 [N0CALL]: <img src=x onerror=alert(1)>');
assert.equal(w.document.querySelector('#openwebrx-messages img'), null);

dom.window.close();
console.log('Native-DOM chat checks passed');
