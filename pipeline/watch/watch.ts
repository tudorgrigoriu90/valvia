/**
 * One watcher run (TS-06.1.1): query PubMed for new documents and Crossref for errata of registered sources, keep only
 * candidates not reported before, render one issue each and return the new state. I/O is injected; the CLI and the
 * weekly workflow do the fetching, issue creation and commit.
 */
import type { ContentBundle } from '../../core/content/types';
import { buildNavigation } from '../../core/navigation/tree';
import { blockCitations } from '../../core/values/citations';
import { fetchErrata, type RegisteredSource } from './errata';
import { candidateIssue, type Issue, type IssueContext, type TopicLink } from './issue';
import { fetchPubmedCandidates, type FetchJson } from './pubmed';
import { markSeen, newCandidates, type WatchState } from './state';

const FIRST_RUN_DAYS = 14;

export function watchWindow(state: WatchState, today: string): { since: string; until: string } {
  if (state.lastRun !== undefined) return { since: state.lastRun, until: today };
  const since = new Date(`${today}T00:00:00Z`);
  since.setUTCDate(since.getUTCDate() - FIRST_RUN_DAYS);
  return { since: since.toISOString().slice(0, 10), until: today };
}

export const registeredDois = (bundle: ContentBundle): Set<string> =>
  new Set([...bundle.sources.values()].flatMap((source) => (source.doi === undefined ? [] : [source.doi])));

export const sourcesWithDoi = (bundle: ContentBundle): RegisteredSource[] =>
  [...bundle.sources.values()].flatMap((source) =>
    source.doi === undefined ? [] : [{ id: source.id, doi: source.doi }],
  );

/** Sources and, per source, the visible topics citing it (absolute URLs under `siteUrl`, which ends with '/'). */
export function issueContext(bundle: ContentBundle, siteUrl: string): IssueContext {
  const navigation = buildNavigation(bundle.topics);
  const topicsBySource = new Map<string, TopicLink[]>();
  for (const topic of navigation.visibleNodes()) {
    const cited = new Set((topic.blocks ?? []).flatMap((block) => blockCitations(block).map((c) => c.source)));
    for (const source of cited) {
      const link = { id: topic.id, title: topic.title, url: new URL(navigation.urlPath(topic.id), siteUrl).href };
      topicsBySource.set(source, [...(topicsBySource.get(source) ?? []), link]);
    }
  }
  const sources = [...bundle.sources.values()].map(({ id, title, year }) => ({ id, title, year }));
  return { sources, topicsBySource };
}

export interface WatchOptions {
  fetchJson: FetchJson;
  state: WatchState;
  /** Today's date (YYYY-MM-DD, UTC). */
  today: string;
  context: IssueContext;
  registry: ReadonlySet<string>;
  sourcesWithDoi: readonly RegisteredSource[];
}

export async function runWatch(options: WatchOptions): Promise<{ issues: Issue[]; state: WatchState }> {
  const { since, until } = watchWindow(options.state, options.today);
  const found = [
    ...(await fetchPubmedCandidates(options.fetchJson, since, until)),
    ...(await fetchErrata(options.fetchJson, options.sourcesWithDoi)),
  ];
  const fresh = newCandidates(found, options.state, options.registry);
  return {
    issues: fresh.map((candidate) => candidateIssue(candidate, options.context)),
    state: markSeen(options.state, fresh, options.today),
  };
}
