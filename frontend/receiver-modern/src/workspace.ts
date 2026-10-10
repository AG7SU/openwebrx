/** Keep legacy controls and their listeners while giving each task its own card. */
export function arrangeReceiverCards(): () => void {
    const restored: (() => void)[] = [];
    function move(element: Element | null, targetId: string): void {
        const target = document.getElementById(targetId);
        if (!element || !target || !element.parentNode) return;
        const marker = document.createComment('receiver control position');
        element.before(marker);
        target.append(element);
        restored.push(() => { marker.replaceWith(element); });
    }
    const receiver = document.getElementById('openwebrx-panel-receiver');
    if (!receiver) return () => {};

    move(document.getElementById('openwebrx-sdr-profiles-listbox'), 'receiver-modern-profile-slot');
    for (const id of ['openwebrx-section-settings', 'openwebrx-section-display']) {
        const heading = document.getElementById(id);
        const content = heading?.nextElementSibling;
        const target = id.endsWith('settings') ? 'receiver-modern-preferences-slot' : 'receiver-modern-display-slot';
        move(heading, target);
        move(content ?? null, target);
    }
    // Waterfall levels and palette belong with the display, beside spectrum/zoom.
    for (const id of ['openwebrx-waterfall-colors-auto', 'openwebrx-waterfall-color-min',
        'openwebrx-waterfall-colors-default', 'openwebrx-waterfall-color-max']) {
        move(document.getElementById(id), 'receiver-modern-levels-slot');
    }
    move(document.getElementById('openwebrx-wf-themes-listbox')?.closest('.openwebrx-panel-line') ?? null,
        'receiver-modern-display-slot');
    move(document.getElementById('openwebrx-smeter')?.closest('.openwebrx-panel-line') ?? null,
        'receiver-modern-meter-slot');
    move(receiver, 'receiver-modern-rf-slot');
    return () => restored.reverse().forEach(restore => restore());
}
