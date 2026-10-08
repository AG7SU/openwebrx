const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

let Processor;
class WorkletBase {
    constructor() {
        this.port = {
            listeners: {},
            sent: [],
            addEventListener: (name, callback) => { this.port.listeners[name] = callback; },
            postMessage: message => this.port.sent.push(message),
            start() {}
        };
    }
}
const context = vm.createContext({
    AudioWorkletProcessor: WorkletBase,
    registerProcessor: (_name, processor) => { Processor = processor; },
    console
});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../htdocs/lib/AudioProcessor.js'), 'utf8'), context);

const processor = new Processor({processorOptions: {maxBufferSize: 256}});
const WorkletFloat32Array = vm.runInContext('Float32Array', context);
const input = values => new WorkletFloat32Array(values);
processor.port.listeners.message({data: input(Array.from({length: 256}, (_, i) => i + 1))});
assert.equal(processor.remaining(), 256, 'the ring buffer can represent completely full');
assert.deepEqual(JSON.parse(JSON.stringify(processor.port.sent.at(-1))), {type: 'audio_ack', samples: 256, accepted: true});
processor.port.listeners.message({data: input([999])});
assert.equal(processor.remaining(), 256, 'overflow must preserve queued samples');
assert.equal(processor.droppedSamples, 1);
assert.deepEqual(JSON.parse(JSON.stringify(processor.port.sent.at(-1))), {type: 'audio_ack', samples: 1, accepted: false});

const first = [new Float32Array(128)];
assert.equal(processor.process([], [first]), true);
assert.deepEqual([...first[0].slice(0, 3)], [1, 2, 3]);
assert.equal(processor.remaining(), 128);
processor.port.listeners.message({data: input(Array.from({length: 128}, (_, i) => i + 1000))});
assert.equal(processor.remaining(), 256, 'ring wrap must preserve order without overwriting unread data');
const second = [new Float32Array(128)];
processor.process([], [second]);
assert.deepEqual([...second[0].slice(0, 3)], [129, 130, 131]);
const third = [new Float32Array(128)];
processor.process([], [third]);
assert.deepEqual([...third[0].slice(0, 3)], [1000, 1001, 1002]);
assert.equal(processor.remaining(), 0);

const silence = [new Float32Array(128).fill(5)];
processor.process([], [silence]);
assert.deepEqual([...silence[0].slice(0, 3)], [0, 0, 0], 'underflow should output silence');
processor.port.listeners.message({data: input([10, 11, 12])});
processor.port.listeners.message({data: JSON.stringify({cmd: 'clearBuffer'})});
assert.equal(processor.remaining(), 0, 'reconnect flush must discard stale queued audio');
processor.reportStats();
assert.equal(processor.port.sent.at(-1).droppedSamples, 1);
assert.equal(processor.droppedSamples, 0, 'reported drop counter resets after stats');

const audioEngineContext = vm.createContext({window: {}});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../htdocs/lib/AudioEngine.js'), 'utf8'), audioEngineContext);
const AudioEngine = audioEngineContext.AudioEngine;
const engine = Object.create(AudioEngine.prototype);
const posted = [];
const reports = [];
engine.audioNode = {port: {postMessage: (...args) => posted.push(args)}};
engine.audioWorkletPendingSamples = 0;
engine.audioWorkletBufferedSamples = 0;
engine.audioDroppedSamples = 0;
engine.maxBufferSize = 4;
engine.audioBytes = {add() {}};
engine.audioReporter = report => reports.push(report);
engine.recording = false;
engine.resampler = {process: () => new Float32Array(4)};
engine.recorder = {};
engine.processAudio(new ArrayBuffer(8), engine.resampler, engine.recorder);
assert.equal(engine.audioWorkletPendingSamples, 4);
assert.equal(posted.length, 1);
assert.equal(posted[0][1].length, 1, 'AudioWorklet input should transfer ownership of the PCM buffer');
engine.resampler = {process: () => new Float32Array(2)};
engine.processAudio(new ArrayBuffer(4), engine.resampler, engine.recorder);
assert.equal(posted.length, 1, 'messages waiting for worklet admission are byte bounded');
assert.equal(engine.audioDroppedSamples, 2);
engine.audioWorkletBufferedSamples = 3;
assert.equal(engine.getBuffersize(), 7);
engine.clearBuffer();
assert.equal(engine.getBuffersize(), 0, 'websocket reconnect flush resets pending and buffered samples');
assert.equal(posted.at(-1)[0], JSON.stringify({cmd: 'clearBuffer'}));
assert.ok(reports.some(report => report.audioDroppedSamples === 2));

engine.audioNode = {};
engine.audioBuffers = [];
engine.audioDroppedSamples = 0;
engine.maxBufferSize = 4;
engine.resampler = {process: () => new Float32Array(4)};
engine.processAudio(new ArrayBuffer(8), engine.resampler, engine.recorder);
assert.equal(engine.getBuffersize(), 4, 'ScriptProcessor fallback remains bounded');
engine.resampler = {process: () => new Float32Array(2)};
engine.processAudio(new ArrayBuffer(4), engine.resampler, engine.recorder);
assert.equal(engine.getBuffersize(), 4);
assert.equal(engine.audioDroppedSamples, 2);
console.log('AudioWorklet ring, overflow, underflow, and flush checks passed');
