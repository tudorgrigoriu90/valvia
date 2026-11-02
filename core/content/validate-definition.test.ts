import { describe, expect, it } from 'vitest';
import { validateDefinition } from './validate-file';

const messages = (definition: Parameters<typeof validateDefinition>[0], text: string): string[] =>
  validateDefinition(definition, text).problems.map((p) => `${String(p.line)}: ${p.message}`);

describe('citation definition (TS-02.3.2)', () => {
  it('accepts a source id with a table locator', () => {
    expect(messages('citation', 'source: esc-eacts-2025-vhd\nlocator:\n  table: "8"\n')).toEqual([]);
  });

  it('accepts every locator kind together', () => {
    const text =
      'source: ase-2017-regurgitation\nlocator:\n  table: "3"\n  figure: 2B\n  section: "4.2.1"\n  page: e45\n';
    expect(messages('citation', text)).toEqual([]);
  });

  it('requires a source and a locator', () => {
    expect(messages('citation', 'note: x\n')).toEqual([
      "1: missing required property 'source'",
      "1: missing required property 'locator'",
      "1: unknown property 'note'",
    ]);
  });

  it('requires at least one locator field so every value can be found in the source', () => {
    expect(messages('citation', 'source: a\nlocator: {}\n')).toEqual([
      '2: locator must name at least one of table, figure, section or page',
    ]);
  });

  it('rejects unknown locator fields and empty locator values', () => {
    expect(messages('citation', 'source: a\nlocator:\n  line: "3"\n  table: ""\n')).toEqual([
      "3: locator: unknown property 'line'",
      '4: locator.table must not be empty',
    ]);
  });

  it('rejects numbers for locators so "1.10" is never read as 1.1', () => {
    expect(messages('citation', 'source: a\nlocator:\n  section: 1.10\n')).toEqual([
      '3: locator.section must be string (got number 1.1)',
    ]);
  });
});
