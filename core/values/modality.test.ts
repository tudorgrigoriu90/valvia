import { describe, expect, it } from 'vitest';
import type { Parameter } from '../../schema/generated/parameter';
import { checkValueModality } from './modality';

const regurgitantVolume: Parameter = {
  id: 'regurgitant-volume',
  name: 'Regurgitant volume',
  quantity: 'volume',
  unit: 'mL',
  modalities: ['Echo', 'CMR'],
};

describe('checkValueModality (TS-02.2.6)', () => {
  it('accepts a modality the parameter is measured with', () => {
    expect(checkValueModality('CMR', regurgitantVolume)).toBeUndefined();
  });

  it('rejects a modality the parameter is not measured with', () => {
    expect(checkValueModality('CT', regurgitantVolume)).toBe(
      "modality 'CT' is not listed for parameter 'regurgitant-volume' (Echo, CMR)",
    );
  });
});
