import { describe, expect, it } from 'vitest';
import type { SourceDocument } from '../../schema/generated/source';
import type { LoadedBlock, LoadedValue } from '../content/types';
import { currentSuccessor, previousRecommendations, withoutHistory } from './history';

const src = (id: string, status: SourceDocument['status'], year: number, supersededBy?: string): SourceDocument => ({
  id,
  title: id,
  issuers: ['ASE'],
  type: 'recommendation',
  year,
  status,
  ...(supersededBy === undefined ? {} : { supersededBy }),
});

const SOURCES = new Map<string, SourceDocument>([
  ['ase-2009', src('ase-2009', 'superseded', 2009, 'ase-2016')],
  ['ase-2016', src('ase-2016', 'superseded', 2016, 'ase-2025')],
  ['ase-2025', src('ase-2025', 'current', 2025)],
  ['old-withdrawn', src('old-withdrawn', 'withdrawn', 2012)],
]);

const value = (source: string, n: string): LoadedValue =>
  ({
    parameter: 'e',
    operator: '>',
    value: Number(n),
    unit: '1',
    citation: { source, locator: { table: '1' } },
    published: { value: n },
  }) as unknown as LoadedValue;

const grading = (values: LoadedValue[]): LoadedBlock =>
  ({ id: 'g', type: 'grading-table', tag: 'GRADE', grades: ['A', 'B'], values }) as unknown as LoadedBlock;

describe('currentSuccessor (TS-02.4.2)', () => {
  it('follows the supersession chain to the current document', () => {
    expect(currentSuccessor('ase-2009', SOURCES)?.id).toBe('ase-2025');
    expect(currentSuccessor('ase-2016', SOURCES)?.id).toBe('ase-2025');
  });

  it('returns undefined for current, withdrawn, unknown or cyclic sources', () => {
    expect(currentSuccessor('ase-2025', SOURCES)).toBeUndefined();
    expect(currentSuccessor('old-withdrawn', SOURCES)).toBeUndefined();
    expect(currentSuccessor('nope', SOURCES)).toBeUndefined();
    const cyclic = new Map([
      ['a', src('a', 'superseded', 2000, 'b')],
      ['b', src('b', 'superseded', 2001, 'a')],
    ]);
    expect(currentSuccessor('a', cyclic)).toBeUndefined();
  });
});

describe('withoutHistory', () => {
  it('keeps only values of current sources in value blocks', () => {
    const block = grading([
      value('ase-2025', '14'),
      value('ase-2016', '13'),
      value('old-withdrawn', '12'),
      value('unknown', '11'),
    ]);
    const current = withoutHistory(block, SOURCES);
    expect(current.type === 'grading-table' ? current.values.map((v) => v.published.value) : []).toEqual(['14', '11']);
  });

  it('filters values inside checklist criteria and leaves other blocks unchanged', () => {
    const checklist = {
      id: 'c',
      type: 'criteria-checklist',
      tag: 'CRIT',
      criteria: [{ text: 'x', values: [value('ase-2016', '1'), value('ase-2025', '2')] }, { text: 'y' }],
    } as unknown as LoadedBlock;
    const filtered = withoutHistory(checklist, SOURCES);
    expect(filtered.type === 'criteria-checklist' ? filtered.criteria.map((c) => c.values?.length) : []).toEqual([
      1,
      undefined,
    ]);
    const note = { id: 'n', type: 'note', tag: 'METH', text: 'x' } as LoadedBlock;
    expect(withoutHistory(note, SOURCES)).toBe(note);
  });
});

describe('previousRecommendations', () => {
  it('lists values of superseded and withdrawn sources with year and superseding document', () => {
    const block = grading([value('ase-2025', '14'), value('ase-2016', '13'), value('old-withdrawn', '12')]);
    expect(
      previousRecommendations(block, SOURCES).map((h) => [
        h.value.published.value,
        h.source.id,
        h.source.year,
        h.supersededBy?.id,
        h.status,
      ]),
    ).toEqual([
      ['13', 'ase-2016', 2016, 'ase-2025', 'superseded'],
      ['12', 'old-withdrawn', 2012, undefined, 'withdrawn'],
    ]);
  });

  it('includes values nested in criteria and returns nothing for blocks without values', () => {
    const checklist = {
      id: 'c',
      type: 'criteria-checklist',
      tag: 'CRIT',
      criteria: [{ text: 'x', values: [value('ase-2009', '1')] }],
    } as unknown as LoadedBlock;
    expect(previousRecommendations(checklist, SOURCES).map((h) => h.supersededBy?.id)).toEqual(['ase-2025']);
    expect(previousRecommendations({ id: 'n', type: 'note', tag: 'METH', text: 'x' }, SOURCES)).toEqual([]);
  });
});
