const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');

const root = path.resolve(__dirname, '..');
const dom = new JSDOM('<!doctype html><html><body><button class="openwebrx-record-button">REC</button><select id="openwebrx-sdr-profiles-listbox"><option value="sdr1|p1" selected>Receiver 1</option><option value="sdr2|p2">Receiver 2</option></select></body></html>', {
    runScripts: 'outside-only',
    pretendToBeVisual: true
});
const w = dom.window;
let started = true;
const audio = {
    recording: false,
    audioDroppedSamples: 128,
    isStarted: () => started,
    isAllowed: () => true,
    getOutputRate: () => 12000,
    getHdOutputRate: () => 48000,
    getSampleRate: () => 48000,
    setCompression(value) { this.compression = value; },
    setVolume(value) { this.gain = value; },
    clearBuffer() { this.bufferCleared = true; },
    resume() { this.resumed = true; },
    onStart(callback) { this.startCallback = callback; },
    startRecording() { this.recording = true; },
    stopRecording() { this.recording = false; },
    pushAudio(data) { this.lastStream = ['normal', data.byteLength]; },
    pushHdAudio(data) { this.lastStream = ['hd', data.byteLength]; }
};
w.audioEngine = audio;
w.sdr_profile_changed = () => { w.profileChanges = (w.profileChanges || 0) + 1; };
w.zoomInOneStep = () => { w.zoomCalls = (w.zoomCalls || 0) + 1; };
w.Waterfall = {
    setAutoRange() { w.waterfallRange = 'auto'; },
    setDefaultRange() { w.waterfallRange = 'default'; }
};
w.waterfall_add = (data) => { w.lastWaterfallLine = data; };
w.secondary_demod_waterfall_add = (data) => { w.lastSecondaryWaterfallLine = data; };
w.waterfall_clear = () => { w.waterfallCleared = true; };
w.eval(fs.readFileSync(path.join(root, 'htdocs/lib/jquery-3.7.1.min.js'), 'utf8'));
w.eval(fs.readFileSync(path.join(root, 'htdocs/lib/UI.js'), 'utf8'));

const decoderErrors = [];
w.addEventListener('openwebrx:decoder-error', event => decoderErrors.push(event.detail));
const decoderOutputs = [];
w.addEventListener('openwebrx:decoder-output', event => decoderOutputs.push(event.detail));
w.UI.getModulation = () => 'USB';
assert.equal(w.UI.dispatchDecoderErrorEvent({schema_version: 1, message: 'Decoder stopped'}), true);
assert.equal(w.UI.dispatchDecoderErrorEvent({schema_version: 2, message: 'unknown schema'}), false);
assert.equal(w.UI.dispatchDecoderErrorEvent({schema_version: 1, message: 'x'.repeat(241)}), false);
assert.deepEqual(JSON.parse(JSON.stringify(decoderErrors)), [{schema_version: 1, message: 'Decoder stopped'}]);
assert.equal(w.UI.dispatchDecoderOutputEvent({schema_version: 1, received_at: 1_800_000_000}), true);
assert.equal(w.UI.dispatchDecoderOutputEvent({schema_version: 1, received_at: 1_800_000_000, modulation: 'ft8'}), true);
assert.equal(w.UI.dispatchDecoderOutputEvent({schema_version: 2, received_at: 1_800_000_000}), false);
assert.equal(w.UI.dispatchDecoderOutputEvent({schema_version: 1, received_at: Infinity}), false);
assert.equal(w.UI.dispatchDecoderOutputEvent({schema_version: 1, received_at: 1_800_000_000, modulation: 'x'.repeat(65)}), false);
assert.equal(w.UI.dispatchDecoderOutputEvent({schema_version: 1, received_at: 1_800_000_000, modulation: 'ft8\nforged'}), false);
assert.deepEqual(JSON.parse(JSON.stringify(decoderOutputs)), [
    {schema_version: 1, received_at: 1_800_000_000, modulation: 'USB'},
    {schema_version: 1, received_at: 1_800_000_000, modulation: 'ft8'}
]);

assert.equal(w.UI.isRecordingAllowed(), false);
assert.equal(w.OpenWebRXReceiver.audio.setRecording(true), false, 'recording starts denied until server permission arrives');
assert.equal(audio.recording, false);

w.UI.recordingAllowed = true;
assert.equal(w.OpenWebRXReceiver.audio.setRecording(true), true);
assert.equal(audio.recording, true);
assert.equal(w.document.querySelector('.openwebrx-record-button').style.animationName, 'openwebrx-record-animation');

w.UI.recordingAllowed = false;
assert.equal(w.OpenWebRXReceiver.audio.setRecording(true), false, 'permission revocation blocks a new recording');
assert.equal(w.OpenWebRXReceiver.audio.setRecording(false), true, 'an active recording remains stoppable after permission revocation');
assert.equal(audio.recording, false);
assert.equal(w.document.querySelector('.openwebrx-record-button').style.animationName, '');

