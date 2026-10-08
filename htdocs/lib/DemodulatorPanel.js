function DemodulatorPanel(el) {
    var self = this;
    self.root = el;
    self.demodulator = null;
    self.mode = null;
    self.squelchMargin = 10;
    self.initialParams = {};

    var displayEl = self.root.querySelector('.webrx-actual-freq');
    this.tuneableFrequencyDisplay = OpenWebRXFrequencyDisplay.createTuneable(displayEl);
    displayEl.addEventListener('frequencychange', function(event) {
        var demod = self.getDemodulator();
        var delta = demod.get_modulation() === 'cw'? UI.getCwOffset() : 0;
        demod.set_offset_frequency(event.detail - self.center_freq - delta);
    });

    this.mouseFrequencyDisplay = OpenWebRXFrequencyDisplay.create(self.root.querySelector('.webrx-mouse-freq'));

    Modes.registerModePanel(this);
    self.root.addEventListener('click', function(event) {
        var button = event.target.closest('.openwebrx-demodulator-button');
        if (!button || !self.root.contains(button)) return;
        var modulation = button.getAttribute('data-modulation');
        if (modulation) {
            if (self.mode && self.mode.type === 'digimode' && self.mode.underlying.indexOf(modulation) >= 0) {
                // keep the mode, just switch underlying modulation
                self.setMode(self.mode.modulation, modulation)
            } else {
                self.setMode(modulation);
            }
        } else {
            self.disableDigiMode();
        }
    });
    self.root.addEventListener('change', function(event) {
        if (event.target.matches('.openwebrx-secondary-demod-listbox')) {
            var value = event.target.value;
            if (value === 'none') {
                self.disableDigiMode();
            } else {
                self.setMode(value);
            }
        } else if (event.target.matches('.openwebrx-squelch-slider')) {
            self.updateSquelch();
        }
    });
    self.root.addEventListener('click', function(event) {
        if (!event.target.closest('.openwebrx-squelch-auto') || !self.root.contains(event.target)) return;
        if (!self.squelchAvailable()) return;
        self.root.querySelector('.openwebrx-squelch-slider').value = getLogSmeterValue(smeter_level) + self.getSquelchMargin();
        self.updateSquelch();
    });
    window.addEventListener('hashchange', function() {
        self.onHashChange();
    });
};

DemodulatorPanel.prototype.render = function() {
    var normalModes = Modes.getModes()
        .filter(function(m){ return m.type === 'analog'; });

    var digiModes = Modes.getModes()
        .filter(function(m){ return m.type === 'digimode'; })
        .sort(function(a, b){ return a.name.localeCompare(b.name) });

    var doc = this.root.ownerDocument;
    var modeGrid = doc.createElement('div');
    modeGrid.className = 'openwebrx-modes-grid';
    normalModes.forEach(function(mode) {
        var button = doc.createElement('div');
        button.className = 'openwebrx-button openwebrx-demodulator-button';
        button.setAttribute('data-modulation', mode.modulation);
        button.id = 'openwebrx-button-' + mode.modulation;
        button.textContent = mode.name;
        modeGrid.append(button);
    });

    var digitalModes = doc.createElement('div');
    digitalModes.className = 'openwebrx-panel-line openwebrx-panel-flex-line';
    var digitalButton = doc.createElement('div');
    digitalButton.className = 'openwebrx-button openwebrx-demodulator-button openwebrx-button-dig';
    digitalButton.textContent = 'DIG';
    var select = doc.createElement('select');
    select.className = 'openwebrx-secondary-demod-listbox';
    var none = doc.createElement('option');
    none.value = 'none';
    select.append(none);
    digiModes.forEach(function(mode) {
        var option = doc.createElement('option');
        option.value = mode.modulation;
        option.textContent = mode.name;
        select.append(option);
    });
    digitalModes.append(digitalButton, select);

    var container = this.root.querySelector('.openwebrx-modes');
    if (container) container.replaceChildren(modeGrid, digitalModes);
};

