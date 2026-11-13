/**
 * Parameter glossary (CH-61, taxonomy 14.1): every registered parameter with its abbreviation, full name, synonyms,
 * comparison unit and modalities, generated from content/parameters so the glossary never drifts from the content.
 */
import type { Parameter } from '../../schema/generated/parameter';

export interface GlossaryEntry {
  id: string;
  /** Abbreviation, or the full name when there is none. */
  term: string;
  /** Full name, when the term is an abbreviation. */
  name: string | undefined;
  synonyms: string[];
  /** Unit in which values are compared; undefined for dimensionless ratios. */
  unit: string | undefined;
  modalities: string[];
}

export function glossaryEntries(parameters: ReadonlyMap<string, Parameter>): GlossaryEntry[] {
  return [...parameters.values()]
    .map((parameter) => ({
      id: parameter.id,
      term: parameter.abbreviation ?? parameter.name,
      name: parameter.abbreviation === undefined ? undefined : parameter.name,
      synonyms: [...(parameter.synonyms ?? [])],
      unit: parameter.unit === '1' ? undefined : parameter.unit,
      modalities: [...parameter.modalities],
    }))
    .sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));
}
