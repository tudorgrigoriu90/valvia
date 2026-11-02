import { describe, expect, it } from 'vitest';
import { validateContentFile } from './validate-file';

const VALID_SOURCE = `id: esc-eacts-2025-vhd
title: ESC/EACTS Guidelines for the management of valvular heart disease
issuers: [ESC, EACTS]
type: guideline
year: 2025
journal: European Heart Journal
doi: 10.1093/eurheartj/ehaf194
url: https://www.escardio.org/Guidelines
status: current
`;

const validate = (text: string, file = 'content/sources/esc-eacts-2025-vhd.yaml') =>
  validateContentFile('source', file, text);

describe('validateContentFile(source)', () => {
  it('accepts a valid source', () => {
    expect(validate(VALID_SOURCE).problems).toEqual([]);
  });

  it('allows long publication titles up to 600 characters', () => {
    const long = VALID_SOURCE.replace(/^title: .*$/m, `title: ${'x'.repeat(600)}`);
    expect(validate(long).problems).toEqual([]);
    const tooLong = VALID_SOURCE.replace(/^title: .*$/m, `title: ${'x'.repeat(601)}`);
    expect(validate(tooLong).problems).toEqual([
      expect.objectContaining({ message: 'title must be at most 600 characters (got 601)' }),
    ]);
  });

  it('requires supersededBy when the status is superseded', () => {
    const result = validate(VALID_SOURCE.replace('status: current', 'status: superseded'));
    expect(result.problems).toEqual([
      expect.objectContaining({ line: 1, message: "missing required property 'supersededBy'" }),
    ]);
  });

  it('accepts a superseded source that names its successor', () => {
    const text = VALID_SOURCE.replace('status: current', 'status: superseded\nsupersededBy: esc-2030-vhd');
    expect(validate(text).problems).toEqual([]);
  });

  it('requires citedBy for a z-score dataset', () => {
    const text = VALID_SOURCE.replace('type: guideline', 'type: z-score-dataset');
    expect(validate(text).problems).toEqual([
      expect.objectContaining({ line: 1, message: "missing required property 'citedBy'" }),
    ]);
  });

  it.each([
    [
      'doi: 10.1093/eurheartj/ehaf194',
      'doi: 1093/eurheartj',
      "doi must be a DOI such as 10.1093/eurheartj/ehab395 (got '1093/eurheartj')",
    ],
    [
      'url: https://www.escardio.org/Guidelines',
      'url: http://www.escardio.org',
      "url must be an https URL (got 'http://www.escardio.org')",
    ],
    ['year: 2025', 'year: 1890', 'year must be >= 1990'],
    ['issuers: [ESC, EACTS]', 'issuers: []', 'issuers must NOT have fewer than 1 items'],
    ['issuers: [ESC, EACTS]', 'issuers: [esc]', "issuers[0] must be an upper-case acronym such as ESC (got 'esc')"],
    [
      'type: guideline',
      'type: blog',
      "type must be one of: guideline, recommendation, consensus-statement, position-statement, focused-update, standardized-definitions, z-score-dataset (got 'blog')",
    ],
  ])('rejects %s replaced by %s', (from, to, message) => {
    expect(validate(VALID_SOURCE.replace(from, to)).problems).toEqual([expect.objectContaining({ message })]);
  });
});
