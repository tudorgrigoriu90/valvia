import { describe, expect, it } from 'vitest';
import { CATEGORIES, categoriesOfPopulation, isCategory, sortCategories, valueCategory } from './category';

describe('categories (PO-5)', () => {
  it('offers Adults, Children, TEE and Stress echo, in this order', () => {
    expect(CATEGORIES.map((c) => [c.id, c.label])).toEqual([
      ['adult', 'Adults'],
      ['paediatric', 'Children'],
      ['TEE', 'TEE'],
      ['stress', 'Stress echo'],
    ]);
  });

  it('puts transthoracic values (technique absent or TTE) in their age group', () => {
    expect(valueCategory({ population: { ageGroup: 'adult' } })).toBe('adult');
    expect(valueCategory({ population: { ageGroup: 'paediatric' }, technique: 'TTE' })).toBe('paediatric');
  });

  it('puts TEE and stress values in their own category, whatever the age group', () => {
    expect(valueCategory({ population: { ageGroup: 'adult' }, technique: 'TEE' })).toBe('TEE');
    expect(valueCategory({ population: { ageGroup: 'paediatric' }, technique: 'stress' })).toBe('stress');
  });

  it('maps a topic population to categories for topics without values', () => {
    expect(categoriesOfPopulation('adult')).toEqual(['adult']);
    expect(categoriesOfPopulation('paediatric')).toEqual(['paediatric']);
    expect(categoriesOfPopulation('both')).toEqual(['adult', 'paediatric']);
  });

  it('sorts and de-duplicates categories in switch order', () => {
    expect(sortCategories(['stress', 'adult', 'TEE', 'adult'])).toEqual(['adult', 'TEE', 'stress']);
  });

  it('recognises category ids, e.g. from storage', () => {
    expect(isCategory('TEE')).toBe(true);
    expect(isCategory('tee')).toBe(false);
    expect(isCategory(null)).toBe(false);
  });
});
