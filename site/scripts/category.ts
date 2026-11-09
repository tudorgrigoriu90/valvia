/**
 * Category preference (decision PO-5: Adults, Children, TEE, Stress echo), stored on the device. Replaces the
 * adult/paediatric preference of TS-04.7.1, whose stored choice is still honoured. Every access tolerates blocked
 * storage.
 */
import { isCategory, type Category } from '../../core/population/category';

export const CATEGORY_KEY = 'valvia.category';
export const LEGACY_POPULATION_KEY = 'valvia.population';

export function readCategory(storage: Storage | undefined): Category {
  try {
    const stored = storage?.getItem(CATEGORY_KEY) ?? storage?.getItem(LEGACY_POPULATION_KEY);
    return isCategory(stored) ? stored : 'adult';
  } catch {
    return 'adult';
  }
}

export function writeCategory(storage: Storage | undefined, category: Category): void {
  try {
    storage?.setItem(CATEGORY_KEY, category);
  } catch {
    // Storage unavailable: the choice applies to this page view only.
  }
}
