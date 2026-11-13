import { describe, expect, it } from 'vitest';
import type { Parameter } from '../../schema/generated/parameter';
import type { ProstheticValve } from '../../schema/generated/prosthetic';
import type { SourceDocument } from '../../schema/generated/source';
import { checkProsthetic } from './rules';

const PARAMETERS = new Map<string, Parameter>([
  ['eoa', { id: 'eoa', name: 'EOA', quantity: 'area', unit: 'cm²', modalities: ['Echo'] }],
  [
    'mean-gradient',
    { id: 'mean-gradient', name: 'Mean gradient', quantity: 'pressure', unit: 'mmHg', modalities: ['Echo'] },
  ],
  ['strain', { id: 'strain', name: 'Strain', quantity: 'percent', unit: '%', modalities: ['Echo'] }],
]);
const SOURCES = new Map<string, SourceDocument>([
  [
    'ase-2024-prosthetic',
    { id: 'ase-2024-prosthetic', title: 't', issuers: ['ASE'], type: 'guideline', year: 2024, status: 'current' },
  ],
]);

type ExpectedValue = ProstheticValve['sizes'][number]['values'][number];
const value = (overrides: Partial<ExpectedValue> = {}): ExpectedValue => ({
  parameter: 'eoa',
  statistic: 'mean-sd',
  mean: 1.45,
  sd: 0.26,
  unit: 'cm²',
  modality: 'Echo',
  population: { ageGroup: 'adult' },
  citation: { source: 'ase-2024-prosthetic', locator: { table: 'A1' } },
  ...overrides,
});

const valve = (first: ExpectedValue, ...rest: ExpectedValue[]): ProstheticValve => ({
  id: 'aortic-example',
  name: 'Example',
  position: 'aortic',
  type: 'transcatheter',
  sizes: [{ size: '23', values: [first, ...rest] }],
});

const check = (first: ExpectedValue, ...rest: ExpectedValue[]) =>
  checkProsthetic(valve(first, ...rest), PARAMETERS, SOURCES);

describe('checkProsthetic (TS-02.2.8)', () => {
  it('accepts values that reference known parameters and sources with fitting units', () => {
    expect(check(value(), value({ parameter: 'mean-gradient', mean: 9.9, sd: 4.3, unit: 'mmHg' }))).toEqual([]);
  });

  it('reports an unknown parameter at the parameter field', () => {
    expect(check(value({ parameter: 'velocity-ratio' }))).toEqual([
      {
        path: ['sizes', 0, 'values', 0, 'parameter'],
        rule: 'value-reference',
        message: "unknown parameter 'velocity-ratio'",
      },
    ]);
  });

  it('skips parameters and sources whose own file is invalid (reported there)', () => {
    const invalid = { parameters: new Set(['velocity-ratio']), sources: new Set(['ase-2099']) };
    const values = value({ parameter: 'velocity-ratio', citation: { source: 'ase-2099', locator: { table: 'A1' } } });
    expect(checkProsthetic(valve(values), PARAMETERS, SOURCES, invalid)).toEqual([]);
  });

  it('reports an unknown source at the citation', () => {
    expect(check(value({ citation: { source: 'esc-2099', locator: { table: '1' } } }))).toEqual([
      {
        path: ['sizes', 0, 'values', 0, 'citation', 'source'],
        rule: 'citation-reference',
        message: "unknown source 'esc-2099'",
      },
    ]);
  });

  it('rejects a unit that does not fit the parameter quantity', () => {
    const [finding] = check(value({ unit: 'mmHg' }));
    expect(finding?.rule).toBe('value-unit');
    expect(finding?.path).toEqual(['sizes', 0, 'values', 0, 'unit']);
    expect(finding?.message).toMatch(/unit 'mmHg' is not valid for parameter 'eoa'/);
  });

  it('rejects a modality the parameter is not measured with', () => {
    expect(check(value({ modality: 'CMR' }))[0]?.rule).toBe('value-modality');
  });

  it('rejects negative numbers for quantities that cannot be negative', () => {
    expect(check(value({ mean: -1.2 })).map((f) => f.path.at(-1))).toEqual(['mean']);
    const threshold = value({ statistic: 'threshold', operator: '<', value: -2 });
    delete threshold.mean;
    delete threshold.sd;
    expect(check(threshold).map((f) => f.rule)).toEqual(['value-sign']);
  });

  it('allows negative numbers for quantities that can be negative (e.g. strain in %)', () => {
    expect(check(value({ parameter: 'strain', mean: -18, sd: 2, unit: '%' }))).toEqual([]);
  });

  it('requires q1 ≤ median ≤ q3', () => {
    const iqr = (median: number, q1: number, q3: number): ExpectedValue => {
      const v = value({ statistic: 'median-iqr', median, q1, q3, parameter: 'mean-gradient', unit: 'mmHg' });
      delete v.mean;
      delete v.sd;
      return v;
    };
    expect(check(iqr(7, 6, 9))).toEqual([]);
    expect(check(iqr(7, 8, 9))).toEqual([
      { path: ['sizes', 0, 'values', 0, 'q1'], rule: 'value-range', message: 'q1 (8) must not exceed median (7)' },
    ]);
    expect(check(iqr(7, 6, 5))).toEqual([
      { path: ['sizes', 0, 'values', 0, 'q3'], rule: 'value-range', message: 'q3 (5) must not be below median (7)' },
    ]);
  });

  it('reports a size label printed twice', () => {
    const twice: ProstheticValve = {
      ...valve(value()),
      sizes: [
        { size: '23', values: [value()] },
        { size: '23', values: [value()] },
      ],
    };
    expect(checkProsthetic(twice, PARAMETERS, SOURCES)).toEqual([
      { path: ['sizes', 1, 'size'], rule: 'duplicate-size', message: "size '23' is listed more than once" },
    ]);
  });
});
