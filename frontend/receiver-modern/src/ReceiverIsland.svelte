<script lang="ts">
    import {onMount} from 'svelte';
    import {arrangeReceiverCards} from './workspace';
    import {addCurrentBookmark, getOtherSourceProfile, getSelectedReceiverProfile, readReceiverSnapshot, setReceiverMode, setRecording, setVolume, setWaterfallRange, subscribeReceiver, toggleMute, tuneTo, zoomWaterfall, type ReceiverSnapshot} from './receiver-bridge';
    import {deleteReceiverLayout, getReceiverLayouts, saveReceiverLayout, type ReceiverLayout} from './layouts';

    type ReceptionEntry = {
        timestampMs: number;
        frequencyHz: number | null;
        mode: string;
        profile: string;
        content: string;
    };
    const receptionHistoryKey = 'openwebrx.reception-history.v1';
    const receptionHistoryLimit = 500;
    const receptionHistoryMaxTimestamp = 8.64e15;

    let snapshot = $state<ReceiverSnapshot>({
        profileName: 'Live receiver',
        frequencyHz: null,
        tuningStepHz: 1,
        connection: 'starting',
        audio: 'waiting',
        recording: false,
        recordingAllowed: false,
        volume: 100,
        muted: false,
        audioDroppedSamples: 0,
        deviceName: null,
        deviceState: 'unknown',
        deviceSeverity: 'info',
        deviceMessage: null,
        decoderError: null,
        mode: 'No mode',
        availableModes: [],
        modeCapabilities: [],
        decoder: 'off',
        waterfallZoomLevel: 0,
        waterfallZoomMaximum: 0
    });
    let frequencyInput = $state('');
    let modeInput = $state('');
    let editingFrequency = $state(false);
    let editingMode = $state(false);
    let tuneMessage = $state('');
    let modeMessage = $state('');
    let bookmarkMessage = $state('');
    let receiverMessage = $state('');
    let recordingMessage = $state('');
    let waterfallMessage = $state('');
    let dualViewMessage = $state('');
    let dualViewOpen = $state(false);
    let advancedControlsOpen = $state(false);
    let receiverCard: HTMLDetailsElement;
    let lastCardSummary: HTMLElement | null = null;
    let secondaryPane = $state(false);
    let dualViewTimer: number | null = null;
    let separateReceiverTimer: number | null = null;
    let dualViewFrame: HTMLIFrameElement | null = null;
    let layoutProfileId = '';
    let savedLayouts = $state<ReceiverLayout[]>([]);
    let selectedLayoutId = $state('');
    let layoutName = $state('');
    let layoutMessage = $state('');
    let data2gStatus = $state('waiting for receiver audio');
    let data2gFrames = $state<{port: number; command: number; payloadBytes: number; payloadHex: string; receivedAt: number}[]>([]);
    let data2gAprs = $state<{source: string; destination: string; text: string; receivedAt: number}[]>([]);
    let data2gActivity = $state<{text: string; receivedAt: number}[]>([]);
    let receptionHistory = $state<ReceptionEntry[]>([]);
    let receptionSearch = $state('');
    let receptionHistoryMessage = $state('');
    let filteredReceptionHistory = $derived.by(() => {
        const query = receptionSearch.trim().toLocaleLowerCase();
        if (!query) return receptionHistory;
        return receptionHistory.filter((entry) => [
            new Date(entry.timestampMs).toISOString(),
            new Date(entry.timestampMs).toLocaleString(),
            entry.mode,
            entry.profile,
            entry.content,
            entry.frequencyHz === null ? '' : String(entry.frequencyHz),
            entry.frequencyHz === null ? '' : (entry.frequencyHz / 1_000_000).toFixed(6)
        ].some((field) => field.toLocaleLowerCase().includes(query)));
    });

    function readReceptionHistory(): ReceptionEntry[] {
        try {
            const serialized = localStorage.getItem(receptionHistoryKey) ?? '[]';
            if (serialized.length > 1_500_000) return [];
            const stored: unknown = JSON.parse(serialized);
            if (!Array.isArray(stored)) return [];
            return stored.filter((entry): entry is ReceptionEntry => !!entry
                && Number.isFinite(entry.timestampMs) && entry.timestampMs >= 0 && entry.timestampMs <= receptionHistoryMaxTimestamp
                && (entry.frequencyHz === null || (Number.isFinite(entry.frequencyHz) && entry.frequencyHz > 0 && entry.frequencyHz <= 1e12))
                && typeof entry.mode === 'string' && entry.mode.length <= 48
                && typeof entry.profile === 'string' && entry.profile.length <= 80
                && typeof entry.content === 'string' && entry.content.length <= 2048)
                .slice(0, receptionHistoryLimit);
        } catch {
            return [];
        }
    }

    function clearReceptionHistory(): void {
        receptionHistory = [];
        receptionHistoryMessage = '';
        try {
            localStorage.removeItem(receptionHistoryKey);
        } catch {
            receptionHistoryMessage = 'Could not clear browser storage';
        }
    }

    function receiveReceptionStorage(event: StorageEvent): void {
        if (event.key !== receptionHistoryKey && event.key !== null) return;
        receptionHistory = readReceptionHistory();
    }

    onMount(() => {
        document.body.classList.add('receiver-modern-modes-mounted');
        const restoreCards = arrangeReceiverCards();
        const toggleReceiverCard = (event: MouseEvent) => {
            if (!(event.target instanceof Element) || !event.target.closest('[data-toggle-panel="openwebrx-panel-receiver"]')) return;
            event.stopImmediatePropagation();
            receiverCard.open = !receiverCard.open;
            document.body.classList.remove('receiver-modern-focus');
        };
        document.addEventListener('click', toggleReceiverCard, true);
        secondaryPane = document.body.classList.contains('receiver-modern-secondary-document');
        receptionHistory = readReceptionHistory();
        const receiveReception = (event: Event) => {
            const detail = (event as CustomEvent<Record<string, unknown>>).detail;
            if (!detail || detail.schema_version !== 1
                || !Number.isFinite(detail.timestamp_ms) || Number(detail.timestamp_ms) < 0 || Number(detail.timestamp_ms) > receptionHistoryMaxTimestamp
                || !(detail.frequency_hz === null || (Number.isFinite(detail.frequency_hz) && Number(detail.frequency_hz) > 0 && Number(detail.frequency_hz) <= 1e12))
                || typeof detail.mode !== 'string' || !detail.mode.trim() || detail.mode.length > 48
                || typeof detail.profile !== 'string' || detail.profile.length > 80
                || typeof detail.content !== 'string' || !detail.content.trim() || detail.content.length > 2048) return;
            const entry: ReceptionEntry = {
                timestampMs: Number(detail.timestamp_ms),
                frequencyHz: detail.frequency_hz === null ? null : Number(detail.frequency_hz),
                mode: detail.mode,
                profile: detail.profile,
                content: detail.content
            };
            receptionHistory = [entry, ...readReceptionHistory()].slice(0, receptionHistoryLimit);
            try {
                localStorage.setItem(receptionHistoryKey, JSON.stringify(receptionHistory));
                receptionHistoryMessage = '';
            } catch {
                receptionHistoryMessage = 'History is available for this page only; browser storage is full';
            }
        };
        window.addEventListener('openwebrx:reception', receiveReception);
        window.addEventListener('storage', receiveReceptionStorage);
        const closeAdvancedControlsOnEscape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            if (advancedControlsOpen) {
                advancedControlsOpen = false;
                document.body.classList.remove('receiver-modern-advanced-open');
                document.querySelector<HTMLButtonElement>('.receiver-island__advanced-toggle')?.focus();
            } else {
                closeSupportingCards();
                lastCardSummary?.focus();
            }
        };
        window.addEventListener('keydown', closeAdvancedControlsOnEscape);
        layoutProfileId = getSelectedReceiverProfile() ?? '';
        savedLayouts = getReceiverLayouts(layoutProfileId || null);
        const receiveData2GFrame = (event: Event) => {
            const frame = (event as CustomEvent<Record<string, unknown>>).detail;
            if (!frame || frame.schema_version !== 1
                || !Number.isInteger(frame.port) || Number(frame.port) < 0 || Number(frame.port) > 15
                || !Number.isInteger(frame.command) || Number(frame.command) < 0 || Number(frame.command) > 15
                || !Number.isInteger(frame.payload_bytes) || Number(frame.payload_bytes) < 0 || Number(frame.payload_bytes) > 4096
                || typeof frame.payload_hex !== 'string' || frame.payload_hex.length > 8192
                || !/^(?:[0-9a-f]{2})*$/i.test(frame.payload_hex)
                || frame.payload_hex.length !== Number(frame.payload_bytes) * 2) return;
            data2gFrames = [{
                port: Number(frame.port),
                command: Number(frame.command),
                payloadBytes: Number(frame.payload_bytes),
                payloadHex: frame.payload_hex.slice(0, 2048),
                receivedAt: Number.isFinite(frame.received_at) ? Number(frame.received_at) : Date.now() / 1000
            }, ...data2gFrames].slice(0, 10);
            data2gStatus = 'frames received';
        };
        const receiveData2GStatus = (event: Event) => {
            const status = (event as CustomEvent<Record<string, unknown>>).detail;
            const state = String(status?.state ?? '');
            if (!status || status.schema_version !== 1) return;
            if (['busy', 'idle', 'heard', 'lost', 'missed', 'dropped'].includes(state)) {
                let label = '';
                if (state === 'busy' || state === 'idle') {
                    if (typeof status.busy !== 'boolean' || status.busy !== (state === 'busy')) return;
                    label = state === 'busy' ? 'channel busy' : 'channel clear';
                    data2gStatus = state === 'busy' ? 'channel busy' : 'listening · channel clear';
                } else if (state === 'heard') {
                    if (!Number.isInteger(status.port) || Number(status.port) < 0 || Number(status.port) > 15
                        || (status.call !== undefined && (typeof status.call !== 'string' || !/^[A-Z0-9/-]{1,10}$/.test(status.call)))) return;
                    label = `burst checked · KISS ${status.port}${status.call ? ` · ${status.call}` : ''}`;
                    data2gStatus = label;
                } else if (state === 'lost' || state === 'dropped') {
                    if (!Number.isInteger(status.port) || Number(status.port) < 0 || Number(status.port) > 15
                        || !Number.isInteger(status.count) || Number(status.count) < 0 || Number(status.count) > 999999) return;
                    label = state === 'lost'
                        ? `burst incomplete · KISS ${status.port} · ${status.count} lost`
                        : `frames dropped · KISS ${status.port} · ${status.count}`;
                    data2gStatus = label;
                } else {
                    if (typeof status.submode !== 'string' || !/^[A-Za-z0-9./_-]{1,48}$/.test(status.submode)
                        || !Number.isInteger(status.codewords) || Number(status.codewords) < 0 || Number(status.codewords) > 999) return;
                    label = `possible missed burst · ${status.submode} · ${status.codewords} codewords`;
                    data2gStatus = label;
                }
                data2gActivity = [{text: label, receivedAt: Date.now() / 1000}, ...data2gActivity].slice(0, 20);
                return;
            }
            if (!['listening', 'audio_overrun', 'error', 'restarting'].includes(state)) return;
            data2gStatus = state === 'listening'
                ? 'listening · 8 kHz RX'
                : state === 'audio_overrun'
                    ? `audio queue dropped ${Number(status.dropped_chunks) || 0} chunks`
                    : state === 'error'
                        ? `worker error · ${String(status.message ?? 'unknown').slice(0, 160)}`
                        : state;
        };
        const receiveData2GAprs = (event: Event) => {
            const decoded = (event as CustomEvent<Record<string, unknown>>).detail;
            const message = decoded?.message;
            if (!decoded || decoded.schema_version !== 1 || !message || typeof message !== 'object') return;
            const parsed = message as Record<string, unknown>;
            if (typeof parsed.source !== 'string' || typeof parsed.destination !== 'string'
                || typeof parsed.data !== 'string') return;
            data2gAprs = [{
                source: parsed.source.slice(0, 16),
                destination: parsed.destination.slice(0, 16),
                text: parsed.data.slice(0, 512),
                receivedAt: Number.isFinite(decoded.received_at) ? Number(decoded.received_at) : Date.now() / 1000
            }, ...data2gAprs].slice(0, 20);
            data2gStatus = 'APRS decoded';
        };
        window.addEventListener('openwebrx:data2g-frame', receiveData2GFrame);
        window.addEventListener('openwebrx:data2g-status', receiveData2GStatus);
        window.addEventListener('openwebrx:data2g-aprs', receiveData2GAprs);
        const unsubscribe = subscribeReceiver((next) => {
            snapshot = next;
            const selectedProfile = getSelectedReceiverProfile() ?? '';
            if (selectedProfile !== layoutProfileId) {
                layoutProfileId = selectedProfile;
                savedLayouts = getReceiverLayouts(layoutProfileId || null);
                selectedLayoutId = '';
            }
            if (!editingFrequency) {
                frequencyInput = next.frequencyHz === null ? '' : (next.frequencyHz / 1_000_000).toFixed(6);
            }
            if (!editingMode) {
                modeInput = next.availableModes.find((mode) => mode.modulation === next.mode)?.name ?? next.mode;
            }
        });
        return () => {
            unsubscribe();
            window.removeEventListener('keydown', closeAdvancedControlsOnEscape);
            window.removeEventListener('openwebrx:reception', receiveReception);
            window.removeEventListener('storage', receiveReceptionStorage);
            window.removeEventListener('openwebrx:data2g-frame', receiveData2GFrame);
            window.removeEventListener('openwebrx:data2g-status', receiveData2GStatus);
            window.removeEventListener('openwebrx:data2g-aprs', receiveData2GAprs);
            if (dualViewTimer !== null) window.clearInterval(dualViewTimer);
            if (separateReceiverTimer !== null) window.clearInterval(separateReceiverTimer);
            dualViewFrame?.remove();
            document.body.classList.remove('receiver-modern-dual');
            document.body.classList.remove('receiver-modern-advanced-open');
            document.documentElement.classList.remove('receiver-modern-dual-document');
            document.body.classList.remove('receiver-modern-modes-mounted', 'receiver-modern-focus');
            document.removeEventListener('click', toggleReceiverCard, true);
            restoreCards();
        };
    });

    function closeSupportingCards(): void {
        document.querySelectorAll<HTMLDetailsElement>('.receiver-workspace__card[open]').forEach(card => card.open = false);
    }

    function openSupportingCard(event: Event): void {
        const card = event.currentTarget;
        if (!(card instanceof HTMLDetailsElement) || !card.open) return;
        lastCardSummary = card.querySelector('summary');
        document.body.classList.remove('receiver-modern-focus');
        document.querySelectorAll<HTMLDetailsElement>('.receiver-workspace__card[open]').forEach(other => {
            if (other !== card) other.open = false;
        });
    }

    function focusWaterfall(): void {
        closeSupportingCards();
        receiverCard.open = false;
        document.body.classList.add('receiver-modern-focus');
        advancedControlsOpen = false;
        document.body.classList.remove('receiver-modern-advanced-open');
    }

    function toggleAdvancedControls(): void {
        advancedControlsOpen = !advancedControlsOpen;
        document.body.classList.toggle('receiver-modern-advanced-open', advancedControlsOpen);
    }

    function adjustFrequency(direction: -1 | 1): void {
        tuneBySteps(direction);
    }

    function tuneBySteps(steps: number): void {
        if (snapshot.frequencyHz === null) return;
        if (tuneTo(snapshot.frequencyHz + steps * snapshot.tuningStepHz)) {
            snapshot = readReceiverSnapshot();
        }
        tuneMessage = '';
    }

    function tuneFromKeyboard(event: KeyboardEvent): void {
        const direction = event.key === 'ArrowUp' || event.key === 'PageUp'
            ? 1
            : event.key === 'ArrowDown' || event.key === 'PageDown'
                ? -1
                : 0;
        if (!direction) return;
        event.preventDefault();
        const multiplier = event.key === 'PageUp' || event.key === 'PageDown' ? 10 : 1;
        tuneBySteps(direction * multiplier);
    }

    function submitFrequency(event: SubmitEvent): void {
        event.preventDefault();
        const megahertz = Number(frequencyInput);
        if (!Number.isFinite(megahertz) || megahertz <= 0 || !tuneTo(megahertz * 1_000_000)) {
            tuneMessage = 'Frequency unavailable';
            return;
        }
        editingFrequency = false;
        snapshot = readReceiverSnapshot();
        tuneMessage = '';
    }

    function changeVolume(event: Event): void {
        const target = event.currentTarget;
        if (!(target instanceof HTMLInputElement)) return;
        setVolume(Number(target.value));
        snapshot = readReceiverSnapshot();
    }

    function toggleAudioMute(): void {
        toggleMute();
        snapshot = readReceiverSnapshot();
    }

    function toggleAudioRecording(): void {
        if (!setRecording(!snapshot.recording)) {
            recordingMessage = 'Recording unavailable';
            return;
        }
        recordingMessage = '';
        snapshot = readReceiverSnapshot();
    }

    function changeWaterfallZoom(direction: 'in' | 'out' | 'full' | 'detail'): void {
        zoomWaterfall(direction);
        snapshot = readReceiverSnapshot();
    }

    function changeWaterfallRange(mode: 'auto' | 'default'): void {
        waterfallMessage = setWaterfallRange(mode) ? '' : 'Waterfall controls unavailable';
    }

    function saveBookmark(): void {
        bookmarkMessage = addCurrentBookmark() ? '' : 'Bookmark controls unavailable';
    }

    function saveCurrentLayout(): void {
        if (snapshot.frequencyHz === null || snapshot.mode === 'No mode') {
            layoutMessage = 'Tune a frequency and select a mode before saving';
            return;
        }
        const next = saveReceiverLayout(layoutProfileId || null, {
            name: layoutName,
            frequencyHz: snapshot.frequencyHz,
            modulation: snapshot.mode
        });
        if (!next) {
            layoutMessage = layoutName.trim() ? 'Could not save layout in this browser' : 'Enter a layout name';
            return;
        }
        savedLayouts = next;
        const saved = next.find((layout) => layout.name.toLocaleLowerCase() === layoutName.trim().toLocaleLowerCase());
        selectedLayoutId = saved?.id ?? '';
        layoutName = '';
        layoutMessage = 'Layout saved for this receiver profile';
    }

    function applySavedLayout(): void {
        const layout = savedLayouts.find((candidate) => candidate.id === selectedLayoutId);
        if (!layout) {
            layoutMessage = 'Choose a saved station';
            return;
        }
        if (!snapshot.availableModes.some((mode) => mode.modulation === layout.modulation)) {
            layoutMessage = 'Saved mode is unavailable on this receiver';
            return;
        }
        if (!setReceiverMode(layout.modulation) || !tuneTo(layout.frequencyHz)) {
            layoutMessage = 'Could not apply the saved layout';
            return;
        }
        editingMode = false;
        editingFrequency = false;
        modeInput = snapshot.availableModes.find((mode) => mode.modulation === layout.modulation)?.name ?? layout.modulation;
        frequencyInput = (layout.frequencyHz / 1_000_000).toFixed(6);
        snapshot = readReceiverSnapshot();
        layoutMessage = `Applied ${layout.name}`;
    }

    function removeSavedLayout(): void {
        const next = deleteReceiverLayout(layoutProfileId || null, selectedLayoutId);
        if (!next) {
            layoutMessage = 'Could not update saved layouts in this browser';
            return;
        }
        savedLayouts = next;
        selectedLayoutId = '';
        layoutMessage = 'Saved layout removed';
    }

    function openAnotherReceiver(): void {
        if (separateReceiverTimer !== null) window.clearInterval(separateReceiverTimer);
        dualViewMessage = '';
        const otherProfile = getOtherSourceProfile();
        if (!otherProfile) {
            receiverMessage = 'Configure a second enabled source for the other tuner';
            return;
        }
        const opened = window.open(window.location.href, 'openwebrx-second-receiver', 'popup,width=1100,height=760');
        if (opened === null) {
            receiverMessage = 'Allow popups to open another receiver';
            return;
        }

        try {
            opened.opener = null;
            receiverMessage = 'Opening second receiver…';
            let attempts = 0;
            separateReceiverTimer = window.setInterval(() => {
                attempts += 1;
                try {
                    if (opened.closed) {
                        if (separateReceiverTimer !== null) window.clearInterval(separateReceiverTimer);
                        separateReceiverTimer = null;
                        receiverMessage = 'Second receiver window closed';
                        return;
                    }
                    const receiverBridge = opened.OpenWebRXReceiver;
                    const profileAvailable = receiverBridge?.getProfiles().some((profile) => profile.id === otherProfile.id);
                    if (receiverBridge && profileAvailable && receiverBridge.selectProfile(otherProfile.id)) {
                        if (separateReceiverTimer !== null) window.clearInterval(separateReceiverTimer);
                        separateReceiverTimer = null;
                        receiverMessage = `Second receiver opened on ${otherProfile.name}`;
                    } else if (attempts >= 100) {
                        if (separateReceiverTimer !== null) window.clearInterval(separateReceiverTimer);
                        separateReceiverTimer = null;
                        receiverMessage = `Could not select ${otherProfile.name} in the second receiver window`;
                    }
                } catch {
                    if (separateReceiverTimer !== null) window.clearInterval(separateReceiverTimer);
                    separateReceiverTimer = null;
                    receiverMessage = 'Second receiver window is unavailable';
                }
            }, 200);
        } catch {
            receiverMessage = 'Choose another profile in the second receiver window';
        }
    }

    function toggleDualReceiverView(): void {
        if (dualViewOpen) {
            if (dualViewTimer !== null) window.clearInterval(dualViewTimer);
            dualViewTimer = null;
            dualViewFrame?.remove();
            dualViewFrame = null;
            dualViewOpen = false;
            document.body.classList.remove('receiver-modern-dual');
            document.documentElement.classList.remove('receiver-modern-dual-document');
            dualViewMessage = 'Second receiver closed';
            return;
        }

        const otherProfile = getOtherSourceProfile();
        const host = document.getElementById('receiver-modern-secondary');
        if (!otherProfile || !host) {
            dualViewMessage = 'Configure a second enabled source for the other tuner';
            return;
        }

        const paneUrl = new URL(window.location.href);
        paneUrl.searchParams.set('receiver-pane', 'secondary');
        const frame = document.createElement('iframe');
        frame.title = `${otherProfile.name} receiver`;
        frame.setAttribute('allow', 'autoplay');
        frame.setAttribute('loading', 'eager');
        frame.src = paneUrl.toString();
        host.replaceChildren(frame);
        dualViewFrame = frame;
        dualViewOpen = true;
        document.body.classList.add('receiver-modern-dual');
        document.documentElement.classList.add('receiver-modern-dual-document');
        dualViewMessage = `Connecting ${otherProfile.name}…`;

        let attempts = 0;
        dualViewTimer = window.setInterval(() => {
            attempts += 1;
            try {
                if (frame.contentWindow?.closed) {
                    if (dualViewTimer !== null) window.clearInterval(dualViewTimer);
                    dualViewTimer = null;
                    return;
                }
                const receiverBridge = frame.contentWindow?.OpenWebRXReceiver;
                const profileAvailable = receiverBridge?.getProfiles().some((profile) => profile.id === otherProfile.id);
                if (receiverBridge && profileAvailable && receiverBridge.selectProfile(otherProfile.id)) {
                    if (dualViewTimer !== null) window.clearInterval(dualViewTimer);
                    dualViewTimer = null;
                    dualViewMessage = `Second tuner connected · ${otherProfile.name}`;
                } else if (attempts >= 120) {
                    if (dualViewTimer !== null) window.clearInterval(dualViewTimer);
                    dualViewTimer = null;
                    dualViewMessage = `Second tuner not available · ${otherProfile.name}`;
                }
            } catch {
                if (dualViewTimer !== null) window.clearInterval(dualViewTimer);
                dualViewTimer = null;
                dualViewMessage = 'Second receiver could not be reached';
            }
        }, 250);
    }

    function requirementLabel(requirement: string): string {
        const labels: Record<string, string> = {
            wsjtx: 'WSJT-X decoders',
            wsjtx_2_3: 'WSJT-X 2.3 or newer',
            wsjtx_2_4: 'WSJT-X 2.4 or newer',
            msk144decoder: 'MSK144 decoder',
            js8: 'JS8Call',
            js8py: 'JS8 Python decoder'
        };
        return labels[requirement] ?? requirement.replaceAll('_', ' ');
    }

    function unavailableReason(requirements: string[]): string {
        return `Unavailable: requires ${requirements.map(requirementLabel).join(', ')}`;
    }

    function submitMode(event: SubmitEvent): void {
        event.preventDefault();
        const query = modeInput.trim().toLocaleLowerCase();
        const mode = snapshot.availableModes.find((candidate) =>
            candidate.name.toLocaleLowerCase() === query || candidate.modulation.toLocaleLowerCase() === query
        );
        const unavailable = snapshot.modeCapabilities.find((candidate) =>
            !candidate.available && (candidate.name.toLocaleLowerCase() === query || candidate.modulation.toLocaleLowerCase() === query)
        );
        if (unavailable) {
            modeMessage = unavailableReason(unavailable.missing_requirements);
            return;
        }
        if (!mode || !setReceiverMode(mode.modulation)) {
            modeMessage = 'Choose an available receiver mode';
            return;
        }
        modeMessage = '';
        editingMode = false;
        modeInput = mode.name;
        snapshot = readReceiverSnapshot();
    }