DemodulatorPanel.prototype.setMode = function(requestedModulation, underlyingModulation) {
    var mode = Modes.findByModulation(requestedModulation);
    if (!mode) {
        return;
    }

    if (this.mode === mode && this.underlyingModulation === underlyingModulation) {
        return;
    }

    var modulation;
    if (mode.type !== 'digimode') {
        // analog modes have no underlying modulation
        underlyingModulation = undefined;
        modulation = mode.modulation;
    } else if (underlyingModulation) {
        // use given underlying modulation
        modulation = underlyingModulation;
    } else if (mode.underlying.indexOf(this.underlyingModulation) >= 0) {
        // use current underlying modulation if it fits
        modulation = underlyingModulation = this.underlyingModulation;
    } else if (this.mode && mode.underlying.indexOf(this.mode.modulation) >= 0) {
        // use current mode modulation if it fits
        modulation = underlyingModulation = this.mode.modulation;
    } else {
        // use mode's default underlying modulation
        modulation = underlyingModulation = mode.underlying[0];
    }

    var current = this.collectParams();
    if (this.demodulator) {
        current.offset_frequency = this.demodulator.get_offset_frequency();
        current.squelch_level = this.demodulator.getSquelch();
    }

    this.stopDemodulator();
    this.demodulator = new Demodulator(current.offset_frequency, modulation);
    this.demodulator.setSquelch(current.squelch_level);

    var self = this;
    var updateFrequency = function(freq) {
        var delta = self.demodulator.get_modulation() === 'cw'? UI.getCwOffset() : 0;
        self.tuneableFrequencyDisplay.setFrequency(self.center_freq + freq + delta);
        self.updateHash();
    };
    this.demodulator.on("frequencychange", updateFrequency);
    updateFrequency(this.demodulator.get_offset_frequency());
    var updateSquelch = function(squelch) {
        var slider = self.root.querySelector('.openwebrx-squelch-slider');
        slider.value = squelch;
        slider.title = 'Squelch (' + squelch + ' dB)';
        self.updateHash();
    };
    this.demodulator.on('squelchchange', updateSquelch);
    updateSquelch(this.demodulator.getSquelch());

    if (mode.type === 'digimode') {
        this.demodulator.set_secondary_demod(mode.modulation);
        var uMode = Modes.findByModulation(underlyingModulation);
        var bandpass = mode.bandpass || (uMode && uMode.bandpass);
        if (bandpass) {
            this.demodulator.setBandpass(bandpass);
        } else {
            this.demodulator.disableBandpass();
        }
        var ifRate = mode.ifRate || (uMode && uMode.ifRate);
        this.demodulator.setIfRate(ifRate);
    } else {
        this.demodulator.set_secondary_demod(false);
    }

    this.demodulator.start();
    this.mode = mode;
    this.underlyingModulation = underlyingModulation;

    this.updateButtons();
    this.updatePanels();
    this.updateHash();
};

DemodulatorPanel.prototype.disableDigiMode = function() {
    this.setMode(this.getDemodulator().get_modulation());
};

DemodulatorPanel.prototype.updatePanels = function() {
    var modulation = this.getDemodulator().get_secondary_demod();
    var digimodesPanel = document.getElementById('openwebrx-panel-digimodes');
    if (digimodesPanel) digimodesPanel.setAttribute('data-mode', modulation || '');
    var mode = Modes.findByModulation(modulation);
    toggle_panel("openwebrx-panel-digimodes", modulation && (!mode || mode.secondaryFft));
    // WSJT-X modes share the same panel
    toggle_panel("openwebrx-panel-wsjt-message", ['ft8', 'wspr', 'jt65', 'jt9', 'ft4', 'fst4', 'fst4w', "q65", "msk144"].indexOf(modulation) >= 0);
    // Aeronautic modes share the same panel
    toggle_panel("openwebrx-panel-hfdl-message", ['hfdl', 'vdl2', 'acars', 'uat'].indexOf(modulation) >= 0);
    // Packet modes share the same panel
    toggle_panel("openwebrx-panel-packet-message", ['packet', 'ais', 'lora-aprs', 'sonde-rs41', 'sonde-mts01', 'sonde-m10', 'sonde-m20', 'sonde-dfm9', 'sonde-dfm17'].indexOf(modulation) >= 0);
    // ISM modes share the same panel
    toggle_panel("openwebrx-panel-ism-message", ['ism', 'wmbus'].indexOf(modulation) >= 0);
    // Skimmer modes share the same panel
    toggle_panel("openwebrx-panel-skimmer-message", ['cwskimmer', 'rttyskimmer'].indexOf(modulation) >= 0);
    // These modes come with their own panels
    ['js8', 'page', 'pocsag', 'sstv', 'fax', 'dsc', 'adsb', 'meshtastic'].forEach(function(m) {
        toggle_panel('openwebrx-panel-' + m + '-message', modulation === m);
    });

    modulation = this.getDemodulator().get_modulation();
    var showing = 'openwebrx-panel-metadata-' + modulation;
    OpenWebRXMetaPanels.forEach(function(metaPanel, p) {
        toggle_panel(p.id, p.id === showing && !p.classList.contains('disabled'));
        metaPanel.clear();
    });
};

