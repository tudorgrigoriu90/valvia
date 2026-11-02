/** Cross-file integrity of the topic tree and references (ADR 0003 step 3). */
import type { Parameter } from '../../schema/generated/parameter';
import type { SourceDocument } from '../../schema/generated/source';
import type { TopicNode } from '../../schema/generated/topic';
import { valuesOf, type Block } from '../values/topic-rules';
import type { PathSegment } from './yaml';

export interface IntegrityFinding {
  topicId: string;
  path: PathSegment[];
  /** Point at the key instead of the value (e.g. `blocks:`). */
  atKey?: boolean;
  rule:
    | 'topic-reference'
    | 'topic-cycle'
    | 'topic-slug'
    | 'topic-blocks'
    | 'block-id'
    | 'value-reference'
    | 'citation-reference';
  message: string;
}

function citationPaths(block: Block, blockIndex: number): { source: string; path: PathSegment[] }[] {
  const base: PathSegment[] = ['blocks', blockIndex];
  const fromValues = valuesOf(block, blockIndex).map(({ value, path }) => ({
    source: value.citation.source,
    path: [...path, 'citation', 'source'],
  }));
  switch (block.type) {
    case 'criteria-checklist':
      return [
        ...block.criteria.map((criterion, index) => ({
          source: criterion.citation.source,
          path: [...base, 'criteria', index, 'citation', 'source'],
        })),
        ...fromValues,
      ];
    case 'algorithm-reference':
      return [{ source: block.citation.source, path: [...base, 'citation', 'source'] }];
    case 'note':
      return block.citation === undefined
        ? []
        : [{ source: block.citation.source, path: [...base, 'citation', 'source'] }];
    default:
      return fromValues;
  }
}

/** Ids of files that exist but failed validation: references to them are not reported again. */
export interface InvalidIds {
  topics: ReadonlySet<string>;
  parameters: ReadonlySet<string>;
  sources: ReadonlySet<string>;
}

const NONE: InvalidIds = { topics: new Set(), parameters: new Set(), sources: new Set() };

export function checkIntegrity(
  topics: readonly TopicNode[],
  parameters: ReadonlyMap<string, Parameter>,
  sources: ReadonlyMap<string, SourceDocument>,
  invalid: InvalidIds = NONE,
): IntegrityFinding[] {
  const findings: IntegrityFinding[] = [];
  const byId = new Map(topics.map((topic) => [topic.id, topic]));
  const parents = new Set(topics.map((topic) => topic.parent).filter((parent) => parent !== null));

  // Parent references and cycles.
  const inCycle = new Set<string>();
  for (const topic of topics) {
    if (topic.parent !== null && !byId.has(topic.parent)) {
      if (invalid.topics.has(topic.parent)) continue;
      findings.push({
        topicId: topic.id,
        path: ['parent'],
        rule: 'topic-reference',
        message: `parent refers to unknown topic '${topic.parent}'`,
      });
      continue;
    }
    const chain = [topic.id];
    let next = topic.parent;
    while (next !== null && !chain.includes(next)) {
      chain.push(next);
      next = byId.get(next)?.parent ?? null;
    }
    if (next === topic.id && !inCycle.has(topic.id)) {
      chain.forEach((id) => inCycle.add(id));
      findings.push({
        topicId: topic.id,
        path: ['parent'],
        rule: 'topic-cycle',
        message: `parent chain forms a cycle: ${[...chain, topic.id].join(' → ')}`,
      });
    }
  }

  // Sibling slugs (current and former).
  const siblings = new Map<string | null, TopicNode[]>();
  for (const topic of topics) siblings.set(topic.parent, [...(siblings.get(topic.parent) ?? []), topic]);
  for (const group of siblings.values()) {
    const seen = new Map<string, string>();
    for (const topic of group) {
      const owner = seen.get(topic.slug);
      if (owner === undefined) seen.set(topic.slug, topic.id);
      else {
        findings.push({
          topicId: topic.id,
          path: ['slug'],
          rule: 'topic-slug',
          message: `slug '${topic.slug}' is already used by sibling '${owner}'`,
        });
      }
    }
    for (const topic of group) {
      (topic.formerSlugs ?? []).forEach((former, index) => {
        const user = group.find((other) => other.id !== topic.id && other.slug === former);
        if (user !== undefined) {
          findings.push({
            topicId: topic.id,
            path: ['formerSlugs', index],
            rule: 'topic-slug',
            message: `former slug '${former}' is used by sibling '${user.id}'`,
          });
        }
      });
    }
  }

  for (const topic of topics) {
    (topic.seeAlso ?? []).forEach((target, index) => {
      if (!byId.has(target) && !invalid.topics.has(target)) {
        findings.push({
          topicId: topic.id,
          path: ['seeAlso', index],
          rule: 'topic-reference',
          message: `seeAlso[${String(index)}] refers to unknown topic '${target}'`,
        });
      }
    });

    const blocks = topic.blocks ?? [];
    if (blocks.length > 0 && parents.has(topic.id)) {
      findings.push({
        topicId: topic.id,
        path: ['blocks'],
        atKey: true,
        rule: 'topic-blocks',
        message: `only leaf topics may have blocks (${topic.id} has children)`,
      });
    }

    const blockIds = new Set<string>();
    blocks.forEach((block, blockIndex) => {
      if (blockIds.has(block.id)) {
        findings.push({
          topicId: topic.id,
          path: ['blocks', blockIndex, 'id'],
          rule: 'block-id',
          message: `duplicate block id '${block.id}'`,
        });
      }
      blockIds.add(block.id);

      for (const { value, path } of valuesOf(block, blockIndex)) {
        if (!parameters.has(value.parameter) && !invalid.parameters.has(value.parameter)) {
          findings.push({
            topicId: topic.id,
            path: [...path, 'parameter'],
            rule: 'value-reference',
            message: `parameter refers to unknown parameter '${value.parameter}'`,
          });
        }
        const reference = value.population.zScoreReference;
        if (reference !== undefined && !invalid.sources.has(reference)) {
          const dataset = sources.get(reference);
          const message =
            dataset === undefined
              ? `zScoreReference refers to unknown source '${reference}'`
              : dataset.type === 'z-score-dataset'
                ? undefined
                : `zScoreReference '${reference}' is not a z-score dataset`;
          if (message !== undefined) {
            findings.push({
              topicId: topic.id,
              path: [...path, 'population', 'zScoreReference'],
              rule: 'value-reference',
              message,
            });
          }
        }
      }

      for (const citation of citationPaths(block, blockIndex)) {
        if (!sources.has(citation.source) && !invalid.sources.has(citation.source)) {
          findings.push({
            topicId: topic.id,
            path: citation.path,
            rule: 'citation-reference',
            message: `citation refers to unknown source '${citation.source}'`,
          });
        }
      }
    });
  }
  return findings;
}
