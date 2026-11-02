/** Types of content as loaded by the loader (validated data plus published number text). */
import type { Parameter } from '../../schema/generated/parameter';
import type { SourceDocument } from '../../schema/generated/source';
import type { TopicNode } from '../../schema/generated/topic';
import type { Block, Value } from '../values/topic-rules';

/** Exact text of the numbers as written in the YAML (= as published), e.g. { value: '0.40' }. */
export interface PublishedNumbers {
  value?: string;
  min?: string;
  max?: string;
}

export type LoadedValue = Value & { published: PublishedNumbers };

type WithLoadedValues<B> = B extends { values: unknown } ? Omit<B, 'values'> & { values: LoadedValue[] } : B;
type WithLoadedCriteria<B> = B extends { criteria: (infer C)[] }
  ? Omit<B, 'criteria'> & { criteria: (Omit<C, 'values'> & { values?: LoadedValue[] })[] }
  : B;

export type LoadedBlock = WithLoadedCriteria<WithLoadedValues<Block>>;
export type LoadedTopic = Omit<TopicNode, 'blocks'> & { blocks?: LoadedBlock[] };

export interface ContentBundle {
  topics: ReadonlyMap<string, LoadedTopic>;
  parameters: ReadonlyMap<string, Parameter>;
  sources: ReadonlyMap<string, SourceDocument>;
}
