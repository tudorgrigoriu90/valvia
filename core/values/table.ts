/** Table model for grading-table blocks (TS-04.3.1): parameter rows × grade columns, values in display units. */
import type { Parameter } from '../../schema/generated/parameter';
import type { LoadedBlock, LoadedValue } from '../content/types';
import type { Unit } from '../units/units';
import { displayNumbers, OPERATOR_SYMBOLS } from './format';

export interface TableValue {
  /** Value without unit, e.g. '≥ 0.40' (the unit is shown in the row header). */
  text: string;
  converted: boolean;
  /** Published value with unit, e.g. '≥ 0.7 cm' (shown on tap when converted). */
  original: string;
  /** 1-based footnote numbers of this value's caveats (see GradingTable.footnotes). */
  footnotes: number[];
  value: LoadedValue;
}

export interface TableRow {
  parameter: Parameter;
  /** Abbreviation if available, else the name. */
  label: string;
  name: string;
  /** Display unit; undefined for dimensionless values. */
  unit: Unit | undefined;
  /** One list of values per column. */
  cells: TableValue[][];
}

export interface GradingTable {
  columns: string[];
  rows: TableRow[];
  /** Caveat texts in order of first appearance; identical texts share one number (TS-04.3.6). */
  footnotes: string[];
}

const prefix = (value: LoadedValue): string =>
  value.operator === 'range' ? '' : `${OPERATOR_SYMBOLS[value.operator]} `;

export function buildGradingTable(
  block: Extract<LoadedBlock, { type: 'grading-table' }>,
  parameters: ReadonlyMap<string, Parameter>,
): GradingTable {
  const rows = new Map<string, TableRow>();
  const footnotes: string[] = [];
  const footnoteNumber = (text: string): number => {
    const index = footnotes.indexOf(text);
    if (index !== -1) return index + 1;
    footnotes.push(text);
    return footnotes.length;
  };
  for (const value of block.values) {
    const parameter = parameters.get(value.parameter);
    const column = value.grade === undefined ? -1 : block.grades.indexOf(value.grade);
    if (parameter === undefined || column === -1) continue;
    const display = displayNumbers(value, parameter);
    if (display === undefined) continue;
    const row = rows.get(parameter.id) ?? {
      parameter,
      label: parameter.abbreviation ?? parameter.name,
      name: parameter.name,
      unit: display.unit === '1' ? undefined : display.unit,
      cells: block.grades.map(() => []),
    };
    const published = value.operator === 'range' ? [value.published.min, value.published.max] : [value.published.value];
    row.cells[column]?.push({
      text: `${prefix(value)}${display.numbers.join('–')}`,
      converted: display.converted,
      original: `${prefix(value)}${published.join('–')}${value.unit === '1' ? '' : ` ${value.unit}`}`,
      footnotes: (value.caveats ?? []).map(footnoteNumber),
      value,
    });
    rows.set(parameter.id, row);
  }
  return { columns: [...block.grades], rows: [...rows.values()], footnotes };
}
