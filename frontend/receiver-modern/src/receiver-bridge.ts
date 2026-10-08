export interface ReceiverMode {
    modulation: string;
    name: string;
    type: 'analog' | 'digimode' | string;
}

export interface ReceiverModeCapability extends ReceiverMode {
    available: boolean;
    missing_requirements: string[];
}

export interface ReceiverProfile {
    id: string;
    name: string;
}

export interface ReceiverAudioAdapter {
    isAvailable(): boolean;
    isStarted(): boolean;
    isAllowed(): boolean;
    isRecording(): boolean;
    getDroppedSamples(): number;
    getOutputRate(): number;
    getHdOutputRate(): number;
    getSampleRate(): number;
    setCompression(value: string): boolean;
    setGain(value: number): boolean;
    clearBuffer(): boolean;
    resume(): boolean;
    onStart(callback: (apiType?: string) => void): boolean;
    startRecording(): boolean;
    stopRecording(): boolean;
    setVolume(volume: number): boolean;
    toggleMute(): void;
    setRecording(on: boolean): boolean;
    pushStream(data: ArrayBuffer, highDefinition?: boolean): boolean;
}

export interface ReceiverWaterfallAdapter {
    updateColors(endpoint: 0 | 1): boolean;
    zoom(direction: 'in' | 'out' | 'full' | 'detail'): boolean;
    setRange(mode: 'auto' | 'default'): boolean;
    addLine(data: Float32Array): boolean;
    addSecondaryLine(data: Float32Array): boolean;
    clear(): boolean;
}

export interface ReceiverDisplayAdapter {
    toggleSection(section: HTMLElement): void;
    toggleNoiseReduction(): void;
    setNoiseReduction(value: number): boolean;
    setTheme(value: string): void;
    setWaterfallTheme(value: string): void;
    toggleOpacity(): void;
    setOpacity(value: number): boolean;
    bumpOpacity(): void;
    toggleSpectrum(): void;
    toggleFrame(value: boolean): void;
    toggleWheelSwap(value: boolean): void;
    toggleCrossFrequency(value: boolean): void;
    toggleBandplan(value: boolean): void;
}

export interface ReceiverChatAdapter {
    send(): boolean;
    keyPress(event: KeyboardEvent): boolean;
}

export interface ReceiverTuningAdapter {
    jumpBySteps(steps: number): boolean;
    resetStep(): boolean;
    setStep(stepHz: number): boolean;
}

export interface ReceiverSnapshot {
    profileName: string;
    frequencyHz: number | null;
    tuningStepHz: number;
    connection: 'starting' | 'connected' | 'reconnecting';
    audio: 'playing' | 'waiting';
    recording: boolean;
    recordingAllowed: boolean;
    volume: number;
    muted: boolean;
    audioDroppedSamples: number;
    deviceName: string | null;
    deviceState: 'unknown' | 'starting' | 'running' | 'stopping' | 'stopped' | 'tuning' | 'failed' | 'disabled' | 'shutting_down' | 'offline';
    deviceSeverity: 'info' | 'warning' | 'error';
    deviceMessage: string | null;
    decoderError: string | null;
    mode: string;
    availableModes: ReceiverMode[];
    modeCapabilities: ReceiverModeCapability[];
    decoder: 'off' | 'selected' | 'output';
    waterfallZoomLevel: number;
    waterfallZoomMaximum: number;
}

type ReceiverBridgeSnapshot = Omit<ReceiverSnapshot,
    'decoder' | 'deviceName' | 'deviceState' | 'deviceSeverity' | 'deviceMessage' | 'decoderError'>;

export interface OpenWebRXReceiverBridge {
    getSnapshot(): ReceiverBridgeSnapshot;
    audio: ReceiverAudioAdapter;
    waterfall: ReceiverWaterfallAdapter;
    display: ReceiverDisplayAdapter;
    chat: ReceiverChatAdapter;
    tuning: ReceiverTuningAdapter;
    tuneTo(frequencyHz: number): boolean;
    tuneBySteps(steps: number): boolean;
    setMode(modulation: string): boolean;
    addCurrentBookmark(): boolean;
    getProfiles(): ReceiverProfile[];
    getSelectedProfile(): string | null;
    selectProfile(profileId: string): boolean;
}

declare global {
    interface Window {
        OpenWebRXReceiver?: OpenWebRXReceiverBridge;
    }
}

