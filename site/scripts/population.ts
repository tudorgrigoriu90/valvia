/** Adult/paediatric preference (TS-04.7.1), stored on the device; every access tolerates blocked storage. */
export type Population = 'adult' | 'paediatric';
export const POPULATION_KEY = 'valvia.population';

export function readPopulation(storage: Storage | undefined): Population {
  try {
    return storage?.getItem(POPULATION_KEY) === 'paediatric' ? 'paediatric' : 'adult';
  } catch {
    return 'adult';
  }
}

export function writePopulation(storage: Storage | undefined, population: Population): void {
  try {
    storage?.setItem(POPULATION_KEY, population);
  } catch {
    // Storage unavailable: the choice applies to this page view only.
  }
}
