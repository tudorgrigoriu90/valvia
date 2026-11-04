import { describe, expect, it } from 'vitest';
import type { Parameter } from '../../schema/generated/parameter';
import {
  allowedUnits,
  checkParameterUnit,
  convert,
  displayUnit,
  isUnitAllowed,
  QUANTITY_UNITS,
  shiftDecimal,
  toDisplay,
  type Unit,
} from './units';

describe('shiftDecimal: exact power-of-ten shifts on decimal strings', () => {
  it.each([
    ['40', -2, '0.40'],
    ['0.40', 2, '40'],
    ['2.5', 1, '25'],
    ['25', -1, '2.5'],
    ['1.0', 2, '100'],
    ['0.1', -3, '0.0001'],
    ['12.345', 0, '12.345'],
    ['0.05', 1, '0.5'],
    ['-1.5', 1, '-15'],
    ['-0.5', -1, '-0.05'],
    ['007', 0, '7'],
    ['0', 3, '0'],
    ['0.0', -1, '0.00'],
    ['3', 3, '3000'],
  ])('shifts %s by 10^%i to %s', (value, exponent, expected) => {
    expect(shiftDecimal(value, exponent)).toBe(expected);
  });

  it.each([['1e3'], ['1,5'], [''], ['abc'], ['.5'], ['5.'], ['+5'], ['1.2.3']])('rejects %j', (value) => {
    expect(() => shiftDecimal(value, 1)).toThrow(/not a plain decimal/);
  });

  it('never introduces binary floating-point artefacts', () => {
    // 0.1 + 0.2 style errors: 0.07 cm² × 100 is 7.000000000000001 in floating point.
    expect(0.07 * 100).not.toBe(7);
    expect(shiftDecimal('0.07', 2)).toBe('7');
  });
});

describe('quantity units (NFR-15, taxonomy 14.2)', () => {
  it.each([
    ['length', 'mm'],
    ['area', 'cm²'],
    ['velocity-blood', 'm/s'],
    ['velocity-tissue', 'cm/s'],
    ['volume', 'mL'],
    ['indexed-volume', 'mL/m²'],
    ['indexed-mass', undefined],
    ['pressure', 'mmHg'],
    ['time', 'ms'],
    ['percent', '%'],
    ['indexed-length', undefined],
    ['velocity-time-integral', 'cm'],
  ] as const)('house unit for %s is %s', (quantity, unit) => {
    expect(QUANTITY_UNITS[quantity].display).toBe(unit);
  });

  it('allows cm/s and m/s for both blood-flow and tissue velocities', () => {
    expect(isUnitAllowed('velocity-blood', 'cm/s')).toBe(true);
    expect(isUnitAllowed('velocity-tissue', 'm/s')).toBe(true);
  });

  it('keeps velocity-time integrals in cm, as reported clinically (not converted to mm)', () => {
    expect(allowedUnits('velocity-time-integral')).toEqual(['cm']);
    expect(toDisplay('velocity-time-integral', '60', 'cm')).toMatchObject({
      value: '60',
      unit: 'cm',
      converted: false,
    });
  });

  it('rejects units of a different quantity', () => {
    expect(isUnitAllowed('area', 'mm')).toBe(false);
    expect(isUnitAllowed('length', 'cm²')).toBe(false);
    expect(allowedUnits('indexed-mass')).toEqual(['g/m²', 'g/m^2.7']);
  });

  it('displays in the house unit, or as published when the quantity has none (pending SME F4)', () => {
    expect(displayUnit('area', 'mm²')).toBe('cm²');
    expect(displayUnit('indexed-mass', 'g/m^2.7')).toBe('g/m^2.7');
  });
});

