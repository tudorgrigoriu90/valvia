import { describe, expect, it } from 'vitest';
import { readSociety, SOCIETY_KEY, writeSociety } from './society';

const memory = (): Storage => {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  } as unknown as Storage;
};

describe('society filter preference (TS-04.3.5)', () => {
  it('defaults to all, reads valid stored values and ignores others', () => {
    const s = memory();
    expect(readSociety(s)).toBe('all');
    writeSociety(s, 'ase');
    expect(readSociety(s)).toBe('ase');
    s.setItem(SOCIETY_KEY, 'other');
    expect(readSociety(s)).toBe('all');
  });

  it('survives storage that throws', () => {
    const throwing = {
      getItem: () => {
        throw new Error('x');
      },
      setItem: () => {
        throw new Error('x');
      },
    } as unknown as Storage;
    expect(readSociety(throwing)).toBe('all');
    expect(() => {
      writeSociety(throwing, 'esc');
    }).not.toThrow();
  });
});
