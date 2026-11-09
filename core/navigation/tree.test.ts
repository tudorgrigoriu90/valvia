import { describe, expect, it } from 'vitest';
import type { LoadedTopic } from '../content/types';
import { buildNavigation } from './tree';

const node = (id: string, parent: string | null, order: number, extra: Partial<LoadedTopic> = {}): LoadedTopic => ({
  id,
  slug: `${id}-slug`,
  title: `Title ${id}`,
  parent,
  order,
  population: 'adult',
  wave: 'W1',
  status: 'draft',
  ...extra,
});
const NOTE = [{ id: 'n', type: 'note', tag: 'METH', text: 'x' }] as NonNullable<LoadedTopic['blocks']>;

const topics = new Map(
  [
    node('vhd', null, 3),
    node('chambers', null, 1),
    node('mitral', 'vhd', 1),
    node('aortic', 'vhd', 0),
    node('mr', 'mitral', 0),
    node('mr-grading', 'mr', 1, { blocks: NOTE }),
    node('mr-mechanism', 'mr', 0),
    node('as', 'aortic', 0),
    node('empty-leaf-with-empty-blocks', 'aortic', 1, { blocks: [] as NonNullable<LoadedTopic['blocks']> }),
  ].map((t) => [t.id, t]),
);
const nav = buildNavigation(topics);

describe('buildNavigation (TS-04.2.2)', () => {
  it('sorts roots and children by order', () => {
    expect(nav.roots().map((t) => t.id)).toEqual(['chambers', 'vhd']);
    expect(nav.children('vhd').map((t) => t.id)).toEqual(['aortic', 'mitral']);
    expect(nav.children('missing')).toEqual([]);
  });

  it('marks a node visible when it or a descendant has blocks (unpopulated nodes are hidden)', () => {
    expect(['vhd', 'mitral', 'mr', 'mr-grading'].every((id) => nav.isVisible(id))).toBe(true);
    expect(
      ['chambers', 'aortic', 'as', 'mr-mechanism', 'empty-leaf-with-empty-blocks', 'missing'].some((id) =>
        nav.isVisible(id),
      ),
    ).toBe(false);
    expect(nav.visibleRoots().map((t) => t.id)).toEqual(['vhd']);
    expect(nav.visibleChildren('mr').map((t) => t.id)).toEqual(['mr-grading']);
  });

  it('builds URL paths from slugs from the root down', () => {
    expect(nav.urlPath('mr-grading')).toBe('vhd-slug/mitral-slug/mr-slug/mr-grading-slug/');
    expect(nav.urlPath('vhd')).toBe('vhd-slug/');
  });

  it('lists ancestors from the root for breadcrumbs', () => {
    expect(nav.ancestors('mr-grading').map((t) => t.id)).toEqual(['vhd', 'mitral', 'mr']);
    expect(nav.ancestors('vhd')).toEqual([]);
  });

  it('distinguishes leaves with content from navigation nodes', () => {
    expect(nav.hasContent('mr-grading')).toBe(true);
    expect(nav.hasContent('mr')).toBe(false);
  });

  it('counts visible leaves below a node (for category cards)', () => {
    expect(nav.visibleLeafCount('vhd')).toBe(1);
    expect(nav.visibleLeafCount('mr-grading')).toBe(1);
    expect(nav.visibleLeafCount('chambers')).toBe(0);
  });

  it('lists every visible node for static page generation', () => {
    expect(nav.visibleNodes().map((t) => t.id)).toEqual(['vhd', 'mitral', 'mr', 'mr-grading']);
  });

  it("derives each node's categories from the values below it, else from the topic population (PO-5)", () => {
    const list = (id: string, values: Record<string, unknown>[]): NonNullable<LoadedTopic['blocks']> =>
      [{ id, type: 'threshold-list', tag: 'CRIT', values }] as unknown as NonNullable<LoadedTopic['blocks']>;
    const tte = { population: { ageGroup: 'adult' } };
    const tee = { population: { ageGroup: 'adult' }, technique: 'TEE' };
    const child = { population: { ageGroup: 'paediatric' }, technique: 'TTE' };
    const tree = buildNavigation(
      new Map(
        [
          node('root', null, 0),
          node('a', 'root', 0, { blocks: list('x', [tte, tee]) }),
          node('b', 'root', 1, { blocks: list('y', [child]) }),
          node('notes', 'root', 2, { population: 'both', blocks: NOTE }),
          node('other', null, 1, { population: 'paediatric' }),
        ].map((t) => [t.id, t]),
      ),
    );
    expect(tree.categories('a')).toEqual(['adult', 'TEE']);
    expect(tree.categories('notes')).toEqual(['adult', 'paediatric']);
    expect(tree.categories('root')).toEqual(['adult', 'paediatric', 'TEE']);
    expect(tree.categories('other')).toEqual(['paediatric']);
    expect(tree.leafCountIn('root', 'TEE')).toBe(1);
    expect(tree.leafCountIn('root', 'paediatric')).toBe(2);
    expect(tree.leafCountIn('root', 'stress')).toBe(0);
  });

  it('throws for unknown ids where a page needs the node', () => {
    expect(() => nav.urlPath('missing')).toThrow("unknown topic 'missing'");
  });
});
