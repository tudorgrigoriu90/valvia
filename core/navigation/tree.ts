/**
 * Navigation over the topic tree (TS-04.2.2): ordering, visibility (nodes without content in their subtree are
 * hidden), URL paths built from slugs, breadcrumbs. Framework-free; used by the Astro pages.
 */
import type { LoadedTopic } from '../content/types';

export interface Navigation {
  roots: () => LoadedTopic[];
  children: (id: string) => LoadedTopic[];
  visibleRoots: () => LoadedTopic[];
  visibleChildren: (id: string) => LoadedTopic[];
  visibleNodes: () => LoadedTopic[];
  isVisible: (id: string) => boolean;
  hasContent: (id: string) => boolean;
  visibleLeafCount: (id: string) => number;
  ancestors: (id: string) => LoadedTopic[];
  /** Site-relative path without leading slash, e.g. `valvular-heart-disease/mitral-valve-disease/`. */
  urlPath: (id: string) => string;
}

const byOrder = (a: LoadedTopic, b: LoadedTopic): number => a.order - b.order || a.id.localeCompare(b.id);

export function buildNavigation(topics: ReadonlyMap<string, LoadedTopic>): Navigation {
  const childrenOf = new Map<string | null, LoadedTopic[]>();
  for (const topic of topics.values()) childrenOf.set(topic.parent, [...(childrenOf.get(topic.parent) ?? []), topic]);
  for (const list of childrenOf.values()) list.sort(byOrder);

  const get = (id: string): LoadedTopic => {
    const topic = topics.get(id);
    if (topic === undefined) throw new Error(`unknown topic '${id}'`);
    return topic;
  };
  const children = (id: string | null): LoadedTopic[] => childrenOf.get(id) ?? [];
  const hasContent = (id: string): boolean => (topics.get(id)?.blocks ?? []).length > 0;

  const leafCounts = new Map<string, number>();
  const leafCount = (id: string): number => {
    const cached = leafCounts.get(id);
    if (cached !== undefined) return cached;
    const own = hasContent(id) ? 1 : 0;
    const total = children(id).reduce((sum, child) => sum + leafCount(child.id), own);
    leafCounts.set(id, total);
    return total;
  };
  const isVisible = (id: string): boolean => topics.has(id) && leafCount(id) > 0;

  const ancestors = (id: string): LoadedTopic[] => {
    const chain: LoadedTopic[] = [];
    let parent = get(id).parent;
    while (parent !== null) {
      const topic = get(parent);
      chain.unshift(topic);
      parent = topic.parent;
    }
    return chain;
  };

  const visibleIn = (list: LoadedTopic[]): LoadedTopic[] => list.filter((t) => isVisible(t.id));
  const visibleNodes = (): LoadedTopic[] => {
    const out: LoadedTopic[] = [];
    const walk = (id: string | null): void => {
      for (const child of visibleIn(children(id))) {
        out.push(child);
        walk(child.id);
      }
    };
    walk(null);
    return out;
  };

  return {
    roots: () => children(null),
    children: (id) => children(id),
    visibleRoots: () => visibleIn(children(null)),
    visibleChildren: (id) => visibleIn(children(id)),
    visibleNodes,
    isVisible,
    hasContent,
    visibleLeafCount: leafCount,
    ancestors,
    urlPath: (id) => [...ancestors(id), get(id)].map((t) => `${t.slug}/`).join(''),
  };
}
