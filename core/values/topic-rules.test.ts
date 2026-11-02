import { describe, expect, it } from 'vitest';
import type { Parameter } from '../../schema/generated/parameter';
import type { TopicNode } from '../../schema/generated/topic';
import { checkTopicValues } from './topic-rules';

type Block = NonNullable<TopicNode['blocks']>[number];
type Value = Extract<Block, { type: 'grading-table' }>['values'][number];

const PARAMETERS = new Map<string, Parameter>([
  ['eroa', { id: 'eroa', name: 'EROA', quantity: 'area', unit: 'cm²', modalities: ['Echo'] }],
  ['rvol', { id: 'rvol', name: 'Regurgitant volume', quantity: 'volume', unit: 'mL', modalities: ['Echo', 'CMR'] }],
  ['gls', { id: 'gls', name: 'GLS', quantity: 'percent', unit: '%', modalities: ['Echo'] }],
  ['lvmi', { id: 'lvmi', name: 'LV mass index', quantity: 'indexed-mass', unit: 'g/m²', modalities: ['Echo'] }],
  ['ava', { id: 'ava', name: 'Aortic valve area', quantity: 'area', unit: 'cm²', modalities: ['Echo', 'CT'] }],
]);

const value = (overrides: Partial<Value>): Value =>
  ({
    parameter: 'eroa',
    context: 'grading',
    grade: 'severe',
    operator: '>=',
    value: 0.4,
    unit: 'cm²',
    modality: 'Echo',
    population: { ageGroup: 'adult' },
    citation: { source: 'esc', locator: { table: '8' } },
    ...overrides,
  });

const topic = (blocks: Block[]): TopicNode => ({
  id: 't',
  slug: 't',
  title: 'T',
  parent: 'p',
  order: 0,
  population: 'adult',
  wave: 'W1',
  status: 'draft',
  blocks,
});

const grading = (values: Value[], grades = ['mild', 'moderate', 'severe']): Block => ({
  id: 'severity',
  type: 'grading-table',
  tag: 'GRADE',
  grades,
  values,
});

describe('checkTopicValues: per-value rules', () => {
  it('accepts a consistent grading table', () => {
    const values = [
      value({ grade: 'mild', operator: '<', value: 0.2 }),
      value({ grade: 'moderate', operator: 'range', value: undefined, min: 0.2, max: 0.39 }),
      value({ grade: 'severe', operator: '>=', value: 0.4 }),
    ];
    expect(checkTopicValues(topic([grading(values)]), PARAMETERS)).toEqual([]);
  });

  it('rejects a unit that does not belong to the parameter quantity', () => {
    expect(checkTopicValues(topic([grading([value({ unit: 'mm' })])]), PARAMETERS)).toEqual([
      {
        path: ['blocks', 0, 'values', 0, 'unit'],
        severity: 'error',
        rule: 'value-unit',
        message: "unit 'mm' is not valid for parameter 'eroa' (area: mm², cm²)",
      },
    ]);
  });

  it('accepts a convertible published unit (40 mm² for a cm² parameter)', () => {
    expect(checkTopicValues(topic([grading([value({ unit: 'mm²', value: 40 })])]), PARAMETERS)).toEqual([]);
  });

  it('rejects a modality the parameter is not measured with', () => {
    expect(checkTopicValues(topic([grading([value({ modality: 'CMR' })])]), PARAMETERS)).toEqual([
      expect.objectContaining({ path: ['blocks', 0, 'values', 0, 'modality'], rule: 'value-modality' }),
    ]);
  });

  it('rejects ranges whose min is not below max', () => {
    const range = value({ operator: 'range', value: undefined, min: 0.4, max: 0.2 });
    expect(checkTopicValues(topic([grading([range])]), PARAMETERS)).toEqual([
      expect.objectContaining({
        path: ['blocks', 0, 'values', 0, 'max'],
        rule: 'value-range',
        message: 'max (0.2) must be greater than min (0.4)',
      }),
    ]);
  });

  it('rejects negative numbers for quantities that cannot be negative, but allows negative strain', () => {
    expect(checkTopicValues(topic([grading([value({ value: -0.1 })])]), PARAMETERS)).toEqual([
      expect.objectContaining({
        path: ['blocks', 0, 'values', 0, 'value'],
        rule: 'value-sign',
        message: 'value (-0.1) must not be negative for area',
      }),
    ]);
    const strain = value({
      parameter: 'gls',
      unit: '%',
      value: -18,
      operator: '>',
      context: 'normal-range',
      grade: undefined,
    });
    const block: Block = { id: 'n', type: 'normal-range-table', tag: 'NORM', values: [strain] };
    expect(checkTopicValues(topic([block]), PARAMETERS)).toEqual([]);
  });

  it('rejects a negative range end', () => {
    const range = value({ operator: 'range', value: undefined, min: -1, max: 0.2 });
    expect(checkTopicValues(topic([grading([range])]), PARAMETERS)).toContainEqual(
      expect.objectContaining({ path: ['blocks', 0, 'values', 0, 'min'], rule: 'value-sign' }),
    );
  });

  it('skips values whose parameter is unknown (reported by the integrity check)', () => {
    expect(checkTopicValues(topic([grading([value({ parameter: 'nope' })])]), PARAMETERS)).toEqual([]);
  });

  it('checks values nested in checklist criteria', () => {
    const block: Block = {
      id: 'teer',
      type: 'criteria-checklist',
      tag: 'FEAS',
      criteria: [
        {
          text: 'MVA',
          category: 'favourable',
          citation: { source: 's', locator: { table: '1' } },
          values: [value({ unit: 'mm', context: 'feasibility', grade: 'favourable' })],
        },
        { text: 'No values', citation: { source: 's', locator: { table: '1' } } },
      ],
    };
    expect(checkTopicValues(topic([block]), PARAMETERS)).toEqual([
      expect.objectContaining({ path: ['blocks', 0, 'criteria', 0, 'values', 0, 'unit'], rule: 'value-unit' }),
    ]);
  });

  it('ignores blocks without values and topics without blocks', () => {
    const note: Block = { id: 'n', type: 'note', tag: 'METH', text: 'x' };
    expect(checkTopicValues(topic([note]), PARAMETERS)).toEqual([]);
    const { blocks: _blocks, ...withoutBlocks } = topic([]);
    expect(checkTopicValues(withoutBlocks, PARAMETERS)).toEqual([]);
  });
});

