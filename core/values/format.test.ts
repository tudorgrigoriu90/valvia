import { describe, expect, it } from 'vitest';
import type { Parameter } from '../../schema/generated/parameter';
import type { LoadedValue } from '../content/types';
import { displayNumbers, formatValue, OPERATOR_SYMBOLS } from './format';

const area: Parameter = { id: 'eroa', name: 'EROA', quantity: 'area', unit: 'cm²', modalities: ['Echo'] };
const ratio: Parameter = { id: 'ee', name: 'E/e′', quantity: 'ratio', unit: '1', modalities: ['Echo'] };

const value = (fields: Record<string, unknown>): LoadedValue => fields as unknown as LoadedValue;

describe('formatValue', () => {
  it('formats a single bound in the display unit with the operator symbol', () => {
    expect(formatValue(value({ operator: '>=', unit: 'mm²', published: { value: '40' } }), area)).toBe('≥ 0.40 cm²');
  });

  it('formats a range with an en dash', () => {
    expect(formatValue(value({ operator: 'range', unit: 'cm²', published: { min: '0.20', max: '0.39' } }), area)).toBe(
      '0.20–0.39 cm²',
    );
  });

  it('spells out exclusive bounds as published', () => {
    expect(
      formatValue(
        value({ operator: 'range', unit: 'cm²', minExclusive: true, published: { min: '0.30', max: '0.39' } }),
        area,
      ),
    ).toBe('> 0.30 to ≤ 0.39 cm²');
    expect(
      formatValue(
        value({ operator: 'range', unit: 'cm²', maxExclusive: true, published: { min: '0.30', max: '0.39' } }),
        area,
      ),
    ).toBe('≥ 0.30 to < 0.39 cm²');
  });

  it('omits the unit of dimensionless values', () => {
    expect(formatValue(value({ operator: '>', unit: '1', published: { value: '14' } }), ratio)).toBe('> 14');
  });

  it('maps every operator to its symbol', () => {
    expect(OPERATOR_SYMBOLS).toEqual({ '<': '<', '<=': '≤', '>': '>', '>=': '≥', '=': '=' });
  });
});

describe('displayNumbers', () => {
  it('returns converted numbers and the display unit', () => {
    expect(
      displayNumbers(value({ operator: 'range', unit: 'mm²', published: { min: '20', max: '39' } }), area),
    ).toEqual({
      unit: 'cm²',
      numbers: ['0.20', '0.39'],
      converted: true,
    });
  });

  it('returns undefined when the unit does not fit the parameter', () => {
    expect(displayNumbers(value({ operator: '>', unit: 'mm', published: { value: '4' } }), area)).toBeUndefined();
  });
});
