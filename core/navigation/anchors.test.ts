import { describe, expect, it } from 'vitest';
import type { LoadedBlock } from '../content/types';
import { parameterAnchor, parameterAnchorBlocks, rowAnchors } from './anchors';

const values = (...parameters: string[]) =>
  parameters.map((parameter) => ({ parameter })) as unknown as Extract<LoadedBlock, { values: unknown }>['values'];

const grading = (id: string, ...parameters: string[]): LoadedBlock => ({
  id,
  type: 'grading-table',
  tag: 'GRADE',
  grades: ['mild', 'severe'],
  values: values(...parameters),
});
const thresholds = (id: string, ...parameters: string[]): LoadedBlock => ({
  id,
  type: 'threshold-list',
  tag: 'INTV',
  values: values(...parameters),
});
const checklist = (id: string, parameter: string): LoadedBlock =>
  ({
    id,
    type: 'criteria-checklist',
    tag: 'CRIT',
    criteria: [{ text: 'x', values: values(parameter) }],
  }) as unknown as LoadedBlock;
const note = (id: string): LoadedBlock => ({ id, type: 'note', tag: 'METH', text: 'x' }) as unknown as LoadedBlock;

describe('parameterAnchor (TS-04.5.1)', () => {
  it('prefixes the stable parameter id so anchors cannot collide with block ids', () => {
    expect(parameterAnchor('eroa')).toBe('p-eroa');
  });
});

describe('parameterAnchorBlocks', () => {
  it('assigns each parameter to the first table or list block that shows it, in page order', () => {
    const blocks = [note('intro'), grading('severity', 'eroa', 'vc'), thresholds('intervention', 'eroa', 'lvesd')];
    expect(parameterAnchorBlocks(blocks)).toEqual(
      new Map([
        ['eroa', 'severity'],
        ['vc', 'severity'],
        ['lvesd', 'intervention'],
      ]),
    );
  });

  it('ignores values nested in checklists (they are not rows)', () => {
    expect(parameterAnchorBlocks([checklist('feasibility', 'eroa'), thresholds('t', 'eroa')])).toEqual(
      new Map([['eroa', 't']]),
    );
  });
});

describe('rowAnchors', () => {
  const anchors = new Map([
    ['eroa', 'severity'],
    ['vc', 'other-block'],
  ]);

  it('gives the anchor to the first row of the parameter in its anchor block only', () => {
    expect(rowAnchors(['eroa', 'eroa', 'vc', 'rvol'], 'severity', anchors)).toEqual([
      'p-eroa',
      undefined,
      undefined,
      undefined,
    ]);
  });

  it('gives no anchors in a block that owns none', () => {
    expect(rowAnchors(['eroa'], 'intervention', anchors)).toEqual([undefined]);
  });
});
