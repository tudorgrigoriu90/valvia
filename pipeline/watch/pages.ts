/**
 * Page-change watchers (TS-06.1.3): the society guideline pages are read for links to individual documents. A link not
 * seen before becomes a candidate. The first time a page is watched, its current links are recorded as a baseline
 * instead of being reported. A page that shows no document link at all fails the run (layout change, blocked request).
 */
import { createHash } from 'node:crypto';
import { candidateKeys, type Candidate, type WatchState } from './state';

export interface WatchedPage {
  id: string;
  url: string;
  society: string;
  /** Matches the href of a document link (as written in the page). */
  link: RegExp;
}

export const WATCHED_PAGES: readonly WatchedPage[] = [
  {
    id: 'ase-guidelines',
    url: 'https://www.asecho.org/guidelines-search/',
    society: 'ASE',
    link: /^https:\/\/www\.asecho\.org\/guideline\/[a-z0-9-]+\/?$/,
  },
  {
    id: 'esc-guidelines',
    url: 'https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/',
    society: 'ESC',
    link: /^\/guidelines\/clinical-practice-guidelines\/all-esc-practice-guidelines\/[a-z0-9-]+\/$/,
  },
];

const NAMED: Readonly<Record<string, string>> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export const decodeEntities = (text: string): string =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code.startsWith('#x') || code.startsWith('#X')) return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
    if (code.startsWith('#')) return String.fromCodePoint(Number.parseInt(code.slice(1), 10));
    return NAMED[code.toLowerCase()] ?? entity;
  });

const attribute = (tag: string, name: string): string | undefined =>
  new RegExp(`\\s${name}="([^"]*)"`, 'i').exec(tag)?.[1];

const clean = (text: string): string =>
  decodeEntities(text.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^Read /, '');

export interface PageLink {
  url: string;
  title: string;
}

export function extractLinks(html: string, page: WatchedPage): PageLink[] {
  const links = new Map<string, string>();
  for (const [, tag = '', inner = ''] of html.matchAll(/(<a\b[^>]*>)([\s\S]*?)<\/a>/gi)) {
    const href = attribute(tag, 'href');
    if (href === undefined || !page.link.test(decodeEntities(href))) continue;
    const url = new URL(decodeEntities(href), page.url).href;
    const titles = [attribute(tag, 'title'), attribute(tag, 'aria-label'), inner].map((t) => clean(t ?? ''));
    const best = [...titles, links.get(url) ?? ''].reduce((a, b) => (b.length > a.length ? b : a));
    links.set(url, best);
  }
  return [...links].map(([url, title]) => ({ url, title }));
}

const linkHash = (links: readonly PageLink[]): string =>
  createHash('sha256')
    .update(
      links
        .map((l) => l.url)
        .sort()
        .join('\n'),
    )
    .digest('hex');

export type FetchText = (url: string) => Promise<string>;

export interface PageResult {
  /** New document links on pages watched before. */
  report: Candidate[];
  /** Links on pages watched for the first time: mark as seen, do not report. */
  baseline: Candidate[];
  /** Page URL → hash of its document links. */
  pages: Record<string, string>;
}

export async function fetchPageCandidates(
  fetchText: FetchText,
  watched: readonly WatchedPage[],
  state: WatchState,
  today: string,
): Promise<PageResult> {
  const result: PageResult = { report: [], baseline: [], pages: {} };
  for (const page of watched) {
    const links = extractLinks(await fetchText(page.url), page);
    if (links.length === 0)
      throw new Error(`no document links found on ${page.url} (layout changed or request blocked)`);
    result.pages[page.url] = linkHash(links);
    const candidates = links.map((link): Candidate => ({
      origin: 'page',
      url: link.url,
      title: link.title,
      journal: `${page.society} website`,
      date: today,
    }));
    if (state.pages[page.url] === undefined) {
      result.baseline.push(...candidates);
    } else {
      result.report.push(...candidates.filter((c) => !candidateKeys(c).some((key) => key in state.seen)));
    }
  }
  return result;
}
