import { describe, expect, it } from 'vitest';
import type { LoadedBlock } from '../content/types';
import { blockCitations } from './citations';

const cite = (source: string, locator: Record<string, string>) => ({ source, locator });
const value = (source: string, locator: Record<string, string>) => ({ citation: cite(source, locator) });

describe('blockCitations (TS-04.3.3)', () => {
  it('collects unique sources in order with their distinct locators', () => {
    const block = {
      type: 'grading-table',
      values: [
        value('ase', { table: '8', page: '332' }),
        value('esc', { table: '6' }),
        value('ase', { table: '8', page: '332' }),
        value('ase', { table: '9' }),
      ],
    } as unknown as LoadedBlock;
    expect(blockCitations(block)).toEqual([
      { source: 'ase', locators: ['Table 8, p. 332', 'Table 9'] },
      { source: 'esc', locators: ['Table 6'] },
    ]);
  });

  it('includes criteria, their values, notes and algorithm references', () => {
    const checklist = {
      type: 'criteria-checklist',
      criteria: [
        { citation: cite('a', { figure: '1' }), values: [value('b', { table: '2' })] },
        { citation: cite('a', { figure: '1' }) },
      ],
    } as unknown as LoadedBlock;
    expect(blockCitations(checklist).map((c) => c.source)).toEqual(['a', 'b']);
    expect(blockCitations({ type: 'note', citation: cite('n', { page: '3' }) } as unknown as LoadedBlock)).toEqual([
      { source: 'n', locators: ['p. 3'] },
    ]);
    expect(blockCitations({ type: 'note' } as unknown as LoadedBlock)).toEqual([]);
    expect(
      blockCitations({ type: 'algorithm-reference', citation: cite('g', { figure: '5' }) } as unknown as LoadedBlock),
    ).toEqual([{ source: 'g', locators: ['Figure 5'] }]);
  });
});
