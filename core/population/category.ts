/**
 * Main categories of the site (decision PO-5): Adults, Children, TEE and Stress echo. Transthoracic values belong
 * to their age group; TEE and stress values form their own category. Safety-critical (hazard: value shown for the
 * wrong population): 100 % coverage.
 */
import type { Value } from '../../schema/generated/topic';

export type Category = 'adult' | 'paediatric' | 'TEE' | 'stress';

export const CATEGORIES: readonly { id: Category; label: string }[] = [
  { id: 'adult', label: 'Adults' },
  { id: 'paediatric', label: 'Children' },
  { id: 'TEE', label: 'TEE' },
  { id: 'stress', label: 'Stress echo' },
];

const ORDER: readonly Category[] = CATEGORIES.map((c) => c.id);

export function valueCategory(value: Pick<Value, 'population' | 'technique'>): Category {
  if (value.technique === 'TEE' || value.technique === 'stress') return value.technique;
  return value.population.ageGroup;
}

export function categoriesOfPopulation(population: 'adult' | 'paediatric' | 'both'): Category[] {
  return population === 'both' ? ['adult', 'paediatric'] : [population];
}

export function sortCategories(categories: Iterable<Category>): Category[] {
  const present = new Set(categories);
  return ORDER.filter((id) => present.has(id));
}

export const isCategory = (text: string | null | undefined): text is Category => ORDER.some((id) => id === text);
