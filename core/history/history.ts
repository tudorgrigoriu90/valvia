/**
 * Supersession history (TS-02.4.2, SME decision 3): values from superseded or withdrawn sources are never shown
 * as current; they move to "Previous recommendations" with the year and the document that replaced them.
 * Safety-critical (hazard: superseded value shown as current): 100 % coverage.
 */
import type { SourceDocument } from '../../schema/generated/source';
import type { LoadedBlock, LoadedValue } from '../content/types';
import { loadedValuesOf } from '../content/walk';

export interface HistoricalValue {
  value: LoadedValue;
  source: SourceDocument;
  status: 'superseded' | 'withdrawn';
  /** The current document at the end of the supersession chain, when there is one. */
  supersededBy: SourceDocument | undefined;
}

/** Follows `supersededBy` to the current document; undefined for current, withdrawn, unknown or cyclic chains. */
export function currentSuccessor(
  sourceId: string,
  sources: ReadonlyMap<string, SourceDocument>,
): SourceDocument | undefined {
  const seen = new Set<string>();
  let source = sources.get(sourceId);
  if (source?.status !== 'superseded') return undefined;
  while (source?.status === 'superseded' && source.supersededBy !== undefined && !seen.has(source.id)) {
    seen.add(source.id);
    source = sources.get(source.supersededBy);
  }
  return source?.status === 'current' ? source : undefined;
}

/** True unless the cited source is registered and not current (unknown sources are reported by validation). */
const isCurrent = (value: LoadedValue, sources: ReadonlyMap<string, SourceDocument>): boolean =>
  (sources.get(value.citation.source)?.status ?? 'current') === 'current';

/** The block with values of superseded or withdrawn sources removed. */
export function withoutHistory(block: LoadedBlock, sources: ReadonlyMap<string, SourceDocument>): LoadedBlock {
  const keep = (values: LoadedValue[]): LoadedValue[] => values.filter((v) => isCurrent(v, sources));
  switch (block.type) {
    case 'grading-table':
    case 'normal-range-table':
    case 'threshold-list':
      return { ...block, values: keep(block.values) };
    case 'criteria-checklist':
      return {
        ...block,
        criteria: block.criteria.map((c) => (c.values === undefined ? c : { ...c, values: keep(c.values) })),
      };
    default:
      return block;
  }
}

export function previousRecommendations(
  block: LoadedBlock,
  sources: ReadonlyMap<string, SourceDocument>,
): HistoricalValue[] {
  const history: HistoricalValue[] = [];
  for (const { value } of loadedValuesOf(block, 0)) {
    const source = sources.get(value.citation.source);
    if (source === undefined || source.status === 'current') continue;
    history.push({ value, source, status: source.status, supersededBy: currentSuccessor(source.id, sources) });
  }
  return history;
}
