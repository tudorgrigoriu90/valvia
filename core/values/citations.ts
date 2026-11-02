/** Sources cited by a block, for the source chips (TS-04.3.3). */
import type { LoadedBlock, LoadedValue } from '../content/types';
import { describeLocator } from './criteria';

type Citation = LoadedValue['citation'];

export interface BlockCitation {
  source: string;
  locators: string[];
}

function citationsOf(block: LoadedBlock): Citation[] {
  switch (block.type) {
    case 'grading-table':
    case 'normal-range-table':
    case 'threshold-list':
      return block.values.map((value) => value.citation);
    case 'criteria-checklist':
      return block.criteria.flatMap((criterion) => [
        criterion.citation,
        ...(criterion.values ?? []).map((value) => value.citation),
      ]);
    case 'note':
      return block.citation === undefined ? [] : [block.citation];
    case 'algorithm-reference':
      return [block.citation];
  }
}

export function blockCitations(block: LoadedBlock): BlockCitation[] {
  const bySource = new Map<string, BlockCitation>();
  for (const citation of citationsOf(block)) {
    const entry = bySource.get(citation.source) ?? { source: citation.source, locators: [] };
    const locator = describeLocator(citation.locator);
    if (!entry.locators.includes(locator)) entry.locators.push(locator);
    bySource.set(citation.source, entry);
  }
  return [...bySource.values()];
}
