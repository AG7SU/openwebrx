// Smoke the built Svelte island against the typed receiver bridge contract.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');

const root = path.resolve(__dirname, '..');
const bundle = fs.readFileSync(path.join(root, 'htdocs/modern/receiver-ui.js'), 'utf8');
const dom = new JSDOM('<!doctype html><html><body><div id="receiver-modern-ui"></div><div id="receiver-modern-secondary"></div><select id="openwebrx-sdr-profiles-listbox"><option value="sdr1|profile1" selected>Receiver 1</option><option value="sdr2|profile2">Receiver 2</option></select><div id="openwebrx-section-modes">Modes</div><div class="openwebrx-section" id="legacy-mode-options"></div></body></html>', {
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    url: 'https://receiver.example/'
});
const w = dom.window;
let frequency = 14_074_000;
let volume = 100;
let audioDroppedSamples = 0;
let muted = false;
let recording = false;
let recordingAllowed = true;
let modulation = 'USB';
const tuningCalls = [];
const modeCalls = [];
const waterfallRangeCalls = [];
let bookmarkOpens = 0;
const openedWindows = [];
let selectedPopupProfile = null;
let selectedInlineProfile = null;
let zoomLevel = 2;
let selectedProfile = 'sdr1|profile1';
const modes = [
    {modulation: 'USB', name: 'Upper Sideband', type: 'analog'},
    {modulation: 'AM', name: 'AM', type: 'analog'},
    {modulation: 'FT8', name: 'FT8', type: 'digimode'},
    {modulation: 'data2g', name: 'Data2G RX', type: 'digimode'}
];
const modeCapabilities = [
    {modulation: 'USB', name: 'Upper Sideband', type: 'analog', available: true, missing_requirements: []},
    {modulation: 'AM', name: 'AM', type: 'analog', available: true, missing_requirements: []},
    {modulation: 'FT8', name: 'FT8', type: 'digimode', available: true, missing_requirements: []},
    {modulation: 'Q65', name: 'Q65', type: 'digimode', available: false, missing_requirements: ['wsjtx_2_4']},
    {modulation: 'data2g', name: 'Data2G RX', type: 'digimode', available: true, missing_requirements: []}
];
const profiles = [
    {id: 'sdr1|profile1', name: 'Receiver 1'},
    {id: 'sdr1|profile1b', name: 'Receiver 1 alternate profile'},
    {id: 'sdr2|profile2', name: 'Receiver 2'}
];
const secondReceiverBridge = {
    getProfiles: () => profiles,
    selectProfile: id => { selectedPopupProfile = id; return true; }
};
const secondWindow = {
    opener: w,
    closed: false,
    OpenWebRXReceiver: secondReceiverBridge
};
w.open = (...args) => { openedWindows.push(args); return secondWindow; };
w.OpenWebRXReceiver = {
    getSnapshot: () => ({
        profileName: selectedProfile === 'sdr2|profile2' ? 'Receiver 2' : 'Receiver 1',
        frequencyHz: frequency,
        tuningStepHz: 100,
        connection: 'connected',
        audio: 'playing',
        recording,
        recordingAllowed,
        volume,
        muted,
        audioDroppedSamples,
        mode: modulation,
        availableModes: modes,
        modeCapabilities,
        waterfallZoomLevel: zoomLevel,
        waterfallZoomMaximum: 4
    }),
    tuneTo: next => { frequency = next; tuningCalls.push({next, snap: true}); return true; },
    setMode: next => { modulation = next; modeCalls.push(next); return true; },
    audio: {
        setVolume: next => { volume = next; return true; },
        toggleMute: () => { muted = !muted; volume = muted ? 0 : 100; },
        setRecording: on => {
            if (on && !recordingAllowed) return false;
            recording = on;
            return true;
        }
    },
    waterfall: {
        zoom: direction => {
            if (direction === 'in') zoomLevel = Math.min(4, zoomLevel + 1);
            else if (direction === 'out') zoomLevel = Math.max(0, zoomLevel - 1);
            else if (direction === 'full') zoomLevel = 0;
            else if (direction === 'detail') zoomLevel = 4;
            else return false;
            return true;
        },
        setRange: mode => { waterfallRangeCalls.push(mode); return true; }
    },
    addCurrentBookmark: () => { bookmarkOpens++; return true; },
    getProfiles: () => profiles,
    getSelectedProfile: () => selectedProfile,
    selectProfile: id => { selectedProfile = id; return true; }
};

