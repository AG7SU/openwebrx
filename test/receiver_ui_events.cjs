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
w.OpenWebRXReceiver = {
    getSnapshot: () => ({recording: !!w.recording}),
    tuneBySteps: steps => calls.push(['bridge.tuneBySteps', steps]),
    selectProfile: profile => calls.push(['bridge.selectProfile', profile]),
    chat: {
        send: () => calls.push(['bridge.chat.send']),
        keyPress: event => calls.push(['bridge.chat.keyPress', event])
    },
    tuning: {
        jumpBySteps: steps => calls.push(['bridge.tuning.jumpBySteps', steps]),
        resetStep: () => calls.push(['bridge.tuning.resetStep']),
        setStep: step => calls.push(['bridge.tuning.setStep', step])
    },
    audio: {
        toggleMute: () => calls.push(['bridge.toggleMute']),
        setVolume: volume => calls.push(['bridge.setVolume', volume]),
        setRecording: on => { w.recording = on; calls.push(['bridge.setRecording', on]); return true; }
    },
    waterfall: {
        setRange: mode => calls.push(['bridge.setRange', mode]),
        zoom: direction => calls.push(['bridge.zoom', direction]),
        updateColors: endpoint => calls.push(['bridge.updateColors', endpoint])
    },
    display: new Proxy({}, {get: (_, name) => (...args) => calls.push([`bridge.display.${name}`, ...args])})
};
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
assert(calls.some(([name, value]) => name === 'bridge.tuneBySteps' && value === -1));

const contextMenu = new w.MouseEvent('contextmenu', {bubbles: true, cancelable: true});
firstTuneButton.dispatchEvent(contextMenu);
assert.equal(contextMenu.defaultPrevented, true);
assert(calls.some(([name, value]) => name === 'bridge.tuning.jumpBySteps' && value === -1));
assert(!calls.some(([name]) => name === 'jumpBySteps'));

click(w.document.querySelector('#openwebrx-section-modes'));
assert(calls.some(([name, element]) => name === 'bridge.display.toggleSection' && element.id === 'openwebrx-section-modes'));
assert(!calls.some(([name]) => name === 'UI.toggleSection'));
click(w.document.querySelector('#openwebrx-chat-message').nextElementSibling);
assert(calls.some(([name]) => name === 'bridge.chat.send'));
assert(!calls.some(([name]) => name === 'Chat.send'));
const chatMessage = w.document.querySelector('#openwebrx-chat-message');
chatMessage.dispatchEvent(new w.KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
assert(calls.some(([name]) => name === 'bridge.chat.keyPress'));

const volume = w.document.querySelector('#openwebrx-panel-volume');
volume.value = '42';
volume.dispatchEvent(new w.Event('input', {bubbles: true}));
assert(calls.some(([name, value]) => name === 'bridge.setVolume' && value === 42));
volume.dispatchEvent(new w.Event('change', {bubbles: true}));
assert.equal(calls.filter(([name]) => name === 'bridge.setVolume').length, 2);

const profile = w.document.querySelector('#openwebrx-sdr-profiles-listbox');
profile.innerHTML = '<option value="sdr1|profile1">Receiver 1</option><option value="sdr2|profile2">Receiver 2</option>';
profile.value = profile.options[1].value;
profile.dispatchEvent(new w.Event('change', {bubbles: true}));
assert(calls.some(([name, value]) => name === 'bridge.selectProfile' && value === profile.options[1].value));

click(w.document.querySelector('.openwebrx-mute-button'));
assert(calls.some(([name]) => name === 'bridge.toggleMute'));
click(w.document.querySelector('.openwebrx-record-button'));
assert(calls.some(([name, value]) => name === 'bridge.setRecording' && value === true));
click(w.document.querySelector('#openwebrx-waterfall-colors-auto'));
assert(calls.some(([name, value]) => name === 'bridge.setRange' && value === 'auto'));
click(w.document.querySelector('.openwebrx-zoom-button[data-owrx-click="zoom-in-step"]'));
assert(calls.some(([name, value]) => name === 'bridge.zoom' && value === 'in'));

const waterfallMin = w.document.querySelector('#openwebrx-waterfall-color-min');
waterfallMin.dispatchEvent(new w.Event('change', {bubbles: true}));
assert(calls.some(([name, endpoint]) => name === 'bridge.updateColors' && endpoint === 0));
const nr = w.document.querySelector('#openwebrx-panel-nr');
nr.value = '-7';
nr.dispatchEvent(new w.Event('input', {bubbles: true}));
assert(calls.some(([name, value]) => name === 'bridge.display.setNoiseReduction' && value === -7));
const theme = w.document.querySelector('#openwebrx-themes-listbox');
theme.value = 'default';
theme.dispatchEvent(new w.Event('change', {bubbles: true}));
assert(calls.some(([name, value]) => name === 'bridge.display.setTheme' && value === 'default'));
const frame = w.document.querySelector('#openwebrx-frame-checkbox');
frame.checked = true;
frame.dispatchEvent(new w.Event('change', {bubbles: true}));
assert(calls.some(([name, value]) => name === 'bridge.display.toggleFrame' && value === true));
const tuningStep = w.document.querySelector('#openwebrx-tuning-step-listbox');
tuningStep.innerHTML = '<option value="100">100 Hz</option><option value="1000">1 kHz</option>';
tuningStep.value = '1000';
tuningStep.dispatchEvent(new w.Event('change', {bubbles: true}));
assert(calls.some(([name, value]) => name === 'bridge.tuning.setStep' && value === 1000));
click(w.document.querySelector('[data-owrx-click="reset-tuning-step"]'));
assert(calls.some(([name]) => name === 'bridge.tuning.resetStep'));

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
    headerWindow.window.OpenWebRXHeader.applyPolicyRefresh();
    const refresh = headerWindow.window.document.head.querySelector('meta[http-equiv="refresh"]');
    assert(refresh);
    assert.equal(refresh.content, '15; url=policy');
    headerWindow.window.close();
    dom.window.close();
    templateDoms.forEach(templateDom => templateDom.window.close());
    console.log('Receiver UI event binding checks passed');
}, 0);
