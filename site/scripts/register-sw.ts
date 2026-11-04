/** Registers the service worker (TS-05.3.2) for offline use; skipped where unsupported. */
if ('serviceWorker' in navigator) {
  const base = document.documentElement.dataset.base ?? '/';
  void navigator.serviceWorker.register(`${base}sw.js`, { scope: base });
}
