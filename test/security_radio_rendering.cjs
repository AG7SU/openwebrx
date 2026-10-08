// Run with jsdom installed outside the repository; see SECURITY_AUDIT.md.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');

const root = path.resolve(__dirname, '..');
const dom = new JSDOM('<table><tbody><tr id="thread"></tr></tbody></table><div id="skimmer"></div>', {
    runScripts: 'outside-only',
    url: 'https://receiver.example/'
});
const w = dom.window;
w.setInterval = () => 1;
w.clearInterval = () => {};
for (const file of [
    'htdocs/lib/jquery-3.7.1.min.js',
    'htdocs/lib/Utils.js',
    'htdocs/lib/MessagePanel.js',
    'htdocs/lib/Js8Threads.js'
]) {
    w.eval(fs.readFileSync(path.join(root, file), 'utf8'));
}

const attack = '<img src=x onerror="alert(1)"><svg onload="alert(2)"></svg>';
const thread = new w.Js8Thread(w.$('#thread'));
thread.pushMessage({
    freq: 14074000,
    timestamp: 1000,
    thread_type: 0,
    js8mode: 'A',
    msg: attack
});
assert.equal(w.document.querySelector('#thread img'), null);
assert.equal(w.document.querySelector('#thread svg'), null);
assert(w.document.querySelector('#thread .message').textContent.includes(attack));

const skimmer = new w.SkimmerMessagePanel(w.$('#skimmer'));
skimmer.pushMessage({freq: 14074000, db: 10, text: attack});
assert.equal(w.document.querySelector('#skimmer img'), null);
assert.equal(w.document.querySelector('#skimmer svg'), null);
assert.equal(w.document.querySelector('#skimmer [onerror], #skimmer [onload]'), null);
assert(w.document.querySelector('#skimmer tbody').textContent.includes(attack));

dom.window.close();
console.log('Radio message DOM security checks passed');
