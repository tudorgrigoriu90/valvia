/** Applies the society filter to <html data-society> and wires the filter buttons (TS-04.3.5). */
import { readSociety, writeSociety, type SocietyFilter } from './society';

const storage = (() => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
})();

function apply(value: SocietyFilter): void {
  document.documentElement.dataset.society = value;
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-society-choice]')) {
    button.setAttribute('aria-pressed', String(button.dataset.societyChoice === value));
  }
}

apply(readSociety(storage));
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-society-choice]')) {
  button.addEventListener('click', () => {
    const choice = button.dataset.societyChoice;
    const value: SocietyFilter = choice === 'esc' || choice === 'ase' ? choice : 'all';
    writeSociety(storage, value);
    apply(value);
  });
}
