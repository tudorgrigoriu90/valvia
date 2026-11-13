import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  JOURNALS,
  esearchUrl,
  esummaryUrl,
  fetchPubmedCandidates,
  parseEsearch,
  parseEsummary,
  searchTerm,
} from './pubmed';

const fixture = (name: string): unknown =>
  JSON.parse(readFileSync(join(import.meta.dirname, '__fixtures__', name), 'utf8'));

describe('PubMed query (TS-06.1.2)', () => {
  it('searches the society journals for guideline-type documents about echo and imaging', () => {
    const term = searchTerm();
    for (const journal of JOURNALS) expect(term).toContain(`"${journal}"[ta]`);
    expect(term).toContain('Practice Guideline[pt]');
    expect(term).toContain('recommendation*[ti]');
    expect(term).toContain('echocardiogra*[tiab]');
    expect(term).toMatch(/^\(.+\) AND \(.+\) AND \(.+\)$/);
  });

  it('asks for records added to PubMed in the watch window, as JSON, naming the tool but no e-mail', () => {
    const url = new URL(esearchUrl('2026-11-06', '2026-11-13'));
    expect(url.origin + url.pathname).toBe('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      db: 'pubmed',
      term: searchTerm(),
      datetype: 'edat',
      mindate: '2026/11/06',
      maxdate: '2026/11/13',
      retmode: 'json',
      retmax: '200',
      tool: 'valvia',
    });
  });

  it('requests summaries for the found ids', () => {
    const url = new URL(esummaryUrl(['1', '2']));
    expect(url.searchParams.get('id')).toBe('1,2');
    expect(url.searchParams.get('retmode')).toBe('json');
  });
});

describe('parsing', () => {
  it('reads the id list of a search', () => {
    expect(parseEsearch(fixture('esearch.json'))).toEqual(['42547112', '42242827', '42070896']);
  });

  it('turns summaries into candidates with PMID, DOI, journal and ISO date, skipping comments', () => {
    expect(parseEsummary(fixture('esummary.json'))).toEqual([
      {
        origin: 'pubmed',
        pmid: '42547112',
        doi: '10.1016/j.echo.2026.04.018',
        journal: 'J Am Soc Echocardiogr',
        date: '2026-08-01',
        title:
          'Guidelines for the Prevention of Work-Related Musculoskeletal Disorders for Cardiac Sonographers: Recommendations from the American Society of Echocardiography.',
      },
      {
        origin: 'pubmed',
        pmid: '42242827',
        doi: '10.1016/j.echo.2026.03.003',
        journal: 'J Am Soc Echocardiogr',
        date: '2026-06-01',
        title:
          'Guidelines for the Intraprocedural Imaging for Mitral Valve Transcatheter Edge-to-Edge Repair (M-TEER): Recommendations from the American Society of Echocardiography.',
      },
    ]);
  });

  it('rejects responses of an unexpected shape (an API change must fail the run loudly)', () => {
    expect(() => parseEsearch({})).toThrow(/esearch/);
    expect(() => parseEsearch({ esearchresult: { idlist: [1] } })).toThrow(/esearch/);
    expect(() => parseEsummary({ result: {} })).toThrow(/esummary/);
    expect(() => parseEsummary({ result: { uids: ['1'] } })).toThrow(/esummary/);
  });

  it('accepts minimal records (no publication types, ids or dates) and rejects a non-object response', () => {
    expect(parseEsummary({ result: { uids: ['6'], '6': { uid: '6', title: 'T', source: 'S' } } })).toEqual([
      { origin: 'pubmed', pmid: '6', doi: undefined, journal: 'S', date: '', title: 'T' },
    ]);
    expect(() => parseEsearch(null)).toThrow(/esearch/);
    expect(() => parseEsummary('x')).toThrow(/esummary/);
  });

  it('reads the PubMed Central id of the article itself (free full text), when PubMed lists one', () => {
    const json = {
      result: {
        uids: ['7'],
        '7': {
          uid: '7',
          title: 'T',
          source: 'Eur Heart J',
          sortpubdate: '2026/03/01 00:00',
          articleids: [
            { idtype: 'pubmed', value: '7' },
            { idtype: 'pmc', value: 'PMC13314027' },
            { idtype: 'pmcid', value: 'pmc-id: PMC13314027;' },
          ],
        },
      },
    };
    expect(parseEsummary(json)[0]?.pmcid).toBe('PMC13314027');
  });

  it('keeps a record without DOI and falls back to the year when the sort date is missing', () => {
    const json = {
      result: {
        uids: ['5'],
        '5': {
          uid: '5',
          title: 'T',
          source: 'Eur Heart J',
          pubdate: '2026',
          pubtype: ['Practice Guideline'],
          articleids: [],
        },
      },
    };
    expect(parseEsummary(json)).toEqual([
      { origin: 'pubmed', pmid: '5', doi: undefined, journal: 'Eur Heart J', date: '2026', title: 'T' },
    ]);
  });
});

describe('fetchPubmedCandidates', () => {
  it('searches, then fetches summaries of the hits', async () => {
    const calls: string[] = [];
    const fake = (url: string): Promise<unknown> => {
      calls.push(new URL(url).pathname);
      return Promise.resolve(url.includes('esearch') ? fixture('esearch.json') : fixture('esummary.json'));
    };
    const candidates = await fetchPubmedCandidates(fake, '2026-11-06', '2026-11-13');
    expect(calls).toEqual(['/entrez/eutils/esearch.fcgi', '/entrez/eutils/esummary.fcgi']);
    expect(candidates.map((c) => c.pmid)).toEqual(['42547112', '42242827']);
  });

  it('does not call esummary when nothing was found', async () => {
    const calls: string[] = [];
    const fake = (url: string): Promise<unknown> => {
      calls.push(url);
      return Promise.resolve({ esearchresult: { idlist: [] } });
    };
    expect(await fetchPubmedCandidates(fake, '2026-11-06', '2026-11-13')).toEqual([]);
    expect(calls).toHaveLength(1);
  });
});
