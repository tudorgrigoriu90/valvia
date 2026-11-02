import { describe, expect, it } from 'vitest';
import type { Parameter } from '../../schema/generated/parameter';
import type { LoadedBlock, LoadedValue } from '../content/types';
import { buildGradingTable, buildNormalRangeTable, buildThresholdList } from './table';

const PARAMETERS = new Map<string, Parameter>([
  [
    'eroa',
    {
      id: 'eroa',
      name: 'Effective regurgitant orifice area',
      abbreviation: 'EROA',
      quantity: 'area',
      unit: 'cm²',
      modalities: ['Echo'],
    },
  ],
  [
    'vcw',
    {
      id: 'vcw',
      name: 'Vena contracta width',
      abbreviation: 'VCW',
      quantity: 'length',
      unit: 'mm',
      modalities: ['Echo'],
    },
  ],
  ['ee', { id: 'ee', name: 'E/e′', quantity: 'ratio', unit: '1', modalities: ['Echo'] }],
]);

const value = (fields: Record<string, unknown>): LoadedValue =>
  ({
    context: 'grading',
    modality: 'Echo',
    population: { ageGroup: 'adult' },
    citation: { source: 's', locator: { table: '8' } },
    ...fields,
  }) as unknown as LoadedValue;

const block = (
  values: LoadedValue[],
  grades = ['Mild', 'Moderate', 'Severe'],
): Extract<LoadedBlock, { type: 'grading-table' }> =>
  ({ id: 'g', type: 'grading-table', tag: 'GRADE', grades, values }) as Extract<LoadedBlock, { type: 'grading-table' }>;

describe('buildGradingTable (TS-04.3.1)', () => {
  it('builds one row per parameter in order of appearance and one column per grade', () => {
    const table = buildGradingTable(
      block([
        value({ parameter: 'eroa', grade: 'Mild', operator: '<', unit: 'cm²', published: { value: '0.20' } }),
        value({ parameter: 'vcw', grade: 'Severe', operator: '>=', unit: 'cm', published: { value: '0.7' } }),
        value({ parameter: 'eroa', grade: 'Severe', operator: '>=', unit: 'cm²', published: { value: '0.40' } }),
      ]),
      PARAMETERS,
    );
    expect(table.columns).toEqual(['Mild', 'Moderate', 'Severe']);
    expect(table.rows.map((r) => [r.label, r.name, r.unit])).toEqual([
      ['EROA', 'Effective regurgitant orifice area', 'cm²'],
      ['VCW', 'Vena contracta width', 'mm'],
    ]);
    expect(table.rows[0]?.cells.map((c) => c.map((v) => v.text))).toEqual([['< 0.20'], [], ['≥ 0.40']]);
  });

  it('converts to the display unit and keeps the original for the popover', () => {
    const table = buildGradingTable(
      block([value({ parameter: 'vcw', grade: 'Severe', operator: '>=', unit: 'cm', published: { value: '0.7' } })]),
      PARAMETERS,
    );
    expect(table.rows[0]?.cells[2]?.[0]).toMatchObject({ text: '≥ 7', converted: true, original: '≥ 0.7 cm' });
  });

  it('formats ranges and keeps several values per cell in order', () => {
    const table = buildGradingTable(
      block([
        value({ parameter: 'vcw', grade: 'Severe', operator: '>=', unit: 'cm', published: { value: '0.7' } }),
        value({
          parameter: 'vcw',
          grade: 'Severe',
          operator: '>',
          unit: 'cm',
          published: { value: '0.8' },
          caveats: ['Biplane.'],
        }),
        value({
          parameter: 'vcw',
          grade: 'Moderate',
          operator: 'range',
          unit: 'mm',
          published: { min: '3', max: '6.9' },
        }),
      ]),
      PARAMETERS,
    );
    expect(table.rows[0]?.cells.map((c) => c.map((v) => v.text))).toEqual([[], ['3–6.9'], ['≥ 7', '> 8']]);
    expect(table.rows[0]?.cells[2]?.[1]?.value.caveats).toEqual(['Biplane.']);
  });

  it('shows dimensionless rows without a unit', () => {
    const table = buildGradingTable(
      block([value({ parameter: 'ee', grade: 'Severe', operator: '>', unit: '1', published: { value: '14' } })]),
      PARAMETERS,
    );
    expect(table.rows[0]).toMatchObject({ label: 'E/e′', unit: undefined });
    expect(table.rows[0]?.cells[2]?.[0]?.text).toBe('> 14');
  });

  it('skips values with unknown parameters or grades (reported by validation)', () => {
    const table = buildGradingTable(
      block([
        value({ parameter: 'nope', grade: 'Mild', operator: '<', unit: 'cm²', published: { value: '1' } }),
        value({ parameter: 'eroa', grade: 'Torrential', operator: '<', unit: 'cm²', published: { value: '1' } }),
        value({ parameter: 'eroa', grade: 'Mild', operator: '<', unit: 'mm', published: { value: '1' } }),
      ]),
      PARAMETERS,
    );
    expect(table.rows).toEqual([]);
  });

  it('numbers caveats as footnotes per table, sharing numbers for identical text', () => {
    const table = buildGradingTable(
      block([
        value({
          parameter: 'eroa',
          grade: 'Severe',
          operator: '>=',
          unit: 'cm²',
          published: { value: '0.40' },
          caveats: ['Lower in secondary MR.', 'Nyquist 30–40 cm/s.'],
        }),
        value({
          parameter: 'vcw',
          grade: 'Mild',
          operator: '<',
          unit: 'cm',
          published: { value: '0.3' },
          caveats: ['Nyquist 30–40 cm/s.'],
        }),
        value({ parameter: 'vcw', grade: 'Severe', operator: '>=', unit: 'cm', published: { value: '0.7' } }),
      ]),
      PARAMETERS,
    );
    expect(table.footnotes).toEqual(['Lower in secondary MR.', 'Nyquist 30–40 cm/s.']);
    expect(table.rows[0]?.cells[2]?.[0]?.footnotes).toEqual([1, 2]);
    expect(table.rows[1]?.cells[0]?.[0]?.footnotes).toEqual([2]);
    expect(table.rows[1]?.cells[2]?.[0]?.footnotes).toEqual([]);
  });

  it('keeps separate rows per population (e.g. sex-specific LV EF grades)', () => {
    const table = buildGradingTable(
      block([
        value({
          parameter: 'eroa',
          grade: 'Mild',
          operator: '<',
          unit: 'cm²',
          published: { value: '0.2' },
          population: { ageGroup: 'adult', sex: 'male' },
        }),
        value({
          parameter: 'eroa',
          grade: 'Mild',
          operator: '<',
          unit: 'cm²',
          published: { value: '0.3' },
          population: { ageGroup: 'adult', sex: 'female' },
        }),
      ]),
      PARAMETERS,
    );
    expect(table.rows.map((r) => [r.label, r.population])).toEqual([
      ['EROA', 'Male'],
      ['EROA', 'Female'],
    ]);
  });
});

