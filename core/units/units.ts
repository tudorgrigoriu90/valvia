/**
 * Unit layer (TS-02.2.7, NFR-15). Values are stored exactly as published; this module decides the display
 * (house) unit per quantity and converts with exact decimal-point shifts, never with floating-point
 * arithmetic, so a published "40 mm²" is shown as "0.40 cm²" with its original precision.
 * Safety-critical (hazard: wrong unit or conversion): 100 % coverage, exhaustive tests.
 */
import type { Parameter } from '../../schema/generated/parameter';

export type Quantity = Parameter['quantity'];
export type Unit = Parameter['unit'];

interface QuantityUnits {
  /** Units a value of this quantity may be published in. */
  units: readonly Unit[];
  /** House display unit (NFR-15, taxonomy 14.2); undefined = show as published (pending SME F4). */
  display: Unit | undefined;
}

export const QUANTITY_UNITS: Readonly<Record<Quantity, QuantityUnits>> = {
  dimensionless: { units: ['1'], display: '1' },
  ratio: { units: ['1'], display: '1' },
  percent: { units: ['%'], display: '%' },
  length: { units: ['mm', 'cm'], display: 'mm' },
  'indexed-length': { units: ['mm/m²', 'cm/m²'], display: undefined },
  area: { units: ['mm²', 'cm²'], display: 'cm²' },
  'indexed-area': { units: ['cm²/m²'], display: 'cm²/m²' },
  volume: { units: ['mL'], display: 'mL' },
  'indexed-volume': { units: ['mL/m²'], display: 'mL/m²' },
  mass: { units: ['g'], display: 'g' },
  'indexed-mass': { units: ['g/m²', 'g/m^2.7'], display: undefined },
  'velocity-blood': { units: ['m/s', 'cm/s'], display: 'm/s' },
  'velocity-tissue': { units: ['cm/s', 'm/s'], display: 'cm/s' },
  acceleration: { units: ['m/s²'], display: 'm/s²' },
  pressure: { units: ['mmHg'], display: 'mmHg' },
  time: { units: ['ms', 's'], display: 'ms' },
  'heart-rate': { units: ['bpm'], display: 'bpm' },
  'flow-rate': { units: ['mL/s'], display: 'mL/s' },
  'calcium-score': { units: ['AU'], display: 'AU' },
  angle: { units: ['°'], display: '°' },
  age: { units: ['years'], display: 'years' },
};

/** Convertible units: same family, size = 10^exponent base units. Units not listed only convert to themselves. */
const SCALES: Partial<Record<Unit, { family: string; exponent: number }>> = {
  mm: { family: 'length', exponent: 0 },
  cm: { family: 'length', exponent: 1 },
  'mm²': { family: 'area', exponent: 0 },
  'cm²': { family: 'area', exponent: 2 },
  'cm/s': { family: 'velocity', exponent: 0 },
  'm/s': { family: 'velocity', exponent: 2 },
  ms: { family: 'time', exponent: 0 },
  s: { family: 'time', exponent: 3 },
  'mm/m²': { family: 'indexed-length', exponent: 0 },
  'cm/m²': { family: 'indexed-length', exponent: 1 },
};

const PLAIN_DECIMAL = /^(-?)(\d+)(?:\.(\d+))?$/;

/** Multiplies a plain decimal string by 10^exponent by moving the decimal point. Keeps published digits. */
export function shiftDecimal(value: string, exponent: number): string {
  const match = PLAIN_DECIMAL.exec(value);
  if (match === null) throw new Error(`'${value}' is not a plain decimal number`);
  const [, sign = '', integer = '', fraction = ''] = match;
  const digits = integer + fraction;
  const point = integer.length + exponent;
  let whole: string;
  let decimals: string;
  if (point <= 0) {
    whole = '0';
    decimals = '0'.repeat(-point) + digits;
  } else if (point >= digits.length) {
    whole = digits + '0'.repeat(point - digits.length);
    decimals = '';
  } else {
    whole = digits.slice(0, point);
    decimals = digits.slice(point);
  }
  whole = whole.replace(/^0+(?=\d)/, '');
  return `${sign}${whole}${decimals === '' ? '' : `.${decimals}`}`;
}

export const allowedUnits = (quantity: Quantity): readonly Unit[] => QUANTITY_UNITS[quantity].units;

export const isUnitAllowed = (quantity: Quantity, unit: Unit): boolean => allowedUnits(quantity).includes(unit);

export const displayUnit = (quantity: Quantity, publishedUnit: Unit): Unit =>
  QUANTITY_UNITS[quantity].display ?? publishedUnit;

/** Converts a published decimal string between two units of the same family. */
export function convert(value: string, from: Unit, to: Unit): string {
  if (from === to) return shiftDecimal(value, 0);
  const source = SCALES[from];
  const target = SCALES[to];
  if (source === undefined || source.family !== target?.family) {
    throw new Error(`cannot convert ${from} to ${to}`);
  }
  return shiftDecimal(value, source.exponent - target.exponent);
}

export interface DisplayValue {
  value: string;
  unit: Unit;
  /** True when the display differs from the published unit (UI shows the original on tap). */
  converted: boolean;
  original: { value: string; unit: Unit };
}

export function toDisplay(quantity: Quantity, value: string, publishedUnit: Unit): DisplayValue {
  if (!isUnitAllowed(quantity, publishedUnit)) {
    throw new Error(`unit '${publishedUnit}' is not valid for quantity '${quantity}'`);
  }
  const unit = displayUnit(quantity, publishedUnit);
  return {
    value: convert(value, publishedUnit, unit),
    unit,
    converted: unit !== publishedUnit,
    original: { value, unit: publishedUnit },
  };
}

/** Content rule: a parameter's unit must belong to its quantity and be the house unit when one is defined. */
export function checkParameterUnit(parameter: Parameter): string | undefined {
  const { quantity, unit } = parameter;
  if (!isUnitAllowed(quantity, unit)) {
    return `unit '${unit}' is not valid for quantity '${quantity}' (allowed: ${allowedUnits(quantity).join(', ')})`;
  }
  const house = QUANTITY_UNITS[quantity].display;
  if (house !== undefined && unit !== house) {
    return `unit must be the house unit '${house}' for quantity '${quantity}' (NFR-15)`;
  }
  return undefined;
}
