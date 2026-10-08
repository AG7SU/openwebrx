import {mount} from 'svelte';
import ReceiverIsland from './ReceiverIsland.svelte';

if (new URLSearchParams(window.location.search).get('receiver-pane') === 'secondary') {
    document.body.classList.add('receiver-modern-secondary-document');
}

function mountReceiverIsland(): void {
    const target = document.getElementById('receiver-modern-ui');
    if (!target || target.dataset.mounted === 'true') return;
    target.dataset.mounted = 'true';
    mount(ReceiverIsland, {target});
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountReceiverIsland, {once: true});
} else {
    mountReceiverIsland();
}
