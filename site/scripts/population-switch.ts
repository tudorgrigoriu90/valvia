/** Applies the adult/paediatric preference to <html data-population> and wires the header switch. */
import { readPopulation, writePopulation, type Population } from './population';

const storage = (() => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
})();

function apply(population: Population): void {
  document.documentElement.dataset.population = population;
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-population-choice]')) {
    button.setAttribute('aria-pressed', String(button.dataset.populationChoice === population));
  }
}

apply(readPopulation(storage));
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-population-choice]')) {
  button.addEventListener('click', () => {
    const choice: Population = button.dataset.populationChoice === 'paediatric' ? 'paediatric' : 'adult';
    writePopulation(storage, choice);
    apply(choice);
  });
}