describe('checkTopicValues: grading tables', () => {
  it('rejects a grade that is not one of the table grades', () => {
    expect(checkTopicValues(topic([grading([value({ grade: 'torrential' })])]), PARAMETERS)).toEqual([
      expect.objectContaining({
        path: ['blocks', 0, 'values', 0, 'grade'],
        rule: 'grade-unknown',
        message: "grade 'torrential' is not one of the table grades: mild, moderate, severe",
      }),
    ]);
  });

  it('rejects thresholds that do not move in one direction across grades (likely transcription error)', () => {
    const values = [
      value({ grade: 'mild', operator: '<', value: 0.2 }),
      value({ grade: 'moderate', operator: 'range', value: undefined, min: 0.5, max: 0.6 }),
      value({ grade: 'severe', operator: '>=', value: 0.4 }),
    ];
    expect(checkTopicValues(topic([grading(values)]), PARAMETERS)).toEqual([
      expect.objectContaining({
        path: ['blocks', 0, 'values', 2],
        rule: 'grade-monotonic',
        message: 'eroa thresholds are not monotonic across grades: mild 0.2, moderate 0.5, severe 0.4 (cm²)',
      }),
    ]);
  });

  it('accepts decreasing thresholds (e.g. valve area falls as stenosis worsens)', () => {
    const values = [
      value({ parameter: 'ava', grade: 'mild', operator: '>', value: 1.5 }),
      value({ parameter: 'ava', grade: 'moderate', operator: 'range', value: undefined, min: 1.0, max: 1.5 }),
      value({ parameter: 'ava', grade: 'severe', operator: '<', value: 1.0 }),
    ];
    expect(checkTopicValues(topic([grading(values)]), PARAMETERS)).toEqual([]);
  });

  it('compares values converted to the parameter unit', () => {
    const values = [value({ grade: 'moderate', unit: 'mm²', value: 20 }), value({ grade: 'severe', value: 0.4 })];
    expect(checkTopicValues(topic([grading(values)]), PARAMETERS)).toEqual([]);
  });

  it('checks each parameter, population, modality and source separately', () => {
    const values = [
      value({ grade: 'mild', value: 0.2 }),
      value({ grade: 'severe', value: 0.4 }),
      value({ grade: 'mild', value: 0.5, population: { ageGroup: 'paediatric' } }),
      value({ grade: 'severe', value: 0.3, population: { ageGroup: 'paediatric' } }),
      value({ parameter: 'rvol', unit: 'mL', grade: 'mild', value: 30, modality: 'CMR' }),
      value({ parameter: 'rvol', unit: 'mL', grade: 'severe', value: 60, modality: 'CMR' }),
    ];
    expect(checkTopicValues(topic([grading(values)]), PARAMETERS)).toEqual([]);
  });

  it('skips the monotonic check when a group repeats a grade', () => {
    const values = [
      value({ grade: 'severe', value: 0.4 }),
      value({ grade: 'severe', value: 0.3 }),
      value({ grade: 'mild', value: 0.5 }),
    ];
    expect(checkTopicValues(topic([grading(values)]), PARAMETERS)).toEqual([]);
  });

  it('skips values that cannot be compared in the parameter unit (different indexation)', () => {
    const values = [
      value({ parameter: 'lvmi', unit: 'g/m^2.7', grade: 'mild', value: 50 }),
      value({ parameter: 'lvmi', unit: 'g/m²', grade: 'severe', value: 40 }),
    ];
    expect(checkTopicValues(topic([grading(values)]), PARAMETERS)).toEqual([]);
  });
});
