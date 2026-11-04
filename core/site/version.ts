/** Content version and review status shown on every page (TS-04.5.2, decision PO-3). */
import type { TopicNode } from '../../schema/generated/topic';

export function contentVersion(env: Readonly<Record<string, string | undefined>>): string {
  if (env.VALVIA_VERSION !== undefined && env.VALVIA_VERSION !== '') return env.VALVIA_VERSION;
  if (env.GITHUB_SHA !== undefined && env.GITHUB_SHA !== '') return env.GITHUB_SHA.slice(0, 7);
  return 'dev';
}

export interface ReviewStatus {
  reviewed: boolean;
  label: string;
}

export function reviewStatus(topic: Pick<TopicNode, 'status' | 'lastReviewed'>): ReviewStatus {
  switch (topic.status) {
    case 'draft':
      return { reviewed: false, label: 'Draft: not yet clinically reviewed' };
    case 'in-review':
      return { reviewed: false, label: 'In clinical review' };
    case 'published':
      return {
        reviewed: true,
        label: topic.lastReviewed === undefined ? 'Reviewed' : `Last reviewed: ${topic.lastReviewed}`,
      };
  }
}
