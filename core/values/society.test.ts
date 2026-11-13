import { describe, expect, it } from 'vitest';
import { societiesOf, societyBadge } from './society';

describe('societiesOf (TS-04.3.5)', () => {
  it.each([
    [['ESC'], ['esc']],
    [['EACVI'], ['esc']],
    [['ESC', 'EACTS'], ['esc']],
    [['EAPCI', 'EACTS', 'ESC'], ['esc']],
    [['EAPCI'], ['esc']],
    [['ASE'], ['ase']],
    [
      ['ASE', 'EACVI'],
      ['ase', 'esc'],
    ],
    [
      ['ASE', 'EAE'],
      ['ase', 'esc'],
    ],
    [['PHN'], []],
  ])('maps issuers %j to filter groups %j', (issuers, groups) => {
    expect(societiesOf(issuers)).toEqual(groups);
  });
});

describe('societyBadge (TS-04.1.3)', () => {
  it.each([
    [['ESC'], 'ESC', 'esc', 'Issued by ESC'],
    [['EACVI'], 'EACVI', 'esc', 'Issued by EACVI'],
    [['ESC', 'EACTS'], 'ESC/EACTS', 'esc', 'Issued by ESC and EACTS'],
    [['ASE'], 'ASE', 'ase', 'Issued by ASE'],
    [['ASE', 'EACVI'], 'ASE/EACVI', 'joint', 'Joint document issued by ASE and EACVI'],
    [['EACVI', 'ASE', 'SCMR'], 'EACVI/ASE/SCMR', 'joint', 'Joint document issued by EACVI, ASE and SCMR'],
    [['PHN'], 'PHN', 'other', 'Issued by PHN'],
  ] as const)('labels issuers %j as %s (tone %s)', (issuers, label, tone, description) => {
    expect(societyBadge(issuers)).toEqual({ label, tone, description });
  });

  it('keeps the issuers in the published order', () => {
    expect(societyBadge(['EACVI', 'ASE']).label).toBe('EACVI/ASE');
  });
});
