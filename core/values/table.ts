/**
 * Table models for value blocks (TS-04.3.1): grading tables (parameter/population rows × grade columns),
 * normal-range tables (parameter rows × population columns) and threshold lists. Values in display units,
 * published value kept for the "original" popover, caveats numbered as footnotes (TS-04.3.6).
 */
import type { Parameter } from '../../schema/generated/parameter';
import type { LoadedBlock, LoadedValue } from '../content/types';
import type { Unit } from '../units/units';
import { displayNumbers, valueText } from './format';
import { populationLabel } from './population-label';

export interface TableValue {
  /** Value without unit, e.g. '≥ 0.40' (the unit is shown in the row header). */
  text: string;
  converted: boolean;
  /** Published value with unit, e.g. '≥ 0.7 cm' (shown on tap when converted). */
  original: string;
  /** 1-based footnote numbers of this value's caveats. */
  footnotes: number[];
  value: LoadedValue;
}

export interface TableRow {
  parameter: Parameter;
  /** Abbreviation if available, else the name. */
  label: string;
  name: string;
  /** Population label for grading rows ('' when the value applies to the whole age group). */
  population: string;
  /** Display unit; undefined for dimensionless values. */
  unit: Unit | undefined;
  /** One list of values per column. */
  cells: TableValue[][];
}

export interface ValueTable {
  columns: string[];
  rows: TableRow[];
  /** Caveat texts in order of first appearance; identical texts share one number. */
  footnotes: string[];
}

export interface ThresholdItem extends TableValue {
  label: string;
  name: string;
  population: string;
}

export interface ThresholdList {
  items: ThresholdItem[];
  footnotes: string[];
}

const unitSuffix = (unit: Unit): string => (unit === '1' ? '' : ` ${unit}`);

function footnoteCounter(): { numbers: (caveats: readonly string[] | undefined) => number[]; list: string[] } {
  const list: string[] = [];
  return {
    list,
    numbers: (caveats) =>
      (caveats ?? []).map((text) => {
        const index = list.indexOf(text);
        if (index !== -1) return index + 1;
        list.push(text);
        return list.length;
      }),
  };
}

interface Prepared {
  parameter: Parameter;
  entry: TableValue;
  unit: Unit;
}

function prepare(
  value: LoadedValue,
  parameters: ReadonlyMap<string, Parameter>,
  footnotes: ReturnType<typeof footnoteCounter>,
): Prepared | undefined {
  const parameter = parameters.get(value.parameter);
  if (parameter === undefined) return undefined;
  const display = displayNumbers(value, parameter);
  if (display === undefined) return undefined;
  const published = value.operator === 'range' ? [value.published.min, value.published.max] : [value.published.value];
  return {
    parameter,
    unit: display.unit,
    entry: {
      text: valueText(value, display.numbers),
      converted: display.converted,
      original: `${valueText(value, published)}${unitSuffix(value.unit)}`,
      footnotes: footnotes.numbers(value.caveats),
      value,
    },
  };
}

function newRow(parameter: Parameter, unit: Unit, population: string, columns: number): TableRow {
  return {
    parameter,
    label: parameter.abbreviation ?? parameter.name,
    name: parameter.name,
    population,
    unit: unit === '1' ? undefined : unit,
    cells: Array.from({ length: columns }, () => []),
  };
}

export function buildGradingTable(
  block: Extract<LoadedBlock, { type: 'grading-table' }>,
  parameters: ReadonlyMap<string, Parameter>,
): ValueTable {
  const footnotes = footnoteCounter();
  const rows = new Map<string, TableRow>();
  for (const value of block.values) {
    const column = value.grade === undefined ? -1 : block.grades.indexOf(value.grade);
    if (column === -1) continue;
    const prepared = prepare(value, parameters, footnotes);
    if (prepared === undefined) continue;
    const population = populationLabel(value.population);
    const key = `${prepared.parameter.id}|${population}`;
    const row = rows.get(key) ?? newRow(prepared.parameter, prepared.unit, population, block.grades.length);
    row.cells[column]?.push(prepared.entry);
    rows.set(key, row);
  }
  return { columns: [...block.grades], rows: [...rows.values()], footnotes: footnotes.list };
}

export function buildNormalRangeTable(
  block: Extract<LoadedBlock, { type: 'normal-range-table' }>,
  parameters: ReadonlyMap<string, Parameter>,
): ValueTable {
  const footnotes = footnoteCounter();
  const columns: string[] = [];
  const placed: { prepared: Prepared; column: number }[] = [];
  for (const value of block.values) {
    const prepared = prepare(value, parameters, footnotes);
    if (prepared === undefined) continue;
    const label = populationLabel(value.population) || 'All';
    if (!columns.includes(label)) columns.push(label);
    placed.push({ prepared, column: columns.indexOf(label) });
  }
  const rows = new Map<string, TableRow>();
  for (const { prepared, column } of placed) {
    const row = rows.get(prepared.parameter.id) ?? newRow(prepared.parameter, prepared.unit, '', columns.length);
    row.cells[column]?.push(prepared.entry);
    rows.set(prepared.parameter.id, row);
  }
  return { columns, rows: [...rows.values()], footnotes: footnotes.list };
}

export function buildThresholdList(
  block: Extract<LoadedBlock, { type: 'threshold-list' }>,
  parameters: ReadonlyMap<string, Parameter>,
): ThresholdList {
  const footnotes = footnoteCounter();
  const items: ThresholdItem[] = [];
  for (const value of block.values) {
    const prepared = prepare(value, parameters, footnotes);
    if (prepared === undefined) continue;
    items.push({
      ...prepared.entry,
      text: `${prepared.entry.text}${unitSuffix(prepared.unit)}`,
      label: prepared.parameter.abbreviation ?? prepared.parameter.name,
      name: prepared.parameter.name,
      population: populationLabel(value.population),
    });
  }
  return { items, footnotes: footnotes.list };
}