DemodulatorPanel.prototype.getDemodulator = function() {
    return this.demodulator;
};

DemodulatorPanel.prototype.collectParams = function() {
    var defaults = {
        offset_frequency: 0,
        squelch_level: -150,
        mod: 'nfm'
    }
    return Object.assign({}, defaults, this.validateInitialParams(this.initialParams), this.transformHashParams(this.parseHash()));
};

DemodulatorPanel.prototype.startDemodulator = function() {
    var params = this.collectParams();

    if ("magic_key" in params)
        this.setMagicKey(params.magic_key);

    if (Modes.initComplete() && this.center_freq)
        this._apply(params);
};

DemodulatorPanel.prototype.stopDemodulator = function() {
    if (!this.demodulator) {
        return;
    }
    this.demodulator.stop();
    this.demodulator = null;
    this.mode = null;
}

DemodulatorPanel.prototype._apply = function(params) {
    if (params.secondary_mod) {
        this.setMode(params.secondary_mod, params.mod)
    } else {
        this.setMode(params.mod);
    }
    this.getDemodulator().set_offset_frequency(params.offset_frequency);
    this.getDemodulator().setSquelch(params.squelch_level);
    this.updateButtons();
};

DemodulatorPanel.prototype.setInitialParams = function(params) {
    Object.assign(this.initialParams, params);
};

DemodulatorPanel.prototype.resetInitialParams = function() {
    this.initialParams = {};
};

DemodulatorPanel.prototype.setMagicKey = function(key) {
    this.magic_key = key;
};

DemodulatorPanel.prototype.getMagicKey = function() {
    return this.magic_key;
};

DemodulatorPanel.prototype.onHashChange = function() {
    this._apply(this.transformHashParams(this.parseHash()));
};

DemodulatorPanel.prototype.transformHashParams = function(params) {
    var ret = {
        mod: params.mod
    };
    if (typeof(params.secondary_mod) !== 'undefined') ret.secondary_mod = params.secondary_mod;
    if (typeof(params.offset_frequency) !== 'undefined') ret.offset_frequency = params.offset_frequency;
    if (typeof(params.sql) !== 'undefined') ret.squelch_level = parseInt(params.sql);
    if (typeof(params.key) !== 'undefined') ret.magic_key = params.key;
    return ret;
};

DemodulatorPanel.prototype.squelchAvailable = function () {
    return this.mode && this.mode.squelch;
}

DemodulatorPanel.prototype.updateButtons = function() {
    var root = this.root;
    var buttons = this.root.querySelectorAll('.openwebrx-demodulator-button');
    buttons.forEach(function(button) { button.classList.remove('highlighted', 'same-mod'); });
    var demod = this.getDemodulator()
    if (!demod) return;
    var selectedMode = Array.from(this.root.querySelectorAll('[data-modulation]'))
        .find(function(button) { return button.getAttribute('data-modulation') === demod.get_modulation(); });
    if (selectedMode) selectedMode.classList.add('highlighted');
    var secondary_demod = demod.get_secondary_demod()
    if (secondary_demod) {
        var digitalButton = this.root.querySelector('.openwebrx-button-dig');
        var secondarySelect = this.root.querySelector('.openwebrx-secondary-demod-listbox');
        if (digitalButton) digitalButton.classList.add('highlighted');
        if (secondarySelect) secondarySelect.value = secondary_demod;
        var mode = Modes.findByModulation(secondary_demod);
        if (mode) {
            mode.underlying.filter(function(m) {
                return m !== demod.get_modulation();
            }).forEach(function(m) {
                var button = Array.from(root.querySelectorAll('[data-modulation]'))
                    .find(function(candidate) { return candidate.getAttribute('data-modulation') === m; });
                if (button) button.classList.add('same-mod');
            });
        }
    } else {
        var secondarySelect = this.root.querySelector('.openwebrx-secondary-demod-listbox');
        if (secondarySelect) secondarySelect.value = 'none';
    }
    var squelch_disabled = !this.squelchAvailable();
    var squelchSlider = this.root.querySelector('.openwebrx-squelch-slider');
    var squelchAuto = this.root.querySelector('.openwebrx-squelch-auto');
    if (squelchSlider) squelchSlider.disabled = squelch_disabled;
    if (squelchAuto) squelchAuto.classList.toggle('disabled', squelch_disabled);
}

