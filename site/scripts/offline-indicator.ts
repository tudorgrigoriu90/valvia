/** Offline indicator (TS-05.3.4): reflects navigator.onLine and online/offline events. */
const indicator = document.querySelector<HTMLElement>('[data-offline-indicator]');
if (indicator !== null) {
  const update = (): void => {
    indicator.hidden = navigator.onLine;
  };
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}
