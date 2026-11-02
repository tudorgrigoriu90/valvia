import { describe, expect, it } from 'vitest';
import { resultCountLabel, toResultItems } from './search-model';

describe('toResultItems (TS-04.4.2)', () => {
  it('maps Pagefind data to title, context and url, with a fallback title', () => {
    expect(
      toResultItems([
        {
          url: '/valvia/a/',
          meta: { title: 'Primary MR: severity grading', context: 'Valvular heart disease › Mitral valve disease' },
        },
        { url: '/valvia/b/', meta: {} },
      ]),
    ).toEqual([
      {
        title: 'Primary MR: severity grading',
        context: 'Valvular heart disease › Mitral valve disease',
        url: '/valvia/a/',
      },
      { title: '/valvia/b/', context: '', url: '/valvia/b/' },
    ]);
  });
});

describe('resultCountLabel', () => {
  it.each([
    [0, 'No results'],
    [1, '1 result'],
    [7, '7 results'],
  ])('labels %i as %j', (count, label) => {
    expect(resultCountLabel(count)).toBe(label);
  });
});