DemodulatorPanel.prototype.setCenterFrequency = function(center_freq) {
    var me = this;
    if (me.centerFreqTimeout) {
        clearTimeout(me.centerFreqTimeout);
        me.centerFreqTimeout = false;
    }
    this.centerFreqTimeout = setTimeout(function() {
        me.stopDemodulator();
        me.center_freq = center_freq;
        me.startDemodulator();
        me.centerFreqTimeout = false;
    }, 50);
};

DemodulatorPanel.prototype.parseHash = function() {
    if (!window.location.hash) {
        return {};
    }
    var params = window.location.hash.substring(1).split(",").map(function(x) {
        var harr = x.split('=');
        return [harr[0], harr.slice(1).join('=')];
    }).reduce(function(params, p){
        params[p[0]] = p[1];
        return params;
    }, {});

    return this.validateHash(params);
};

DemodulatorPanel.prototype.validateHash = function(params) {
    var self = this;
    params = Object.keys(params).filter(function(key) {
        if (key == 'freq' || key == 'mod' || key == 'secondary_mod' || key == 'sql') {
            return params.freq && Math.abs(params.freq - self.center_freq) <= bandwidth / 2;
        }
        return true;
    }).reduce(function(p, key) {
        p[key] = params[key];
        return p;
    }, {});

    if (params['freq']) {
        params['offset_frequency'] = params['freq'] - self.center_freq;
        delete params['freq'];
    }

    return params;
};

DemodulatorPanel.prototype.validateInitialParams = function(params) {
    return Object.fromEntries(
        Object.entries(params).filter(function(a) {
            if (a[0] == "offset_frequency") {
                return Math.abs(a[1]) <= bandwidth / 2;
            }
            return true;
        })
    );
};

DemodulatorPanel.prototype.updateHash = function() {
    var demod = this.getDemodulator();
    if (!demod) return;
    var params = {
        freq: demod.get_offset_frequency() + this.center_freq,
        mod: demod.get_modulation(),
        secondary_mod: demod.get_secondary_demod(),
        sql: demod.getSquelch(),
        key: this.magic_key
    };
    window.location.hash = Object.entries(params)
        .filter(function(entry) {
            return typeof entry[1] !== 'undefined' && entry[1] !== false && entry[1] !== '';
        })
        .map(function(entry) { return entry[0] + '=' + entry[1]; })
        .join(',');
};

DemodulatorPanel.prototype.updateSquelch = function() {
    var sliderValue = parseInt(this.root.querySelector('.openwebrx-squelch-slider').value, 10);
    var demod = this.getDemodulator();
    if (demod) demod.setSquelch(sliderValue);
};

DemodulatorPanel.prototype.setSquelchMargin = function(margin) {
    if (typeof(margin) === 'undefined' || this.squelchMargin == margin) return;
    this.squelchMargin = margin;
};

DemodulatorPanel.prototype.getSquelchMargin = function() {
    return this.squelchMargin;
};

DemodulatorPanel.prototype.setMouseFrequency = function(freq) {
    this.mouseFrequencyDisplay.setFrequency(freq);
};

DemodulatorPanel.prototype.setTuningPrecision = function(precision) {
    this.tuneableFrequencyDisplay.setTuningPrecision(precision);
    this.mouseFrequencyDisplay.setTuningPrecision(precision);
};

var demodulatorPanels = new WeakMap();
window.OpenWebRXDemodulatorPanel = {
    create: function(element) {
        if (element && element.jquery) element = element[0];
        if (!element || !element.ownerDocument) {
            throw new TypeError('Demodulator panel requires a DOM element');
        }
        if (!demodulatorPanels.has(element)) {
            demodulatorPanels.set(element, new DemodulatorPanel(element));
        }
        return demodulatorPanels.get(element);
    }
};
