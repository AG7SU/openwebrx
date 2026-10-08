class OwrxAudioProcessor extends AudioWorkletProcessor {
    constructor(options){
        super(options);
        // initialize ringbuffer, make sure it aligns with the expected buffer size of 128
        this.bufferSize = Math.max(128, Math.round(options.processorOptions.maxBufferSize / 128) * 128);
        this.audioBuffer = new Float32Array(this.bufferSize);
        this.inPos = 0;
        this.outPos = 0;
        this.queuedSamples = 0;
        this.samplesProcessed = 0;
        this.droppedSamples = 0;
        this.port.addEventListener('message', (m) => {
            if (typeof(m.data) === 'string') {
                const json = JSON.parse(m.data);
                if (json.cmd && json.cmd === 'getStats') {
                    this.reportStats();
                } else if (json.cmd && json.cmd === 'clearBuffer') {
                    this.inPos = 0;
                    this.outPos = 0;
                    this.queuedSamples = 0;
                }
            } else {
                const data = m.data;
                const available = this.bufferSize - this.queuedSamples;
                if (!(data instanceof Float32Array) || data.length > available) {
                    const dropped = data && Number.isInteger(data.length) ? data.length : 0;
                    this.droppedSamples += dropped;
                    this.port.postMessage({type: 'audio_ack', samples: dropped, accepted: false});
                    return;
                }
                const firstPart = Math.min(data.length, this.bufferSize - this.inPos);
                this.audioBuffer.set(data.subarray(0, firstPart), this.inPos);
                if (firstPart < data.length) this.audioBuffer.set(data.subarray(firstPart), 0);
                this.inPos = (this.inPos + m.data.length) % this.bufferSize;
                this.queuedSamples += data.length;
                this.port.postMessage({type: 'audio_ack', samples: data.length, accepted: true});
            }
        });
        this.port.addEventListener('messageerror', console.error);
        this.port.start();
    }
    process(inputs, outputs) {
        if (this.queuedSamples < 128) {
            outputs[0].forEach(output => output.fill(0));
            return true;
        }
        outputs[0].forEach((output) => {
            output.set(this.audioBuffer.subarray(this.outPos, this.outPos + 128));
        });
        this.outPos = (this.outPos + 128) % this.bufferSize;
        this.queuedSamples -= 128;
        this.samplesProcessed += 128;
        return true;
    }
    remaining() {
        return this.queuedSamples;
    }
    reportStats() {
        this.port.postMessage({
            type: 'audio_stats',
            buffersize: this.remaining(),
            samplesProcessed: this.samplesProcessed,
            droppedSamples: this.droppedSamples
        });
        this.samplesProcessed = 0;
        this.droppedSamples = 0;
    }
}

registerProcessor('openwebrx-audio-processor', OwrxAudioProcessor);
