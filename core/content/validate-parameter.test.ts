import { describe, expect, it } from 'vitest';
import { validateContentFile } from './validate-file';

const VALID_PARAMETER = `id: eroa
name: Effective regurgitant orifice area
abbreviation: EROA
quantity: area
unit: cm²
modalities: [Echo]
synonyms: [ERO, effective regurgitant orifice]
method: PISA method, apical 4-chamber zoom on the regurgitant orifice; single frame at peak regurgitant velocity.
`;

const validate = (text: string, file = 'content/parameters/eroa.yaml') => validateContentFile('parameter', file, text);

describe('validateContentFile(parameter) (TS-02.2.1)', () => {
  it('accepts a valid parameter', () => {
    expect(validate(VALID_PARAMETER).problems).toEqual([]);
  });

  it('accepts a minimal dimensionless parameter without abbreviation, synonyms or method', () => {
    const text = 'id: e-over-e-prime\nname: E/e′ ratio\nquantity: ratio\nunit: "1"\nmodalities: [Echo]\n';
    expect(validate(text, 'content/parameters/e-over-e-prime.yaml').problems).toEqual([]);
  });

  it('accepts several modalities, e.g. CMR-quantified regurgitant volume', () => {
    const text = VALID_PARAMETER.replace('modalities: [Echo]', 'modalities: [Echo, CMR]');
    expect(validate(text).problems).toEqual([]);
  });

  it.each([
    ['modalities: [Echo]', 'modalities: [MRI]', "modalities[0] must be one of: Echo, CT, CMR (got 'MRI')"],
    ['modalities: [Echo]', 'modalities: []', 'modalities must NOT have fewer than 1 items'],
    [
      'unit: cm²',
      'unit: cm2',
      "unit must be one of: 1, %, mm, cm, mm/m², cm/m², mm², cm², cm²/m², mL, mL/m², g, g/m², g/m^2.7, g/m, m/s, cm/s, m/s², cm/s², mmHg, ms, s, bpm, mL/s, mL/min/kg, AU, °, years, mm/mmHg, WU (got 'cm2')",
    ],
    [
      'quantity: area',
      'quantity: surface',
      "quantity must be one of: dimensionless, ratio, percent, length, indexed-length, area, indexed-area, volume, indexed-volume, mass, indexed-mass, velocity-blood, velocity-tissue, velocity-time-integral, acceleration, pressure, time, heart-rate, flow-rate, calcium-score, angle, age, coupling-ratio, vascular-resistance, mass-per-height, indexed-flow-rate (got 'surface')",
    ],
    ['abbreviation: EROA', 'abbreviation: ""', 'abbreviation must not be empty'],
  ])('rejects %s replaced by %s', (from, to, message) => {
    expect(validate(VALID_PARAMETER.replace(from, to)).problems).toEqual([expect.objectContaining({ message })]);
  });

  it('requires name, quantity, unit and modalities', () => {
    expect(validate('id: eroa\n').problems.map((p) => p.message)).toEqual([
      "missing required property 'name'",
      "missing required property 'quantity'",
      "missing required property 'unit'",
      "missing required property 'modalities'",
    ]);
  });
});