</script>

<div class="receiver-workspace">
<details class="receiver-island" bind:this={receiverCard} open ontoggle={() => { if (receiverCard.open) document.body.classList.remove('receiver-modern-focus'); }} aria-label="Receiver card">
    <summary class="receiver-island__summary">
        <strong>Receiver</strong>
        <span>{snapshot.frequencyHz === null ? snapshot.profileName : `${(snapshot.frequencyHz / 1_000_000).toFixed(6)} MHz`} · {snapshot.mode}</span>
    </summary>
    <div class="receiver-island__body">
    <header class="receiver-island__identity">
        <label id="receiver-modern-profile-slot" for="openwebrx-sdr-profiles-listbox" class="receiver-island__profile-select">Source / profile</label>
        <button type="button" class="receiver-island__bookmark" onclick={saveBookmark}>Save station</button>
    </header>
    <span class="receiver-island__header-message" aria-live="polite">{bookmarkMessage}</span>

    <div class="receiver-island__listening-bar">
    <form class="receiver-island__tuning" onsubmit={submitFrequency}>
        <button type="button" class="receiver-island__nudge" aria-label="Tune down one step" onclick={() => adjustFrequency(-1)}>−</button>
        <label class="receiver-island__frequency-label" for="receiver-modern-frequency">FREQUENCY · MHz</label>
        <input
            id="receiver-modern-frequency"
            class="receiver-island__frequency"
            type="number"
            inputmode="decimal"
            min="0.001"
            step="0.000001"
            bind:value={frequencyInput}
            onkeydown={tuneFromKeyboard}
            onfocus={() => editingFrequency = true}
            onblur={() => editingFrequency = false}
            aria-describedby="receiver-modern-tune-message"
            aria-label="Tune frequency in megahertz"
        />
        <button type="submit" class="receiver-island__apply">Tune</button>
        <button type="button" class="receiver-island__nudge" aria-label="Tune up one step" onclick={() => adjustFrequency(1)}>+</button>
        <span class="receiver-island__step">{snapshot.tuningStepHz.toLocaleString()} Hz step</span>
        <span id="receiver-modern-tune-message" class="receiver-island__message" aria-live="polite">{tuneMessage}</span>
    </form>

    <form class="receiver-island__mode-picker" onsubmit={submitMode} aria-label="Select receiver mode">
        <label for="receiver-modern-mode">MODE</label>
        <select id="receiver-modern-mode" bind:value={modeInput} onfocus={() => editingMode = true} onblur={() => editingMode = false} aria-describedby="receiver-modern-mode-message">
            {#if snapshot.modeCapabilities.length}
                {#each snapshot.modeCapabilities as mode (mode.modulation)}
                    <option value={mode.name} disabled={!mode.available}>{mode.name}{mode.available ? '' : ` · ${unavailableReason(mode.missing_requirements)}`}</option>
                {/each}
            {:else}
                {#each snapshot.availableModes as mode (mode.modulation)}
                    <option value={mode.name}>{mode.name}</option>
                {/each}
            {/if}
        </select>
        <button type="submit" class="receiver-island__apply">Apply</button>
        <span id="receiver-modern-mode-message" class="receiver-island__message" aria-live="polite">{modeMessage}</span>
    </form>

    <div class="receiver-island__audio" aria-label="Audio controls">
        <button type="button" class="receiver-island__mute" aria-pressed={snapshot.muted} disabled={snapshot.audio !== 'playing'} onclick={toggleAudioMute}>{snapshot.audio !== 'playing' ? 'Audio waiting' : snapshot.muted ? 'Unmute' : 'Mute'}</button>
        {#if snapshot.recordingAllowed || snapshot.recording}
            <button type="button" class="receiver-island__record" aria-pressed={snapshot.recording} disabled={!snapshot.recording && snapshot.audio !== 'playing'} onclick={toggleAudioRecording}>{snapshot.recording ? 'Stop recording' : 'Record'}</button>
        {/if}
        <label for="receiver-modern-volume">VOLUME</label>
        <input id="receiver-modern-volume" type="range" min="0" max="150" step="1" value={snapshot.volume} disabled={snapshot.audio !== 'playing' || snapshot.muted} oninput={changeVolume} aria-label="Audio volume" />
        <output for="receiver-modern-volume">{snapshot.volume}%</output>
        <span class="receiver-island__record-message" aria-live="polite">{recordingMessage}</span>
    </div>
    </div>

    <div class="receiver-island__status" aria-label="Receiver status">
        <span class:receiver-island__status--active={snapshot.connection === 'connected'} class="receiver-island__status-item">
            <i aria-hidden="true"></i>{snapshot.connection === 'connected' ? 'Connected' : snapshot.connection === 'starting' ? 'Starting' : 'Reconnecting'}
        </span>
        <span
            class:receiver-island__status--active={snapshot.deviceState === 'running'}
            class:receiver-island__health-warning={snapshot.deviceSeverity === 'warning'}
            class:receiver-island__health-error={snapshot.deviceSeverity === 'error'}
            class="receiver-island__status-item"
            title={snapshot.deviceMessage ?? ''}
            aria-label={`SDR ${snapshot.deviceName ?? 'source'}: ${snapshot.deviceState}`}
        ><i aria-hidden="true"></i>{snapshot.deviceName ?? 'SDR'} · {snapshot.deviceState.replaceAll('_', ' ')}</span>
        <span class:receiver-island__status--active={snapshot.audio === 'playing'} class="receiver-island__status-item">
            <i aria-hidden="true"></i>{snapshot.audio === 'playing' ? 'Audio live' : 'Audio waiting'}
        </span>
        {#if snapshot.audioDroppedSamples > 0}
            <span class="receiver-island__audio-warning" role="status">Audio buffer dropped {snapshot.audioDroppedSamples.toLocaleString()} samples</span>
        {/if}
        {#if snapshot.decoderError}
            <span class="receiver-island__health-error" role="status" title={snapshot.decoderError}>Decoder error · {snapshot.decoderError}</span>
        {/if}
        <span class:receiver-island__status--active={snapshot.decoder === 'output'} class="receiver-island__status-item">
            <i aria-hidden="true"></i>{snapshot.decoder === 'off'
                ? 'Decoder off'
                : snapshot.decoder === 'output'
                    ? `${snapshot.mode} output received`
                    : `${snapshot.mode} selected · waiting for output`}
        </span>
        <span class="receiver-island__status-step">STEP {snapshot.tuningStepHz.toLocaleString()} Hz</span>
    </div>

    <div id="receiver-modern-meter-slot" aria-label="Signal strength"></div>
    <button type="button" class="receiver-island__advanced-toggle" aria-expanded={advancedControlsOpen} aria-controls="receiver-modern-rf-slot" onclick={toggleAdvancedControls}>{advancedControlsOpen ? 'Close RF controls' : 'RF controls · step, squelch, noise reduction'}</button>
    <div id="receiver-modern-rf-slot" hidden={!advancedControlsOpen}></div>
    </div>
</details>

<nav class="receiver-workspace__dock" aria-label="Listening workspace cards">
    <button type="button" class="receiver-workspace__focus" onclick={focusWaterfall}>Clear view</button>
    <details class="receiver-workspace__card" ontoggle={openSupportingCard}>
        <summary>Display</summary>
        <div class="receiver-workspace__card-body">
            <h2>Spectrum &amp; waterfall</h2>
    <div class="receiver-island__waterfall-controls" aria-label="Waterfall controls">
        <span class="receiver-island__waterfall-label">WATERFALL · ZOOM {snapshot.waterfallZoomLevel + 1}/{snapshot.waterfallZoomMaximum + 1}</span>
        <button type="button" class="receiver-island__zoom" disabled={snapshot.waterfallZoomLevel === 0} onclick={() => changeWaterfallZoom('out')}>Zoom out</button>
        <button type="button" class="receiver-island__zoom" disabled={snapshot.waterfallZoomLevel >= snapshot.waterfallZoomMaximum} onclick={() => changeWaterfallZoom('in')}>Zoom in</button>
        <button type="button" class="receiver-island__zoom" onclick={() => changeWaterfallZoom('full')}>Full spectrum</button>
        <button type="button" class="receiver-island__zoom" onclick={() => changeWaterfallRange('auto')}>Auto levels</button>
        <button type="button" class="receiver-island__zoom" onclick={() => changeWaterfallRange('default')}>Reset range</button>
        <span class="receiver-island__message" aria-live="polite">{waterfallMessage}</span>
    </div>

            <div id="receiver-modern-levels-slot" class="receiver-workspace__levels"></div>
            <div id="receiver-modern-display-slot"></div>
        </div>
    </details>
    <details class="receiver-workspace__card" ontoggle={openSupportingCard}>
        <summary>Preferences</summary>
        <div class="receiver-workspace__card-body">
            <h2>Appearance &amp; gestures</h2>
            <div id="receiver-modern-preferences-slot"></div>
        </div>
    </details>
    <details class="receiver-workspace__card" ontoggle={openSupportingCard}>
        <summary>Activity{snapshot.mode.toLocaleLowerCase() === 'data2g' ? ' · Data2G' : ''}</summary>
        <div class="receiver-workspace__card-body">
            <h2>Decoded activity</h2>
    <div class="receiver-island__waterfall-controls" aria-label="Waterfall controls">
        <span class="receiver-island__waterfall-label">WATERFALL · ZOOM {snapshot.waterfallZoomLevel + 1}/{snapshot.waterfallZoomMaximum + 1}</span>
        <button type="button" class="receiver-island__zoom" disabled={snapshot.waterfallZoomLevel === 0} onclick={() => changeWaterfallZoom('out')}>Zoom out</button>
        <button type="button" class="receiver-island__zoom" disabled={snapshot.waterfallZoomLevel >= snapshot.waterfallZoomMaximum} onclick={() => changeWaterfallZoom('in')}>Zoom in</button>
        <button type="button" class="receiver-island__zoom" onclick={() => changeWaterfallZoom('full')}>Full spectrum</button>
        <button type="button" class="receiver-island__zoom" onclick={() => changeWaterfallRange('auto')}>Auto levels</button>
        <button type="button" class="receiver-island__zoom" onclick={() => changeWaterfallRange('default')}>Reset range</button>
        <span class="receiver-island__message" aria-live="polite">{waterfallMessage}</span>
    </div>

    {#if snapshot.mode.toLocaleLowerCase() === 'data2g'}
        <section class="receiver-island__data2g" aria-label="Data2G receive activity">
            <div class="receiver-island__data2g-heading">
                <strong>DATA2G RECEIVE</strong>
                <span aria-live="polite">{data2gStatus}</span>
            </div>
            {#if data2gAprs.length}
                <ol class="receiver-island__data2g-aprs">
                    {#each data2gAprs as message, index (message.receivedAt + ':' + index)}
                        <li>
                            <span>{new Date(message.receivedAt * 1000).toLocaleTimeString()} · {message.source} → {message.destination}</span>
                            <p>{message.text}</p>
                        </li>
                    {/each}
                </ol>
            {/if}
            {#if data2gFrames.length}
                <ol>
                    {#each data2gFrames as frame, index (frame.receivedAt + ':' + index)}
                        <li>
                            <span>{new Date(frame.receivedAt * 1000).toLocaleTimeString()} · KISS {frame.port} · {frame.command === 0 ? 'DATA' : `CMD ${frame.command}`} · {frame.payloadBytes} B</span>
                            <code>{frame.payloadHex}</code>
                        </li>
                    {/each}
                </ol>
            {:else if !data2gAprs.length}
                <p>No complete Data2G frame received yet. Decoded frames appear here.</p>
            {/if}
            {#if data2gActivity.length}
                <ol class="receiver-island__data2g-activity" aria-label="Recent Data2G channel and burst activity">
                    {#each data2gActivity as activity, index (activity.receivedAt + ':' + index)}
                        <li>{new Date(activity.receivedAt * 1000).toLocaleTimeString()} · {activity.text}</li>
                    {/each}
                </ol>
            {/if}
        </section>
    {/if}

        {#if snapshot.mode.toLocaleLowerCase() !== 'data2g'}
            <p>Decoder output appears in the reception cards. Search saved output in History.</p>
        {/if}
        </div>
    </details>
    <details class="receiver-island__layouts receiver-workspace__card" ontoggle={openSupportingCard}>
        <summary>Saved stations <span>{savedLayouts.length}</span></summary>
        <div class="receiver-island__layouts-panel receiver-workspace__card-body">
            <form class="receiver-island__layout-save" onsubmit={(event) => { event.preventDefault(); saveCurrentLayout(); }}>
                <label for="receiver-modern-layout-name">SAVE CURRENT FREQUENCY + MODE</label>
                <input id="receiver-modern-layout-name" bind:value={layoutName} maxlength="48" placeholder="Station name" autocomplete="off" />
                <button type="submit" class="receiver-island__apply">Save</button>
            </form>
            {#if savedLayouts.length}
                <label class="receiver-island__layout-select-label" for="receiver-modern-layout-list">THIS RECEIVER PROFILE</label>
                <div class="receiver-island__layout-actions">
                    <select id="receiver-modern-layout-list" bind:value={selectedLayoutId}>
                        <option value="">Choose a saved station</option>
                        {#each savedLayouts as layout (layout.id)}
                            <option value={layout.id}>{layout.name} · {(layout.frequencyHz / 1_000_000).toFixed(6)} MHz · {layout.modulation}</option>
                        {/each}
                    </select>
                    <button type="button" class="receiver-island__apply" onclick={applySavedLayout} disabled={!selectedLayoutId}>Apply</button>
                    <button type="button" class="receiver-island__zoom" onclick={removeSavedLayout} disabled={!selectedLayoutId}>Remove</button>
                </div>
            {:else}
                <p class="receiver-island__layout-empty">Save a frequency and mode combination for quick recall.</p>
            {/if}
            <span class="receiver-island__layout-message" aria-live="polite">{layoutMessage}</span>
        </div>
    </details>

    <details class="receiver-island__history receiver-workspace__card" ontoggle={openSupportingCard}>
        <summary>History · {receptionHistory.length}</summary>
        <div class="receiver-workspace__card-body">
        <h2>Reception history</h2>
        <div class="receiver-island__history-tools">
            <label for="receiver-modern-history-search">Search time, frequency, mode, source, or decoded content</label>
            <input id="receiver-modern-history-search" type="search" bind:value={receptionSearch} autocomplete="off" />
            <button type="button" onclick={clearReceptionHistory} disabled={receptionHistory.length === 0}>Clear history</button>
            <span role="status" aria-live="polite">{receptionHistoryMessage}</span>
        </div>
        {#if filteredReceptionHistory.length}
            <ol class="receiver-island__history-list">
                {#each filteredReceptionHistory as entry, index (`${entry.timestampMs}:${index}`)}
                    <li>
                        <header>
                            <time datetime={new Date(entry.timestampMs).toISOString()}>{new Date(entry.timestampMs).toLocaleString()}</time>
                            <span>{entry.frequencyHz === null ? 'Frequency unknown' : `${(entry.frequencyHz / 1_000_000).toFixed(6)} MHz`}</span>
                            <span>{entry.mode}</span>
                            <span>{entry.profile}</span>
                        </header>
                        <pre>{entry.content}</pre>
                    </li>
                {/each}
            </ol>
        {:else}
            <p>{receptionSearch ? 'No receptions match this search.' : 'Decoded receptions will appear here.'}</p>
        {/if}
        </div>
    </details>
    <details class="receiver-workspace__card" ontoggle={openSupportingCard}>
        <summary>Tools</summary>
        <div class="receiver-workspace__card-body receiver-workspace__tools">
            <h2>Receiver windows</h2>
            {#if !secondaryPane}
                <button type="button" class="receiver-island__bookmark" aria-pressed={dualViewOpen} onclick={toggleDualReceiverView}>{dualViewOpen ? 'Close second tuner' : 'Dual tuner view'}</button>
                <button type="button" class="receiver-island__bookmark" onclick={openAnotherReceiver}>Open separate window</button>
            {:else}
                <p>This is the second receiver. Manage both tuners from the main window.</p>
            {/if}
            <span aria-live="polite">{dualViewMessage || receiverMessage}</span>
        </div>
    </details>
</nav>
</div>

<style>
    .receiver-island {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 10px;
        padding: 12px clamp(14px, 2vw, 30px);
        border-bottom: 1px solid var(--rx-border, #2b4050);
        background: linear-gradient(90deg, #101820, #152530 52%, #101820);
        color: var(--rx-text, #e5edf2);
        font-family: "DejaVu Sans", Verdana, sans-serif;
    }
    .receiver-island__identity { display: flex; align-items: center; gap: 14px; min-width: 0; }
    .receiver-island__header-message { color: var(--rx-amber, #f4b95f); font-size: 12px; }
    .receiver-island__bookmark { justify-self: start; min-height: 40px; border: 1px solid var(--rx-border, #2b4050); border-radius: 8px; padding: 0 12px; background: #1a2a37; color: var(--rx-text, #e5edf2); cursor: pointer; font: 600 12px sans-serif; }
    .receiver-island__bookmark:hover { border-color: var(--rx-cyan, #57d7e8); color: var(--rx-cyan, #57d7e8); }
    .receiver-island__listening-bar { display: grid; grid-template-columns: minmax(280px, 1.25fr) minmax(210px, .85fr) minmax(280px, 1fr); align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--rx-border, #2b4050); border-radius: 12px; background: linear-gradient(110deg, #15232d, #111a22 60%, #172632); box-shadow: 0 8px 24px rgb(0 0 0 / 20%); }
    .receiver-island__mode-picker { display: flex; align-items: center; gap: 8px; min-width: 0; flex-wrap: wrap; color: var(--rx-muted, #9aabb8); font: 11px ui-monospace, monospace; }
    .receiver-island__mode-picker select { flex: 1 1 130px; width: 100%; min-width: 0; min-height: 44px; border: 1px solid var(--rx-border, #2b4050); border-radius: 8px; padding: 0 12px; background: #0b1118; color: var(--rx-text, #e5edf2); font: 14px sans-serif; }
    .receiver-island__tuning { display: flex; align-items: center; gap: 8px; min-width: 0; flex-wrap: wrap; }
    .receiver-island__frequency-label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
    .receiver-island__frequency { flex: 1 1 160px; width: min(100%, 230px); min-width: 130px; border: 1px solid var(--rx-border, #2b4050); border-radius: 8px; padding: 9px 11px; background: #081218; color: var(--rx-cyan, #57d7e8); font: 650 24px/1.2 ui-monospace, monospace; font-variant-numeric: tabular-nums; }
    .receiver-island__frequency::-webkit-inner-spin-button { display: none; }
    .receiver-island__nudge, .receiver-island__apply { min-width: 44px; min-height: 44px; border: 1px solid var(--rx-border, #2b4050); border-radius: 7px; background: #1a2a37; color: var(--rx-text, #e5edf2); cursor: pointer; font: 700 17px/1 sans-serif; }
    .receiver-island__apply { padding: 0 12px; color: var(--rx-cyan, #57d7e8); font-size: 12px; }
    .receiver-island__nudge:hover, .receiver-island__apply:hover { border-color: var(--rx-cyan, #57d7e8); }
    .receiver-island__status { display: flex; align-items: center; justify-content: flex-start; gap: 18px; flex-wrap: wrap; padding: 0 4px; }
    .receiver-island__status-item { display: inline-flex; align-items: center; gap: 7px; color: var(--rx-muted, #9aabb8); font-size: 12px; white-space: nowrap; }
    .receiver-island__status-item i { width: 7px; height: 7px; border-radius: 50%; background: #697680; }
    .receiver-island__status--active { color: var(--rx-text, #e5edf2); }
    .receiver-island__status--active i { background: var(--rx-cyan, #57d7e8); box-shadow: 0 0 9px rgb(87 215 232 / 55%); }
    .receiver-island__health-warning { color: var(--rx-amber, #f4b95f); }
    .receiver-island__health-error { color: #ff8888; }
    .receiver-island__audio-warning { color: var(--rx-amber, #f4b95f); font: 600 10px ui-monospace, monospace; }
    .receiver-island__status-step { color: var(--rx-muted, #9aabb8); font: 10px ui-monospace, monospace; white-space: nowrap; }
    .receiver-island__waterfall-controls { grid-column: 1 / -1; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .receiver-island__history { grid-column: 1 / -1; min-width: 0; border: 1px solid #263c46; border-radius: 8px; background: #0b171d; color: var(--rx-text, #e5edf2); }
    .receiver-island__history > summary { min-height: 44px; padding: 12px; color: var(--rx-cyan, #57d7e8); cursor: pointer; font: 11px ui-monospace, monospace; }
    .receiver-island__history-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 0 12px 10px; }
    .receiver-island__history-tools label { flex-basis: 100%; color: var(--rx-muted, #9aabb8); font: 11px sans-serif; }
    .receiver-island__history-tools input { flex: 1 1 240px; min-height: 44px; padding: 8px; border: 1px solid #526a75; border-radius: 6px; background: #071116; color: var(--rx-text, #e5edf2); }
    .receiver-island__history-tools button { min-height: 44px; padding: 8px 12px; border: 1px solid #526a75; border-radius: 6px; background: #12242c; color: var(--rx-text, #e5edf2); }
    .receiver-island__history-tools span { flex-basis: 100%; color: var(--rx-muted, #9aabb8); font: 11px sans-serif; }
    .receiver-island__history p { margin: 0 12px 12px; color: var(--rx-muted, #9aabb8); font: 12px sans-serif; }
    .receiver-island__history-list { display: grid; gap: 8px; max-height: 360px; overflow: auto; margin: 0; padding: 0 12px 12px; list-style: none; }
    .receiver-island__history-list li { min-width: 0; padding: 10px; border-left: 2px solid var(--rx-cyan, #57d7e8); border-radius: 4px; background: #101f27; }
    .receiver-island__history-list header { display: flex; flex-wrap: wrap; gap: 6px 12px; color: var(--rx-muted, #9aabb8); font: 10px ui-monospace, monospace; }
    .receiver-island__history-list pre { overflow-wrap: anywhere; white-space: pre-wrap; margin: 8px 0 0; color: var(--rx-text, #e5edf2); font: 11px/1.45 ui-monospace, monospace; }
    .receiver-island__data2g { grid-column: 1 / -1; display: grid; gap: 8px; padding: 10px 12px; border: 1px solid #27505a; border-radius: 8px; background: #0b1a20; }
    .receiver-island__data2g-heading { display: flex; justify-content: space-between; gap: 12px; color: var(--rx-cyan, #57d7e8); font: 11px ui-monospace, monospace; }
    .receiver-island__data2g-heading span { color: var(--rx-muted, #9aabb8); text-align: right; }
    .receiver-island__data2g ol { display: grid; gap: 8px; max-height: 220px; overflow: auto; margin: 0; padding: 0; list-style: none; }
    .receiver-island__data2g li { display: grid; gap: 4px; padding: 8px; border-radius: 6px; background: #101f27; color: var(--rx-text, #e5edf2); font: 10px ui-monospace, monospace; }
    .receiver-island__data2g .receiver-island__data2g-aprs li { border-left: 2px solid var(--rx-cyan, #57d7e8); }
    .receiver-island__data2g .receiver-island__data2g-aprs p { color: var(--rx-text, #e5edf2); overflow-wrap: anywhere; }
    .receiver-island__data2g code { color: #c0d5df; overflow-wrap: anywhere; font: 10px/1.45 ui-monospace, monospace; }
    .receiver-island__data2g p { margin: 0; color: var(--rx-muted, #9aabb8); font: 11px sans-serif; }
    .receiver-island__layouts { grid-column: 1 / -1; border: 1px solid var(--rx-border, #2b4050); border-radius: 8px; background: #101b24; color: var(--rx-text, #e5edf2); }
    .receiver-island__layouts summary { min-height: 44px; display: flex; align-items: center; gap: 8px; padding: 0 12px; cursor: pointer; color: var(--rx-cyan, #57d7e8); font: 700 11px ui-monospace, monospace; }
    .receiver-island__layouts summary span { color: var(--rx-muted, #9aabb8); font-weight: 400; }
    .receiver-island__layouts-panel { display: grid; gap: 10px; padding: 0 12px 12px; }
    .receiver-island__layout-save { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .receiver-island__layout-save label, .receiver-island__layout-select-label { flex-basis: 100%; color: var(--rx-muted, #9aabb8); font: 10px ui-monospace, monospace; }
    .receiver-island__layout-save input, .receiver-island__layout-actions select { min-width: 180px; min-height: 44px; border: 1px solid var(--rx-border, #2b4050); border-radius: 7px; padding: 0 10px; background: #0a1219; color: var(--rx-text, #e5edf2); font: 12px sans-serif; }
    .receiver-island__layout-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .receiver-island__layout-actions select { flex: 1 1 300px; }
    .receiver-island__layout-actions button:disabled { opacity: .5; cursor: not-allowed; }
    .receiver-island__layout-empty, .receiver-island__layout-message { margin: 0; color: var(--rx-muted, #9aabb8); font: 11px sans-serif; }
    .receiver-island__layout-message { color: var(--rx-amber, #f4b95f); }
    .receiver-island__waterfall-label { margin-right: 4px; color: var(--rx-muted, #9aabb8); font: 10px ui-monospace, monospace; }
    .receiver-island__zoom { min-height: 44px; border: 1px solid var(--rx-border, #2b4050); border-radius: 7px; padding: 0 12px; background: #1a2a37; color: var(--rx-text, #e5edf2); cursor: pointer; font: 600 11px sans-serif; }
    .receiver-island__zoom:hover:not(:disabled) { border-color: var(--rx-cyan, #57d7e8); color: var(--rx-cyan, #57d7e8); }
    .receiver-island__zoom:disabled { opacity: .5; cursor: not-allowed; }
    .receiver-island__message { flex-basis: 100%; min-height: 12px; color: var(--rx-amber, #f4b95f); font-size: 10px; }
    .receiver-island__audio { display: flex; align-items: center; gap: 9px; min-width: 0; color: var(--rx-muted, #9aabb8); font: 11px ui-monospace, monospace; flex-wrap: wrap; }
    .receiver-island__audio input { width: min(240px, 40vw); accent-color: var(--rx-cyan, #57d7e8); }
    .receiver-island__audio output { min-width: 42px; color: var(--rx-text, #e5edf2); font-variant-numeric: tabular-nums; }
    .receiver-island__mute { min-height: 44px; border: 1px solid var(--rx-cyan, #57d7e8); border-radius: 8px; padding: 0 14px; background: #12313b; color: var(--rx-text, #e5edf2); cursor: pointer; font: 700 12px sans-serif; }
    .receiver-island__mute:hover:not(:disabled) { border-color: var(--rx-cyan, #57d7e8); color: var(--rx-cyan, #57d7e8); }
    .receiver-island__mute:disabled { opacity: .55; cursor: not-allowed; }
    .receiver-island__record { min-height: 44px; border: 1px solid #704045; border-radius: 7px; padding: 0 10px; background: #351e23; color: #ffc0c0; cursor: pointer; font: 600 11px sans-serif; }
    .receiver-island__record:hover:not(:disabled) { border-color: #ff9292; background: #51272c; }
    .receiver-island__record[aria-pressed="true"] { border-color: #ff9292; background: #702c32; color: #fff; }
    .receiver-island__record:disabled { opacity: .5; cursor: not-allowed; }
    .receiver-island__record-message { color: var(--rx-amber, #f4b95f); }
    .receiver-workspace { font-family: "DejaVu Sans", Verdana, sans-serif; color: var(--rx-text); }
    .receiver-island { position: absolute; right: 12px; bottom: 64px; width: 360px; max-width: calc(100% - 24px); padding: 0; display: block; border: 1px solid var(--rx-border); border-radius: 12px; background: rgb(13 21 28 / 97%); box-shadow: 0 8px 32px #0008; }
    .receiver-island__summary { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 44px; padding: 0 12px; cursor: pointer; font-size: 13px; }
    .receiver-island__summary::before { content: '+'; color: var(--rx-cyan); }
    .receiver-island[open] > summary::before { content: '−'; }
    .receiver-island__summary span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 11px ui-monospace, monospace; color: var(--rx-cyan); }
    .receiver-island__body { display: grid; gap: 10px; padding: 0 12px 12px; max-height: calc(100dvh - 200px); overflow: auto; overscroll-behavior: contain; }
    .receiver-island__identity { align-items: end; gap: 8px; }
    .receiver-island__profile-select { display: grid; flex: 1; min-width: 0; gap: 4px; color: var(--rx-muted); font-size: 11px; }
    .receiver-island__listening-bar { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; padding: 0; border: 0; background: none; box-shadow: none; }
    .receiver-island__tuning { display: grid; grid-template-columns: 36px minmax(0, 1fr) 44px 36px; gap: 6px; }
    .receiver-island__frequency { width: 100%; box-sizing: border-box; min-width: 0; font-size: 21px; padding: 8px; }
    .receiver-island__nudge { min-width: 36px; }
    .receiver-island__step { grid-column: 1 / -1; color: var(--rx-muted); font: 11px ui-monospace, monospace; }
    .receiver-island__mode-picker { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; font-size: 12px; }
    .receiver-island__audio { gap: 6px; font-size: 11px; }
    .receiver-island__audio label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
    .receiver-island__audio input { flex: 1; min-width: 50px; width: 50px; }
    .receiver-island__audio output { min-width: 34px; }
    .receiver-island__status { gap: 6px 12px; padding: 0; }
    .receiver-island__status-item { font-size: 11px; white-space: normal; overflow-wrap: anywhere; }
    .receiver-island__status-step { display: none; }
    .receiver-island__message:empty, .receiver-island__header-message:empty, .receiver-island__record-message:empty { display: none; }
    .receiver-island__advanced-toggle { min-height: 36px; border: 1px solid var(--rx-border); border-radius: 8px; background: var(--rx-surface-raised); color: var(--rx-cyan); cursor: pointer; font: 12px sans-serif; }
    .receiver-workspace__dock { position: absolute; bottom: max(10px, env(safe-area-inset-bottom)); left: 12px; right: 12px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; pointer-events: auto; }
    .receiver-workspace__card { grid-column: auto; border: 1px solid var(--rx-border); border-radius: 8px; background: var(--rx-surface); min-width: 0; }
    .receiver-workspace__card > summary { min-height: 44px; box-sizing: border-box; display: flex; align-items: center; padding: 0 12px; font: 12px sans-serif; color: var(--rx-text); cursor: pointer; white-space: nowrap; }
    .receiver-workspace__card[open] > summary { color: var(--rx-cyan); background: var(--rx-surface-raised); border-radius: 8px; }
    .receiver-workspace__card-body { position: absolute; left: 0; bottom: 56px; width: min(480px, 100%); box-sizing: border-box; max-height: calc(100dvh - 180px); overflow: auto; overscroll-behavior: contain; padding: 16px; border: 1px solid var(--rx-border); border-radius: 12px; background: rgb(13 21 28 / 98%); box-shadow: 0 8px 32px #0008; font-size: 13px; }
    .receiver-workspace__card-body h2 { margin: 0 0 12px; font-size: 15px; }
    .receiver-workspace__card-body p { font-size: 13px; line-height: 1.5; }
    .receiver-workspace__focus { min-height: 44px; padding: 0 12px; border: 1px solid var(--rx-cyan); border-radius: 8px; background: #12313b; color: var(--rx-cyan); cursor: pointer; white-space: nowrap; }
    .receiver-workspace__levels { display: grid; grid-template-columns: 32px minmax(0, 1fr); align-items: center; gap: 8px; padding: 12px 0; }
    .receiver-workspace__tools { display: grid; gap: 10px; }
    .receiver-workspace__card .receiver-island__waterfall-controls { gap: 6px; }
    @media (max-width: 700px) {
        .receiver-island { bottom: 116px; right: 8px; width: 340px; max-width: calc(100% - 16px); }
        .receiver-island__body { max-height: min(48dvh, calc(100dvh - 250px)); }
        .receiver-workspace__dock { left: 8px; right: 8px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px; }
        .receiver-workspace__card > summary { padding: 0 6px; justify-content: center; font-size: 11px; white-space: normal; }
        .receiver-workspace__focus { padding: 0 6px; font-size: 11px; }
        .receiver-workspace__card-body { bottom: 104px; width: calc(100vw - 16px); max-height: calc(100dvh - 220px); }
        .receiver-workspace__card[open] .receiver-workspace__card-body { z-index: 2; }
    }
</style>
