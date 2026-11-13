import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { hasErrors, loadContent } from './loader';

let root: string;
const write = (relative: string, content: string): void => {
  const file = join(root, 'content', relative);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
};
const problems = (): string[] =>
  loadContent(root).problems.map((p) => `${p.file}:${String(p.line)} ${p.severity} ${p.rule} ${p.message}`);

const SOURCE = `id: esc-2025-vhd
title: ESC/EACTS Guidelines for the management of valvular heart disease
issuers: [ESC, EACTS]
type: guideline
year: 2025
status: current
`;
const PARAMETER =
  'id: eroa\nname: Effective regurgitant orifice area\nabbreviation: EROA\nquantity: area\nunit: cm²\nmodalities: [Echo]\n';
const ROOT =
  'id: vhd\nslug: valvular-heart-disease\ntitle: Valvular heart disease\nparent: null\norder: 3\npopulation: both\nwave: W1\nstatus: published\n';
const leaf = (extra = '', value = '0.40'): string => `id: primary-mr-grading
slug: primary-mr-grading
title: Primary MR severity grading
parent: vhd
order: 1
population: adult
wave: W1
status: published
blocks:
  - id: severity
    type: grading-table
    tag: GRADE
    grades: [moderate, severe]
    values:
      - parameter: eroa
        context: grading
        grade: severe
        operator: ">="
        value: ${value}
        unit: cm²
        modality: Echo
        population: { ageGroup: adult }
        citation: { source: esc-2025-vhd, locator: { table: "8" } }
${extra}`;

const writeValidTree = (): void => {
  write('sources/esc-2025-vhd.yaml', SOURCE);
  write('parameters/eroa.yaml', PARAMETER);
  write('topics/vhd.yaml', ROOT);
  write('topics/primary-mr-grading.yaml', leaf());
};

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'valvia-content-'));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('loadContent', () => {
  it('returns an empty bundle when there is no content yet', () => {
    const result = loadContent(root);
    expect(result.problems).toEqual([]);
    expect(result.bundle.topics.size).toBe(0);
  });

  it('loads a valid tree, ignoring README and .gitkeep files', () => {
    writeValidTree();
    write('README.md', '# docs');
    write('topics/.gitkeep', '');
    const { bundle, problems: found } = loadContent(root);
    expect(found).toEqual([]);
    expect([...bundle.topics.keys()]).toEqual(['primary-mr-grading', 'vhd']);
    expect(bundle.parameters.get('eroa')?.unit).toBe('cm²');
    expect(bundle.sources.get('esc-2025-vhd')?.year).toBe(2025);
    expect(loadContent(root).fileCount).toBe(4);
  });

  it('keeps the published text of numbers, so 0.40 is not shown as 0.4', () => {
    writeValidTree();
    const topic = loadContent(root).bundle.topics.get('primary-mr-grading');
    const block = topic?.blocks?.[0];
    expect(block?.type === 'grading-table' ? block.values[0]?.published : undefined).toEqual({ value: '0.40' });
  });

  it('reports schema problems with the path relative to the repository', () => {
    writeValidTree();
    write('parameters/eroa.yaml', PARAMETER.replace('quantity: area', 'quantity: surface'));
    expect(problems()).toEqual([
      "content/parameters/eroa.yaml:4 error schema quantity must be one of: dimensionless, ratio, percent, length, indexed-length, area, indexed-area, volume, indexed-volume, mass, indexed-mass, velocity-blood, velocity-tissue, velocity-time-integral, acceleration, pressure, time, heart-rate, flow-rate, calcium-score, angle, age, coupling-ratio, vascular-resistance, mass-per-height, indexed-flow-rate (got 'surface')",
    ]);
  });

  it('does not report follow-up reference errors for entities that failed schema validation', () => {
    writeValidTree();
    write('parameters/eroa.yaml', 'id: eroa\n');
    expect(problems().filter((p) => p.includes('unknown parameter'))).toEqual([]);
  });

  it('reports a YAML file with an unknown folder kind only once as a warning', () => {
    write('misc/x.yaml', 'a: 1\n');
    expect(problems()).toEqual([
      'content/misc/x.yaml:1 warning unknown-folder files in content/misc/ are not loaded (expected sources, parameters, topics, prosthetics)',
    ]);
  });

  it('flags warnings without making them errors', () => {
    writeValidTree();
    write('sources/esc-2025-vhd.yaml', SOURCE.replace('[ESC, EACTS]', '[EAPCI]'));
    const result = loadContent(root);
    expect(result.problems).toEqual([
      expect.objectContaining({ severity: 'warning', rule: 'source-allowlist', line: 3 }),
    ]);
    expect(hasErrors(result.problems)).toBe(false);
  });
});

