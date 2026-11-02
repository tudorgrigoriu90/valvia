/** Walks the values of loaded blocks with their paths inside the topic file. */
import type { PathSegment } from './yaml';
import type { LoadedBlock, LoadedTopic, LoadedValue } from './types';

export interface LocatedLoadedValue {
  value: LoadedValue;
  path: PathSegment[];
}

export function loadedValuesOf(block: LoadedBlock, blockIndex: number): LocatedLoadedValue[] {
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

export function topicValues(topic: LoadedTopic): LocatedLoadedValue[] {
  return (topic.blocks ?? []).flatMap((block, index) => loadedValuesOf(block, index));
}
