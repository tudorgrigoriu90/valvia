import { describe, expect, it } from 'vitest';
import type { Parameter } from '../../schema/generated/parameter';
import type { SourceDocument } from '../../schema/generated/source';
import type { ContentBundle, LoadedBlock, LoadedTopic, LoadedValue } from '../content/types';
import { detectDiscrepancies, valueKey } from './discrepancy';

const source = (
  id: string,
  issuers: SourceDocument['issuers'],
  status: SourceDocument['status'] = 'current',
): SourceDocument => ({
  id,
  title: id,
  issuers,
  type: 'guideline',
  year: 2025,
  status,
  ...(status === 'superseded' ? { supersededBy: 'esc' } : {}),
});

const SOURCES = new Map<string, SourceDocument>([
  ['esc', source('esc', ['ESC'])],
  ['ase', source('ase', ['ASE'])],
  ['eacvi', source('eacvi', ['EACVI'])],
  ['esc-old', source('esc-old', ['ESC'], 'superseded')],
]);

const PARAMETERS = new Map<string, Parameter>([
  ['eroa', { id: 'eroa', name: 'EROA', quantity: 'area', unit: 'cm²', modalities: ['Echo'] }],
  ['lvedd', { id: 'lvedd', name: 'LVEDD', quantity: 'length', unit: 'mm', modalities: ['Echo'] }],
]);

const value = (sourceId: string, overrides: Record<string, unknown> = {}): LoadedValue => {
  const merged: Record<string, unknown> = {
    parameter: 'eroa',
    context: 'grading',
    grade: 'severe',
    operator: '>=',
    value: 0.4,
    unit: 'cm²',
    modality: 'Echo',
    population: { ageGroup: 'adult' },
    citation: { source: sourceId, locator: { table: '1' } },
    published: { value: '0.40' },
    ...overrides,
  };
  for (const key of Object.keys(merged)) if (merged[key] === undefined) Reflect.deleteProperty(merged, key);
  return merged as unknown as LoadedValue;
};

const topic = (id: string, values: LoadedValue[]): LoadedTopic => ({
  id,
  slug: id,
  title: id,
  parent: null,
  order: 0,
  population: 'adult',
  wave: 'W1',
  status: 'published',
  blocks: [{ id: 'b', type: 'threshold-list', tag: 'INTV', values }],
});

const bundle = (...topics: LoadedTopic[]): ContentBundle => ({
  topics: new Map(topics.map((t) => [t.id, t])),
  parameters: PARAMETERS,
  sources: SOURCES,
});

