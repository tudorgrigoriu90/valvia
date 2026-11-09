/** Display formatting of values: operator symbols, numbers and units exactly as published (decision PO-4). */
import type { Parameter } from '../../schema/generated/parameter';
import type { LoadedValue } from '../content/types';
import { isUnitAllowed, toCommonUnit, type Unit } from '../units/units';

export const OPERATOR_SYMBOLS = { '<': '<', '<=': '≤', '>': '>', '>=': '≥', '=': '=' } as const;

export interface Numbers {
  unit: Unit;
  /** One number for single bounds, two (min, max) for ranges, as decimal strings. */
  numbers: string[];
}

const publishedTexts = (value: LoadedValue): string[] =>
  (value.operator === 'range' ? [value.published.min, value.published.max] : [value.published.value]).map(
    (text) => text ?? '',
  );

/** The numbers and unit to show: exactly as published. Undefined when the unit does not fit the parameter. */
export function displayNumbers(value: LoadedValue, parameter: Parameter): Numbers | undefined {
  if (!isUnitAllowed(parameter.quantity, value.unit)) return undefined;
  return { unit: value.unit, numbers: publishedTexts(value) };
}

/** The numbers in the common unit of the quantity, to compare values across sources (never displayed). */
export function comparableNumbers(value: LoadedValue, parameter: Parameter): Numbers | undefined {
  if (!isUnitAllowed(parameter.quantity, value.unit)) return undefined;
  const common = publishedTexts(value).map((text) => toCommonUnit(parameter.quantity, text, value.unit));
  return { unit: common[0]?.unit ?? value.unit, numbers: common.map((c) => c.value) };
}

/**
 * Value text without unit: '≥ 0.40', '0.20–0.29', or with exclusive bounds as published '> 5.8 to ≤ 6.3'.
 * `numbers` are the (display or published) numbers: one for single bounds, [min, max] for ranges.
 */
export function valueText(value: LoadedValue, numbers: readonly (string | undefined)[]): string {
  if (value.operator !== 'range') return `${OPERATOR_SYMBOLS[value.operator]} ${String(numbers[0])}`;
  const [min, max] = numbers;
  if (value.minExclusive !== true && value.maxExclusive !== true) return `${String(min)}–${String(max)}`;
  return `${value.minExclusive === true ? '>' : '≥'} ${String(min)} to ${value.maxExclusive === true ? '<' : '≤'} ${String(max)}`;
}

export function formatValue(value: LoadedValue, parameter: Parameter): string | undefined {
  const display = displayNumbers(value, parameter);
  if (display === undefined) return undefined;
  const unit = display.unit === '1' ? '' : ` ${display.unit}`;
  return `${valueText(value, display.numbers)}${unit}`;
}
