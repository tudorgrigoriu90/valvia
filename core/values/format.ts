/** Display formatting of values (NFR-15): operator symbols, display units, published precision. */
import type { Parameter } from '../../schema/generated/parameter';
import type { LoadedValue } from '../content/types';
import { isUnitAllowed, toDisplay, type Unit } from '../units/units';

export const OPERATOR_SYMBOLS = { '<': '<', '<=': '≤', '>': '>', '>=': '≥', '=': '=' } as const;

export interface DisplayNumbers {
  unit: Unit;
  /** One number for single bounds, two (min, max) for ranges, as display-unit decimal strings. */
  numbers: string[];
  converted: boolean;
}

export function displayNumbers(value: LoadedValue, parameter: Parameter): DisplayNumbers | undefined {
  if (!isUnitAllowed(parameter.quantity, value.unit)) return undefined;
  const texts = value.operator === 'range' ? [value.published.min, value.published.max] : [value.published.value];
  const shown = texts.map((text) => toDisplay(parameter.quantity, text ?? '', value.unit));
  const [first] = shown;
  /* v8 ignore next */
  if (first === undefined) return undefined;
  return { unit: first.unit, numbers: shown.map((d) => d.value), converted: first.converted };
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
