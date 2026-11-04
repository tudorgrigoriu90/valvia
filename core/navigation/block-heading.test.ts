import { describe, expect, it } from 'vitest';
import type { LoadedBlock } from '../content/types';
import { blockHeading } from './block-heading';

describe('blockHeading (TS-04.2.3)', () => {
  it('uses the block title when present', () => {
    expect(blockHeading({ id: 'x', type: 'note', title: 'Measurement' } as LoadedBlock)).toBe('Measurement');
  });

  it.each([
    ['grading-table', 'Grading'],
    ['normal-range-table', 'Normal values'],
    ['threshold-list', 'Thresholds'],
    ['criteria-checklist', 'Criteria'],
    ['note', 'Note'],
    ['algorithm-reference', 'Algorithm'],
  ] as const)('falls back to a readable heading for %s blocks', (type, heading) => {
    expect(blockHeading({ id: 'some-id', type } as LoadedBlock)).toBe(heading);
  });
});
