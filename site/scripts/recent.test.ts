import { describe, expect, it } from 'vitest';
import { RECENT_KEY, RECENT_MAX, clearRecent, readRecent, recordVisit, writeRecent, type RecentTopic } from './recent';

const storage = (initial: Record<string, string> = {}): Storage & { data: Map<string, string> } => {
  const data = new Map(Object.entries(initial));
  return {
    data,
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
const throwing = {
  getItem: () => {
    throw new Error('denied');
  },
  setItem: () => {
    throw new Error('denied');
  },
  removeItem: () => {
    throw new Error('denied');
  },
} as unknown as Storage;

const topic = (n: number): RecentTopic => ({ path: `root/leaf-${String(n)}/`, title: `Leaf ${String(n)}` });

describe('recordVisit (TS-04.6.1)', () => {
  it('puts the visited topic first', () => {
    expect(recordVisit([topic(1), topic(2)], topic(3))).toEqual([topic(3), topic(1), topic(2)]);
  });

  it('moves a revisited topic to the front without duplicating it', () => {
    expect(recordVisit([topic(1), topic(2), topic(3)], topic(2))).toEqual([topic(2), topic(1), topic(3)]);
  });

  it('keeps the last 10 topics', () => {
    const many = Array.from({ length: RECENT_MAX }, (_, i) => topic(i));
    const next = recordVisit(many, topic(99));
    expect(RECENT_MAX).toBe(10);
    expect(next).toHaveLength(10);
    expect(next[0]).toEqual(topic(99));
    expect(next).not.toContainEqual(topic(9));
  });

  it('updates the title of a revisited topic', () => {
    expect(recordVisit([{ path: 'a/', title: 'Old' }], { path: 'a/', title: 'New' })).toEqual([
      { path: 'a/', title: 'New' },
    ]);
  });
});

describe('readRecent / writeRecent', () => {
  it('round-trips through storage', () => {
    const s = storage();
    writeRecent(s, [topic(1), topic(2)]);
    expect(readRecent(s)).toEqual([topic(1), topic(2)]);
  });

  it('returns an empty list when nothing is stored, the JSON is broken or not a list', () => {
    expect(readRecent(storage())).toEqual([]);
    expect(readRecent(storage({ [RECENT_KEY]: '{oops' }))).toEqual([]);
    expect(readRecent(storage({ [RECENT_KEY]: '{"path":"a/"}' }))).toEqual([]);
    expect(readRecent(undefined)).toEqual([]);
  });

  it('drops entries that are not safe site paths or have no title (stored data is untrusted)', () => {
    const stored = JSON.stringify([
      topic(1),
      { path: 'javascript:alert(1)', title: 'x' },
      { path: '//evil.example/', title: 'x' },
      { path: 'root/Leaf/', title: 'x' },
      { path: 'root/leaf-2/', title: '' },
      { path: 'root/leaf-3/', title: 'y'.repeat(201) },
      { path: 'root/leaf-4/' },
      'root/leaf-5/',
      null,
    ]);
    expect(readRecent(storage({ [RECENT_KEY]: stored }))).toEqual([topic(1)]);
  });

  it('never returns more than 10 entries', () => {
    const stored = JSON.stringify(Array.from({ length: 15 }, (_, i) => topic(i)));
    expect(readRecent(storage({ [RECENT_KEY]: stored }))).toHaveLength(10);
  });

  it('clears the list', () => {
    const s = storage({ [RECENT_KEY]: JSON.stringify([topic(1)]) });
    clearRecent(s);
    expect(s.data.has(RECENT_KEY)).toBe(false);
  });

  it('survives storage that throws (private mode, blocked site data)', () => {
    expect(readRecent(throwing)).toEqual([]);
    expect(() => {
      writeRecent(throwing, [topic(1)]);
    }).not.toThrow();
    expect(() => {
      clearRecent(throwing);
    }).not.toThrow();
  });
});