let lastDecoderOutput: {modulation: string; at: number} | null = null;
let lastReceiverHealth: Pick<ReceiverSnapshot, 'deviceName' | 'deviceState' | 'deviceSeverity' | 'deviceMessage'> = {
    deviceName: null,
    deviceState: 'unknown',
    deviceSeverity: 'info',
    deviceMessage: null
};
let lastDecoderError: string | null = null;
window.addEventListener('openwebrx:decoder-output', (event) => {
    const modulation = (event as CustomEvent<{modulation?: string}>).detail?.modulation;
    if (typeof modulation === 'string' && modulation) {
        lastDecoderOutput = {modulation, at: Date.now()};
        lastDecoderError = null;
    }
});
window.addEventListener('openwebrx:decoder-error', (event) => {
    const error = (event as CustomEvent<Record<string, unknown>>).detail;
    if (error?.schema_version === 1 && typeof error.message === 'string' && error.message.length <= 240) {
        lastDecoderError = error.message.slice(0, 240);
    }
});
window.addEventListener('openwebrx:receiver-health', (event) => {
    const health = (event as CustomEvent<Record<string, unknown>>).detail;
    const states = ['starting', 'running', 'stopping', 'stopped', 'tuning', 'failed', 'disabled', 'shutting_down', 'offline'];
    if (!health || health.schema_version !== 1 || typeof health.state !== 'string'
        || !states.includes(health.state)
        || !['info', 'warning', 'error'].includes(String(health.severity))) return;
    lastReceiverHealth = {
        deviceName: typeof health.source_name === 'string' ? health.source_name.slice(0, 80) : null,
        deviceState: health.state as ReceiverSnapshot['deviceState'],
        deviceSeverity: health.severity as ReceiverSnapshot['deviceSeverity'],
        deviceMessage: typeof health.message === 'string' ? health.message.slice(0, 240) : null
    };
});

const emptySnapshot: Omit<ReceiverSnapshot, 'decoder'> = {
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
    waterfallZoomLevel: 0,
    waterfallZoomMaximum: 0
};

export function readReceiverSnapshot(): ReceiverSnapshot {
    const current = window.OpenWebRXReceiver?.getSnapshot() ?? emptySnapshot;
    const availableModes = (current.availableModes ?? []).filter((candidate) =>
        typeof candidate?.modulation === 'string' && typeof candidate?.name === 'string'
    );
    const modeCapabilities = (current.modeCapabilities ?? []).filter((candidate) =>
        typeof candidate?.modulation === 'string' && typeof candidate?.name === 'string'
    );
    const selectedMode = modeCapabilities.find((candidate) => candidate.modulation === current.mode)
        ?? availableModes.find((candidate) => candidate.modulation === current.mode);
    const decoder = selectedMode?.type !== 'digimode'
        ? 'off'
        : lastDecoderOutput?.modulation === current.mode && Date.now() - lastDecoderOutput.at < 15000
            ? 'output'
            : 'selected';
    return {...emptySnapshot, ...current, ...lastReceiverHealth, decoderError: lastDecoderError, availableModes, modeCapabilities, decoder};
}

export function tuneTo(frequencyHz: number): boolean {
    if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) return false;
    return window.OpenWebRXReceiver?.tuneTo(frequencyHz) ?? false;
}

export function setVolume(volume: number): void {
    if (!Number.isFinite(volume)) return;
    window.OpenWebRXReceiver?.audio?.setVolume(Math.max(0, Math.min(150, Math.round(volume))));
}

export function toggleMute(): void {
    window.OpenWebRXReceiver?.audio?.toggleMute();
}

export function setRecording(on: boolean): boolean {
    if (readReceiverSnapshot().audio !== 'playing') return false;
    return window.OpenWebRXReceiver?.audio?.setRecording(on) ?? false;
}

export function zoomWaterfall(direction: 'in' | 'out' | 'full' | 'detail'): boolean {
    return window.OpenWebRXReceiver?.waterfall?.zoom(direction) ?? false;
}

export function setWaterfallRange(mode: 'auto' | 'default'): boolean {
    return window.OpenWebRXReceiver?.waterfall?.setRange(mode) ?? false;
}

export function setReceiverMode(modulation: string): boolean {
    if (!modulation || !readReceiverSnapshot().availableModes.some((mode) => mode.modulation === modulation)) return false;
    return window.OpenWebRXReceiver?.setMode(modulation) ?? false;
}

export function addCurrentBookmark(): boolean {
    return window.OpenWebRXReceiver?.addCurrentBookmark() ?? false;
}

export function getSelectedReceiverProfile(): string | null {
    return window.OpenWebRXReceiver?.getSelectedProfile() ?? null;
}

export function getOtherSourceProfile(): ReceiverProfile | null {
    const bridge = window.OpenWebRXReceiver;
    const selectedProfile = bridge?.getSelectedProfile();
    const sourceId = selectedProfile?.split('|', 1)[0];
    if (!sourceId) return null;
    return bridge?.getProfiles().find((profile) => {
        const candidateSourceId = profile.id.split('|', 1)[0];
        return candidateSourceId && candidateSourceId !== sourceId;
    }) ?? null;
}

export function subscribeReceiver(callback: (snapshot: ReceiverSnapshot) => void): () => void {
    const refresh = () => callback(readReceiverSnapshot());
    refresh();
    const timer = window.setInterval(refresh, 400);
    return () => window.clearInterval(timer);
}
