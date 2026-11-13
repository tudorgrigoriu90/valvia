import { describe, expect, it } from 'vitest';
import type { Parameter } from '../../schema/generated/parameter';
import { glossaryEntries } from './glossary';

const parameter = (overrides: Partial<Parameter> & Pick<Parameter, 'id' | 'name'>): Parameter => ({
  quantity: 'length',
  unit: 'mm',
  modalities: ['Echo'],
  ...overrides,
});

describe('glossaryEntries (CH-61)', () => {
  it('lists every parameter by abbreviation (or name), alphabetically and case-insensitively', () => {
    const parameters = new Map([
      ['vc', parameter({ id: 'vc', name: 'Vena contracta width', abbreviation: 'VCW', synonyms: ['VC'] })],
      [
        'eroa',
        parameter({
          id: 'eroa',
          name: 'Effective regurgitant orifice area',
          abbreviation: 'EROA',
          quantity: 'area',
          unit: 'cm²',
        }),
      ],
      ['e-over-e', parameter({ id: 'e-over-e', name: 'E/e′ ratio', quantity: 'ratio', unit: '1' })],
      [
        'ef',
        parameter({
          id: 'ef',
          name: 'Ejection fraction',
          abbreviation: 'LVEF',
          quantity: 'percent',
          unit: '%',
          modalities: ['Echo', 'CMR'],
        }),
      ],
    ]);
    expect(glossaryEntries(parameters)).toEqual([
      { id: 'e-over-e', term: 'E/e′ ratio', name: undefined, synonyms: [], unit: undefined, modalities: ['Echo'] },
      {
        id: 'eroa',
        term: 'EROA',
        name: 'Effective regurgitant orifice area',
        synonyms: [],
        unit: 'cm²',
        modalities: ['Echo'],
      },
      { id: 'ef', term: 'LVEF', name: 'Ejection fraction', synonyms: [], unit: '%', modalities: ['Echo', 'CMR'] },
      { id: 'vc', term: 'VCW', name: 'Vena contracta width', synonyms: ['VC'], unit: 'mm', modalities: ['Echo'] },
    ]);
  });

  it('is empty without parameters', () => {
    expect(glossaryEntries(new Map())).toEqual([]);
  });
});