describe('detectDiscrepancies (TS-02.4.1)', () => {
  it('finds nothing when current sources agree', () => {
    expect(detectDiscrepancies(bundle(topic('t', [value('esc'), value('ase')])))).toEqual([]);
  });

  it('treats values that agree after unit conversion as agreeing (40 mm² = 0.40 cm²)', () => {
    const ase = value('ase', { unit: 'mm²', value: 40, published: { value: '40' } });
    expect(detectDiscrepancies(bundle(topic('t', [value('esc'), ase])))).toEqual([]);
  });

  it('flags different numbers from different current sources, side by side in display units', () => {
    const ase = value('ase', { unit: 'mm²', value: 30, published: { value: '30' } });
    expect(detectDiscrepancies(bundle(topic('t', [value('esc'), ase])))).toEqual([
      {
        parameter: 'eroa',
        context: 'grading',
        grade: 'severe',
        modality: 'Echo',
        population: { ageGroup: 'adult' },
        entries: [
          { source: 'esc', topicId: 't', path: ['blocks', 0, 'values', 0], display: '≥ 0.40 cm²' },
          { source: 'ase', topicId: 't', path: ['blocks', 0, 'values', 1], display: '≥ 0.30 cm²' },
        ],
      },
    ]);
  });

  it('flags a different operator even with the same number', () => {
    const ase = value('ase', { operator: '>' });
    expect(detectDiscrepancies(bundle(topic('t', [value('esc'), ase])))[0]?.entries.map((e) => e.display)).toEqual([
      '≥ 0.40 cm²',
      '> 0.40 cm²',
    ]);
  });

  it('compares ranges end to end', () => {
    const range = (id: string, min: string, max: string): LoadedValue =>
      value(id, {
        parameter: 'lvedd',
        unit: 'mm',
        context: 'normal-range',
        grade: undefined,
        operator: 'range',
        value: undefined,
        min: Number(min),
        max: Number(max),
        published: { min, max },
      });
    expect(detectDiscrepancies(bundle(topic('t', [range('esc', '42', '58'), range('ase', '42', '58')])))).toEqual([]);
    const found = detectDiscrepancies(bundle(topic('t', [range('esc', '42', '58'), range('ase', '42', '59')])));
    expect(found[0]?.entries.map((e) => e.display)).toEqual(['42–58 mm', '42–59 mm']);
    expect(found[0]?.grade).toBeUndefined();
  });

  it('ignores superseded sources (they belong to the history, not to the comparison)', () => {
    const old = value('esc-old', { value: 0.3, published: { value: '0.30' } });
    expect(detectDiscrepancies(bundle(topic('t', [value('esc'), old])))).toEqual([]);
  });

  it('does not compare a source with itself', () => {
    const second = value('esc', { value: 0.3, published: { value: '0.30' } });
    expect(detectDiscrepancies(bundle(topic('t', [value('esc'), second])))).toEqual([]);
  });

  it('keeps different populations, grades, contexts and modalities apart', () => {
    const values = [
      value('esc'),
      value('ase', { population: { ageGroup: 'paediatric' }, value: 0.3 }),
      value('ase', { grade: 'moderate', value: 0.3 }),
      value('ase', { context: 'intervention-threshold', value: 0.3 }),
      value('ase', { modality: 'CMR', value: 0.3 }),
      value('ase', { population: { ageGroup: 'adult', sex: 'male' }, value: 0.3 }),
    ];
    expect(detectDiscrepancies(bundle(topic('t', values)))).toEqual([]);
  });

  it('groups population qualifiers regardless of key order', () => {
    const a = value('esc', { population: { ageGroup: 'adult', sex: 'female' } });
    const b = value('ase', {
      population: { sex: 'female', ageGroup: 'adult' },
      value: 0.3,
      published: { value: '0.30' },
    });
    expect(detectDiscrepancies(bundle(topic('t', [a, b])))).toHaveLength(1);
  });

  it('compares values across topics (content shown in two places is stored once)', () => {
    const ase = value('ase', { value: 0.3, published: { value: '0.30' } });
    const found = detectDiscrepancies(bundle(topic('a', [value('esc')]), topic('b', [ase])));
    expect(found[0]?.entries.map((e) => e.topicId)).toEqual(['a', 'b']);
  });

  it('includes every disagreeing source, also three-way', () => {
    const values = [value('esc'), value('ase', { value: 0.3, published: { value: '0.30' } }), value('eacvi')];
    expect(detectDiscrepancies(bundle(topic('t', values)))[0]?.entries.map((e) => e.source)).toEqual([
      'esc',
      'ase',
      'eacvi',
    ]);
  });

  it('skips values with an unknown parameter, unknown source or a unit the parameter cannot use', () => {
    const values = [
      value('esc'),
      value('ase', { parameter: 'nope', value: 0.3 }),
      value('missing', { value: 0.3 }),
      value('ase', { unit: 'mm', value: 0.3, published: { value: '0.3' } }),
    ];
    expect(detectDiscrepancies(bundle(topic('t', values)))).toEqual([]);
  });

  it('checks values nested in checklist criteria and ignores blocks without values', () => {
    const checklist = {
      id: 'c',
      type: 'criteria-checklist',
      tag: 'FEAS',
      criteria: [
        {
          text: 'x',
          citation: { source: 'esc', locator: { table: '1' } },
          values: [value('esc'), value('ase', { value: 0.3, published: { value: '0.30' } })],
        },
      ],
    } as LoadedBlock;
    const note = { id: 'n', type: 'note', tag: 'METH', text: 'x' } as LoadedBlock;
    const t: LoadedTopic = { ...topic('t', []), blocks: [checklist, note] };
    expect(detectDiscrepancies(bundle(t))[0]?.entries[1]?.path).toEqual(['blocks', 0, 'criteria', 0, 'values', 1]);
    const withoutBlocks: LoadedTopic = { ...t };
    delete withoutBlocks.blocks;
    expect(detectDiscrepancies(bundle(withoutBlocks))).toEqual([]);
  });
});

describe('valueKey', () => {
  it('identifies a value by topic and path for UI markers', () => {
    expect(valueKey('t', ['blocks', 0, 'values', 2])).toBe('t#blocks.0.values.2');
  });
});
