import { describe, expect, it } from 'vitest';
import { validateDefinition } from './validate-file';

const messages = (text: string): string[] =>
  validateDefinition('value', text).problems.map((p) => `${String(p.line)}: ${p.message}`);

const SEVERE_EROA = `parameter: eroa
context: grading
grade: severe
operator: ">="
value: 0.40
unit: cm²
modality: Echo
population:
  ageGroup: adult
citation:
  source: esc-eacts-2025-vhd
  locator: { table: "8" }
`;

describe('value definition (TS-02.2.2)', () => {
  it('accepts a grading threshold', () => {
    expect(messages(SEVERE_EROA)).toEqual([]);
  });

  it('accepts a range with caveats, e.g. a normal range', () => {
    const text = `parameter: lvedd
context: normal-range
operator: range
min: 42
max: 58
unit: mm
modality: Echo
population: { ageGroup: adult, sex: male }
caveats:
  - Not valid in atrial fibrillation.
citation: { source: ase-eacvi-2015-chambers, locator: { table: "2" } }
`;
    expect(messages(text)).toEqual([]);
  });

  it.each([['intervention-threshold'], ['diagnostic-criterion'], ['prognostic-marker']])(
    'accepts the %s context without a grade',
    (context) => {
      expect(messages(SEVERE_EROA.replace('context: grading\ngrade: severe', `context: ${context}`))).toEqual([]);
    },
  );

  it('requires a grade for grading and feasibility values', () => {
    expect(messages(SEVERE_EROA.replace('grade: severe\n', ''))).toEqual(["1: missing required property 'grade'"]);
    expect(messages(SEVERE_EROA.replace('context: grading\ngrade: severe', 'context: feasibility'))).toEqual([
      "1: missing required property 'grade'",
    ]);
  });

  it('requires value for single-bound operators and forbids min/max', () => {
    expect(messages(SEVERE_EROA.replace('value: 0.40', 'min: 0.40'))).toEqual([
      "1: missing required property 'value'",
      '5: min is not allowed here',
    ]);
  });

  it('requires min and max for ranges and forbids value', () => {
    expect(messages(SEVERE_EROA.replace('operator: ">="', 'operator: range'))).toEqual([
      "1: missing required property 'min'",
      "1: missing required property 'max'",
      '5: value is not allowed here',
    ]);
  });

  it('requires modality, population and citation on every value (no orphan numbers)', () => {
    const text = 'parameter: eroa\ncontext: grading\ngrade: severe\noperator: ">="\nvalue: 0.4\nunit: cm²\n';
    expect(messages(text)).toEqual([
      "1: missing required property 'modality'",
      "1: missing required property 'population'",
      "1: missing required property 'citation'",
    ]);
  });

  it.each([
    ['operator: ">="', 'operator: "=>"', "operator must be one of: <, <=, >, >=, =, range (got '=>')"],
    ['value: 0.40', 'value: "0.40"', "value must be number (got string '0.40')"],
    ['unit: cm²', 'unit: cm2', 'unit must be one of:'],
    [
      'context: grading',
      'context: grade',
      "context must be one of: grading, normal-range, intervention-threshold, feasibility, diagnostic-criterion, prognostic-marker (got 'grade')",
    ],
    ['modality: Echo', 'modality: echo', "modality must be one of: Echo, CT, CMR (got 'echo')"],
    ['  ageGroup: adult', '  ageGroup: kids', "population.ageGroup must be one of: adult, paediatric (got 'kids')"],
    [
      '  locator: { table: "8" }',
      '  locator: {}',
      'citation.locator must name at least one of table, figure, section or page',
    ],
  ])('rejects %s replaced by %s', (from, to, message) => {
    const result = messages(SEVERE_EROA.replace(from, to));
    expect(result).toHaveLength(1);
    expect(result[0]).toContain(message);
  });

  it('accepts exclusive range bounds as published (e.g. "> 5.8 to ≤ 6.3")', () => {
    const text = SEVERE_EROA.replace(
      'operator: ">="\nvalue: 0.40',
      'operator: range\nmin: 0.30\nmax: 0.39\nminExclusive: true',
    );
    expect(messages(text)).toEqual([]);
  });

  it('only allows exclusive flags on ranges', () => {
    expect(messages(SEVERE_EROA.replace('value: 0.40', 'value: 0.40\nmaxExclusive: true'))).toEqual([
      '1: maxExclusive is not allowed here'.replace('1:', '6:'),
    ]);
  });
});
