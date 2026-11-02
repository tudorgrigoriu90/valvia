import { describe, expect, it } from 'vitest';
import { validateContentFile, validateDefinition } from './validate-file';

const messages = (text: string): string[] =>
  validateDefinition('block', text).problems.map((p) => `${String(p.line)}: ${p.message}`);

const VALUE = `
      parameter: eroa
      context: grading
      grade: severe
      operator: ">="
      value: 0.40
      unit: cm²
      modality: Echo
      population: { ageGroup: adult }
      citation: { source: esc-eacts-2025-vhd, locator: { table: "8" } }`;

const GRADING_TABLE = `id: severity
type: grading-table
tag: GRADE
title: Severity of primary MR
grades: [mild, moderate, severe]
values:
  - ${VALUE.trim().replace(/\n {6}/g, '\n    ')}
`;

describe('block definition (TS-02.2.3)', () => {
  it('accepts a grading table', () => {
    expect(messages(GRADING_TABLE)).toEqual([]);
  });

  it('accepts a normal-range table and a threshold list', () => {
    expect(
      messages(
        GRADING_TABLE.replace('type: grading-table', 'type: normal-range-table')
          .replace('tag: GRADE', 'tag: NORM')
          .replace('grades: [mild, moderate, severe]\n', ''),
      ),
    ).toEqual([]);
    expect(
      messages(
        GRADING_TABLE.replace('type: grading-table', 'type: threshold-list')
          .replace('tag: GRADE', 'tag: INTV')
          .replace('grades: [mild, moderate, severe]\n', ''),
      ),
    ).toEqual([]);
  });

  it('accepts a criteria checklist with categories (e.g. TEER feasibility)', () => {
    const text = `id: teer-feasibility
type: criteria-checklist
tag: FEAS
title: Anatomical suitability for mitral TEER
criteria:
  - text: Central A2/P2 pathology
    category: favourable
    citation: { source: esc-eacts-2025-vhd, locator: { table: "12" } }
  - text: Severe calcification of the grasping area
    category: unsuitable
    citation: { source: esc-eacts-2025-vhd, locator: { table: "12" } }
`;
    expect(messages(text)).toEqual([]);
  });

  it('accepts a note and an algorithm reference', () => {
    expect(messages('id: method\ntype: note\ntag: METH\ntext: Measure at end-diastole.\n')).toEqual([]);
    const algorithm = `id: as-workup
type: algorithm-reference
tag: ALG
title: Diagnostic work-up of aortic stenosis
citation: { source: esc-eacts-2025-vhd, locator: { figure: "5" } }
url: https://academic.oup.com/eurheartj
`;
    expect(messages(algorithm)).toEqual([]);
  });

  it('names the allowed types for an unknown block type', () => {
    expect(messages('id: x\ntype: chart\ntag: NORM\n')).toEqual([
      "2: type must be one of: grading-table, normal-range-table, threshold-list, criteria-checklist, note, algorithm-reference (got 'chart')",
    ]);
  });

  it('reports only the errors of the selected block type', () => {
    expect(messages(GRADING_TABLE.replace('grades: [mild, moderate, severe]\n', ''))).toEqual([
      "1: missing required property 'grades'",
    ]);
  });

  it('requires at least two ordered grades and at least one value', () => {
    expect(messages(GRADING_TABLE.replace('[mild, moderate, severe]', '[severe]'))).toEqual([
      '5: grades must NOT have fewer than 2 items',
    ]);
    const empty = GRADING_TABLE.slice(0, GRADING_TABLE.indexOf('values:')) + 'values: []\n';
    expect(messages(empty)).toEqual(['6: values must NOT have fewer than 1 items']);
  });

  it('rejects an unknown checklist category and a missing criterion citation', () => {
    const text = 'id: c\ntype: criteria-checklist\ntag: FEAS\ncriteria:\n  - text: x\n    category: maybe\n';
    expect(messages(text)).toEqual([
      "5: criteria[0]: missing required property 'citation'",
      "6: criteria[0].category must be one of: favourable, challenging, unsuitable (got 'maybe')",
    ]);
  });

  it('rejects a tag that does not fit the block type', () => {
    expect(messages('id: method\ntype: note\ntag: GRADE\ntext: x\n')).toEqual([
      "3: tag must be one of: METH, CRIT (got 'GRADE')",
    ]);
  });

  it('rejects algorithm references without a citation (always link to the source, never redraw)', () => {
    expect(messages('id: a\ntype: algorithm-reference\ntag: ALG\ntitle: x\n')).toEqual([
      "1: missing required property 'citation'",
    ]);
  });
});

describe('topic with blocks', () => {
  it('accepts blocks on a topic and positions nested errors on the right line', () => {
    const topic = `id: primary-mr-grading
slug: severity-grading
title: Primary MR severity grading
parent: primary-mr
order: 1
population: adult
wave: W1
status: draft
blocks:
  - id: method
    type: note
    tag: METH
    text: ""
`;
    const result = validateContentFile('topic', 'content/topics/primary-mr-grading.yaml', topic);
    expect(result.problems.map((p) => `${String(p.line)}: ${p.message}`)).toEqual([
      '13: blocks[0].text must not be empty',
    ]);
  });
});
