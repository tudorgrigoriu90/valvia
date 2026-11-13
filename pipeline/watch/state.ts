/**
 * Source-watcher state and deduplication (TS-06.1.4). The weekly watcher (EP-06) remembers every document it has
 * reported, keyed by PMID and DOI, in a JSON file committed to the repository, so each new document is reported
 * once. Documents already in the source registry are never reported.
 */
export interface Candidate {
  /** Which query found it. */
  origin: 'pubmed' | 'crossref' | 'page';
  title: string;
  journal: string;
  /** Publication date as reported (YYYY-MM-DD or YYYY-MM or YYYY). */
  date: string;
  pmid?: string | undefined;
  doi?: string | undefined;
  /** PubMed Central id of the article itself (free full text), when PubMed lists one (TS-06.2.3). */
  pmcid?: string | undefined;
  /** Document page found by a page watcher (TS-06.1.3). */
  url?: string | undefined;
  /** Set for an erratum, correction or retraction of a registered source (TS-06.1.5). */
  updates?: { source: string; kind: string } | undefined;
}

export interface WatchState {
  version: 1;
  /** Date of the last completed run (YYYY-MM-DD). */
  lastRun?: string;
  /** 'pmid:…' / 'doi:…' → date first reported. */
  seen: Record<string, string>;
  /** Watched page URL → hash of its relevant content (TS-06.1.3). */
  pages: Record<string, string>;
}

export const EMPTY_STATE: WatchState = { version: 1, seen: {}, pages: {} };

export function candidateKeys(candidate: Candidate): string[] {
  const keys: string[] = [];
  if (candidate.pmid !== undefined) keys.push(`pmid:${candidate.pmid}`);
  if (candidate.doi !== undefined) keys.push(`doi:${candidate.doi.toLowerCase()}`);
  if (candidate.url !== undefined) keys.push(`url:${candidate.url}`);
  return keys;
}

export function newCandidates(
  candidates: readonly Candidate[],
  state: WatchState,
  registryDois: ReadonlySet<string>,
): Candidate[] {
  const registry = new Set([...registryDois].map((doi) => doi.toLowerCase()));
  const taken = new Set(Object.keys(state.seen));
  const result: Candidate[] = [];
  for (const candidate of candidates) {
    const keys = candidateKeys(candidate);
    if (keys.length === 0 || keys.some((key) => taken.has(key))) continue;
    if (candidate.doi !== undefined && registry.has(candidate.doi.toLowerCase())) continue;
    keys.forEach((key) => taken.add(key));
    result.push(candidate);
  }
  return result;
}

export function markSeen(state: WatchState, candidates: readonly Candidate[], date: string): WatchState {
  const seen = { ...state.seen };
  for (const key of candidates.flatMap(candidateKeys)) seen[key] ??= date;
  return { ...state, lastRun: date, seen };
}

const sorted = (record: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)));

export function serializeState(state: WatchState): string {
  return `${JSON.stringify({ ...state, seen: sorted(state.seen), pages: sorted(state.pages) }, null, 2)}\n`;
}

const isStringRecord = (value: unknown): value is Record<string, string> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every((entry) => typeof entry === 'string');

export function parseState(text: string | undefined): WatchState {
  if (text === undefined) return EMPTY_STATE;
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('watcher state file is not valid JSON');
  }
  const { version, lastRun, seen, pages } = (typeof data === 'object' && data !== null ? data : {}) as Record<
    string,
    unknown
  >;
  if (version !== 1) throw new Error('watcher state file: unsupported version');
  if (!isStringRecord(seen)) throw new Error('watcher state file: seen must map keys to dates');
  if (!isStringRecord(pages)) throw new Error('watcher state file: pages must map URLs to hashes');
  if (lastRun !== undefined && typeof lastRun !== 'string')
    throw new Error('watcher state file: lastRun must be a date');
  return lastRun === undefined ? { version, seen, pages } : { version, lastRun, seen, pages };
}
