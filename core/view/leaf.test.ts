import { describe, expect, it } from 'vitest';
import type { Parameter } from '../../schema/generated/parameter';
import type { SourceDocument } from '../../schema/generated/source';
import type { ContentBundle, LoadedBlock, LoadedTopic, LoadedValue } from '../content/types';
import { differingValues, leafView } from './leaf';

const src = (
  id: string,
  status: SourceDocument['status'],
  year: number,
  extra: Partial<SourceDocument> = {},
): SourceDocument => ({ id, title: id, issuers: ['ASE'], type: 'recommendation', year, status, ...extra });
const SOURCES = new Map([
  ['new', src('new', 'current', 2025, { shortTitle: 'ASE 2025' })],
  ['old', src('old', 'superseded', 2016, { supersededBy: 'new' })],
]);
const PARAMS = new Map<string, Parameter>([
  ['e', { id: 'e', name: 'E/e′ average', abbreviation: 'E/e′', quantity: 'ratio', unit: '1', modalities: ['Echo'] }],
]);
const value = (source: string, n: string): LoadedValue =>
  ({
    parameter: 'e',
    context: 'diagnostic-criterion',
    operator: '>',
    value: Number(n),
    unit: '1',
    modality: 'Echo',
    population: { ageGroup: 'adult' },
    citation: { source, locator: { table: '1' } },
    published: { value: n },
  }) as unknown as LoadedValue;
const list = (id: string, values: LoadedValue[]): LoadedBlock =>
  ({ id, type: 'threshold-list', tag: 'CRIT', values }) as unknown as LoadedBlock;
const topic = (blocks: LoadedBlock[]): LoadedTopic => ({
  id: 't',
  slug: 't',
  title: 'T',
  parent: null,
  order: 0,
  population: 'adult',
  wave: 'W1',
  status: 'draft',
  blocks,
});
const bundle: ContentBundle = { topics: new Map(), parameters: PARAMS, sources: SOURCES, prosthetics: new Map() };

describe('leafView (TS-04.7.2)', () => {
  it('separates current values from previous recommendations per block', () => {
    const [section] = leafView(topic([list('a', [value('new', '14'), value('old', '13')])]), bundle);
    expect(section?.block.type === 'threshold-list' ? section.block.values.map((v) => v.published.value) : []).toEqual([
      '14',
    ]);
    expect(section?.history).toEqual([
      { label: 'E/e′', text: '> 13', source: 'old (2016)', status: 'superseded', supersededBy: 'ASE 2025 (2025)' },
    ]);
    expect(section?.noCurrentValue).toBe(false);
    expect(section?.categories).toEqual(['adult']);
  });

  it('lists the categories present among current values, in switch order (PO-5)', () => {
    const child = { ...value('new', '10'), population: { ageGroup: 'paediatric' } } as LoadedValue;
    const stress = { ...value('new', '11'), technique: 'stress' } as LoadedValue;
    const [section] = leafView(topic([list('a', [stress, value('new', '14'), child])]), bundle);
    expect(section?.categories).toEqual(['adult', 'paediatric', 'stress']);
  });

  it('flags blocks whose values are all superseded (show "no current society-endorsed value")', () => {
    const [section] = leafView(topic([list('a', [value('old', '13')])]), bundle);
    expect(section?.noCurrentValue).toBe(true);
  });

  it('keeps blocks without values as they are', () => {
    const note = { id: 'n', type: 'note', tag: 'METH', text: 'x' } as LoadedBlock;
    expect(leafView(topic([note]), bundle)).toEqual([
      { block: note, history: [], noCurrentValue: false, categories: [], differs: [], comparisons: [] },
    ]);
    const bare = topic([]);
    delete bare.blocks;
    expect(leafView(bare, bundle)).toEqual([]);
  });

  it('describes withdrawn sources and skips values with unknown parameters', () => {
    const sources = new Map([...SOURCES, ['gone', src('gone', 'withdrawn', 2012)]]);
    const values = [value('gone', '12'), { ...value('old', '9'), parameter: 'missing' } as LoadedValue];
    const [section] = leafView(topic([list('a', values)]), { ...bundle, sources });
    expect(section?.history).toEqual([
      { label: 'E/e′', text: '> 12', source: 'gone (2012)', status: 'withdrawn', supersededBy: undefined },
    ]);
  });

  it('marks values that differ between current sources and lists the comparison per block', () => {
    const sources = new Map([
      ...SOURCES,
      ['esc', src('esc', 'current', 2025, { shortTitle: 'ESC 2025', issuers: ['ESC'] })],
    ]);
    const esc = { ...value('esc', '15') } as LoadedValue;
    const [section] = leafView(topic([list('a', [value('new', '14'), esc])]), { ...bundle, sources });
    expect(section?.differs).toEqual([true, true]);
    expect(section?.comparisons).toEqual([
      {
        label: 'E/e′',
        entries: [
          { source: 'ASE 2025 (2025)', display: '> 14' },
          { source: 'ESC 2025 (2025)', display: '> 15' },
        ],
      },
    ]);
  });

  it('reports no differences when sources agree', () => {
    const [section] = leafView(topic([list('a', [value('new', '14')])]), bundle);
    expect(section?.differs).toEqual([false]);
    expect(section?.comparisons).toEqual([]);
  });

  it('exposes the differing values as a set for value markers', () => {
    const sources = new Map([...SOURCES, ['esc', src('esc', 'current', 2025, { issuers: ['ESC'] })]]);
    const ase = value('new', '14');
    const esc = value('esc', '15');
    const [section] = leafView(topic([list('a', [ase, esc])]), { ...bundle, sources });
    expect(section === undefined ? [] : [...differingValues(section)]).toEqual([ase, esc]);
    expect(section?.comparisons[0]?.entries.map((e) => e.source)).toEqual(['ASE 2025 (2025)', 'esc (2025)']);
  });
});