w.UI.recordingAllowed = true;
started = false;
assert.equal(w.UI.setRecording(true), false, 'recording requires active audio');
assert.equal(audio.recording, false);

assert.deepEqual(JSON.parse(JSON.stringify(w.OpenWebRXReceiver.getProfiles())), [
    {id: 'sdr1|p1', name: 'Receiver 1'},
    {id: 'sdr2|p2', name: 'Receiver 2'}
]);
assert.equal(w.OpenWebRXReceiver.selectProfile('sdr2|p2'), true);
assert.equal(w.document.querySelector('#openwebrx-sdr-profiles-listbox').value, 'sdr2|p2');
assert.equal(w.profileChanges, 1);
assert.equal(w.OpenWebRXReceiver.waterfall.zoom('in'), true);
assert.equal(w.zoomCalls, 1);
assert.equal(w.OpenWebRXReceiver.waterfall.setRange('auto'), true);
assert.equal(w.waterfallRange, 'auto');
assert.equal(w.OpenWebRXReceiver.waterfall.setRange('default'), true);
assert.equal(w.waterfallRange, 'default');
const pcm = new w.ArrayBuffer(32);
assert.equal(w.OpenWebRXReceiver.audio.pushStream(pcm), true);
assert.deepEqual(audio.lastStream, ['normal', 32]);
assert.equal(w.OpenWebRXReceiver.audio.pushStream(pcm, true), true);
assert.deepEqual(audio.lastStream, ['hd', 32]);
assert.equal(w.OpenWebRXReceiver.audio.pushStream(new w.Uint8Array(8)), false);
assert.equal(w.OpenWebRXReceiver.audio.isAvailable(), true);
assert.equal(w.OpenWebRXReceiver.audio.isAllowed(), true);
assert.equal(w.OpenWebRXReceiver.audio.getOutputRate(), 12000);
assert.equal(w.OpenWebRXReceiver.audio.getHdOutputRate(), 48000);
assert.equal(w.OpenWebRXReceiver.audio.getSampleRate(), 48000);
assert.equal(w.OpenWebRXReceiver.audio.setCompression('adpcm'), true);
assert.equal(audio.compression, 'adpcm');
assert.equal(w.OpenWebRXReceiver.audio.setGain(0.25), true);
assert.equal(audio.gain, 0.25);
assert.equal(w.OpenWebRXReceiver.audio.clearBuffer(), true);
assert.equal(audio.bufferCleared, true);
assert.equal(w.OpenWebRXReceiver.audio.resume(), true);
assert.equal(audio.resumed, true);
const startCallback = () => {};
assert.equal(w.OpenWebRXReceiver.audio.onStart(startCallback), true);
assert.equal(audio.startCallback, startCallback);
const fftLine = new w.Float32Array([1, 2, 3]);
assert.equal(w.OpenWebRXReceiver.waterfall.addLine(fftLine), true);
assert.equal(w.lastWaterfallLine, fftLine);
assert.equal(w.OpenWebRXReceiver.waterfall.addLine([1, 2, 3]), false);
assert.equal(w.OpenWebRXReceiver.waterfall.addSecondaryLine(fftLine), true);
assert.equal(w.lastSecondaryWaterfallLine, fftLine);
assert.equal(w.OpenWebRXReceiver.waterfall.addSecondaryLine([1, 2, 3]), false);
assert.equal(w.OpenWebRXReceiver.waterfall.clear(), true);
assert.equal(w.waterfallCleared, true);
w.UI.getFrequency = () => 14_074_000;
w.UI.getModulation = () => 'USB';
w.UI.volume = 83;
w.UI.volumeMuted = -1;
w.Modes = {
    getModes: () => [{modulation: 'USB', name: 'Upper Sideband', type: 'analog'}],
    getCapabilities: () => []
};
w.ws = {readyState: w.WebSocket.OPEN};
w.tuning_step = 50;
w.zoom_level = 1;
w.zoom_levels = [1, 2, 4];
const snapshot = w.OpenWebRXReceiver.getSnapshot();
assert.equal(snapshot.frequencyHz, 14_074_000);
assert.equal(snapshot.tuningStepHz, 50);
assert.equal(snapshot.connection, 'connected');
assert.equal(snapshot.mode, 'USB');
assert.equal(snapshot.volume, 83);
assert.equal(snapshot.audioDroppedSamples, 128);
assert.equal(snapshot.waterfallZoomLevel, 1);
assert.equal(snapshot.waterfallZoomMaximum, 2);

dom.window.close();
console.log('Legacy receiver bridge recording and profile checks passed');
