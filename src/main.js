import App from './App.svelte';
import ResultApp from './ResultApp.svelte';

var whichApp = window.location.pathname.startsWith('/result') ? ResultApp : App;

const app = new whichApp({ target: document.body });

export default app;