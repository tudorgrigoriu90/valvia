/** Section heading of a content block: its title, or a readable default per block type (TS-04.2.3). */
import type { LoadedBlock } from '../content/types';

const DEFAULTS: Readonly<Record<LoadedBlock['type'], string>> = {
  'grading-table': 'Grading',
  'normal-range-table': 'Normal values',
  'threshold-list': 'Thresholds',
  'criteria-checklist': 'Criteria',
  note: 'Note',
  'algorithm-reference': 'Algorithm',
  'parameter-glossary': 'Parameters and abbreviations',
};

export const blockHeading = (block: LoadedBlock): string => block.title ?? DEFAULTS[block.type];
