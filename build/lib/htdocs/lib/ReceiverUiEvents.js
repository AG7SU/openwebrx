// Bind receiver-page actions without executable HTML event attributes.
var receiverUiEventsBound = false;
function bindReceiverUiEvents() {
    if (receiverUiEventsBound) return;
    receiverUiEventsBound = true;

    var handlers = {
        click: {
            'tune-down': function() { tuneBySteps(-1); },
            'tune-up': function() { tuneBySteps(1); },
            'chat-send': function() { Chat.send(); },
            'toggle-section': function(event, element) { UI.toggleSection(element); },
            'toggle-mute': function() { UI.toggleMute(); },
            'reset-tuning-step': function() { tuning_step_reset(); },
            'waterfall-auto-range': function() { Waterfall.setAutoRange(); },
            'toggle-noise-reduction': function() { UI.toggleNR(); },
            'waterfall-default-range': function() { Waterfall.setDefaultRange(); },
            'theme-default': function() { UI.setTheme('default'); },
            'toggle-opacity': function() { UI.toggleOpacity(); },
            'waterfall-theme-default': function() { UI.setWfTheme('default'); },
            'zoom-in-step': function() { zoomInOneStep(); },
            'zoom-out-step': function() { zoomOutOneStep(); },
            'zoom-in-total': function() { zoomInTotal(); },
            'zoom-out-total': function() { zoomOutTotal(); },
            'toggle-spectrum': function() { UI.toggleSpectrum(); },
            'toggle-recording': function() { UI.toggleRecording(); }
        },
        contextmenu: {
            'jump-down': function() { jumpBySteps(-1); },
            'jump-up': function() { jumpBySteps(1); }
        },
        change: {
            'profile-change': function() { sdr_profile_changed(); },
            'set-volume': function(event, element) { UI.setVolume(element.value); },
            'tuning-step-change': function() { tuning_step_changed(); },
            'waterfall-min': function() { Waterfall.updateColors(0); },
            'set-noise-reduction': function(event, element) { UI.setNR(element.value); },
            'waterfall-max': function() { Waterfall.updateColors(1); },
            'set-theme': function(event, element) { UI.setTheme(element.value); },
            'set-waterfall-theme': function(event, element) { UI.setWfTheme(element.value); },
            'toggle-frame': function(event, element) { UI.toggleFrame(element.checked); },
            'toggle-wheel-swap': function(event, element) { UI.toggleWheelSwap(element.checked); },
            'toggle-cross-frequency': function(event, element) { UI.toggleCrossFreq(element.checked); },
            'toggle-bandplan': function(event, element) { UI.toggleBandplan(element.checked); }
        },
        input: {
            'set-volume': function(event, element) { UI.setVolume(element.value); },
            'set-noise-reduction': function(event, element) { UI.setNR(element.value); },
            'set-opacity': function(event, element) { UI.setOpacity(element.value); }
        },
        keydown: {
            'chat-key': function(event) { Chat.keyPress(event); }
        },
        mousemove: {
            'bump-opacity': function() { UI.bumpOpacity(); }
        },
        mousedown: {
            'bump-opacity': function() { UI.bumpOpacity(); }
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
