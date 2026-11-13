/**
 * PubMed watcher (TS-06.1.2): finds guideline-type documents about echocardiography and imaging added to PubMed in the
 * watch window, in the ESC and ASE journals. NCBI E-utilities, anonymous (no API key, no e-mail; `tool=valvia`).
 * Responses are checked for shape so an API change fails the run instead of silently reporting nothing.
 */
import type { Candidate } from './state';

const EUTILS = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

/** NLM journal title abbreviations: ASE (JASE) and ESC journals that publish imaging documents. */
export const JOURNALS = [
  'J Am Soc Echocardiogr',
  'Eur Heart J',
  'Eur Heart J Cardiovasc Imaging',
  'Eur J Heart Fail',
] as const;

const DOCUMENT_TYPES = [
  'Practice Guideline[pt]',
  'Guideline[pt]',
  'Consensus Development Conference[pt]',
  'guideline*[ti]',
  'recommendation*[ti]',
  'consensus[ti]',
  '"position statement"[ti]',
  '"position paper"[ti]',
  '"standardized definitions"[ti]',
];

const TOPICS = ['echocardiogra*[tiab]', 'imaging[ti]', '"cardiac ultrasound"[tiab]'];

/** Publication types that are never new guidance (errata are handled by the Crossref watcher, TS-06.1.5). */
const NOT_GUIDANCE = new Set(['Comment', 'Editorial', 'Letter', 'Published Erratum', 'News']);

const anyOf = (terms: readonly string[]): string => `(${terms.join(' OR ')})`;

export const searchTerm = (): string =>
  [anyOf(JOURNALS.map((journal) => `"${journal}"[ta]`)), anyOf(DOCUMENT_TYPES), anyOf(TOPICS)].join(' AND ');

const eutilsDate = (iso: string): string => iso.replaceAll('-', '/');

export function esearchUrl(since: string, until: string): string {
  const url = new URL(`${EUTILS}/esearch.fcgi`);
  url.search = new URLSearchParams({
    db: 'pubmed',
    term: searchTerm(),
    datetype: 'edat',
    mindate: eutilsDate(since),
    maxdate: eutilsDate(until),
    retmode: 'json',
    retmax: '200',
    tool: 'valvia',
  }).toString();
  return url.href;
}

export function esummaryUrl(ids: readonly string[]): string {
  const url = new URL(`${EUTILS}/esummary.fcgi`);
  url.search = new URLSearchParams({ db: 'pubmed', id: ids.join(','), retmode: 'json', tool: 'valvia' }).toString();
  return url.href;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

export function parseEsearch(json: unknown): string[] {
  const result = isRecord(json) ? json.esearchresult : undefined;
  const ids = isRecord(result) ? result.idlist : undefined;
  if (!isStringArray(ids)) throw new Error('unexpected esearch response: no idlist');
  return ids;
}

interface Summary {
  uid: string;
  title: string;
  source: string;
  pubdate?: string;
  sortpubdate?: string;
  pubtype?: string[];
  articleids?: { idtype: string; value: string }[];
}

const isSummary = (value: unknown): value is Summary =>
  isRecord(value) &&
  typeof value.uid === 'string' &&
  typeof value.title === 'string' &&
  typeof value.source === 'string';

function isoDate(summary: Summary): string {
  const sort = /^(\d{4})\/(\d{2})\/(\d{2})/.exec(summary.sortpubdate ?? '');
  if (sort !== null) return `${String(sort[1])}-${String(sort[2])}-${String(sort[3])}`;
  return /^\d{4}/.exec(summary.pubdate ?? '')?.[0] ?? '';
}

export function parseEsummary(json: unknown): Candidate[] {
  const result = isRecord(json) ? json.result : undefined;
  const uids = isRecord(result) ? result.uids : undefined;
  if (!isRecord(result) || !isStringArray(uids)) throw new Error('unexpected esummary response: no uids');
  return uids.flatMap((uid) => {
    const summary = result[uid];
    if (!isSummary(summary)) throw new Error(`unexpected esummary response: record ${uid}`);
    if ((summary.pubtype ?? []).some((type) => NOT_GUIDANCE.has(type))) return [];
    const doi = summary.articleids?.find((id) => id.idtype === 'doi')?.value;
    // 'pmc' is the article's own PubMed Central id; never use elink's pubmed_pmc_refs (articles citing it).
    const pmcid = summary.articleids?.find((id) => id.idtype === 'pmc')?.value;
    return [
      {
        origin: 'pubmed',
        pmid: summary.uid,
        doi,
        pmcid,
        journal: summary.source,
        date: isoDate(summary),
        title: summary.title,
      },
    ];
  });
}

/** Fetches JSON from a URL; injected so tests run without network. */
export type FetchJson = (url: string) => Promise<unknown>;

export async function fetchPubmedCandidates(fetchJson: FetchJson, since: string, until: string): Promise<Candidate[]> {
  const ids = parseEsearch(await fetchJson(esearchUrl(since, until)));
  if (ids.length === 0) return [];
  return parseEsummary(await fetchJson(esummaryUrl(ids)));
}
