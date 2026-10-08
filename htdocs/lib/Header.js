// Shared page header. Keep the menu and station identity independent of
// jQuery plugins; the AJAX prefilter remains for legacy $.ajax callers.
(function() {
    function Header(element) {
        this.element = element;
        this.photoExpanded = false;
        this.bindPanelButtons();
        this.bindPhotoTriggers();
    }

    Header.prototype.bindPanelButtons = function() {
        var buttons = this.element.querySelectorAll('.openwebrx-main-buttons [data-toggle-panel]');
        Array.prototype.forEach.call(buttons, function(button) {
            var panelId = button.dataset.togglePanel;
            if (!panelId || !document.getElementById(panelId)) return;
            button.style.display = 'block';
            button.addEventListener('click', function() {
                if (typeof window.toggle_panel === 'function') window.toggle_panel(panelId);
            });
        });
    };

    Header.prototype.bindPhotoTriggers = function() {
        var self = this;
        this.element.querySelectorAll('.openwebrx-photo-trigger').forEach(function(trigger) {
            trigger.addEventListener('click', function(event) {
                if (event.target && event.target.closest('a')) return;
                self.togglePhoto();
            });
        });
    };

    Header.prototype.setDetails = function(details) {
        details = details || {};
        var title = this.element.querySelector('.webrx-rx-title');
        var titleText = details.receiver_name || '';
        if (title) title.textContent = titleText;
        if (titleText) document.title = 'OpenWebRX+ | ' + titleText;

        var description = this.element.querySelector('.webrx-rx-desc');
        if (description) {
            description.textContent = (details.receiver_location || '') + ' | Loc: '
                + (details.locator || '') + ', ASL: ' + (details.receiver_asl || '') + ' m';
        }
        var photoTitle = this.element.querySelector('.webrx-rx-photo-title');
        var photoDescription = this.element.querySelector('.webrx-rx-photo-desc');
        if (photoTitle) photoTitle.textContent = details.photo_title || '';
        if (photoDescription) photoDescription.textContent = details.photo_desc || '';
    };

    Header.prototype.togglePhoto = function() {
        this.photoExpanded = !this.photoExpanded;
        var description = this.element.querySelector('.openwebrx-description-container');
        var arrow = this.element.querySelector('.openwebrx-rx-details-arrow');
        if (description) description.classList.toggle('expanded', this.photoExpanded);
        if (arrow) {
            arrow.classList.toggle('openwebrx-rx-details-arrow--up', this.photoExpanded);
            arrow.classList.toggle('openwebrx-rx-details-arrow--down', !this.photoExpanded);
        }
    };

    Header.applyPolicyRefresh = function() {
        var container = document.querySelector('.webrx-top-container');
        if (!container || document.head.querySelector('meta[http-equiv="refresh"]')) return;
        var page = window.location.pathname.split('/').pop();
        var sessionTimeout = Number(container.dataset.sessionTimeout);
        if (page !== '' || !Number.isFinite(sessionTimeout) || sessionTimeout <= 0) return;
        var refresh = document.createElement('meta');
        refresh.httpEquiv = 'refresh';
        refresh.content = sessionTimeout + '; url=' + container.dataset.usagePolicyUrl;
        document.head.appendChild(refresh);
    };

    function installCsrfAjaxPrefilter() {
        if (!window.jQuery || typeof window.jQuery.ajaxPrefilter !== 'function') return;
        window.jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
            var container = document.querySelector('.webrx-top-container');
            var token = container && container.dataset.csrfToken;
            if (token) xhr.setRequestHeader('X-CSRF-Token', token);
        });
    }

    var initialized = false;
    function initialize() {
        if (initialized) return;
        initialized = true;
        Header.applyPolicyRefresh();
        installCsrfAjaxPrefilter();
        var element = document.querySelector('.webrx-top-container');
        if (!element || window.OpenWebRXHeader.instance) return;
        window.OpenWebRXHeader.instance = new Header(element);
    }

    window.OpenWebRXHeader = {
        instance: null,
        applyPolicyRefresh: Header.applyPolicyRefresh,
        setDetails: function(details) {
            if (!window.OpenWebRXHeader.instance) initialize();
            if (!window.OpenWebRXHeader.instance) return false;
            window.OpenWebRXHeader.instance.setDetails(details);
            return true;
        },
        initialize: initialize
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize, {once: true});
    } else {
        initialize();
    }
})();
