/**
 * Cross-file and plausibility rules for the prosthetic valve catalogue (TS-02.2.8): parameters and sources exist,
 * units fit the parameter quantity, modality fits the parameter, no negative sizes or pressures, interquartile
 * ranges ordered, each labelled size listed once.
 */
import type { Parameter } from '../../schema/generated/parameter';
import type { ProstheticValve } from '../../schema/generated/prosthetic';
import type { SourceDocument } from '../../schema/generated/source';
import type { PathSegment } from '../content/yaml';
import { allowedUnits, isUnitAllowed } from '../units/units';
import { checkValueModality } from '../values/modality';
import { CAN_BE_NEGATIVE } from '../values/topic-rules';

export interface ProstheticFinding {
  path: PathSegment[];
  rule:
    | 'value-reference'
    | 'citation-reference'
    | 'value-unit'
    | 'value-modality'
    | 'value-sign'
    | 'value-range'
    | 'duplicate-size';
  message: string;
}

export interface InvalidReferences {
  parameters: ReadonlySet<string>;
  sources: ReadonlySet<string>;
}

const NONE: InvalidReferences = { parameters: new Set(), sources: new Set() };
const NUMBERS = ['mean', 'median', 'q1', 'q3', 'value'] as const;

export function checkProsthetic(
  valve: ProstheticValve,
  parameters: ReadonlyMap<string, Parameter>,
  sources: ReadonlyMap<string, SourceDocument>,
  invalid: InvalidReferences = NONE,
): ProstheticFinding[] {
  const findings: ProstheticFinding[] = [];
  const seen = new Set<string>();
  valve.sizes.forEach((size, sizeIndex) => {
    if (seen.has(size.size)) {
      findings.push({
        path: ['sizes', sizeIndex, 'size'],
        rule: 'duplicate-size',
        message: `size '${size.size}' is listed more than once`,
      });
    }
    seen.add(size.size);
    size.values.forEach((value, valueIndex) => {
      const base: PathSegment[] = ['sizes', sizeIndex, 'values', valueIndex];
      const add = (field: PathSegment[], rule: ProstheticFinding['rule'], message: string): void => {
        findings.push({ path: [...base, ...field], rule, message });
      };
      const source = value.citation.source;
      if (!sources.has(source) && !invalid.sources.has(source)) {
        add(['citation', 'source'], 'citation-reference', `unknown source '${source}'`);
      }
      const parameter = parameters.get(value.parameter);
      if (parameter === undefined) {
        if (!invalid.parameters.has(value.parameter)) {
          add(['parameter'], 'value-reference', `unknown parameter '${value.parameter}'`);
        }
        return;
      }
      if (!isUnitAllowed(parameter.quantity, value.unit)) {
        add(
          ['unit'],
          'value-unit',
          `unit '${value.unit}' is not valid for parameter '${parameter.id}' (${parameter.quantity}: ${allowedUnits(parameter.quantity).join(', ')})`,
        );
      }
      const modality = checkValueModality(value.modality, parameter);
      if (modality !== undefined) add(['modality'], 'value-modality', modality);
      if (!CAN_BE_NEGATIVE.has(parameter.quantity)) {
        for (const field of NUMBERS) {
          const number = value[field];
          if (number !== undefined && number < 0) {
            add([field], 'value-sign', `${field} (${String(number)}) must not be negative for ${parameter.quantity}`);
          }
        }
      }
      const { median, q1, q3 } = value;
      if (median !== undefined && q1 !== undefined && q1 > median) {
        add(['q1'], 'value-range', `q1 (${String(q1)}) must not exceed median (${String(median)})`);
      }
      if (median !== undefined && q3 !== undefined && q3 < median) {
        add(['q3'], 'value-range', `q3 (${String(q3)}) must not be below median (${String(median)})`);
      }
    });
  });
  return findings;
}
