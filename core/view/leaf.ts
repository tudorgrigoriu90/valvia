/** View model of a leaf page (TS-04.7.2): per block, current values and "Previous recommendations". */
import type { ContentBundle, LoadedBlock, LoadedTopic } from '../content/types';
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
}

export function leafView(topic: LoadedTopic, bundle: ContentBundle): LeafSection[] {
  return (topic.blocks ?? []).map((original) => {
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
    return { block, history, noCurrentValue, ageGroups };
  });
}
