import { writable } from 'svelte/store';

export let currentProgress = writable(0);

export let form = writable({});

export let visiblePart = writable(0);

export let runTests = writable(false);

export let showModal = writable(false);

export let theme = writable(window.localStorage.theme || 'default');

export let auth = writable(0);

export let ssl = writable(0);

export let protocol = writable('https');

export let certificate = writable('none');

export let recent = writable([]);

export let showMainApp = writable(false);

export let contentType = writable('xml');
