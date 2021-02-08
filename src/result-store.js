import { writable } from 'svelte/store';

export let data = writable();

export let poll = writable(false);

export let sfs = writable(null);

export let _theme = writable(window.localStorage.theme || 'default');