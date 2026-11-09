import { describe, expect, it } from 'vitest';
import { CATEGORY_KEY, LEGACY_POPULATION_KEY, readCategory, writeCategory } from './category';

const storage = (initial: Record<string, string> = {}): Storage => {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    clear: () => {
      data.clear();
    },
    key: () => null,
    get length() {
      return data.size;
    },
  };
};

describe('category preference (PO-5, replaces the TS-04.7.1 population preference)', () => {
  it('defaults to adults and reads any stored category', () => {
    expect(readCategory(storage())).toBe('adult');
    for (const category of ['paediatric', 'TEE', 'stress'] as const) {
      expect(readCategory(storage({ [CATEGORY_KEY]: category }))).toBe(category);
    }
    expect(readCategory(storage({ [CATEGORY_KEY]: 'nonsense' }))).toBe('adult');
  });

  it('keeps a children choice stored by the earlier adult/paediatric switch', () => {
    expect(readCategory(storage({ [LEGACY_POPULATION_KEY]: 'paediatric' }))).toBe('paediatric');
    expect(readCategory(storage({ [LEGACY_POPULATION_KEY]: 'paediatric', [CATEGORY_KEY]: 'TEE' }))).toBe('TEE');
  });

  it('survives storage that throws (private mode, blocked site data)', () => {
    const throwing = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
    } as unknown as Storage;
    expect(readCategory(throwing)).toBe('adult');
    expect(readCategory(undefined)).toBe('adult');
    expect(() => {
      writeCategory(throwing, 'stress');
    }).not.toThrow();
  });

  it('writes the choice', () => {
    const s = storage();
    writeCategory(s, 'stress');
    expect(s.getItem(CATEGORY_KEY)).toBe('stress');
  });
});