describe('loadContent: integrity', () => {
  it('reports an unknown parent', () => {
    writeValidTree();
    write('topics/primary-mr-grading.yaml', leaf().replace('parent: vhd', 'parent: mitral'));
    expect(problems()).toEqual([
      "content/topics/primary-mr-grading.yaml:4 error topic-reference parent refers to unknown topic 'mitral'",
    ]);
  });

  it('reports parent cycles once', () => {
    write(
      'topics/a.yaml',
      ROOT.replace('id: vhd', 'id: a')
        .replace('parent: null', 'parent: b')
        .replace('slug: valvular-heart-disease', 'slug: a'),
    );
    write(
      'topics/b.yaml',
      ROOT.replace('id: vhd', 'id: b')
        .replace('parent: null', 'parent: a')
        .replace('slug: valvular-heart-disease', 'slug: b'),
    );
    expect(problems()).toEqual(['content/topics/a.yaml:4 error topic-cycle parent chain forms a cycle: a → b → a']);
  });

  it('reports duplicate slugs among siblings, including former slugs', () => {
    writeValidTree();
    write(
      'topics/other.yaml',
      leaf()
        .replace('id: primary-mr-grading', 'id: other')
        .replace(/blocks:[\s\S]*/, ''),
    );
    write(
      'topics/third.yaml',
      leaf()
        .replace('id: primary-mr-grading', 'id: third')
        .replace('slug: primary-mr-grading', 'slug: third\nformerSlugs: [other-old]')
        .replace(/blocks:[\s\S]*/, ''),
    );
    write(
      'topics/fourth.yaml',
      leaf()
        .replace('id: primary-mr-grading', 'id: fourth')
        .replace('slug: primary-mr-grading', 'slug: other-old')
        .replace(/blocks:[\s\S]*/, ''),
    );
    expect(problems()).toEqual([
      "content/topics/primary-mr-grading.yaml:2 error topic-slug slug 'primary-mr-grading' is already used by sibling 'other'",
      "content/topics/third.yaml:3 error topic-slug former slug 'other-old' is used by sibling 'fourth'",
    ]);
  });

  it('reports blocks on a node that has children', () => {
    writeValidTree();
    write('topics/vhd.yaml', `${ROOT}blocks:\n  - id: n\n    type: note\n    tag: METH\n    text: x\n`);
    expect(problems()).toEqual([
      'content/topics/vhd.yaml:9 error topic-blocks only leaf topics may have blocks (vhd has children)',
    ]);
  });

  it('reports duplicate block ids within a topic', () => {
    writeValidTree();
    write('topics/primary-mr-grading.yaml', leaf('  - id: severity\n    type: note\n    tag: METH\n    text: x\n'));
    expect(problems()).toEqual([
      "content/topics/primary-mr-grading.yaml:24 error block-id duplicate block id 'severity'",
    ]);
  });

  it('reports unknown parameters, sources and seeAlso targets at their lines', () => {
    writeValidTree();
    const text = leaf()
      .replace('parameter: eroa', 'parameter: pisa')
      .replace('source: esc-2025-vhd', 'source: ase-2017')
      .replace('status: published', 'status: published\nseeAlso: [nowhere]');
    write('topics/primary-mr-grading.yaml', text);
    expect(problems()).toEqual([
      "content/topics/primary-mr-grading.yaml:9 error topic-reference seeAlso[0] refers to unknown topic 'nowhere'",
      "content/topics/primary-mr-grading.yaml:16 error value-reference parameter refers to unknown parameter 'pisa'",
      "content/topics/primary-mr-grading.yaml:24 error citation-reference citation refers to unknown source 'ase-2017'",
    ]);
  });

  it('checks citations of criteria, notes and algorithm references', () => {
    writeValidTree();
    write(
      'topics/primary-mr-grading.yaml',
      leaf(`  - id: teer
    type: criteria-checklist
    tag: FEAS
    criteria:
      - text: x
        citation: { source: missing-a, locator: { table: "1" } }
  - id: alg
    type: algorithm-reference
    tag: ALG
    title: Work-up
    citation: { source: missing-b, locator: { figure: "1" } }
  - id: note
    type: note
    tag: METH
    text: y
    citation: { source: missing-c, locator: { page: "3" } }
`),
    );
    expect(problems().map((p) => p.replace(/^.*error /, ''))).toEqual([
      "citation-reference citation refers to unknown source 'missing-a'",
      "citation-reference citation refers to unknown source 'missing-b'",
      "citation-reference citation refers to unknown source 'missing-c'",
    ]);
  });

  it('requires a z-score reference to point to a z-score dataset', () => {
    writeValidTree();
    write(
      'topics/primary-mr-grading.yaml',
      leaf().replace(
        'population: { ageGroup: adult }',
        'population: { ageGroup: adult, zScoreReference: esc-2025-vhd }',
      ),
    );
    expect(problems()).toEqual([
      "content/topics/primary-mr-grading.yaml:22 error value-reference zScoreReference 'esc-2025-vhd' is not a z-score dataset",
    ]);
    write(
      'topics/primary-mr-grading.yaml',
      leaf().replace('population: { ageGroup: adult }', 'population: { ageGroup: adult, zScoreReference: nope }'),
    );
    expect(problems()).toEqual([
      "content/topics/primary-mr-grading.yaml:22 error value-reference zScoreReference refers to unknown source 'nope'",
    ]);
  });
});

