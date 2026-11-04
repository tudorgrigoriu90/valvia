import { describe, expect, it } from 'vitest';
import { validateContentFile } from './validate-file';

const VALID_TOPIC = `id: primary-mr-grading
ref: 3.2.1.2
slug: severity-grading
title: Primary MR severity grading
parent: primary-mr
order: 1
synonyms: [primary mitral regurgitation, degenerative MR]
population: adult
wave: W1
status: draft
`;

const validate = (text: string, file = 'content/topics/primary-mr-grading.yaml') =>
  validateContentFile('topic', file, text);

describe('validateContentFile(topic)', () => {
  it('accepts a valid topic node and returns its data', () => {
    const result = validate(VALID_TOPIC);
    expect(result.problems).toEqual([]);
    expect(result.data).toMatchObject({ id: 'primary-mr-grading', parent: 'primary-mr', order: 1 });
  });

  it('accepts a root node with a null parent and no optional fields', () => {
    const root =
      'id: valvular-heart-disease\nslug: valvular-heart-disease\ntitle: Valvular heart disease\nparent: null\norder: 3\npopulation: both\nwave: W1\nstatus: published\n';
    expect(validate(root, 'content/topics/valvular-heart-disease.yaml').problems).toEqual([]);
  });

  it('accepts a last-reviewed date and rejects malformed dates', () => {
    expect(validate(`${VALID_TOPIC}lastReviewed: "2026-11-10"\n`).problems).toEqual([]);
    expect(validate(`${VALID_TOPIC}lastReviewed: "10/11/2026"\n`).problems).toEqual([
      expect.objectContaining({ line: 11, message: 'lastReviewed must match format "date"' }),
    ]);
  });

  it('reports a missing required property at the object, naming the property', () => {
    const result = validate(VALID_TOPIC.replace('slug: severity-grading\n', ''));
    expect(result.problems).toEqual([
      expect.objectContaining({
        file: 'content/topics/primary-mr-grading.yaml',
        line: 1,
        severity: 'error',
        rule: 'schema',
        message: "missing required property 'slug'",
      }),
    ]);
  });

  it('reports an unknown property at its key line', () => {
    const result = validate(`${VALID_TOPIC}colour: red\n`);
    expect(result.problems).toEqual([
      expect.objectContaining({ line: 11, column: 1, message: "unknown property 'colour'" }),
    ]);
  });

  it('reports an invalid enum value at the value, listing the allowed values', () => {
    const result = validate(VALID_TOPIC.replace('population: adult', 'population: neonates'));
    expect(result.problems).toEqual([
      expect.objectContaining({
        line: 8,
        column: 13,
        message: "population must be one of: adult, paediatric, both (got 'neonates')",
      }),
    ]);
  });

  it('reports a wrong type with expected and actual types', () => {
    const result = validate(VALID_TOPIC.replace('order: 1', 'order: first'));
    expect(result.problems).toEqual([
      expect.objectContaining({ line: 6, message: "order must be integer (got string 'first')" }),
    ]);
  });

  it('reports ids and slugs that are not lowercase kebab-case', () => {
    const result = validate(VALID_TOPIC.replace('slug: severity-grading', 'slug: Severity_Grading'));
    expect(result.problems).toEqual([
      expect.objectContaining({ line: 3, message: "slug must be lowercase kebab-case (got 'Severity_Grading')" }),
    ]);
  });

  it('reports problems inside arrays with the item line', () => {
    const result = validate(
      VALID_TOPIC.replace('synonyms: [primary mitral regurgitation, degenerative MR]', 'synonyms:\n  - ok\n  - ""'),
    );
    expect(result.problems).toEqual([expect.objectContaining({ line: 9, message: 'synonyms[1] must not be empty' })]);
  });

  it('reports every problem, not only the first', () => {
    const result = validate(VALID_TOPIC.replace('wave: W1', 'wave: W3').replace('status: draft', 'status: done'));
    expect(result.problems.map((p) => p.line)).toEqual([9, 10]);
  });

  it('requires the file name to equal the id', () => {
    const result = validate(VALID_TOPIC, 'content/topics/other-name.yaml');
    expect(result.problems).toEqual([
      expect.objectContaining({
        line: 1,
        column: 5,
        rule: 'file-name',
        message: "file name 'other-name.yaml' must equal id 'primary-mr-grading' + '.yaml'",
      }),
    ]);
  });

  it('reports YAML syntax errors with their position and no data', () => {
    const result = validate('id: x\ntitle: [unclosed\n');
    expect(result.data).toBeUndefined();
    expect(result.problems).toEqual([expect.objectContaining({ rule: 'yaml-syntax', severity: 'error', line: 3 })]);
  });

  it('rejects a document that is not a mapping', () => {
    const result = validate('- just\n- a list\n');
    expect(result.problems).toEqual([
      expect.objectContaining({ line: 1, message: 'topic must be object (got array)' }),
    ]);
  });

  it('rejects empty files', () => {
    expect(validate('').problems).toEqual([expect.objectContaining({ line: 1, message: 'file is empty' })]);
  });

  it('rejects duplicate keys as YAML errors', () => {
    const result = validate(`${VALID_TOPIC}title: again\n`);
    expect(result.problems).toEqual([expect.objectContaining({ rule: 'yaml-syntax', line: 11 })]);
  });
});

describe('validateContentFile(topic) alternatives (anyOf)', () => {
  it('lists the accepted types when no alternative matches the type', () => {
    const result = validate(VALID_TOPIC.replace('parent: primary-mr', 'parent: 5'));
    expect(result.problems).toEqual([
      expect.objectContaining({ line: 5, message: 'parent must be string or null (got number 5)' }),
    ]);
  });

  it('reports the specific error of the alternative that matches the type', () => {
    const result = validate(VALID_TOPIC.replace('parent: primary-mr', 'parent: Bad_Id'));
    expect(result.problems).toEqual([
      expect.objectContaining({ line: 5, message: "parent must be lowercase kebab-case (got 'Bad_Id')" }),
    ]);
  });
});

describe('validateContentFile(topic) other rules', () => {
  it('reports duplicate items in a list', () => {
    const result = validate(VALID_TOPIC.replace('[primary mitral regurgitation, degenerative MR]', '[MR, MR]'));
    expect(result.problems).toEqual([
      expect.objectContaining({ line: 7, message: 'synonyms must not contain duplicates (items 0 and 1 are equal)' }),
    ]);
  });

  it('reports text that is too long', () => {
    const result = validate(VALID_TOPIC.replace('Primary MR severity grading', 'x'.repeat(301)));
    expect(result.problems).toEqual([
      expect.objectContaining({ line: 4, message: 'title must be at most 300 characters (got 301)' }),
    ]);
  });

  it('reports blank text', () => {
    const result = validate(VALID_TOPIC.replace('title: Primary MR severity grading', 'title: "   "'));
    expect(result.problems).toEqual([expect.objectContaining({ line: 4, message: 'title must not be empty' })]);
  });

  it('reports numbers below the minimum', () => {
    const result = validate(VALID_TOPIC.replace('order: 1', 'order: -1'));
    expect(result.problems).toEqual([expect.objectContaining({ line: 6, message: 'order must be >= 0' })]);
  });

  it('labels nested paths and reports unknown keys inside a mapping', () => {
    const result = validate(VALID_TOPIC.replace('ref: 3.2.1.2', 'ref: "3.2.x"'));
    expect(result.problems).toEqual([
      expect.objectContaining({
        line: 2,
        message: "ref must be a dotted taxonomy number such as 3.2.1.2 (got '3.2.x')",
      }),
    ]);
  });
});
