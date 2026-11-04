/** Modality badges (TS-04.7.3, SME decision 4): CT and CMR values are labelled in text; echo is the default. */
import type { Modality } from './modality';

export interface ModalityBadge {
  label: string;
  description: string;
}

const BADGES: Partial<Record<Modality, ModalityBadge>> = {
  CT: { label: 'CT', description: 'Measured by computed tomography' },
  CMR: { label: 'CMR', description: 'Measured by cardiac magnetic resonance' },
};

export const modalityBadge = (modality: Modality): ModalityBadge | undefined => BADGES[modality];
