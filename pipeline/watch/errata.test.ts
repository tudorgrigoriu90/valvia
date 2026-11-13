import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fetchErrata, parseUpdates, updatesUrl } from './errata';

const fixture = (): unknown =>
  JSON.parse(readFileSync(join(import.meta.dirname, '__fixtures__', 'crossref-updates.json'), 'utf8'));

const SOURCE = { id: 'ase-eacvi-2015-chamber-quantification', doi: '10.1016/j.echo.2014.10.003' };

describe('errata detection (TS-06.1.5)', () => {
  it('asks Crossref for works that update the registered DOI', () => {
    const url = new URL(updatesUrl('10.1016/J.ECHO.2014.10.003'));
    expect(url.origin + url.pathname).toBe('https://api.crossref.org/works');
    expect(url.searchParams.get('filter')).toBe('updates:10.1016/j.echo.2014.10.003');
    expect(url.searchParams.get('rows')).toBe('100');
  });

  it('turns each update notice into a candidate linked to the registered source', () => {
    expect(parseUpdates(fixture(), SOURCE)).toEqual([
      {
        origin: 'crossref',
        doi: '10.1016/j.echo.2016.01.015',
        pmid: undefined,
        journal: 'Journal of the American Society of Echocardiography',
        date: '2016-03-01',
        title: 'Erratum: Correction',
        updates: { source: 'ase-eacvi-2015-chamber-quantification', kind: 'erratum' },
      },
      {
        origin: 'crossref',
        doi: '10.1016/j.echo.2016.04.013',
        pmid: undefined,
        journal: 'Journal of the American Society of Echocardiography',
        date: '2016-06-01',
        title: 'Erratum: Correction',
        updates: { source: 'ase-eacvi-2015-chamber-quantification', kind: 'erratum' },
      },
    ]);
  });

  it('ignores relations to other DOIs and pads partial dates', () => {
    const json = {
      message: {
        items: [
          {
            DOI: '10.1/x',
            title: ['Retraction'],
            'update-to': [
              { DOI: '10.9/other', type: 'erratum', updated: { 'date-parts': [[2020, 1, 1]] } },
              { DOI: '10.1016/j.echo.2014.10.003', type: 'retraction', updated: { 'date-parts': [[2021, 5]] } },
            ],
          },
        ],
      },
    };
    expect(parseUpdates(json, SOURCE)).toEqual([
      {
        origin: 'crossref',
        doi: '10.1/x',
        pmid: undefined,
        journal: '',
        date: '2021-05',
        title: 'Retraction: Retraction',
        updates: { source: SOURCE.id, kind: 'retraction' },
      },
    ]);
  });

  it('accepts a minimal notice without title, journal, date or relations', () => {
    const json = {
      message: {
        items: [{ DOI: '10.1/y', 'update-to': [{ DOI: SOURCE.doi, type: 'correction' }] }, { DOI: '10.1/z' }],
      },
    };
    expect(parseUpdates(json, SOURCE)).toEqual([
      {
        origin: 'crossref',
        doi: '10.1/y',
        pmid: undefined,
        journal: '',
        date: '',
        title: 'Correction: ',
        updates: { source: SOURCE.id, kind: 'correction' },
      },
    ]);
  });

  it('fails loudly on an unexpected response', () => {
    expect(() => parseUpdates(null, SOURCE)).toThrow(/Crossref/);
    expect(() => parseUpdates({}, SOURCE)).toThrow(/Crossref/);
    expect(() => parseUpdates({ message: { items: [{ title: [] }] } }, SOURCE)).toThrow(/Crossref/);
  });

  it('queries every registered source that has a DOI, one after another', async () => {
    const calls: string[] = [];
    const fake = (url: string): Promise<unknown> => {
      calls.push(new URL(url).searchParams.get('filter') ?? '');
      return Promise.resolve(url.includes('2014.10.003') ? fixture() : { message: { items: [] } });
    };
    const found = await fetchErrata(fake, [
      SOURCE,
      { id: 'ase-2017-native-regurgitation', doi: '10.1016/j.echo.2017.01.007' },
    ]);
    expect(calls).toEqual(['updates:10.1016/j.echo.2014.10.003', 'updates:10.1016/j.echo.2017.01.007']);
    expect(found.map((c) => c.doi)).toEqual(['10.1016/j.echo.2016.01.015', '10.1016/j.echo.2016.04.013']);
  });
});
