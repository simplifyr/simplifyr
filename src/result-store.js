import { writable } from 'svelte/store';

export let data = writable();

export let poll = writable(false);

export let sfs = writable(null);