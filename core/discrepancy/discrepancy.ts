/**
 * Build-time discrepancy detection (TS-02.4.1, principle 2): values in the same topic for the same parameter,
 * population, grade, context, modality and technique from different *current* sources that differ in operator or number (compared in a
 * common unit) are reported side by side. Never resolved by picking one. Safety-critical: 100 % coverage.
 */
import type { ContentBundle, LoadedValue } from '../content/types';
import { topicValues } from '../content/walk';
import type { PathSegment } from '../content/yaml';
import { comparableNumbers, formatValue } from '../values/format';
import { stableKey } from '../values/topic-rules';

export interface DiscrepancyEntry {
  source: string;
  topicId: string;
  path: PathSegment[];
  /** Value as published, e.g. '≥ 0.40 cm²'. */
  display: string;
}

export interface Discrepancy {
  parameter: string;
  context: LoadedValue['context'];
  grade?: string;
  modality: LoadedValue['modality'];
  population: LoadedValue['population'];
  entries: DiscrepancyEntry[];
}

/** Stable identity of a value for UI markers: `<topicId>#<path>`. */
export const valueKey = (topicId: string, path: readonly PathSegment[]): string => `${topicId}#${path.join('.')}`;

interface Candidate {
  value: LoadedValue;
  entry: DiscrepancyEntry;
  signature: string;
}

export function detectDiscrepancies(bundle: ContentBundle): Discrepancy[] {
  const groups = new Map<string, Candidate[]>();
  for (const topic of bundle.topics.values()) {
    for (const { value, path } of topicValues(topic)) {
      const parameter = bundle.parameters.get(value.parameter);
      const source = bundle.sources.get(value.citation.source);
      if (parameter === undefined || source?.status !== 'current') continue;
      const numbers = comparableNumbers(value, parameter);
      const display = formatValue(value, parameter);
      if (numbers === undefined || display === undefined) continue;
      const signature = [
        value.operator,
        value.minExclusive === true ? 'min-exclusive' : '',
        value.maxExclusive === true ? 'max-exclusive' : '',
        ...numbers.numbers.map((n) => String(Number(n))),
      ].join('|');
      const key = stableKey([
        topic.id,
        value.parameter,
        value.context,
        value.grade ?? null,
        value.modality,
        value.technique ?? 'TTE',
        value.population,
      ]);
      const group = groups.get(key) ?? [];
      group.push({ value, signature, entry: { source: source.id, topicId: topic.id, path, display } });
      groups.set(key, group);
    }
  }

  const discrepancies: Discrepancy[] = [];
  for (const group of groups.values()) {
    const sources = new Set(group.map((c) => c.entry.source));
    const signatures = new Set(group.map((c) => c.signature));
    if (sources.size < 2 || signatures.size < 2) continue;
    const [{ value }] = group as [Candidate, ...Candidate[]];
    discrepancies.push({
      parameter: value.parameter,
      context: value.context,
      ...(value.grade === undefined ? {} : { grade: value.grade }),
      modality: value.modality,
      population: value.population,
      entries: group.map((c) => c.entry),
    });
  }
  return discrepancies;
}
