import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadContent } from '../../core/content/loader';
import { WATCHED_PAGES } from './pages';
import { EMPTY_STATE, markSeen, type Candidate } from './state';
import { issueContext, registeredDois, runWatch, sourcesWithDoi as withDoi, watchWindow } from './watch';

const FIXTURES = join(import.meta.dirname, '../../core/view/__fixtures__');
const { bundle } = loadContent(FIXTURES);
const SITE = 'https://valvia-echo.se/';

const json = (name: string): unknown =>
  JSON.parse(readFileSync(join(import.meta.dirname, '__fixtures__', name), 'utf8'));

describe('watch window (TS-06.1.1)', () => {
  it('starts at the last run, or 14 days back on the first run', () => {
    expect(watchWindow({ ...EMPTY_STATE, lastRun: '2026-11-06' }, '2026-11-13')).toEqual({
      since: '2026-11-06',
      until: '2026-11-13',
    });
    expect(watchWindow(EMPTY_STATE, '2026-11-13')).toEqual({ since: '2026-10-30', until: '2026-11-13' });
  });
});

describe('context from content', () => {
  it('collects the DOIs of registered sources and the sources that have one', () => {
    expect(registeredDois(bundle)).toEqual(new Set());
    const source = bundle.sources.get('fixture-esc-2021');
    if (source === undefined) throw new Error('fixture source missing');
    const sources = new Map([...bundle.sources, ['with-doi', { ...source, id: 'with-doi', doi: '10.1/abc' }]]);
    const withDois = { ...bundle, sources };
    expect(registeredDois(withDois)).toEqual(new Set(['10.1/abc']));
    expect(withDoi(withDois)).toEqual([{ id: 'with-doi', doi: '10.1/abc' }]);
  });

  it('maps each source to the visible topics citing it, with absolute URLs', () => {
    const context = issueContext(bundle, SITE);
    expect(context.sources.map((s) => s.id).sort()).toEqual([
      'fixture-ase-2014',
      'fixture-ase-2021',
      'fixture-esc-2021',
    ]);
    expect(context.topicsBySource.get('fixture-esc-2021')).toEqual([
      { id: 'fixture-leaf', title: 'Fixture leaf', url: 'https://valvia-echo.se/fixture-root/fixture-leaf/' },
    ]);
  });
});

describe('runWatch', () => {
  const sourcesWithDoi = [{ id: 'fixture-esc-2021', doi: '10.1016/j.echo.2014.10.003' }];
  const fetchJson = (url: string): Promise<unknown> => {
    if (url.includes('esearch')) return Promise.resolve(json('esearch.json'));
    if (url.includes('esummary')) return Promise.resolve(json('esummary.json'));
    return Promise.resolve(json('crossref-updates.json'));
  };
  const fetchText = (url: string): Promise<string> =>
    Promise.resolve(
      readFileSync(
        join(
          import.meta.dirname,
          '__fixtures__',
          url.includes('asecho') ? 'ase-guidelines.html' : 'esc-guidelines.html',
        ),
        'utf8',
      ),
    );
  const pageOptions = { fetchText, watchedPages: WATCHED_PAGES };

  it('returns one issue per new candidate and the updated state', async () => {
    const result = await runWatch({
      fetchJson,
      ...pageOptions,
      state: EMPTY_STATE,
      today: '2026-11-13',
      context: issueContext(bundle, SITE),
      registry: new Set(),
      sourcesWithDoi,
    });
    expect(result.issues.map((issue) => issue.title.split(':')[0])).toEqual([
      'New document',
      'New document',
      'Erratum to fixture-esc-2021',
      'Erratum to fixture-esc-2021',
    ]);
    expect(result.state.lastRun).toBe('2026-11-13');
    expect(Object.keys(result.state.seen).filter((key) => !key.startsWith('url:'))).toHaveLength(6);
    expect(Object.keys(result.state.seen).filter((key) => key.startsWith('url:')).length).toBeGreaterThan(5);
    expect(Object.keys(result.state.pages)).toHaveLength(2);
    const erratum = result.issues[2];
    expect(erratum?.body).toContain('[Fixture leaf](https://valvia-echo.se/fixture-root/fixture-leaf/)');
  });

  it('reports nothing twice: a second run with the saved state opens no issues', async () => {
    const options = {
      fetchJson,
      ...pageOptions,
      today: '2026-11-13',
      context: issueContext(bundle, SITE),
      registry: new Set<string>(),
      sourcesWithDoi,
    };
    const first = await runWatch({ ...options, state: EMPTY_STATE });
    const second = await runWatch({ ...options, state: first.state, today: '2026-11-20' });
    expect(second.issues).toEqual([]);
    expect(second.state.lastRun).toBe('2026-11-20');
  });

  it('skips documents already in the registry', async () => {
    const seenOne: Candidate = { origin: 'pubmed', pmid: '42547112', title: 't', journal: 'j', date: '2026' };
    const result = await runWatch({
      fetchJson,
      ...pageOptions,
      state: markSeen(EMPTY_STATE, [seenOne], '2026-11-06'),
      today: '2026-11-13',
      context: issueContext(bundle, SITE),
      registry: new Set(['10.1016/j.echo.2026.03.003']),
      sourcesWithDoi: [],
    });
    expect(result.issues).toEqual([]);
  });
});
