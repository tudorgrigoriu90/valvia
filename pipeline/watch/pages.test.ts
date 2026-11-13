import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { WATCHED_PAGES, decodeEntities, extractLinks, fetchPageCandidates, type WatchedPage } from './pages';
import { EMPTY_STATE, candidateKeys } from './state';

const html = (name: string): string => readFileSync(join(import.meta.dirname, '__fixtures__', name), 'utf8');
const page = (id: string): WatchedPage => {
  const found = WATCHED_PAGES.find((p) => p.id === id);
  if (found === undefined) throw new Error(id);
  return found;
};

describe('extractLinks (TS-06.1.3)', () => {
  it('finds the ASE guideline links (absolute, deduplicated) and ignores navigation links', () => {
    const links = extractLinks(html('ase-guidelines.html'), page('ase-guidelines'));
    expect(links).toHaveLength(5);
    expect(links[0]).toEqual({
      url: 'https://www.asecho.org/guideline/prevention-of-work-related-musculoskeletal-disorders-for-cardiac-sonographers/',
      title: 'Prevention of Work-Related Musculoskeletal Disorders for Cardiac Sonographers',
    });
  });

  it('resolves ESC relative links and keeps the most descriptive title of duplicate anchors', () => {
    const links = extractLinks(html('esc-guidelines.html'), page('esc-guidelines'));
    expect(links.map((l) => l.url)).toContain(
      'https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/cardiac-rehabilitation/',
    );
    expect(links.find((l) => l.url.endsWith('/cardiac-rehabilitation/'))?.title).toBe(
      '2026 ESC Guidelines on Cardiac Rehabilitation',
    );
    expect(links.find((l) => l.url.endsWith('/cvd-chronic-kidney-disease/'))?.title).toBe(
      '2026 ESC Guidelines for the management of cardiovascular disease and chronic kidney disease',
    );
  });

  it('decodes HTML entities in titles', () => {
    expect(decodeEntities('CVD &amp; CKD &#8211; &#x2014; &quot;x&quot; &lt;y&gt; &#39;z&#39; &nbsp; &unknown;')).toBe(
      'CVD & CKD \u2013 \u2014 "x" <y> \'z\' \u00a0 &unknown;',
    );
  });
});

describe('fetchPageCandidates', () => {
  const fetchText = (url: string): Promise<string> =>
    Promise.resolve(url.includes('asecho') ? html('ase-guidelines.html') : html('esc-guidelines.html'));

  it('records a baseline on the first run instead of reporting every existing document', async () => {
    const result = await fetchPageCandidates(fetchText, WATCHED_PAGES, EMPTY_STATE, '2026-11-13');
    expect(result.report).toEqual([]);
    expect(result.baseline.length).toBeGreaterThan(5);
    expect(Object.keys(result.pages).sort()).toEqual(WATCHED_PAGES.map((p) => p.url).sort());
  });

  it('reports links that were not on the page before, as candidates with the society and URL', async () => {
    const first = await fetchPageCandidates(fetchText, WATCHED_PAGES, EMPTY_STATE, '2026-11-13');
    const seen = Object.fromEntries(first.baseline.flatMap(candidateKeys).map((key) => [key, '2026-11-13']));
    const withNew = (url: string): Promise<string> =>
      fetchText(url).then((text) =>
        url.includes('asecho')
          ? text.replace(
              '</body>',
              '<a href="https://www.asecho.org/guideline/new-right-heart-in-children/">Right Heart in Children</a></body>',
            )
          : text,
      );
    const second = await fetchPageCandidates(
      withNew,
      WATCHED_PAGES,
      { ...EMPTY_STATE, seen, pages: first.pages },
      '2026-11-20',
    );
    expect(second.report).toEqual([
      {
        origin: 'page',
        url: 'https://www.asecho.org/guideline/new-right-heart-in-children/',
        title: 'Right Heart in Children',
        journal: 'ASE website',
        date: '2026-11-20',
      },
    ]);
  });

  it('fails when a page no longer shows any document link (layout change)', async () => {
    await expect(
      fetchPageCandidates(() => Promise.resolve('<html></html>'), WATCHED_PAGES, EMPTY_STATE, '2026-11-13'),
    ).rejects.toThrow(/no document links/);
  });
});