describe('loadContent: content rules', () => {
  it('maps source registry findings to the source file', () => {
    writeValidTree();
    write('sources/esc-2025-vhd.yaml', SOURCE.replace('[ESC, EACTS]', '[WHF]'));
    expect(problems()).toEqual([
      'content/sources/esc-2025-vhd.yaml:3 error source-allowlist issuers WHF are not allowed: only ESC (incl. EACVI) and ASE documents may be cited (SME decision 2)',
    ]);
  });

  it('reports parameter units that are not the common unit', () => {
    writeValidTree();
    write('parameters/eroa.yaml', PARAMETER.replace('unit: cm²', 'unit: mm²'));
    expect(problems()).toEqual([
      "content/parameters/eroa.yaml:5 error parameter-unit unit must be the common unit 'cm²' for quantity 'area' (used to compare values across sources)",
    ]);
  });

  it('reports value plausibility findings at the value line', () => {
    writeValidTree();
    write('topics/primary-mr-grading.yaml', leaf('', '-0.4'));
    expect(problems()).toEqual([
      'content/topics/primary-mr-grading.yaml:19 error value-sign value (-0.4) must not be negative for area',
    ]);
  });
});

describe('loadContent: prosthetic valve catalogue (TS-02.2.8)', () => {
  const PROSTHETIC = `id: aortic-example
name: Example
position: aortic
type: transcatheter
sizes:
  - size: '23'
    values:
      - parameter: eroa
        statistic: mean-sd
        mean: 1.40
        sd: 0.30
        unit: cm²
        modality: Echo
        population: { ageGroup: adult }
        citation: { source: esc-2025-vhd, locator: { table: A1 } }
`;

  it('loads prosthetic valves into the bundle with the published text of their numbers', () => {
    writeValidTree();
    write('prosthetics/aortic-example.yaml', PROSTHETIC);
    const { bundle, problems: found, fileCount } = loadContent(root);
    expect(found).toEqual([]);
    expect(fileCount).toBe(5);
    const value = bundle.prosthetics.get('aortic-example')?.sizes[0]?.values[0];
    expect(value?.mean).toBe(1.4);
    expect(value?.published).toEqual({ mean: '1.40', sd: '0.30' });
  });

  it('reports catalogue rule findings at the value line', () => {
    writeValidTree();
    write('prosthetics/aortic-example.yaml', PROSTHETIC.replace('parameter: eroa', 'parameter: eoa'));
    expect(problems()).toEqual([
      "content/prosthetics/aortic-example.yaml:8 error value-reference unknown parameter 'eoa'",
    ]);
  });

  it('does not load a prosthetic file that fails the schema, and reports it', () => {
    writeValidTree();
    write('prosthetics/aortic-example.yaml', PROSTHETIC.replace('position: aortic', 'position: apical'));
    const result = loadContent(root);
    expect(result.bundle.prosthetics.size).toBe(0);
    expect(result.problems.map((p) => p.rule)).toEqual(['schema']);
  });
});
