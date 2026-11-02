/** Extra terms indexed for a topic (ADR 0004): topic synonyms plus parameter names, abbreviations and synonyms. */
import type { Parameter } from '../../schema/generated/parameter';
import type { LoadedTopic } from '../content/types';
import { topicValues } from '../content/walk';

export function searchTerms(topic: LoadedTopic, parameters: ReadonlyMap<string, Parameter>): string[] {
  const terms = new Set<string>(topic.synonyms ?? []);
  for (const { value } of topicValues(topic)) {
    const parameter = parameters.get(value.parameter);
    if (parameter === undefined) continue;
    for (const term of [parameter.abbreviation, parameter.name, ...(parameter.synonyms ?? [])]) {
      if (term !== undefined) terms.add(term);
    }
  }
  return [...terms];
}
