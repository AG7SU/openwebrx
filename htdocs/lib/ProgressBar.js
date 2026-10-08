(function(global) {
    'use strict';

    var instances = new WeakMap();

    function ProgressBar(element) {
        if (!element || !element.ownerDocument) throw new TypeError('Progress bar requires a DOM element');
        this.el = element;
        this.innerText = element.ownerDocument.createElement('span');
        this.innerText.className = 'openwebrx-progressbar-text';
        this.innerBar = element.ownerDocument.createElement('div');
        this.innerBar.className = 'openwebrx-progressbar-bar';
        element.replaceChildren(this.innerText, this.innerBar);
        this.setText(this.getDefaultText());
    }

    ProgressBar.prototype.getDefaultText = function() { return ''; };
    ProgressBar.prototype.set = function(value, text, over) {
        this.setValue(value);
        this.setText(text);
        this.setOver(over);
    };
    ProgressBar.prototype.setValue = function(value) {
        value = Number(value);
        if (!Number.isFinite(value)) value = 0;
        value = Math.max(0, Math.min(1, value));
        var offset = Number(((value - 1) * 100).toFixed(4));
        this.innerBar.style.transform = 'translate(' + offset + '%) translateZ(0)';
    };
    ProgressBar.prototype.setText = function(text) { this.innerText.textContent = text == null ? '' : String(text); };
    ProgressBar.prototype.setOver = function(over) { this.el.classList.toggle('openwebrx-progressbar--over', !!over); };

    function inherit(Constructor) {
        Constructor.prototype = Object.create(ProgressBar.prototype);
        Constructor.prototype.constructor = Constructor;
    }

    function AudioBufferProgressBar(element) { ProgressBar.call(this, element); }
    inherit(AudioBufferProgressBar);
    AudioBufferProgressBar.prototype.getDefaultText = function() { return 'Audio buffer [0 ms]'; };
    AudioBufferProgressBar.prototype.setSampleRate = function(sampleRate) { this.sampleRate = sampleRate; };
    AudioBufferProgressBar.prototype.setBuffersize = function(buffersize) {
        var seconds = this.sampleRate > 0 ? buffersize / this.sampleRate : 0;
        var overrun = seconds > audio_buffer_maximal_length_sec;
        var underrun = seconds === 0;
        var text = overrun ? 'overrun' : underrun ? 'underrun' : 'buffer';
        this.set(seconds, 'Audio ' + text + ' [' + seconds.toFixed(1) + ' s]', overrun || underrun);
    };

    function NetworkSpeedProgressBar(element) { ProgressBar.call(this, element); }
    inherit(NetworkSpeedProgressBar);
    NetworkSpeedProgressBar.prototype.getDefaultText = function() { return 'Network usage [0 kbps]'; };
    NetworkSpeedProgressBar.prototype.setSpeed = function(speed) {
        var kilobits = speed * 8 / 1000;
        this.set(kilobits / 2000, 'Network usage [' + kilobits.toFixed(1) + ' kbps]', false);
    };

    function AudioSpeedProgressBar(element) { ProgressBar.call(this, element); }
    inherit(AudioSpeedProgressBar);
    AudioSpeedProgressBar.prototype.getDefaultText = function() { return 'Audio stream [0 kbps]'; };
    AudioSpeedProgressBar.prototype.setSpeed = function(speed) {
        this.set(speed / 1000000, 'Audio stream [' + (speed / 1000).toFixed(0) + ' kbps]', false);
    };

    function AudioOutputProgressBar(element) { ProgressBar.call(this, element); }
    inherit(AudioOutputProgressBar);
    AudioOutputProgressBar.prototype.getDefaultText = function() { return 'Audio output [0 sps]'; };
    AudioOutputProgressBar.prototype.setSampleRate = function(sampleRate) {
        this.maxRate = sampleRate * 1.25;
        this.minRate = sampleRate * 0.25;
    };
    AudioOutputProgressBar.prototype.setAudioRate = function(audioRate) {
        this.set(audioRate / this.maxRate, 'Audio output [' + (audioRate / 1000).toFixed(1) + ' ksps]',
            audioRate > this.maxRate || audioRate < this.minRate);
    };

    function ClientsProgressBar(element) {
        ProgressBar.call(this, element);
        this.clients = 0;
        this.maxClients = 0;
    }
    inherit(ClientsProgressBar);
    ClientsProgressBar.prototype.getDefaultText = function() { return 'Clients [0]'; };
    ClientsProgressBar.prototype.setClients = function(clients) { this.clients = clients; this.render(); };
    ClientsProgressBar.prototype.setMaxClients = function(maxClients) { this.maxClients = maxClients; this.render(); };
    ClientsProgressBar.prototype.render = function() {
        var value = this.maxClients > 0 ? this.clients / this.maxClients : 0;
        this.set(value, 'Clients [' + this.clients + ']', this.maxClients > 0 && this.clients > this.maxClients * 0.85);
    };

    function CpuProgressBar(element) { ProgressBar.call(this, element); }
    inherit(CpuProgressBar);
    CpuProgressBar.prototype.getDefaultText = function() { return 'Server CPU [0%]'; };
    CpuProgressBar.prototype.setUsage = function(usage) {
        var temp = this.temp ? '/' + this.temp + '°C' : '';
        this.set(usage, 'Server CPU [' + Math.round(usage * 100) + '%' + temp + ']', usage > 0.85);
    };
    CpuProgressBar.prototype.setTemp = function(temp) { this.temp = temp; };

    function BatteryProgressBar(element) { ProgressBar.call(this, element); }
    inherit(BatteryProgressBar);
    BatteryProgressBar.prototype.getDefaultText = function() { return 'Battery'; };
    BatteryProgressBar.prototype.setBattery = function(battery) {
        var voltage = battery.voltage || 0.0;
        var current = battery.current > 0 ? '/' + battery.current + 'A' : '';
        var charge = battery.charge || 0;
        this.set(charge / 100.0, (battery.charger ? 'Charging' : 'Battery') + ' [' + charge + '%/' + voltage + 'V' + current + ']', charge < 20);
    };

    ProgressBar.types = {
        cpu: CpuProgressBar,
        battery: BatteryProgressBar,
        audiobuffer: AudioBufferProgressBar,
        audiospeed: AudioSpeedProgressBar,
        audiooutput: AudioOutputProgressBar,
        clients: ClientsProgressBar,
        networkspeed: NetworkSpeedProgressBar
    };

    global.OpenWebRXProgressBar = {
        create: function(element) {
            if (typeof element === 'string') element = document.getElementById(element);
            if (!element || !element.ownerDocument) throw new TypeError('Progress bar requires a DOM element');
            if (!instances.has(element)) {
                var Constructor = ProgressBar.types[element.getAttribute('data-type')] || ProgressBar;
                instances.set(element, new Constructor(element));
            }
            return instances.get(element);
        }
    };
})(window);
