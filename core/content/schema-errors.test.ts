import { describe, expect, it } from 'vitest';
import { formatProblem } from './problem';
import { pathLabel, pointerToPath, schemaProblems } from './schema-errors';
import type { ErrorObject } from './schemas';
import { parseYaml, type ParsedYaml } from './yaml';

const parsed = (text: string): ParsedYaml => {
  const result = parseYaml(text);
  if (!result.ok) throw new Error('fixture must be valid YAML');
  return result.value;
};

const error = (overrides: Partial<ErrorObject>): ErrorObject => ({
  keyword: 'x',
  instancePath: '',
  schemaPath: '#',
  params: {},
  ...overrides,
});

describe('pointerToPath', () => {
  it.each([
    ['', []],
    ['/blocks/0/values/12', ['blocks', 0, 'values', 12]],
    ['/a~1b/c~0d', ['a/b', 'c~d']],
  ])('converts %j', (pointer, path) => {
    expect(pointerToPath(pointer)).toEqual(path);
  });
});

describe('pathLabel', () => {
  it.each([
    [[], 'topic'],
    [['title'], 'title'],
    [['blocks', 0, 'values', 2, 'unit'], 'blocks[0].values[2].unit'],
    [[3], '[3]'],
  ])('labels %j as %j', (path, label) => {
    expect(pathLabel(path, 'topic')).toBe(label);
  });
});

describe('schemaProblems', () => {
  const doc = parsed('a:\n  b: hello\n');

  it('prefixes nested required and unknown-property messages with the object path', () => {
    const problems = schemaProblems(
      [
        error({ keyword: 'required', instancePath: '/a', params: { missingProperty: 'c' } }),
        error({ keyword: 'additionalProperties', instancePath: '/a', params: { additionalProperty: 'b' } }),
      ],
      doc,
      'f.yaml',
      'topic',
    );
    expect(problems.map((p) => [p.line, p.column, p.message])).toEqual([
      [2, 3, "a: missing required property 'c'"],
      [2, 3, "a: unknown property 'b'"],
    ]);
  });

  it('formats const, pattern without a name and unknown keywords', () => {
    const problems = schemaProblems(
      [
        error({ keyword: 'const', instancePath: '/a/b', params: { allowedValue: 'x' }, data: 'hello' }),
        error({
          keyword: 'pattern',
          instancePath: '/a/b',
          params: { pattern: '^z$' },
          data: 'hello',
          parentSchema: {},
        }),
        error({ keyword: 'minLength', instancePath: '/a/b', params: { limit: 10 }, data: 'hello' }),
        error({ keyword: 'format', instancePath: '/a/b', message: 'must match format "uri"' }),
        error({ keyword: 'not', instancePath: '/a/b' }),
      ],
      doc,
      'f.yaml',
      'topic',
    );
    expect(problems.map((p) => p.message)).toEqual([
      "a.b must be 'x' (got 'hello')",
      "a.b must match ^z$ (got 'hello')",
      'a.b must be at least 10 characters',
      'a.b must match format "uri"',
      'a.b is invalid',
    ]);
  });

  it('describes values of every type in type errors', () => {
    const types = [true, null, { k: 1 }, 1.5].map((data) =>
      error({ keyword: 'type', instancePath: '/a/b', params: { type: 'string' }, data }),
    );
    expect(schemaProblems(types, doc, 'f.yaml', 'topic').map((p) => p.message)).toEqual([
      'a.b must be string (got boolean true)',
      'a.b must be string (got null)',
      'a.b must be string (got object)',
      'a.b must be string (got number 1.5)',
    ]);
  });

  it('falls back to the nearest existing node for paths that do not exist', () => {
    const [problem] = schemaProblems(
      [error({ keyword: 'required', instancePath: '/a/missing/deeper', params: { missingProperty: 'x' } })],
      doc,
      'f.yaml',
      'topic',
    );
    expect(problem).toMatchObject({ line: 2, column: 3 });
  });

  it('removes exact duplicates', () => {
    const e = error({ keyword: 'type', instancePath: '/a/b', params: { type: 'number' }, data: 'hello' });
    expect(schemaProblems([e, e], doc, 'f.yaml', 'topic')).toHaveLength(1);
  });
});

describe('formatProblem', () => {
  it('formats file:line:column severity rule message', () => {
    expect(
      formatProblem({ file: 'a.yaml', line: 2, column: 5, severity: 'warning', rule: 'schema', message: 'x' }),
    ).toBe('a.yaml:2:5 warning schema x');
  });
});
