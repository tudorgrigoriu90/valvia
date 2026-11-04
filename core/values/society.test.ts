import { describe, expect, it } from 'vitest';
import { societiesOf } from './society';

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
