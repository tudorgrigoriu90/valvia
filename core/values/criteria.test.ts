import { describe, expect, it } from 'vitest';
import { CATEGORY_LABELS, describeLocator } from './criteria';

describe('CATEGORY_LABELS (TS-04.3.2)', () => {
  it('pairs every feasibility category with a text label and a symbol (never colour alone)', () => {
    expect(CATEGORY_LABELS).toEqual({
      favourable: { label: 'Favourable', symbol: '✓' },
      challenging: { label: 'Challenging', symbol: '!' },
      unsuitable: { label: 'Unsuitable', symbol: '✕' },
    });
  });
});

describe('describeLocator', () => {
  it('lists the locator parts in reading order', () => {
    expect(describeLocator({ table: '8', page: '332' })).toBe('Table 8, p. 332');
    expect(describeLocator({ figure: '18', section: '4.2', page: 'e45' })).toBe('Figure 18, Section 4.2, p. e45');
  });
});
