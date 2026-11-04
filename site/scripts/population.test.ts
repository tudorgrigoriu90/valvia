import { describe, expect, it } from 'vitest';
import { POPULATION_KEY, readPopulation, writePopulation } from './population';

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

describe('population preference (TS-04.7.1)', () => {
  it('defaults to adult and reads a stored paediatric choice', () => {
    expect(readPopulation(storage())).toBe('adult');
    expect(readPopulation(storage({ [POPULATION_KEY]: 'paediatric' }))).toBe('paediatric');
    expect(readPopulation(storage({ [POPULATION_KEY]: 'nonsense' }))).toBe('adult');
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
    expect(readPopulation(throwing)).toBe('adult');
    expect(() => {
      writePopulation(throwing, 'paediatric');
    }).not.toThrow();
  });

  it('writes the choice', () => {
    const s = storage();
    writePopulation(s, 'paediatric');
    expect(s.getItem(POPULATION_KEY)).toBe('paediatric');
  });
});
