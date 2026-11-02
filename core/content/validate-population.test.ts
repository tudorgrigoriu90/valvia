import { describe, expect, it } from 'vitest';
import { validateDefinition } from './validate-file';

const messages = (text: string): string[] =>
  validateDefinition('populationQualifiers', text).problems.map((p) => `${String(p.line)}: ${p.message}`);

describe('populationQualifiers definition (TS-02.2.5)', () => {
  it('accepts an adult value with no further qualifiers', () => {
    expect(messages('ageGroup: adult\n')).toEqual([]);
  });

  it('accepts sex-, age-, BSA- and rhythm-specific qualifiers', () => {
    const text =
      'ageGroup: adult\nsex: female\nageBand: { min: 40, max: 60, unit: years, label: 40–59 years }\nbsaBand: { max: 1.8 }\nrhythm: sinus\n';
    expect(messages(text)).toEqual([]);
  });

  it('accepts a paediatric value referencing a cited z-score dataset', () => {
    const text =
      'ageGroup: paediatric\nageBand: { min: 0, max: 18, unit: years }\nzScoreReference: lopez-2017-phn-zscores\n';
    expect(messages(text)).toEqual([]);
  });

  it('accepts neonatal age bands in days or months', () => {
    expect(messages('ageGroup: paediatric\nageBand: { max: 28, unit: days }\n')).toEqual([]);
    expect(messages('ageGroup: paediatric\nageBand: { min: 1, max: 12, unit: months }\n')).toEqual([]);
  });

  it('requires ageGroup so an adult value can never be shown for a child by default', () => {
    expect(messages('sex: male\n')).toEqual(["1: missing required property 'ageGroup'"]);
  });

  it('rejects "both" as an ageGroup: a value belongs to exactly one population', () => {
    expect(messages('ageGroup: both\n')).toEqual(["1: ageGroup must be one of: adult, paediatric (got 'both')"]);
  });

  it('requires at least one bound in a band', () => {
    expect(messages('ageGroup: adult\nageBand: { unit: years }\n')).toEqual([
      "2: ageBand must have at least one of 'min' or 'max'",
    ]);
    expect(messages('ageGroup: adult\nbsaBand: {}\n')).toEqual(["2: bsaBand must have at least one of 'min' or 'max'"]);
  });

  it('requires the age unit and rejects negative bounds', () => {
    expect(messages('ageGroup: adult\nageBand: { min: -1 }\n')).toEqual([
      "2: ageBand: missing required property 'unit'",
      '2: ageBand.min must be >= 0',
    ]);
  });

  it.each([
    ['sex: unknown', "sex must be one of: male, female (got 'unknown')"],
    ['rhythm: paced', "rhythm must be one of: sinus, atrial-fibrillation (got 'paced')"],
    ['zScoreReference: Bad Id', "zScoreReference must be lowercase kebab-case (got 'Bad Id')"],
  ])('rejects %s', (line, message) => {
    expect(messages(`ageGroup: adult\n${line}\n`)).toEqual([`2: ${message}`]);
  });
});
