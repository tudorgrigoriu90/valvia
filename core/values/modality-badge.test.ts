import { describe, expect, it } from 'vitest';
import { modalityBadge } from './modality-badge';

describe('modalityBadge (TS-04.7.3)', () => {
  it('returns no badge for echocardiography, the default modality', () => {
    expect(modalityBadge('Echo')).toBeUndefined();
  });

  it.each([
    ['CT', { label: 'CT', description: 'Measured by computed tomography' }],
    ['CMR', { label: 'CMR', description: 'Measured by cardiac magnetic resonance' }],
  ] as const)('labels %s values with text and an accessible description', (modality, badge) => {
    expect(modalityBadge(modality)).toEqual(badge);
  });
});
