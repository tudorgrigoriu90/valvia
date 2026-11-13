/**
 * Errata detection (TS-06.1.5): asks Crossref, for every registered source with a DOI, which works update it
 * (errata, corrections, retractions, ...). Each notice becomes a candidate linked to the source, so the values taken
 * from that source get checked against the correction. Anonymous Crossref API, one request per source.
 */
import type { FetchJson } from './pubmed';
import type { Candidate } from './state';

export interface RegisteredSource {
  id: string;
  doi: string;
}

export function updatesUrl(doi: string): string {
  const url = new URL('https://api.crossref.org/works');
  url.search = new URLSearchParams({ filter: `updates:${doi.toLowerCase()}`, rows: '100' }).toString();
  return url.href;
}

interface Relation {
  DOI: string;
  type: string;
  updated?: { 'date-parts'?: number[][] };
}

interface Work {
  DOI: string;
  title?: string[];
  'container-title'?: string[];
  'update-to'?: Relation[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isWork = (value: unknown): value is Work => isRecord(value) && typeof value.DOI === 'string';

const datePart = (parts: number[] | undefined): string =>
  (parts ?? []).map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, '0'))).join('-');

const capitalised = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

export function parseUpdates(json: unknown, source: RegisteredSource): Candidate[] {
  const message = isRecord(json) ? json.message : undefined;
  const items = isRecord(message) ? message.items : undefined;
  if (!Array.isArray(items)) throw new Error('unexpected Crossref response: no items');
  const target = source.doi.toLowerCase();
  return items.flatMap((item: unknown) => {
    if (!isWork(item)) throw new Error('unexpected Crossref response: item without DOI');
    return (item['update-to'] ?? [])
      .filter((relation) => relation.DOI.toLowerCase() === target)
      .map((relation) => ({
        origin: 'crossref' as const,
        doi: item.DOI,
        pmid: undefined,
        journal: item['container-title']?.[0] ?? '',
        date: datePart(relation.updated?.['date-parts']?.[0]),
        title: `${capitalised(relation.type)}: ${item.title?.[0] ?? ''}`,
        updates: { source: source.id, kind: relation.type },
      }));
  });
}

export async function fetchErrata(fetchJson: FetchJson, sources: readonly RegisteredSource[]): Promise<Candidate[]> {
  const found: Candidate[] = [];
  for (const source of sources) found.push(...parseUpdates(await fetchJson(updatesUrl(source.doi)), source));
  return found;
}
