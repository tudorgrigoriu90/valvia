import { describe, expect, it } from 'vitest';
import type { LoadedTopic } from '../content/types';
import { buildNavigation } from '../navigation/tree';
import { contentStatus } from './status';

const node = (id: string, parent: string | null, extra: Partial<LoadedTopic> = {}): LoadedTopic => ({
  id,
  slug: id,
  title: `T ${id}`,
  parent,
  order: 0,
  population: 'adult',
  wave: 'W1',
  status: 'draft',
  ...extra,
});
const NOTE = [{ id: 'n', type: 'note', tag: 'METH', text: 'x' }] as NonNullable<LoadedTopic['blocks']>;

describe('contentStatus (TS-03.0.2)', () => {
  it('counts leaves, populated leaves and statuses per root category, with totals', () => {
    const topics = new Map(
      [
        node('a', null, { wave: 'W1' }),
        node('a1', 'a', { blocks: NOTE }),
        node('a2', 'a', { blocks: NOTE, status: 'published' }),
        node('a3', 'a'),
        node('b', null, { wave: 'W2' }),
        node('b1', 'b', { status: 'in-review', blocks: NOTE }),
        node('c', null),
      ].map((t) => [t.id, t]),
    );
    const status = contentStatus(buildNavigation(topics));
    expect(status.categories).toEqual([
      { id: 'a', title: 'T a', wave: 'W1', leaves: 3, populated: 2, draft: 1, inReview: 0, published: 1 },
      { id: 'b', title: 'T b', wave: 'W2', leaves: 1, populated: 1, draft: 0, inReview: 1, published: 0 },
      { id: 'c', title: 'T c', wave: 'W1', leaves: 1, populated: 0, draft: 0, inReview: 0, published: 0 },
    ]);
    expect(status.totals).toEqual({ leaves: 5, populated: 3, draft: 1, inReview: 1, published: 1 });
  });
});
