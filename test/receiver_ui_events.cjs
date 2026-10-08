const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'htdocs/index.html'), 'utf8');
const headerHtml = fs.readFileSync(path.join(root, 'htdocs/include/header.include.html'), 'utf8');
function listHtmlFiles(directory) {
    return fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
        const filename = path.join(directory, entry.name);
        if (entry.isDirectory()) return listHtmlFiles(filename);
        return /\.html?$/i.test(entry.name) ? [filename] : [];
    });
}
const templateDoms = [];
for (const filename of listHtmlFiles(path.join(root, 'htdocs'))) {
    const templateDom = new JSDOM(fs.readFileSync(filename, 'utf8'));
    templateDoms.push(templateDom);
    for (const element of templateDom.window.document.querySelectorAll('*')) {
        for (const attribute of element.attributes) {
            assert(!/^on[a-z]+$/i.test(attribute.name), `inline handler in ${filename}: ${attribute.name}`);
        }
    }
    for (const script of templateDom.window.document.querySelectorAll('script:not([src])')) {
        assert.equal(script.textContent.trim(), '', `inline script in ${filename}`);
    }
    for (const script of templateDom.window.document.querySelectorAll('script[src]')) {
        assert.equal(script.getAttribute('nonce'), '${csp_nonce}', `script nonce missing in ${filename}`);
    }
    for (const stylesheet of templateDom.window.document.querySelectorAll('link[rel="stylesheet"]')) {
        assert.equal(stylesheet.getAttribute('nonce'), '${csp_nonce}', `stylesheet nonce missing in ${filename}`);
    }
}
const dom = new JSDOM(html, {runScripts: 'outside-only'});
const w = dom.window;
const calls = [];
w.UI = new Proxy({}, {get: (_, name) => (...args) => calls.push([`UI.${name}`, ...args])});
w.Waterfall = new Proxy({}, {get: (_, name) => (...args) => calls.push([`Waterfall.${name}`, ...args])});
w.Chat = {
    keyPress: event => calls.push(['Chat.keyPress', event]),
    send: () => calls.push(['Chat.send'])
};
for (const name of ['tuneBySteps', 'jumpBySteps', 'sdr_profile_changed', 'tuning_step_reset',
    'tuning_step_changed', 'zoomInOneStep', 'zoomOutOneStep', 'zoomInTotal', 'zoomOutTotal']) {
    w[name] = (...args) => calls.push([name, ...args]);
}
w.openwebrx_init = () => calls.push(['openwebrx_init']);

w.eval(fs.readFileSync(path.join(root, 'htdocs/lib/ReceiverUiEvents.js'), 'utf8'));
w.bindReceiverUiEvents();
const click = element => element.dispatchEvent(new w.MouseEvent('click', {bubbles: true}));
const firstTuneButton = w.document.querySelector('.openwebrx-tune-button');
click(firstTuneButton);
assert(calls.some(([name, value]) => name === 'tuneBySteps' && value === -1));

const contextMenu = new w.MouseEvent('contextmenu', {bubbles: true, cancelable: true});
firstTuneButton.dispatchEvent(contextMenu);
assert.equal(contextMenu.defaultPrevented, true);
assert(calls.some(([name, value]) => name === 'jumpBySteps' && value === -1));

click(w.document.querySelector('#openwebrx-section-modes'));
assert(calls.some(([name, element]) => name === 'UI.toggleSection' && element.id === 'openwebrx-section-modes'));
click(w.document.querySelector('#openwebrx-chat-message').nextElementSibling);
assert(calls.some(([name]) => name === 'Chat.send'));

const volume = w.document.querySelector('#openwebrx-panel-volume');
volume.value = '42';
volume.dispatchEvent(new w.Event('input', {bubbles: true}));
assert(calls.some(([name, value]) => name === 'UI.setVolume' && value === '42'));

const unrecognized = w.document.createElement('button');
unrecognized.setAttribute('data-owrx-click', 'alert(1)');
w.document.body.append(unrecognized);
click(unrecognized);
assert.equal(w.document.querySelector('[data-alert]'), null);

setTimeout(() => {
    assert.equal(calls.filter(([name]) => name === 'openwebrx_init').length, 1);
    const renderedHeader = headerHtml
        .replaceAll('${session_timeout}', '15')
        .replaceAll('${usage_policy_url}', 'policy')
        .replaceAll('${csrf_token}', 'csrf-test');
    const headerWindow = new JSDOM(renderedHeader, {runScripts: 'outside-only', url: 'https://receiver.example/'});
    headerWindow.window.eval(fs.readFileSync(path.join(root, 'htdocs/lib/jquery-3.7.1.min.js'), 'utf8'));
    headerWindow.window.eval(fs.readFileSync(path.join(root, 'htdocs/lib/Header.js'), 'utf8'));
    headerWindow.window.Header.applyPolicyRefresh();
    const refresh = headerWindow.window.document.head.querySelector('meta[http-equiv="refresh"]');
    assert(refresh);
    assert.equal(refresh.content, '15; url=policy');
    headerWindow.window.close();
    dom.window.close();
    templateDoms.forEach(templateDom => templateDom.window.close());
    console.log('Receiver UI event binding checks passed');
}, 0);
