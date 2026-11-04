/** View model of a leaf page (TS-04.7.2): per block, current values and "Previous recommendations". */
import type { ContentBundle, LoadedBlock, LoadedTopic, LoadedValue } from '../content/types';
import { detectDiscrepancies, valueKey } from '../discrepancy/discrepancy';
import { loadedValuesOf } from '../content/walk';
import { previousRecommendations, withoutHistory } from '../history/history';
import { formatValue } from '../values/format';

export interface HistoryItem {
  label: string;
  text: string;
  /** e.g. 'ASE/EACVI diastolic function 2016 (2016)'. */
  source: string;
  status: 'superseded' | 'withdrawn';
  supersededBy: string | undefined;
}

export interface LeafSection {
  block: LoadedBlock;
  history: HistoryItem[];
  /** True when the block had values but none from a current source remain. */
  noCurrentValue: boolean;
  /** Age groups among the current values (empty for blocks without values), sorted. */
  ageGroups: ('adult' | 'paediatric')[];
  /** Per current value (in block order): true when another current source differs (TS-04.3.4). */
  differs: boolean[];
  /** Side-by-side comparisons for the discrepancies in this block. */
  comparisons: Comparison[];
}

export interface Comparison {
  label: string;
  entries: { source: string; display: string }[];
}

/** The current values of a section that differ between sources, for value markers. */
export function differingValues(section: LeafSection): ReadonlySet<LoadedValue> {
  const values = loadedValuesOf(section.block, 0).map(({ value }) => value);
  return new Set(values.filter((_value, index) => section.differs[index] === true));
}

export function leafView(topic: LoadedTopic, bundle: ContentBundle): LeafSection[] {
  const discrepancies = detectDiscrepancies({ ...bundle, topics: new Map([[topic.id, topic]]) });
  const differingKeys = new Set(discrepancies.flatMap((d) => d.entries.map((e) => valueKey(e.topicId, e.path))));
  const sourceLabel = (id: string): string => {
    const source = bundle.sources.get(id);
    return source === undefined ? id : `${source.shortTitle ?? source.title} (${String(source.year)})`;
  };
  return (topic.blocks ?? []).map((original, blockIndex) => {
    const block = withoutHistory(original, bundle.sources);
    const history: HistoryItem[] = [];
    for (const item of previousRecommendations(original, bundle.sources)) {
      const parameter = bundle.parameters.get(item.value.parameter);
      const text = parameter === undefined ? undefined : formatValue(item.value, parameter);
      if (parameter === undefined || text === undefined) continue;
      history.push({
        label: parameter.abbreviation ?? parameter.name,
        text,
        source: `${item.source.shortTitle ?? item.source.title} (${String(item.source.year)})`,
        status: item.status,
        supersededBy:
          item.supersededBy === undefined
            ? undefined
            : `${item.supersededBy.shortTitle ?? item.supersededBy.title} (${String(item.supersededBy.year)})`,
      });
    }
    const hadValues = loadedValuesOf(original, 0).length > 0;
    const current = loadedValuesOf(block, 0);
    const noCurrentValue = hadValues && current.length === 0;
    const ageGroups = [...new Set(current.map(({ value }) => value.population.ageGroup))].sort();
    const currentSet = new Set(current.map(({ value }) => value));
    const originalCurrent = loadedValuesOf(original, blockIndex).filter(({ value }) => currentSet.has(value));
    const differs = originalCurrent.map(({ path }) => differingKeys.has(valueKey(topic.id, path)));
    const comparisons: Comparison[] = discrepancies
      .filter((d) => d.entries.some((e) => e.path[1] === blockIndex))
      .map((d) => {
        const parameter = bundle.parameters.get(d.parameter);
        return {
          label: parameter?.abbreviation ?? parameter?.name ?? d.parameter,
          entries: d.entries.map((e) => ({ source: sourceLabel(e.source), display: e.display })),
        };
      });
    return { block, history, noCurrentValue, ageGroups, differs, comparisons };
  });
}
