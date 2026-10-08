export interface ReceiverLayout {
    id: string;
    name: string;
    frequencyHz: number;
    modulation: string;
}

const STORAGE_PREFIX = 'openwebrx.receiver-layouts.v1.';
const MAX_LAYOUTS = 40;
const MAX_NAME_LENGTH = 48;

function storageKey(profileId: string): string | null {
    if (typeof profileId !== 'string' || !profileId || profileId.length > 256) return null;
    return STORAGE_PREFIX + encodeURIComponent(profileId);
}

function normalizeLayouts(value: unknown): ReceiverLayout[] {
    if (!Array.isArray(value)) return [];
    return value.slice(0, MAX_LAYOUTS).filter((item): item is ReceiverLayout =>
        item !== null && typeof item === 'object'
        && typeof item.id === 'string' && item.id.length > 0 && item.id.length <= 80
        && typeof item.name === 'string' && item.name.length > 0 && item.name.length <= MAX_NAME_LENGTH
        && Number.isFinite(item.frequencyHz) && item.frequencyHz > 0
        && typeof item.modulation === 'string' && item.modulation.length > 0 && item.modulation.length <= 40
    ).map((item) => ({
        id: item.id,
        name: item.name,
        frequencyHz: item.frequencyHz,
        modulation: item.modulation
    }));
}

export function getReceiverLayouts(profileId: string | null): ReceiverLayout[] {
    if (!profileId) return [];
    const key = storageKey(profileId);
    if (!key) return [];
    try {
        return normalizeLayouts(JSON.parse(window.localStorage.getItem(key) ?? '[]'));
    } catch {
        return [];
    }
}

export function saveReceiverLayout(profileId: string | null, layout: Omit<ReceiverLayout, 'id'>): ReceiverLayout[] | null {
    if (!profileId || !layout.name.trim() || layout.name.trim().length > MAX_NAME_LENGTH
        || !Number.isFinite(layout.frequencyHz) || layout.frequencyHz <= 0
        || !layout.modulation || layout.modulation.length > 40) return null;
    const key = storageKey(profileId);
    if (!key) return null;
    const layouts = getReceiverLayouts(profileId);
    const normalizedName = layout.name.trim();
    const existing = layouts.find((item) => item.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase());
    const next = existing
        ? layouts.map((item) => item.id === existing.id
            ? {...item, name: normalizedName, frequencyHz: layout.frequencyHz, modulation: layout.modulation}
            : item)
        : [{...layout, id: crypto.randomUUID(), name: normalizedName}, ...layouts].slice(0, MAX_LAYOUTS);
    try {
        window.localStorage.setItem(key, JSON.stringify(next));
        return next;
    } catch {
        return null;
    }
}

export function deleteReceiverLayout(profileId: string | null, layoutId: string): ReceiverLayout[] | null {
    if (!profileId || !layoutId) return null;
    const key = storageKey(profileId);
    if (!key) return null;
    const next = getReceiverLayouts(profileId).filter((layout) => layout.id !== layoutId);
    try {
        window.localStorage.setItem(key, JSON.stringify(next));
        return next;
    } catch {
        return null;
    }
}
