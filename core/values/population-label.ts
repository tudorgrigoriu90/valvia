/** Human label for population qualifiers, used for table rows and columns (e.g. 'Female · Atrial fibrillation'). */
import type { LoadedValue } from '../content/types';

type Population = LoadedValue['population'];
interface Band {
  min?: number;
  max?: number;
  label?: string;
}

function band(b: Band | undefined, unit: string): string | undefined {
  if (b === undefined) return undefined;
  if (b.label !== undefined) return b.label;
  if (b.min !== undefined && b.max !== undefined) return `${String(b.min)} to <${String(b.max)} ${unit}`;
  if (b.min !== undefined) return `≥ ${String(b.min)} ${unit}`;
  return `< ${String(b.max)} ${unit}`;
}

export function populationLabel(population: Population): string {
  const ageBand = population.ageBand as (Band & { unit: string }) | undefined;
  const bsaBand = population.bsaBand as Band | undefined;
  const bsa = band(bsaBand, 'm²');
  return [
    population.ageGroup === 'paediatric' ? 'Children' : undefined,
    population.sex === undefined ? undefined : population.sex === 'male' ? 'Male' : 'Female',
    band(ageBand, ageBand?.unit ?? 'years'),
    bsa === undefined || bsaBand?.label !== undefined ? bsa : `BSA ${bsa}`,
    population.rhythm === undefined
      ? undefined
      : population.rhythm === 'sinus'
        ? 'Sinus rhythm'
        : 'Atrial fibrillation',
  ]
    .filter((part) => part !== undefined)
    .join(' · ');
}
