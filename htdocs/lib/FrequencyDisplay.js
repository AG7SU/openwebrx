(function(global) {
    'use strict';

    var displays = new WeakMap();
    var suffixes = {'': 0, k: 3, M: 6, G: 9, T: 12};

    function FrequencyDisplay(element, tuneable) {
        if (element && element.jquery) element = element[0];
        if (!element || !element.ownerDocument) throw new TypeError('Frequency display requires a DOM element');
        this.element = element;
        this.tuneable = tuneable;
        this.precision = 2;
        this.frequency = 0;
        this.exponent = 0;
        this.digits = [];
        this.build();
        if (tuneable) this.bindTuningEvents();
        this.setFrequency(0);
    }

    FrequencyDisplay.prototype.build = function() {
        var doc = this.element.ownerDocument;
        this.displayContainer = doc.createElement('div');
        this.digitContainer = doc.createElement('span');
        this.unitContainer = doc.createElement('span');
        this.unitContainer.textContent = ' Hz';
        this.displayContainer.append(this.digitContainer, this.unitContainer);
        this.element.replaceChildren(this.displayContainer);
        if (!this.tuneable) return;

        this.inputGroup = doc.createElement('div');
        this.inputGroup.className = 'input-group';
        this.inputGroup.style.display = 'none';
        this.input = doc.createElement('input');
        this.input.type = 'number';
        this.input.step = 'any';
        this.suffixInput = doc.createElement('select');
        this.suffixInput.tabIndex = -1;
        Object.keys(suffixes).forEach(function(suffix) {
            var option = doc.createElement('option');
            option.value = suffixes[suffix];
            option.textContent = suffix + 'Hz';
            this.suffixInput.append(option);
        }, this);
        this.inputGroup.append(this.input, this.suffixInput);
        this.element.append(this.inputGroup);
    };

    FrequencyDisplay.prototype.getSuffix = function() {
        return Object.keys(suffixes).find(function(key) { return suffixes[key] === this.exponent; }, this) || '';
    };

    FrequencyDisplay.prototype.setFrequency = function(freq) {
        this.frequency = Number(freq);
        if (this.frequency === 0 || Number.isNaN(this.frequency)) this.exponent = 0;
        else this.exponent = Math.floor(Math.log10(this.frequency) / 3) * 3;
        var digits = Math.max(0, this.exponent - this.precision);
        var formatted = (freq / 10 ** this.exponent).toLocaleString(undefined, {
            maximumFractionDigits: digits, minimumFractionDigits: digits
        });
        this.digitContainer.replaceChildren();
        this.digits = [];
        Array.from(formatted).forEach(function(character) {
            var node = this.element.ownerDocument.createElement('span');
            if (!Number.isNaN(Number(character))) {
                node.className = 'digit';
                this.digits.push(node);
            }
            node.textContent = character;
            this.digitContainer.append(node);
        }, this);
        this.unitContainer.textContent = ' ' + this.getSuffix() + 'Hz';
    };

    FrequencyDisplay.prototype.setTuningPrecision = function(precision) {
        if (typeof precision === 'undefined') return;
        this.precision = precision;
        this.setFrequency(this.frequency);
    };

    FrequencyDisplay.prototype.emitFrequency = function(freq) {
        this.element.dispatchEvent(new this.element.ownerDocument.defaultView.CustomEvent('frequencychange', {
            bubbles: true, detail: freq
        }));
    };

    FrequencyDisplay.prototype.bindTuningEvents = function() {
        var self = this;
        var inputs = [this.input, this.suffixInput];
        var currentExponent = 0;
        this.displayContainer.addEventListener('wheel', function(event) {
            event.preventDefault();
            event.stopPropagation();
            var index = self.digits.indexOf(event.target);
            if (index < 0) return;
            var delta = 10 ** (Math.floor(Math.max(self.exponent, Math.log10(self.frequency))) - index);
            if (event.deltaY > 0) delta *= -1;
            self.emitFrequency(self.frequency + delta);
        });
        function submit() {
            var exponent = parseInt(self.suffixInput.value, 10);
            var freq = parseFloat(self.input.value) * 10 ** exponent;
            if (!Number.isNaN(freq)) self.emitFrequency(freq);
            self.inputGroup.style.display = 'none';
            self.displayContainer.style.display = '';
        }
        this.element.ownerDocument.body.addEventListener('click', function(event) {
            if (self.inputGroup.style.display === 'none' || self.element.contains(event.target)) return;
            submit();
        });
        inputs.forEach(function(input) {
            input.addEventListener('blur', function(event) {
                if (self.inputGroup.style.display === 'none' || inputs.includes(event.relatedTarget)) return;
                submit();
            });
            input.addEventListener('click', function(event) { event.stopPropagation(); });
        });
        this.input.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') { submit(); return; }
            if (event.key === 'Escape') {
                self.inputGroup.style.display = 'none';
                self.displayContainer.style.display = '';
                return;
            }
            Object.keys(suffixes).forEach(function(suffix) {
                if (suffix && suffix.toUpperCase() === event.key.toUpperCase()) {
                    self.suffixInput.value = suffixes[suffix];
                    submit();
                }
            });
        });
        this.suffixInput.addEventListener('change', function() {
            var newExponent = parseInt(self.suffixInput.value, 10);
            var delta = currentExponent - newExponent;
            var value = parseFloat(self.input.value);
            self.input.value = delta >= 0 ? value * 10 ** delta : value / 10 ** -delta;
            currentExponent = newExponent;
            self.input.focus();
        });
        this.displayContainer.addEventListener('click', function() {
            currentExponent = self.exponent;
            self.input.value = self.frequency / 10 ** self.exponent;
            self.suffixInput.value = self.exponent;
            self.inputGroup.style.display = '';
            self.displayContainer.style.display = 'none';
            self.input.focus();
        });
    };

    function create(element, tuneable) {
        if (element && element.jquery) element = element[0];
        if (!displays.has(element)) displays.set(element, new FrequencyDisplay(element, tuneable));
        return displays.get(element);
    }

    global.OpenWebRXFrequencyDisplay = {
        create: function(element) { return create(element, false); },
        createTuneable: function(element) { return create(element, true); }
    };
})(window);
