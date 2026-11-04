/**
 * Content status (TS-03.0.2): per root category, how many leaves exist, how many have content and their
 * editorial status. A root without children counts as its own leaf.
 */
import type { LoadedTopic } from '../content/types';
import type { Navigation } from '../navigation/tree';

export interface Counts {
  leaves: number;
  populated: number;
  draft: number;
  inReview: number;
  published: number;
}

export interface CategoryStatus extends Counts {
  id: string;
  title: string;
  wave: LoadedTopic['wave'];
}

const empty = (): Counts => ({ leaves: 0, populated: 0, draft: 0, inReview: 0, published: 0 });

function leavesOf(navigation: Navigation, topic: LoadedTopic): LoadedTopic[] {
  const children = navigation.children(topic.id);
  return children.length === 0 ? [topic] : children.flatMap((child) => leavesOf(navigation, child));
}

function add(counts: Counts, leaf: LoadedTopic, navigation: Navigation): void {
  counts.leaves += 1;
  if (!navigation.hasContent(leaf.id)) return;
  counts.populated += 1;
  if (leaf.status === 'draft') counts.draft += 1;
  else if (leaf.status === 'in-review') counts.inReview += 1;
  else counts.published += 1;
}

export function contentStatus(navigation: Navigation): { categories: CategoryStatus[]; totals: Counts } {
  const totals = empty();
  const categories = navigation.roots().map((root) => {
    const counts = empty();
    for (const leaf of leavesOf(navigation, root)) {
      add(counts, leaf, navigation);
      add(totals, leaf, navigation);
    }
    return { id: root.id, title: root.title, wave: root.wave, ...counts };
  });
  return { categories, totals };
}
