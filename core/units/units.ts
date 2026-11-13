/**
 * Unit layer (TS-02.2.7). Values are stored and displayed exactly as published (decision PO-4). This module
 * defines the units allowed per quantity and a common unit per quantity, used only to *compare* values from
 * different sources (discrepancies, plausibility), converting with exact decimal-point shifts, never with
 * floating-point arithmetic, so a published "40 mm²" compares equal to "0.40 cm²".
 * Safety-critical (hazard: wrong unit or conversion): 100 % coverage, exhaustive tests.
 */
import type { Parameter } from '../../schema/generated/parameter';

export type Quantity = Parameter['quantity'];
export type Unit = Parameter['unit'];

interface QuantityUnits {
  /** Units a value of this quantity may be published in. */
  units: readonly Unit[];
  /** Common unit for comparisons across sources; undefined = compare only values in the same unit. */
  common: Unit | undefined;
}

export const QUANTITY_UNITS: Readonly<Record<Quantity, QuantityUnits>> = {
  dimensionless: { units: ['1'], common: '1' },
  ratio: { units: ['1'], common: '1' },
  percent: { units: ['%'], common: '%' },
  length: { units: ['mm', 'cm'], common: 'mm' },
  'indexed-length': { units: ['mm/m²', 'cm/m²'], common: undefined },
  area: { units: ['mm²', 'cm²'], common: 'cm²' },
  'indexed-area': { units: ['cm²/m²'], common: 'cm²/m²' },
  volume: { units: ['mL'], common: 'mL' },
  'indexed-volume': { units: ['mL/m²'], common: 'mL/m²' },
  mass: { units: ['g'], common: 'g' },
  'indexed-mass': { units: ['g/m²', 'g/m^2.7'], common: undefined },
  'velocity-blood': { units: ['m/s', 'cm/s'], common: 'm/s' },
  'velocity-tissue': { units: ['cm/s', 'm/s'], common: 'cm/s' },
  'velocity-time-integral': { units: ['cm'], common: 'cm' },
  acceleration: { units: ['m/s²', 'cm/s²'], common: 'm/s²' },
  pressure: { units: ['mmHg'], common: 'mmHg' },
  time: { units: ['ms', 's'], common: 'ms' },
  'heart-rate': { units: ['bpm'], common: 'bpm' },
  'flow-rate': { units: ['mL/s'], common: 'mL/s' },
  'calcium-score': { units: ['AU'], common: 'AU' },
  angle: { units: ['°'], common: '°' },
  age: { units: ['years'], common: 'years' },
  'coupling-ratio': { units: ['mm/mmHg'], common: 'mm/mmHg' },
  'vascular-resistance': { units: ['WU'], common: 'WU' },
  'mass-per-height': { units: ['g/m'], common: 'g/m' },
  'indexed-flow-rate': { units: ['mL/min/kg'], common: 'mL/min/kg' },
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
  'cm/s²': { family: 'acceleration', exponent: 0 },
  'm/s²': { family: 'acceleration', exponent: 2 },
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

export const commonUnit = (quantity: Quantity, publishedUnit: Unit): Unit =>
  QUANTITY_UNITS[quantity].common ?? publishedUnit;

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

export interface CommonValue {
  value: string;
  unit: Unit;
}

/** Converts a published value to the common unit of its quantity, for comparisons only (never displayed). */
export function toCommonUnit(quantity: Quantity, value: string, publishedUnit: Unit): CommonValue {
  if (!isUnitAllowed(quantity, publishedUnit)) {
    throw new Error(`unit '${publishedUnit}' is not valid for quantity '${quantity}'`);
  }
  const unit = commonUnit(quantity, publishedUnit);
  return { value: convert(value, publishedUnit, unit), unit };
}

/** Content rule: a parameter's unit must belong to its quantity and be the common unit when one is defined. */
export function checkParameterUnit(parameter: Parameter): string | undefined {
  const { quantity, unit } = parameter;
  if (!isUnitAllowed(quantity, unit)) {
    return `unit '${unit}' is not valid for quantity '${quantity}' (allowed: ${allowedUnits(quantity).join(', ')})`;
  }
  const common = QUANTITY_UNITS[quantity].common;
  if (common !== undefined && unit !== common) {
    return `unit must be the common unit '${common}' for quantity '${quantity}' (used to compare values across sources)`;
  }
  return undefined;
}