describe('convert', () => {
  it.each<[string, Unit, Unit, string]>([
    ['40', 'mm²', 'cm²', '0.40'],
    ['0.4', 'cm²', 'mm²', '40'],
    ['2.5', 'cm', 'mm', '25'],
    ['45', 'mm', 'cm', '4.5'],
    ['80', 'cm/s', 'm/s', '0.80'],
    ['4.0', 'm/s', 'cm/s', '400'],
    ['0.2', 's', 'ms', '200'],
    ['160', 'ms', 's', '0.160'],
    ['2.75', 'cm/m²', 'mm/m²', '27.5'],
    ['1.2', 'cm²', 'cm²', '1.2'],
  ])('converts %s %s to %s', (value, from, to, expected) => {
    expect(convert(value, from, to)).toBe(expected);
  });

  it.each([
    ['mm', 'cm²'],
    ['g/m²', 'g/m^2.7'],
    ['mL', 'mL/m²'],
    ['mmHg', 'm/s'],
  ] as const)('refuses to convert %s to %s', (from, to) => {
    expect(() => convert('1', from, to)).toThrow(`cannot convert ${from} to ${to}`);
  });

  it('round-trips every convertible unit pair exactly for a range of published values', () => {
    const values = ['0', '0.05', '0.4', '1', '1.0', '2.5', '12', '40', '99.9', '120', '0.875', '3.14159'];
    // Same quantity but different indexation (BSA vs height^2.7): never convertible.
    const incompatible = new Set(['g/m²>g/m^2.7', 'g/m^2.7>g/m²']);
    for (const { units } of Object.values(QUANTITY_UNITS)) {
      for (const from of units) {
        for (const to of units) {
          if (incompatible.has(`${from}>${to}`)) {
            expect(() => convert('1', from, to)).toThrow('cannot convert');
            continue;
          }
          for (const value of values) {
            const there = convert(value, from, to);
            const back = convert(there, to, from);
            expect(Number(back), `${value} ${from} → ${to} → ${from}`).toBe(Number(value));
            expect(Number(there), `${value} ${from} → ${to}`).toBeCloseTo(Number(value) * scaleRatio(from, to), 10);
          }
        }
      }
    }
  });
});

/** Independent oracle for the round-trip test: unit size in base units. */
function scaleRatio(from: string, to: string): number {
  const size: Record<string, number> = {
    mm: 1,
    cm: 10,
    'mm²': 1,
    'cm²': 100,
    'cm/s': 1,
    'm/s': 100,
    ms: 1,
    s: 1000,
    'mm/m²': 1,
    'cm/m²': 10,
  };
  return (size[from] ?? 1) / (size[to] ?? 1);
}

describe('toDisplay', () => {
  it('converts to the house unit and keeps the original for the "original on tap" popover', () => {
    expect(toDisplay('area', '40', 'mm²')).toEqual({
      value: '0.40',
      unit: 'cm²',
      converted: true,
      original: { value: '40', unit: 'mm²' },
    });
  });

  it('marks values already in the house unit as not converted', () => {
    expect(toDisplay('velocity-blood', '4.0', 'm/s')).toEqual({
      value: '4.0',
      unit: 'm/s',
      converted: false,
      original: { value: '4.0', unit: 'm/s' },
    });
  });

  it('shows values as published when the quantity has no house unit', () => {
    expect(toDisplay('indexed-mass', '115', 'g/m²')).toMatchObject({ value: '115', unit: 'g/m²', converted: false });
  });

  it('rejects a published unit that does not belong to the quantity', () => {
    expect(() => toDisplay('area', '4', 'mm')).toThrow("unit 'mm' is not valid for quantity 'area'");
  });
});

describe('checkParameterUnit', () => {
  const parameter = (quantity: Parameter['quantity'], unit: Parameter['unit']): Parameter => ({
    id: 'p',
    name: 'P',
    quantity,
    unit,
    modalities: ['Echo'],
  });

  it('accepts a parameter whose unit is the house unit', () => {
    expect(checkParameterUnit(parameter('area', 'cm²'))).toBeUndefined();
  });

  it('rejects a parameter unit from another quantity', () => {
    expect(checkParameterUnit(parameter('area', 'mm'))).toBe(
      "unit 'mm' is not valid for quantity 'area' (allowed: mm², cm²)",
    );
  });

  it('rejects a parameter that is not displayed in the house unit', () => {
    expect(checkParameterUnit(parameter('length', 'cm'))).toBe(
      "unit must be the house unit 'mm' for quantity 'length' (NFR-15)",
    );
  });

  it('accepts any allowed unit when the quantity has no house unit', () => {
    expect(checkParameterUnit(parameter('indexed-mass', 'g/m^2.7'))).toBeUndefined();
  });
});
