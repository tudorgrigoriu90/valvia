/**
 * Shared fixture scenarios (TS-02.4.3): a small content tree under `__fixtures__/content` goes through the real
 * loader, discrepancy detection, history logic and leaf view, so the three cases the site must get right are
 * checked end to end: agreement, disagreement and a superseded value.
 */
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { hasErrors, loadContent } from '../content/loader';
import { detectDiscrepancies } from '../discrepancy/discrepancy';
import { leafView } from './leaf';

const FIXTURE_ROOT = join(import.meta.dirname, '__fixtures__');
const loaded = loadContent(FIXTURE_ROOT);
const { bundle } = loaded;

const sectionOf = (blockId: string) => {
  const topic = bundle.topics.get('fixture-leaf');
  if (topic === undefined) throw new Error('fixture topic missing');
  const section = leafView(topic, bundle).find((s) => s.block.id === blockId);
  if (section === undefined) throw new Error(`fixture block ${blockId} missing`);
  return section;
};

describe('fixture content tree', () => {
  it('loads without errors', () => {
    expect(hasErrors(loaded.problems)).toBe(false);
    expect(loaded.fileCount).toBe(7);
  });
});

describe('agreement', () => {
  it('does not flag sources that publish the same cut-off in different units (7 mm and 0.7 cm)', () => {
    const discrepancies = detectDiscrepancies(bundle).filter((d) => d.parameter === 'fixture-vc');
    expect(discrepancies).toEqual([]);
  });

  it('shows both agreeing values unmarked, each with its published unit', () => {
    const section = sectionOf('agreement');
    expect(section.differs).toEqual([false, false]);
    expect(section.comparisons).toEqual([]);
  });
});

describe('disagreement', () => {
  it('flags two current sources that publish different numbers for the same parameter, population and grade', () => {
    const discrepancies = detectDiscrepancies(bundle).filter((d) => d.parameter === 'fixture-eroa');
    expect(discrepancies).toHaveLength(1);
    expect(discrepancies[0]?.entries.map((e) => e.source).sort()).toEqual(['fixture-ase-2021', 'fixture-esc-2021']);
  });

  it('marks both values and shows them side by side without picking one', () => {
    const section = sectionOf('disagreement');
    expect(section.differs).toEqual([true, true]);
    expect(section.comparisons).toEqual([
      {
        label: 'EROA',
        entries: expect.arrayContaining([
          { source: 'Fixture ESC 2021 (2021)', display: '≥ 0.40 cm²' },
          { source: 'Fixture ASE 2021 (2021)', display: '≥ 0.30 cm²' },
        ]) as unknown,
      },
    ]);
  });

  it('does not compare values for different populations (male and female)', () => {
    expect(sectionOf('population').differs).toEqual([false, false]);
    expect(sectionOf('population').comparisons).toEqual([]);
  });
});

describe('superseded', () => {
  it('removes the value of a superseded source from the current values', () => {
    const section = sectionOf('superseded');
    expect(section.block.type === 'grading-table' ? section.block.values.map((v) => v.citation.source) : []).toEqual([
      'fixture-ase-2021',
    ]);
  });

  it('lists it under previous recommendations with its year and successor', () => {
    expect(sectionOf('superseded').history).toEqual([
      {
        label: 'EROA',
        text: '≥ 0.35 cm²',
        source: 'Fixture ASE 2014 (2014)',
        status: 'superseded',
        supersededBy: 'Fixture ASE 2021 (2021)',
      },
    ]);
  });

  it('never reports a superseded value as a discrepancy', () => {
    const sources = detectDiscrepancies(bundle).flatMap((d) => d.entries.map((e) => e.source));
    expect(sources).not.toContain('fixture-ase-2014');
  });
});