async function run() {
    await new Promise(resolve => w.document.addEventListener('DOMContentLoaded', resolve, {once: true}));
    w.eval(bundle);
    await new Promise(resolve => w.setTimeout(resolve, 25));

    assert.equal(w.document.querySelector('.receiver-island__mode').textContent, 'Upper Sideband');
    assert.equal(w.document.body.classList.contains('receiver-modern-modes-mounted'), true);
    const rfControlsToggle = w.document.querySelector('.receiver-island__advanced-toggle');
    assert.equal(rfControlsToggle.getAttribute('aria-expanded'), 'false');
    rfControlsToggle.click();
    assert.equal(w.document.body.classList.contains('receiver-modern-advanced-open'), true);
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.equal(rfControlsToggle.getAttribute('aria-expanded'), 'true');
    w.dispatchEvent(new w.KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    assert.equal(w.document.body.classList.contains('receiver-modern-advanced-open'), false);
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.equal(rfControlsToggle.getAttribute('aria-expanded'), 'false');
    assert.match(w.document.querySelector('.receiver-island__status').textContent, /Connected/);
    assert.match(w.document.querySelector('.receiver-island__status').textContent, /Audio live/);
    assert.match(w.document.querySelector('.receiver-island__status').textContent, /SDR · unknown/);
    w.dispatchEvent(new w.CustomEvent('openwebrx:receiver-health', {detail: {
        schema_version: 1, source_id: 'sdr1', source_name: 'RSPduo tuner 1',
        state: 'running', severity: 'info', message: null
    }}));
    await new Promise(resolve => w.setTimeout(resolve, 425));
    assert.match(w.document.querySelector('.receiver-island__status').textContent, /RSPduo tuner 1 · running/);
    w.dispatchEvent(new w.CustomEvent('openwebrx:receiver-health', {detail: {
        schema_version: 1, source_id: 'sdr1', source_name: 'RSPduo tuner 1',
        state: 'failed', severity: 'error', message: 'SDR source failed'
    }}));
    await new Promise(resolve => w.setTimeout(resolve, 425));
    const sourceHealth = [...w.document.querySelectorAll('.receiver-island__status-item')]
        .find(item => item.textContent.includes('RSPduo tuner 1'));
    assert.match(sourceHealth.textContent, /failed/);
    assert.match(sourceHealth.className, /receiver-island__health-error/);
    assert.equal(sourceHealth.title, 'SDR source failed');
    w.dispatchEvent(new w.CustomEvent('openwebrx:decoder-error', {detail: {
        schema_version: 1, message: 'Decoder process exited'
    }}));
    await new Promise(resolve => w.setTimeout(resolve, 425));
    assert.match(w.document.querySelector('.receiver-island__health-error[role="status"]').textContent, /Decoder process exited/);
    w.dispatchEvent(new w.CustomEvent('openwebrx:decoder-error', {detail: {
        schema_version: 2, message: 'must be ignored'
    }}));
    await new Promise(resolve => w.setTimeout(resolve, 425));
    assert.match(w.document.querySelector('.receiver-island__health-error[role="status"]').textContent, /Decoder process exited/);
    w.dispatchEvent(new w.CustomEvent('openwebrx:decoder-error', {detail: {
        schema_version: 1, message: 'x'.repeat(241)
    }}));
    await new Promise(resolve => w.setTimeout(resolve, 425));
    assert.match(w.document.querySelector('.receiver-island__health-error[role="status"]').textContent, /Decoder process exited/);
    assert.equal(w.document.querySelector('.receiver-island__audio-warning'), null);
    audioDroppedSamples = 640;
    await new Promise(resolve => w.setTimeout(resolve, 425));
    assert.match(w.document.querySelector('.receiver-island__audio-warning').textContent, /640 samples/);
    assert.match(w.document.querySelector('.receiver-island__status').textContent, /Decoder off/);
    assert.match(w.document.querySelector('.receiver-island__waterfall-controls').textContent, /ZOOM 3\/5/);
    assert.equal(w.document.querySelector('#receiver-modern-volume').value, '100');
    const recordButton = w.document.querySelector('.receiver-island__record');
    assert.equal(recordButton.disabled, false);
    recordButton.click();
    assert.equal(recording, true);
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.equal(recordButton.getAttribute('aria-pressed'), 'true');
    recordingAllowed = false;
    await new Promise(resolve => w.setTimeout(resolve, 425));
    assert.equal(w.document.querySelector('.receiver-island__record').disabled, false, 'an active recording must remain stoppable after permission changes');
    recordButton.click();
    assert.equal(recording, false);
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.equal(w.document.querySelector('.receiver-island__record'), null, 'recording controls hide after permission is revoked and recording stops');
    const zoomButtons = [...w.document.querySelectorAll('.receiver-island__zoom')];
    zoomButtons.find(button => button.textContent === 'Zoom in').click();
    assert.equal(zoomLevel, 3);
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.match(w.document.querySelector('.receiver-island__waterfall-controls').textContent, /ZOOM 4\/5/);
    zoomButtons.find(button => button.textContent === 'Zoom out').click();
    assert.equal(zoomLevel, 2);
    zoomButtons.find(button => button.textContent === 'Full spectrum').click();
    assert.equal(zoomLevel, 0);
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.equal(zoomButtons.find(button => button.textContent === 'Zoom out').disabled, true);
    zoomButtons.find(button => button.textContent === 'Auto levels').click();
    zoomButtons.find(button => button.textContent === 'Reset range').click();
    assert.deepEqual(waterfallRangeCalls, ['auto', 'default']);
    w.document.querySelector('.receiver-island__bookmark').click();
    assert.equal(bookmarkOpens, 1);
    [...w.document.querySelectorAll('button')].find(button => button.textContent === 'Dual tuner view').click();
    assert.equal(w.document.body.classList.contains('receiver-modern-dual'), true);
    const inlineFrame = w.document.querySelector('#receiver-modern-secondary iframe');
    assert.ok(inlineFrame);
    assert.equal(new URL(inlineFrame.src).searchParams.get('receiver-pane'), 'secondary');
    inlineFrame.contentWindow.OpenWebRXReceiver = {
        getProfiles: () => profiles,
        selectProfile: id => { selectedInlineProfile = id; return true; }
    };
    await new Promise(resolve => w.setTimeout(resolve, 275));
    assert.equal(selectedInlineProfile, 'sdr2|profile2');
    assert.match(w.document.querySelector('.receiver-island__eyebrow').textContent, /Receiver 1/);
    [...w.document.querySelectorAll('button')].find(button => button.textContent === 'Close second tuner').click();
    assert.equal(w.document.body.classList.contains('receiver-modern-dual'), false);
    assert.equal(w.document.querySelector('#receiver-modern-secondary iframe'), null);

    [...w.document.querySelectorAll('button')].find(button => button.textContent === 'Open separate window').click();
    assert.deepEqual(openedWindows[0], ['https://receiver.example/', 'openwebrx-second-receiver', 'popup,width=1100,height=760']);
    await new Promise(resolve => w.setTimeout(resolve, 225));
    assert.equal(secondWindow.opener, null);
    assert.equal(selectedPopupProfile, 'sdr2|profile2');
    assert.match(w.document.querySelector('.receiver-island__identity .receiver-island__message').textContent, /Receiver 2/);
    const input = w.document.querySelector('#receiver-modern-frequency');
    assert.equal(input.value, '14.074000');

    const modeInput = w.document.querySelector('#receiver-modern-mode');
    assert.equal(modeInput.value, 'Upper Sideband');
    modeInput.value = 'FT8';
    modeInput.dispatchEvent(new w.Event('input', {bubbles: true}));
    w.document.querySelector('.receiver-island__mode-picker').dispatchEvent(
        new w.Event('submit', {bubbles: true, cancelable: true})
    );
    assert.equal(modeCalls.at(-1), 'FT8');
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.match(w.document.querySelector('.receiver-island__status').textContent, /FT8 selected/);
    w.dispatchEvent(new w.CustomEvent('openwebrx:decoder-output', {detail: {modulation: 'FT8'}}));
    await new Promise(resolve => w.setTimeout(resolve, 425));
    assert.match(w.document.querySelector('.receiver-island__status').textContent, /FT8 output received/);

    modeInput.focus();
    modeInput.value = 'Q65';
    modeInput.dispatchEvent(new w.Event('input', {bubbles: true}));
    w.document.querySelector('.receiver-island__mode-picker').dispatchEvent(
        new w.Event('submit', {bubbles: true, cancelable: true})
    );
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.match(w.document.querySelector('#receiver-modern-mode-message').textContent, /WSJT-X 2.4 or newer/);
    assert.equal(modeCalls.at(-1), 'FT8');

    input.value = '145.500000';
    input.dispatchEvent(new w.Event('input', {bubbles: true}));
    w.document.querySelector('.receiver-island__tuning').dispatchEvent(
        new w.Event('submit', {bubbles: true, cancelable: true})
    );
    assert.equal(tuningCalls.at(-1).next, 145_500_000);
    assert.equal(tuningCalls.at(-1).snap, true);

    w.document.querySelector('[aria-label="Tune up one step"]').click();
    assert.equal(tuningCalls.at(-1).next, 145_500_100);
    const arrowUp = new w.KeyboardEvent('keydown', {key: 'ArrowUp', bubbles: true, cancelable: true});
    input.dispatchEvent(arrowUp);
    assert.equal(arrowUp.defaultPrevented, true);
    assert.equal(tuningCalls.at(-1).next, 145_500_200);
    const pageDown = new w.KeyboardEvent('keydown', {key: 'PageDown', bubbles: true, cancelable: true});
    input.dispatchEvent(pageDown);
    assert.equal(pageDown.defaultPrevented, true);
    assert.equal(tuningCalls.at(-1).next, 145_499_200);
    const volumeControl = w.document.querySelector('#receiver-modern-volume');
    volumeControl.value = '42';
    volumeControl.dispatchEvent(new w.Event('input', {bubbles: true}));
    assert.equal(volume, 42);
    w.document.querySelector('.receiver-island__mute').click();
    assert.equal(muted, true);
    await new Promise(resolve => w.setTimeout(resolve, 25));
    assert.equal(w.document.querySelector('.receiver-island__mute').getAttribute('aria-pressed'), 'true');
    const layoutNameInput = w.document.querySelector('#receiver-modern-layout-name');
    layoutNameInput.value = '2m FT8';
    layoutNameInput.dispatchEvent(new w.Event('input', {bubbles: true}));
    w.document.querySelector('.receiver-island__layout-save').dispatchEvent(
        new w.Event('submit', {bubbles: true, cancelable: true})
    );
    await new Promise(resolve => w.setTimeout(resolve, 0));
    const layoutSelect = w.document.querySelector('#receiver-modern-layout-list');
    assert.equal(layoutSelect.options.length, 2);
    assert.match(layoutSelect.options[1].textContent, /2m FT8.*145\.499200 MHz.*FT8/);
    assert.equal(w.localStorage.length, 1, 'layouts are stored in browser-local profile-scoped storage');
    const layoutId = layoutSelect.options[1].value;
    layoutSelect.value = layoutId;
    layoutSelect.dispatchEvent(new w.Event('change', {bubbles: true}));
    frequency = 435_000_000;
    modulation = 'USB';
    [...w.document.querySelectorAll('.receiver-island__layout-actions button')]
        .find(button => button.textContent === 'Apply').click();
    assert.equal(tuningCalls.at(-1).next, 145_499_200);
    assert.equal(modeCalls.at(-1), 'FT8');
    assert.equal(modulation, 'FT8');
    [...w.document.querySelectorAll('.receiver-island__layout-actions button')]
        .find(button => button.textContent === 'Remove').click();
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.equal(w.document.querySelector('#receiver-modern-layout-list'), null);
    assert.equal(JSON.parse(w.localStorage.getItem(w.localStorage.key(0))).length, 0);
    assert.match(w.document.querySelector('.receiver-island__layout-message').textContent, /removed/);
    modeInput.value = 'Data2G RX';
    modeInput.dispatchEvent(new w.Event('input', {bubbles: true}));
    w.document.querySelector('.receiver-island__mode-picker').dispatchEvent(
        new w.Event('submit', {bubbles: true, cancelable: true})
    );
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.equal(modeCalls.at(-1), 'data2g');
    assert.match(w.document.querySelector('.receiver-island__data2g').textContent, /No complete Data2G frame/);
    w.dispatchEvent(new w.CustomEvent('openwebrx:data2g-status', {detail: {
        type: 'data2g_status', schema_version: 1, state: 'listening'
    }}));
    w.dispatchEvent(new w.CustomEvent('openwebrx:data2g-status', {detail: {
        type: 'data2g_status', schema_version: 1, state: 'busy', busy: true
    }}));
    w.dispatchEvent(new w.CustomEvent('openwebrx:data2g-status', {detail: {
        type: 'data2g_status', schema_version: 1, state: 'heard', port: 0, call: 'N0CALL'
    }}));
    w.dispatchEvent(new w.CustomEvent('openwebrx:data2g-frame', {detail: {
        type: 'data2g_frame', schema_version: 1, port: 0, command: 0, payload_bytes: 3,
        payload_hex: '414258', received_at: Date.now() / 1000
    }}));
    w.dispatchEvent(new w.CustomEvent('openwebrx:data2g-aprs', {detail: {
        type: 'data2g_aprs', schema_version: 1, port: 0, received_at: Date.now() / 1000,
        message: {source: 'N0CALL', destination: 'APRS', data: '!4903.50N/07201.75W>test'}
    }}));
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.match(w.document.querySelector('.receiver-island__data2g').textContent, /APRS decoded/);
    assert.match(w.document.querySelector('.receiver-island__data2g code').textContent, /414258/);
    assert.match(w.document.querySelector('.receiver-island__data2g-aprs').textContent, /N0CALL → APRS/);
    assert.match(w.document.querySelector('.receiver-island__data2g-aprs').textContent, /4903\.50N/);
    assert.match(w.document.querySelector('.receiver-island__data2g-activity').textContent, /burst checked · KISS 0 · N0CALL/);
    assert.match(w.document.querySelector('.receiver-island__data2g-activity').textContent, /channel busy/);
    const receivedAt = Date.now();
    w.dispatchEvent(new w.CustomEvent('openwebrx:reception', {detail: {
        schema_version: 1,
        timestamp_ms: receivedAt,
        frequency_hz: frequency,
        mode: 'FT8',
        profile: 'Receiver 1',
        content: '{"callsign":"W1AW","grid":"FN31"}'
    }}));
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.ok(w.document.querySelector('.receiver-island__history').textContent.includes(`${(frequency / 1_000_000).toFixed(6)} MHz`));
    assert.match(w.document.querySelector('.receiver-island__history').textContent, /W1AW/);
    const persistedHistory = w.localStorage.getItem('openwebrx.reception-history.v1');
    assert.equal(JSON.parse(persistedHistory)[0].mode, 'FT8');
    w.dispatchEvent(new w.CustomEvent('openwebrx:reception', {detail: {
        schema_version: 2, timestamp_ms: receivedAt, frequency_hz: frequency,
        mode: 'FT8', profile: 'Receiver 1', content: 'unknown schema'
    }}));
    w.dispatchEvent(new w.CustomEvent('openwebrx:reception', {detail: {
        schema_version: 1, timestamp_ms: receivedAt, frequency_hz: frequency,
        mode: 'FT8', profile: 'Receiver 1', content: 'x'.repeat(2049)
    }}));
    assert.equal(w.document.querySelectorAll('.receiver-island__history-list li').length, 1,
        'unknown schemas and oversized decoded content are rejected');
    const sharedHistory = JSON.stringify([{
        timestampMs: receivedAt - 1000,
        frequencyHz: frequency + 1000,
        mode: 'WSPR',
        profile: 'Receiver 2',
        content: '{"callsign":"K1ABC","grid":"FN32"}'
    }, ...JSON.parse(persistedHistory)]);
    w.localStorage.setItem('openwebrx.reception-history.v1', sharedHistory);
    w.dispatchEvent(new w.StorageEvent('storage', {
        key: 'openwebrx.reception-history.v1', oldValue: persistedHistory, newValue: sharedHistory
    }));
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.equal(w.document.querySelectorAll('.receiver-island__history-list li').length, 2,
        'history refreshes when another same-origin receiver pane adds a reception');
    const reloadDom = new JSDOM('<!doctype html><html><body><div id="receiver-modern-ui"></div><div id="receiver-modern-secondary"></div></body></html>', {
        runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://receiver.example/'
    });
    reloadDom.window.OpenWebRXReceiver = w.OpenWebRXReceiver;
    reloadDom.window.localStorage.setItem('openwebrx.reception-history.v1', sharedHistory);
    reloadDom.window.eval(bundle);
    await new Promise(resolve => reloadDom.window.setTimeout(resolve, 25));
    assert.match(reloadDom.window.document.querySelector('.receiver-island__history-list').textContent, /W1AW/,
        'browser-local reception history is restored on a fresh page load');
    reloadDom.window.close();
    const historySearch = w.document.querySelector('#receiver-modern-history-search');
    historySearch.value = new Date(receivedAt).toISOString().slice(0, 10);
    historySearch.dispatchEvent(new w.Event('input', {bubbles: true}));
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.equal(w.document.querySelectorAll('.receiver-island__history-list li').length, 2,
        'history search matches receive timestamps');
    historySearch.value = String(frequency);
    historySearch.dispatchEvent(new w.Event('input', {bubbles: true}));
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.equal(w.document.querySelectorAll('.receiver-island__history-list li').length, 1,
        'history search matches receive frequency');
    historySearch.value = 'WSPR';
    historySearch.dispatchEvent(new w.Event('input', {bubbles: true}));
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.equal(w.document.querySelectorAll('.receiver-island__history-list li').length, 1,
        'history search matches decoder mode');
    historySearch.value = 'fn31';
    historySearch.dispatchEvent(new w.Event('input', {bubbles: true}));
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.equal(w.document.querySelectorAll('.receiver-island__history-list li').length, 1);
    historySearch.value = 'no-match';
    historySearch.dispatchEvent(new w.Event('input', {bubbles: true}));
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.match(w.document.querySelector('.receiver-island__history').textContent, /No receptions match/);
    w.document.querySelector('.receiver-island__history-tools button').click();
    assert.equal(w.localStorage.getItem('openwebrx.reception-history.v1'), null);
    assert.equal(w.document.querySelectorAll('.receiver-island__history-list li').length, 0);
    w.dispatchEvent(new w.CustomEvent('openwebrx:data2g-frame', {detail: {
        type: 'data2g_frame', schema_version: 2, port: 0, command: 0,
        payload_bytes: 1, payload_hex: '41'
    }}));
    w.dispatchEvent(new w.CustomEvent('openwebrx:data2g-frame', {detail: {
        type: 'data2g_frame', schema_version: 1, port: 0, command: 0,
        payload_bytes: 2, payload_hex: '41zz'
    }}));
    w.dispatchEvent(new w.CustomEvent('openwebrx:data2g-status', {detail: {
        type: 'data2g_status', schema_version: 1, state: 'transmit_enabled'
    }}));
    w.dispatchEvent(new w.CustomEvent('openwebrx:data2g-status', {detail: {
        type: 'data2g_status', schema_version: 1, state: 'heard', port: 16
    }}));
    await new Promise(resolve => w.setTimeout(resolve, 0));
    assert.equal(w.document.querySelectorAll('.receiver-island__data2g code').length, 1,
        'unknown schema versions and malformed frames are ignored');
    assert.match(w.document.querySelector('.receiver-island__data2g').textContent, /APRS decoded/,
        'unknown status values are ignored');
    await new Promise(resolve => w.setTimeout(resolve, 25));
    dom.window.close();
}

run().then(() => console.log('Modern receiver island adapter smoke check passed')).catch(error => {
    dom.window.close();
    console.error(error);
    process.exitCode = 1;
});