const normal = (values: LoadedValue[]): Extract<LoadedBlock, { type: 'normal-range-table' }> => ({
  id: 'n',
  type: 'normal-range-table',
  tag: 'NORM',
  values,
});

describe('buildNormalRangeTable', () => {
  it('uses populations as columns in order of appearance', () => {
    const table = buildNormalRangeTable(
      normal([
        value({
          parameter: 'vcw',
          context: 'normal-range',
          operator: 'range',
          unit: 'mm',
          published: { min: '42.0', max: '58.4' },
          population: { ageGroup: 'adult', sex: 'male' },
        }),
        value({
          parameter: 'vcw',
          context: 'normal-range',
          operator: 'range',
          unit: 'mm',
          published: { min: '37.8', max: '52.2' },
          population: { ageGroup: 'adult', sex: 'female' },
        }),
        value({
          parameter: 'eroa',
          context: 'normal-range',
          operator: '<',
          unit: 'cm²',
          published: { value: '0.1' },
          caveats: ['x'],
        }),
      ]),
      PARAMETERS,
    );
    expect(table.columns).toEqual(['Male', 'Female', 'All']);
    expect(table.rows.map((r) => r.cells.map((c) => c.map((v) => v.text)))).toEqual([
      [['42.0–58.4'], ['37.8–52.2'], []],
      [[], [], ['< 0.1']],
    ]);
    expect(table.footnotes).toEqual(['x']);
  });
});

describe('buildThresholdList', () => {
  it('lists each value with parameter, display text with unit, grade and population', () => {
    const list = buildThresholdList(
      {
        id: 't',
        type: 'threshold-list',
        tag: 'INTV',
        values: [
          value({
            parameter: 'vcw',
            context: 'intervention-threshold',
            operator: '>=',
            unit: 'cm',
            published: { value: '0.7' },
            population: { ageGroup: 'adult', sex: 'male' },
            caveats: ['c'],
          }),
          value({ parameter: 'nope', operator: '>=', unit: 'cm', published: { value: '1' } }),
        ],
      } as unknown as Extract<LoadedBlock, { type: 'threshold-list' }>,
      PARAMETERS,
    );
    expect(list.items).toEqual([
      expect.objectContaining({
        label: 'VCW',
        name: 'Vena contracta width',
        population: 'Male',
        text: '≥ 7 mm',
        footnotes: [1],
      }),
    ]);
    expect(list.footnotes).toEqual(['c']);
  });
});
