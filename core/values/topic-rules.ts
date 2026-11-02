/**
 * Plausibility checks on the values of one topic (TS-02.2.4): unit fits the parameter quantity, modality fits
 * the parameter, no negative sizes, ranges ordered, grades belong to the table, thresholds monotonic across grades.
 * These catch transcription errors before review (hazard log: wrong value, wrong unit).
 */
import type { Parameter } from '../../schema/generated/parameter';
import type { TopicNode } from '../../schema/generated/topic';
import type { PathSegment } from '../content/yaml';
import { allowedUnits, convert, isUnitAllowed, type Quantity } from '../units/units';
import { checkValueModality } from './modality';

export type Block = NonNullable<TopicNode['blocks']>[number];
type GradingTable = Extract<Block, { type: 'grading-table' }>;
export type Value = GradingTable['values'][number];

export interface ValueFinding {
  path: PathSegment[];
  severity: 'error' | 'warning';
  rule: 'value-unit' | 'value-modality' | 'value-range' | 'value-sign' | 'grade-unknown' | 'grade-monotonic';
  message: string;
}

const CAN_BE_NEGATIVE: ReadonlySet<Quantity> = new Set(['percent', 'ratio', 'dimensionless', 'angle', 'acceleration']);

export interface LocatedValue {
  value: Value;
  path: PathSegment[];
}

/** All values of a block with their paths inside the topic file. */
export function valuesOf(block: Block, blockIndex: number): LocatedValue[] {
  const base: PathSegment[] = ['blocks', blockIndex];
  switch (block.type) {
    case 'grading-table':
    case 'normal-range-table':
    case 'threshold-list':
      return block.values.map((value, index) => ({ value, path: [...base, 'values', index] }));
    case 'criteria-checklist':
      return block.criteria.flatMap((criterion, criterionIndex) =>
        (criterion.values ?? []).map((value, index) => ({
          value,
          path: [...base, 'criteria', criterionIndex, 'values', index],
        })),
      );
    default:
      return [];
  }
}

function checkValue({ value, path }: LocatedValue, parameter: Parameter): ValueFinding[] {
  const findings: ValueFinding[] = [];
  const add = (field: string, rule: ValueFinding['rule'], message: string): void => {
    findings.push({ path: [...path, field], severity: 'error', rule, message });
  };
  if (!isUnitAllowed(parameter.quantity, value.unit)) {
    add(
      'unit',
      'value-unit',
      `unit '${value.unit}' is not valid for parameter '${parameter.id}' (${parameter.quantity}: ${allowedUnits(parameter.quantity).join(', ')})`,
    );
  }
  const modalityProblem = checkValueModality(value.modality, parameter);
  if (modalityProblem !== undefined) add('modality', 'value-modality', modalityProblem);
  if (!CAN_BE_NEGATIVE.has(parameter.quantity)) {
    for (const field of ['value', 'min', 'max'] as const) {
      const number = value[field];
      if (number !== undefined && number < 0) {
        add(field, 'value-sign', `${field} (${String(number)}) must not be negative for ${parameter.quantity}`);
      }
    }
  }
  if (value.min !== undefined && value.max !== undefined && value.max <= value.min) {
    add('max', 'value-range', `max (${String(value.max)}) must be greater than min (${String(value.min)})`);
  }
  return findings;
}

/** JSON with sorted keys, so qualifiers written in a different order still group together. */
export function stableKey(input: unknown): string {
  if (input === null || typeof input !== 'object') return JSON.stringify(input);
  if (Array.isArray(input)) return `[${input.map(stableKey).join(',')}]`;
  const entries = Object.entries(input as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableKey(v)}`).join(',')}}`;
}

/** The number that positions a value on the grade axis, in the parameter's unit. */
function representative(value: Value, parameter: Parameter): string | undefined {
  const number = value.operator === 'range' ? value.min : value.value;
  if (number === undefined || !isUnitAllowed(parameter.quantity, value.unit)) return undefined;
  try {
    return convert(String(number), value.unit, parameter.unit);
  } catch {
    return undefined;
  }
}

function checkGradingTable(
  block: GradingTable,
  blockIndex: number,
  parameters: ReadonlyMap<string, Parameter>,
): ValueFinding[] {
  const findings: ValueFinding[] = [];
  interface Entry {
    grade: number;
    label: string;
    number: string;
    path: PathSegment[];
  }
  const groups = new Map<string, { parameter: Parameter; entries: Entry[] }>();

  for (const located of valuesOf(block, blockIndex)) {
    const { value, path } = located;
    const gradeIndex = value.grade === undefined ? -1 : block.grades.indexOf(value.grade);
    if (value.grade !== undefined && gradeIndex === -1) {
      findings.push({
        path: [...path, 'grade'],
        severity: 'error',
        rule: 'grade-unknown',
        message: `grade '${value.grade}' is not one of the table grades: ${block.grades.join(', ')}`,
      });
      continue;
    }
    const parameter = parameters.get(value.parameter);
    if (parameter === undefined || value.grade === undefined) continue;
    const number = representative(value, parameter);
    if (number === undefined) continue;
    const key = stableKey([value.parameter, value.population, value.modality, value.citation.source]);
    const group = groups.get(key) ?? { parameter, entries: [] };
    group.entries.push({ grade: gradeIndex, label: value.grade, number, path });
    groups.set(key, group);
  }

  for (const { parameter, entries } of groups.values()) {
    if (new Set(entries.map((entry) => entry.grade)).size !== entries.length) continue;
    const sorted = [...entries].sort((a, b) => a.grade - b.grade);
    let increasing = true;
    let decreasing = true;
    for (let index = 1; index < sorted.length; index += 1) {
      const previous = Number(sorted[index - 1]?.number);
      const current = sorted[index];
      if (current === undefined) continue;
      if (Number(current.number) < previous) increasing = false;
      if (Number(current.number) > previous) decreasing = false;
      if (!increasing && !decreasing) {
        findings.push({
          path: current.path,
          severity: 'error',
          rule: 'grade-monotonic',
          message: `${parameter.id} thresholds are not monotonic across grades: ${sorted
            .map((entry) => `${entry.label} ${entry.number}`)
            .join(', ')} (${parameter.unit})`,
        });
        break;
      }
    }
  }
  return findings;
}

export function checkTopicValues(topic: TopicNode, parameters: ReadonlyMap<string, Parameter>): ValueFinding[] {
  const findings: ValueFinding[] = [];
  (topic.blocks ?? []).forEach((block, blockIndex) => {
    for (const located of valuesOf(block, blockIndex)) {
      const parameter = parameters.get(located.value.parameter);
      if (parameter !== undefined) findings.push(...checkValue(located, parameter));
    }
    if (block.type === 'grading-table') findings.push(...checkGradingTable(block, blockIndex, parameters));
  });
  return findings;
}
