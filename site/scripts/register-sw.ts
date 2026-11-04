/**
 * Registers the service worker (TS-05.3.2) and shows "New content available" when an update is waiting
 * (TS-05.3.3). Refresh activates the new worker and reloads once it takes control.
 */
import { shouldPromptUpdate } from './sw-update';

/** Set when the user taps Refresh; only then does a controller change reload the page. */
let refreshRequested = false;

function showPrompt(registration: ServiceWorkerRegistration): void {
  const prompt = document.querySelector<HTMLElement>('[data-update-prompt]');
  if (prompt === null) return;
  const button = prompt.querySelector<HTMLButtonElement>('button');
  if (button === null) return;
  prompt.hidden = false;
  button.addEventListener('click', () => {
    refreshRequested = true;
    registration.waiting?.postMessage('skip-waiting');
  });
}

if ('serviceWorker' in navigator) {
  const base = document.documentElement.dataset.base ?? '/';
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // The first install also claims the page; never reload unless the user asked for the new version.
    if (!refreshRequested) return;
    refreshRequested = false;
    window.location.reload();
  });
  void navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).then((registration) => {
    const check = (): void => {
      if (
        shouldPromptUpdate({
          waiting: registration.waiting !== null,
          hasController: navigator.serviceWorker.controller !== null,
        })
      ) {
        showPrompt(registration);
      }
    };
    check();
    registration.addEventListener('updatefound', () => {
      registration.installing?.addEventListener('statechange', check);
    });
  });
}
