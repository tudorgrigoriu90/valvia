import { describe, expect, it } from 'vitest';
import type { SourceDocument } from '../../schema/generated/source';
import { checkSourceRegistry } from './registry-rules';

const source = (overrides: Partial<SourceDocument> & Pick<SourceDocument, 'id'>): SourceDocument => ({
  title: `Document ${overrides.id}`,
  issuers: ['ESC'],
  type: 'guideline',
  year: 2024,
  status: 'current',
  ...overrides,
});

describe('checkSourceRegistry: allowed bodies (SME decision 2)', () => {
  it.each([['ESC'], ['EACVI'], ['ASE']])('accepts documents issued by %s', (issuer) => {
    expect(checkSourceRegistry([source({ id: 'a', issuers: [issuer] })])).toEqual([]);
  });

  it('accepts joint documents when ESC, EACVI or ASE is one of the issuers', () => {
    expect(checkSourceRegistry([source({ id: 'a', issuers: ['EACTS', 'ESC'] })])).toEqual([]);
  });

  it('rejects documents from other bodies', () => {
    expect(checkSourceRegistry([source({ id: 'whf', issuers: ['WHF'] })])).toEqual([
      {
        sourceId: 'whf',
        path: ['issuers'],
        severity: 'error',
        rule: 'source-allowlist',
        message: 'issuers WHF are not allowed: only ESC (incl. EACVI) and ASE documents may be cited (SME decision 2)',
      },
    ]);
  });

  it('warns for ESC association documents while SME question F3 is open', () => {
    expect(checkSourceRegistry([source({ id: 'eapci', issuers: ['EAPCI', 'EACTS'] })])).toEqual([
      {
        sourceId: 'eapci',
        path: ['issuers'],
        severity: 'warning',
        rule: 'source-allowlist',
        message: 'EAPCI is an ESC association other than EACVI: allowed pending SME decision F3',
      },
    ]);
  });
});

describe('checkSourceRegistry: cited z-score datasets (SME follow-up F1)', () => {
  const guideline = source({ id: 'ase-2010-paeds', issuers: ['ASE'] });

  it('accepts a dataset from any body when an ESC/ASE document cites it', () => {
    const dataset = source({ id: 'z', type: 'z-score-dataset', issuers: ['PHN'], citedBy: ['ase-2010-paeds'] });
    expect(checkSourceRegistry([guideline, dataset])).toEqual([]);
  });

  it('rejects a dataset whose citing document is not registered', () => {
    const dataset = source({ id: 'z', type: 'z-score-dataset', issuers: ['PHN'], citedBy: ['missing'] });
    expect(checkSourceRegistry([dataset])).toEqual([
      expect.objectContaining({
        sourceId: 'z',
        path: ['citedBy', 0],
        severity: 'error',
        rule: 'source-reference',
        message: "citedBy[0] refers to unknown source 'missing'",
      }),
    ]);
  });

  it('rejects a dataset cited only by a document that is not an ESC/ASE document', () => {
    const other = source({ id: 'other', issuers: ['WHF'] });
    const dataset = source({ id: 'z', type: 'z-score-dataset', issuers: ['PHN'], citedBy: ['other'] });
    expect(checkSourceRegistry([other, dataset])).toContainEqual(
      expect.objectContaining({
        sourceId: 'z',
        path: ['citedBy', 0],
        rule: 'source-allowlist',
        message: "citedBy[0] 'other' is not an ESC (incl. EACVI) or ASE document",
      }),
    );
  });

  it('rejects a dataset cited by another dataset', () => {
    const first = source({ id: 'z1', type: 'z-score-dataset', issuers: ['X'], citedBy: ['ase-2010-paeds'] });
    const second = source({ id: 'z2', type: 'z-score-dataset', issuers: ['ASE'], citedBy: ['z1'] });
    expect(checkSourceRegistry([guideline, first, second])).toContainEqual(
      expect.objectContaining({
        sourceId: 'z2',
        message: "citedBy[0] 'z1' is not an ESC (incl. EACVI) or ASE document",
      }),
    );
  });

  it('rejects citedBy on documents that are not z-score datasets', () => {
    expect(checkSourceRegistry([guideline, source({ id: 'a', citedBy: ['ase-2010-paeds'] })])).toEqual([
      expect.objectContaining({
        sourceId: 'a',
        path: ['citedBy'],
        rule: 'source-supersession',
        message: 'citedBy is only allowed on z-score datasets',
      }),
    ]);
  });
});

describe('checkSourceRegistry: supersession', () => {
  it('accepts a superseded source that points to a registered successor', () => {
    const old = source({ id: 'old', status: 'superseded', supersededBy: 'new' });
    expect(checkSourceRegistry([old, source({ id: 'new' })])).toEqual([]);
  });

  it('rejects supersededBy on a source that is not superseded', () => {
    expect(checkSourceRegistry([source({ id: 'a', supersededBy: 'b' }), source({ id: 'b' })])).toEqual([
      expect.objectContaining({
        sourceId: 'a',
        path: ['supersededBy'],
        rule: 'source-supersession',
        message: "supersededBy requires status 'superseded' (got 'current')",
      }),
    ]);
  });

  it('rejects an unknown successor', () => {
    expect(checkSourceRegistry([source({ id: 'a', status: 'superseded', supersededBy: 'nope' })])).toEqual([
      expect.objectContaining({
        path: ['supersededBy'],
        rule: 'source-reference',
        message: "supersededBy refers to unknown source 'nope'",
      }),
    ]);
  });

  it('rejects a source that supersedes itself', () => {
    expect(checkSourceRegistry([source({ id: 'a', status: 'superseded', supersededBy: 'a' })])).toEqual([
      expect.objectContaining({
        rule: 'source-supersession',
        message: 'supersededBy must not refer to the source itself',
      }),
    ]);
  });

  it('rejects supersession cycles once, at the first source of the cycle', () => {
    const a = source({ id: 'a', status: 'superseded', supersededBy: 'b' });
    const b = source({ id: 'b', status: 'superseded', supersededBy: 'a' });
    expect(checkSourceRegistry([a, b])).toEqual([
      expect.objectContaining({ sourceId: 'a', rule: 'source-supersession', message: 'supersession cycle: a → b → a' }),
    ]);
  });

  it('rejects a successor that is older than the superseded source', () => {
    const old = source({ id: 'old', year: 2025, status: 'superseded', supersededBy: 'new' });
    expect(checkSourceRegistry([old, source({ id: 'new', year: 2020 })])).toEqual([
      expect.objectContaining({ sourceId: 'old', message: "successor 'new' (2020) is older than this source (2025)" }),
    ]);
  });

  it('rejects duplicate source ids', () => {
    expect(checkSourceRegistry([source({ id: 'a' }), source({ id: 'a' })])).toEqual([
      expect.objectContaining({
        sourceId: 'a',
        path: ['id'],
        rule: 'duplicate-id',
        message: "duplicate source id 'a'",
      }),
    ]);
  });
});
