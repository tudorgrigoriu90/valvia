import { describe, expect, it } from 'vitest';
import { populationLabel } from './population-label';

describe('populationLabel', () => {
  it.each([
    [{ ageGroup: 'adult' }, ''],
    [{ ageGroup: 'adult', sex: 'male' }, 'Male'],
    [{ ageGroup: 'adult', sex: 'female', rhythm: 'atrial-fibrillation' }, 'Female · Atrial fibrillation'],
    [{ ageGroup: 'adult', rhythm: 'sinus' }, 'Sinus rhythm'],
    [{ ageGroup: 'adult', ageBand: { min: 40, max: 60, unit: 'years', label: '40–59 years' } }, '40–59 years'],
    [{ ageGroup: 'adult', ageBand: { min: 20, max: 40, unit: 'years' } }, '20 to <40 years'],
    [{ ageGroup: 'adult', ageBand: { min: 60, unit: 'years' } }, '≥ 60 years'],
    [{ ageGroup: 'paediatric', ageBand: { max: 28, unit: 'days' } }, 'Children · < 28 days'],
    [{ ageGroup: 'adult', bsaBand: { max: 1.8 } }, 'BSA < 1.8 m²'],
    [{ ageGroup: 'adult', bsaBand: { min: 1.8, max: 2.2, label: 'BSA 1.8–2.2 m²' } }, 'BSA 1.8–2.2 m²'],
  ] as const)('labels %j as %j', (population, label) => {
    expect(populationLabel(population)).toBe(label);
  });
});
