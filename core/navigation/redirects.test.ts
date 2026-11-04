import { describe, expect, it } from 'vitest';
import type { LoadedTopic } from '../content/types';
import { redirects } from './redirects';
import { buildNavigation } from './tree';

const NOTE = [{ id: 'n', type: 'note', tag: 'METH', text: 'x' }] as NonNullable<LoadedTopic['blocks']>;
const node = (id: string, parent: string | null, extra: Partial<LoadedTopic> = {}): LoadedTopic => ({
  id,
  slug: id,
  title: id,
  parent,
  order: 0,
  population: 'adult',
  wave: 'W1',
  status: 'draft',
  ...extra,
});

describe('redirects (TS-02.1.3)', () => {
  it('redirects former slugs of a node and of all its visible descendants to the current URLs', () => {
    const topics = new Map(
      [
        node('vhd', null, { formerSlugs: ['valves'] }),
        node('mitral', 'vhd', { formerSlugs: ['mv', 'mitral-valve'] }),
        node('mr', 'mitral', { blocks: NOTE }),
        node('hidden', 'vhd', { formerSlugs: ['gone'] }),
      ].map((t) => [t.id, t]),
    );
    expect(redirects(buildNavigation(topics))).toEqual([
      { from: 'valves/', to: 'vhd/' },
      { from: 'valves/mitral/', to: 'vhd/mitral/' },
      { from: 'valves/mitral/mr/', to: 'vhd/mitral/mr/' },
      { from: 'vhd/mv/', to: 'vhd/mitral/' },
      { from: 'vhd/mv/mr/', to: 'vhd/mitral/mr/' },
      { from: 'vhd/mitral-valve/', to: 'vhd/mitral/' },
      { from: 'vhd/mitral-valve/mr/', to: 'vhd/mitral/mr/' },
    ]);
  });

  it('returns nothing when no slug was renamed', () => {
    const topics = new Map([node('a', null, { blocks: NOTE })].map((t) => [t.id, t]));
    expect(redirects(buildNavigation(topics))).toEqual([]);
  });
});
