import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadContent } from '../../core/content/loader';
import { renderSummary, summariseChanges } from './summary';

const FIXTURES = join(import.meta.dirname, '../../core/view/__fixtures__');
const base = loadContent(FIXTURES).bundle;
const LEAF = 'content/topics/fixture-leaf.yaml';

let head: string;
beforeEach(() => {
  head = mkdtempSync(join(tmpdir(), 'valvia-summary-'));
  cpSync(FIXTURES, head, { recursive: true });
});
afterEach(() => {
  rmSync(head, { recursive: true, force: true });
});

const edit = (file: string, from: string, to: string): void => {
  const path = join(head, file);
  const text = readFileSync(path, 'utf8');
  if (!text.includes(from)) throw new Error(`fixture text not found: ${from}`);
  writeFileSync(path, text.replace(from, to));
};
const headBundle = () => loadContent(head).bundle;

describe('summariseChanges (TS-06.2.4)', () => {
  it('reports nothing when the content is unchanged', () => {
    expect(summariseChanges(base, headBundle())).toEqual({ values: [], topics: [], sources: [] });
  });

  it('shows a changed number as old → new with topic, parameter, population, society and locator', () => {
    edit(LEAF, 'value: 0.30', 'value: 0.35');
    expect(summariseChanges(base, headBundle()).values).toEqual([
      {
        change: 'changed',
        topic: 'Fixture leaf',
        parameter: 'EROA',
        population: 'Adults',
        source: 'ASE · Fixture ASE 2021 (2021)',
        old: 'severe: ≥ 0.30 cm²',
        new: 'severe: ≥ 0.35 cm²',
        locator: 'Table 1',
      },
    ]);
  });

  it('reports a unit or locator change as a change, not as removal plus addition', () => {
    edit(LEAF, 'value: 0.7\n        unit: cm', 'value: 7\n        unit: mm');
    const [row] = summariseChanges(base, headBundle()).values;
    expect(row).toMatchObject({ change: 'changed', parameter: 'VC', old: 'severe: ≥ 0.7 cm', new: 'severe: ≥ 7 mm' });
  });

  it('lists added and removed values', () => {
    edit(
      LEAF,
      "        population: { ageGroup: adult, sex: female }\n        citation: { source: fixture-ase-2021, locator: { table: '1' } }\n",
      "        population: { ageGroup: adult, sex: female }\n        citation: { source: fixture-ase-2021, locator: { table: '2' } }\n",
    );
    edit(
      LEAF,
      '        population: { ageGroup: adult, sex: male }',
      '        population: { ageGroup: paediatric, sex: male }',
    );
    const rows = summariseChanges(base, headBundle()).values;
    expect(rows.map((r) => [r.change, r.population, r.old, r.new])).toEqual([
      ['removed', 'Adults · Male', 'severe: ≥ 0.50 cm²', '—'],
      ['changed', 'Adults · Female', 'severe: ≥ 0.45 cm²', 'severe: ≥ 0.45 cm²'],
      ['added', 'Children · Male', '—', 'severe: ≥ 0.50 cm²'],
    ]);
    expect(rows[1]?.locator).toBe('Table 1 → Table 2');
  });

  it('reports topic status changes and source registry changes', () => {
    edit(LEAF, 'status: draft', 'status: published');
    edit('content/sources/fixture-esc-2021.yaml', 'status: current', 'status: withdrawn');
    const summary = summariseChanges(base, headBundle());
    expect(summary.topics).toEqual(['Fixture leaf: status draft → published']);
    expect(summary.sources).toEqual(['fixture-esc-2021 (Fixture ESC 2021): status current → withdrawn']);
  });

  it('reports added and removed sources', () => {
    rmSync(join(head, 'content/sources/fixture-ase-2014.yaml'));
    edit('content/topics/fixture-leaf.yaml', 'fixture-ase-2014', 'fixture-ase-2021');
    writeFileSync(
      join(head, 'content/sources/fixture-new.yaml'),
      "id: fixture-new\ntitle: 'New'\nissuers: [ESC]\ntype: guideline\nyear: 2026\nstatus: current\n",
    );
    expect(summariseChanges(base, headBundle()).sources).toEqual([
      'fixture-ase-2014 (Fixture ASE 2014): removed',
      'fixture-new (New): added',
    ]);
  });
});

describe('summariseChanges: more cases', () => {
  it('reports added and removed topics with their values', () => {
    const leaf = readFileSync(join(head, LEAF), 'utf8');
    rmSync(join(head, LEAF));
    writeFileSync(
      join(head, 'content/topics/fixture-leaf-2.yaml'),
      leaf
        .replace('id: fixture-leaf', 'id: fixture-leaf-2')
        .replace('slug: fixture-leaf', 'slug: fixture-leaf-2')
        .replace('title: Fixture leaf', 'title: Fixture leaf 2'),
    );
    const summary = summariseChanges(base, headBundle());
    expect(summary.topics).toEqual(['Fixture leaf 2: added', 'Fixture leaf: removed']);
    expect(summary.values.filter((v) => v.change === 'removed')).toHaveLength(8);
    expect(summary.values.filter((v) => v.change === 'added')).toHaveLength(8);
  });

  it('shows caveats with the value and labels TEE values', () => {
    edit(LEAF, '        value: 0.40\n', '        value: 0.40\n        caveats: [Not valid in atrial fibrillation.]\n');
    edit(
      LEAF,
      '        value: 0.30\n        unit: cm²\n        modality: Echo\n',
      '        value: 0.30\n        unit: cm²\n        modality: Echo\n        technique: TEE\n',
    );
    const rows = summariseChanges(base, headBundle()).values;
    expect(rows.find((r) => r.change === 'changed')?.new).toBe(
      'severe: ≥ 0.40 cm² (Not valid in atrial fibrillation.)',
    );
    expect(rows.find((r) => r.change === 'added')?.population).toBe('Adults · TEE');
    expect(renderSummary({ values: rows, topics: [], sources: [] })).toContain('1 value changed, 1 added, 1 removed.');
  });

  it('keeps two values with the same identity apart and counts plural changes', () => {
    edit(LEAF, 'value: 0.7\n', 'value: 0.8\n');
    edit(LEAF, 'value: 0.30', 'value: 0.35');
    const markdown = renderSummary(summariseChanges(base, headBundle()));
    expect(markdown).toContain('2 values changed, 0 added, 0 removed.');
  });
});

describe('renderSummary', () => {
  it('renders the PR template table with one row per changed value, escaping pipes', () => {
    edit(LEAF, 'value: 0.30', 'value: 0.35');
    const markdown = renderSummary(summariseChanges(base, headBundle()));
    expect(markdown).toContain(
      '| Topic | Parameter | Population | Society / source | Old value | New value | Locator |',
    );
    expect(markdown).toContain(
      '| Fixture leaf | EROA | Adults | ASE · Fixture ASE 2021 (2021) | severe: ≥ 0.30 cm² | severe: ≥ 0.35 cm² | Table 1 |',
    );
    expect(markdown).toContain('1 value changed, 0 added, 0 removed');
  });

  it('says so when no clinical value changed', () => {
    expect(renderSummary({ values: [], topics: [], sources: [] })).toContain('No clinical value changed');
  });

  it('lists topic and source changes under their own headings', () => {
    const markdown = renderSummary({ values: [], topics: ['T: status draft → published'], sources: ['s: added'] });
    expect(markdown).toContain('### Topics\n\n- T: status draft → published');
    expect(markdown).toContain('### Sources\n\n- s: added');
  });
});
