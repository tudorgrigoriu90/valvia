/** Value-level modality rule (TS-02.2.6): a value's modality must be one its parameter is measured with. */
import type { Parameter } from '../../schema/generated/parameter';

export type Modality = Parameter['modalities'][number];

export function checkValueModality(modality: Modality, parameter: Parameter): string | undefined {
  if (parameter.modalities.includes(modality)) return undefined;
  return `modality '${modality}' is not listed for parameter '${parameter.id}' (${parameter.modalities.join(', ')})`;
}
