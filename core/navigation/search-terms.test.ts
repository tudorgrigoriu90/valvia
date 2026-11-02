import { describe, expect, it } from 'vitest';
import type { Parameter } from '../../schema/generated/parameter';
import type { LoadedTopic } from '../content/types';
import { searchTerms } from './search-terms';

const PARAMETERS = new Map<string, Parameter>([
  [
    'eroa',
    {
      id: 'eroa',
      name: 'Effective regurgitant orifice area',
      abbreviation: 'EROA',
      quantity: 'area',
      unit: 'cm²',
      modalities: ['Echo'],
      synonyms: ['PISA EROA'],
    },
  ],
  ['rf', { id: 'rf', name: 'Regurgitant fraction', quantity: 'percent', unit: '%', modalities: ['Echo'] }],
]);

const topic = {
  id: 't',
  slug: 't',
  title: 'Primary MR',
  parent: null,
  order: 0,
  population: 'adult',
  wave: 'W1',
  status: 'draft',
  synonyms: ['degenerative MR'],
  blocks: [
    {
      id: 'g',
      type: 'grading-table',
      tag: 'GRADE',
      grades: ['Mild', 'Severe'],
      values: [{ parameter: 'eroa' }, { parameter: 'rf' }, { parameter: 'eroa' }],
    },
    { id: 'c', type: 'criteria-checklist', tag: 'CRIT', criteria: [{ text: 'x', values: [{ parameter: 'missing' }] }] },
    { id: 'n', type: 'note', tag: 'METH', text: 'x' },
  ],
} as unknown as LoadedTopic;

describe('searchTerms (TS-04.4.1)', () => {
  it('collects topic synonyms and the names, abbreviations and synonyms of every parameter, without duplicates', () => {
    expect(searchTerms(topic, PARAMETERS)).toEqual([
      'degenerative MR',
      'EROA',
      'Effective regurgitant orifice area',
      'PISA EROA',
      'Regurgitant fraction',
    ]);
  });

  it('returns nothing for a topic without synonyms or blocks', () => {
    const bare = { ...topic, synonyms: [] } as LoadedTopic;
    delete bare.blocks;
    expect(searchTerms(bare, PARAMETERS)).toEqual([]);
  });
});
