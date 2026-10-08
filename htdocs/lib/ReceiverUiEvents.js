// Bind receiver-page actions without executable HTML event attributes.
var receiverUiEventsBound = false;
function bindReceiverUiEvents() {
    if (receiverUiEventsBound) return;
    receiverUiEventsBound = true;

    var handlers = {
        click: {
            'tune-down': function() { OpenWebRXReceiver.tuneBySteps(-1); },
            'tune-up': function() { OpenWebRXReceiver.tuneBySteps(1); },
            'chat-send': function() { OpenWebRXReceiver.chat.send(); },
            'toggle-section': function(event, element) { OpenWebRXReceiver.display.toggleSection(element); },
            'toggle-mute': function() { OpenWebRXReceiver.audio.toggleMute(); },
            'reset-tuning-step': function() { OpenWebRXReceiver.tuning.resetStep(); },
            'waterfall-auto-range': function() { OpenWebRXReceiver.waterfall.setRange('auto'); },
            'toggle-noise-reduction': function() { OpenWebRXReceiver.display.toggleNoiseReduction(); },
            'waterfall-default-range': function() { OpenWebRXReceiver.waterfall.setRange('default'); },
            'theme-default': function() { OpenWebRXReceiver.display.setTheme('default'); },
            'toggle-opacity': function() { OpenWebRXReceiver.display.toggleOpacity(); },
            'waterfall-theme-default': function() { OpenWebRXReceiver.display.setWaterfallTheme('default'); },
            'zoom-in-step': function() { OpenWebRXReceiver.waterfall.zoom('in'); },
            'zoom-out-step': function() { OpenWebRXReceiver.waterfall.zoom('out'); },
            'zoom-in-total': function() { OpenWebRXReceiver.waterfall.zoom('detail'); },
            'zoom-out-total': function() { OpenWebRXReceiver.waterfall.zoom('full'); },
            'toggle-spectrum': function() { OpenWebRXReceiver.display.toggleSpectrum(); },
            'toggle-recording': function() {
                OpenWebRXReceiver.audio.setRecording(!OpenWebRXReceiver.getSnapshot().recording);
            }
        },
        contextmenu: {
            'jump-down': function() { OpenWebRXReceiver.tuning.jumpBySteps(-1); },
            'jump-up': function() { OpenWebRXReceiver.tuning.jumpBySteps(1); }
        },
        change: {
            'profile-change': function(event, element) { OpenWebRXReceiver.selectProfile(element.value); },
            'set-volume': function(event, element) { OpenWebRXReceiver.audio.setVolume(Number(element.value)); },
            'tuning-step-change': function(event, element) { OpenWebRXReceiver.tuning.setStep(parseInt(element.value, 10)); },
            'waterfall-min': function() { OpenWebRXReceiver.waterfall.updateColors(0); },
            'set-noise-reduction': function(event, element) { OpenWebRXReceiver.display.setNoiseReduction(Number(element.value)); },
            'waterfall-max': function() { OpenWebRXReceiver.waterfall.updateColors(1); },
            'set-theme': function(event, element) { OpenWebRXReceiver.display.setTheme(element.value); },
            'set-waterfall-theme': function(event, element) { OpenWebRXReceiver.display.setWaterfallTheme(element.value); },
            'toggle-frame': function(event, element) { OpenWebRXReceiver.display.toggleFrame(element.checked); },
            'toggle-wheel-swap': function(event, element) { OpenWebRXReceiver.display.toggleWheelSwap(element.checked); },
            'toggle-cross-frequency': function(event, element) { OpenWebRXReceiver.display.toggleCrossFrequency(element.checked); },
            'toggle-bandplan': function(event, element) { OpenWebRXReceiver.display.toggleBandplan(element.checked); }
        },
        input: {
            'set-volume': function(event, element) { OpenWebRXReceiver.audio.setVolume(Number(element.value)); },
            'set-noise-reduction': function(event, element) { OpenWebRXReceiver.display.setNoiseReduction(Number(element.value)); },
            'set-opacity': function(event, element) { OpenWebRXReceiver.display.setOpacity(Number(element.value)); }
        },
        keydown: {
            'chat-key': function(event) { OpenWebRXReceiver.chat.keyPress(event); }
        },
        mousemove: {
            'bump-opacity': function() { OpenWebRXReceiver.display.bumpOpacity(); }
        },
        mousedown: {
            'bump-opacity': function() { OpenWebRXReceiver.display.bumpOpacity(); }
        }
    };

    Object.keys(handlers).forEach(function(eventName) {
        var attribute = 'data-owrx-' + eventName;
        document.addEventListener(eventName, function(event) {
            var element = event.target.closest('[' + attribute + ']');
            if (!element) return;
            var handler = handlers[eventName][element.getAttribute(attribute)];
            if (!handler) return;
            if (eventName === 'contextmenu') event.preventDefault();
            handler(event, element);
        });
    });
}

window.addEventListener('load', function() {
    bindReceiverUiEvents();
    openwebrx_init();
}, {once: true});
