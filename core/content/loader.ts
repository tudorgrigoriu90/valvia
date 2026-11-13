/**
 * Content loader (ADR 0003): reads every YAML file under content/, validates it (syntax, schema, file name),
 * checks cross-file integrity and content rules, and returns the bundle the site renders. The same loader runs
 * in the CLI, CI and the site build, so what CI validates is exactly what is published.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { Parameter } from '../../schema/generated/parameter';
import type { ProstheticValve } from '../../schema/generated/prosthetic';
import type { SourceDocument } from '../../schema/generated/source';
import type { TopicNode } from '../../schema/generated/topic';
import { checkProsthetic } from '../prosthetics/rules';
import { checkSourceRegistry } from '../sources/registry-rules';
import { checkParameterUnit } from '../units/units';
import { checkTopicValues, valuesOf } from '../values/topic-rules';
import { checkIntegrity } from './integrity';
import type { Problem } from './problem';
import type { ContentKind } from './schemas';
import type { ContentBundle, LoadedProsthetic, LoadedTopic, PublishedNumbers, PublishedStatistics } from './types';
import { validateContentFile } from './validate-file';
import type { ParsedYaml, PathSegment } from './yaml';

/** Content folders and the schema each one uses. */
export const CONTENT_FOLDERS: Readonly<Record<string, ContentKind>> = {
  sources: 'source',
  parameters: 'parameter',
  topics: 'topic',
  prosthetics: 'prosthetic',
};

interface Entity<T> {
  data: T;
  file: string;
  parsed: ParsedYaml;
}

export interface LoadResult {
  bundle: ContentBundle;
  problems: Problem[];
  /** Number of YAML files read from the known content folders. */
  fileCount: number;
}

export const hasErrors = (problems: readonly Problem[]): boolean => problems.some((p) => p.severity === 'error');

const isYaml = (name: string): boolean => name.endsWith('.yaml') || name.endsWith('.yml');
const toPosix = (path: string): string => path.split(sep).join('/');

function at(
  entity: Entity<unknown>,
  path: readonly PathSegment[],
  severity: Problem['severity'],
  rule: string,
  message: string,
  atKey = false,
): Problem {
  const key = path.at(-1);
  const position =
    atKey && typeof key === 'string' ? entity.parsed.locateKey(path.slice(0, -1), key) : entity.parsed.locate(path);
  return { file: entity.file, ...position, severity, rule, message };
}

function publishedNumbers(entity: Entity<TopicNode>): LoadedTopic {
  (entity.data.blocks ?? []).forEach((block, blockIndex) => {
    for (const { value, path } of valuesOf(block, blockIndex)) {
      const published: PublishedNumbers = {};
      for (const field of ['value', 'min', 'max'] as const) {
        const number = value[field];
        if (number !== undefined) published[field] = entity.parsed.sourceText([...path, field]) ?? String(number);
      }
      Object.assign(value, { published });
    }
  });
  return entity.data as LoadedTopic;
}

const STATISTICS = ['mean', 'sd', 'median', 'q1', 'q3', 'value'] as const;

function publishedStatistics(entity: Entity<ProstheticValve>): LoadedProsthetic {
  entity.data.sizes.forEach((size, sizeIndex) => {
    size.values.forEach((value, valueIndex) => {
      const published: PublishedStatistics = {};
      for (const field of STATISTICS) {
        const number = value[field];
        if (number === undefined) continue;
        const path = ['sizes', sizeIndex, 'values', valueIndex, field];
        published[field] = entity.parsed.sourceText(path) ?? String(number);
      }
      Object.assign(value, { published });
    });
  });
  return entity.data as unknown as LoadedProsthetic;
}

export function loadContent(root: string, contentDir = 'content'): LoadResult {
  const problems: Problem[] = [];
  const entities = {
    source: [] as Entity<SourceDocument>[],
    parameter: [] as Entity<Parameter>[],
    topic: [] as Entity<TopicNode>[],
    prosthetic: [] as Entity<ProstheticValve>[],
  };
  const directory = join(root, contentDir);
  let fileCount = 0;
  const invalid = {
    topic: new Set<string>(),
    parameter: new Set<string>(),
    source: new Set<string>(),
    prosthetic: new Set<string>(),
  };

  if (existsSync(directory)) {
    for (const folder of readdirSync(directory).sort()) {
      const folderPath = join(directory, folder);
      if (!statSync(folderPath).isDirectory()) continue;
      const files = readdirSync(folderPath).filter(isYaml).sort();
      const kind = CONTENT_FOLDERS[folder];
      if (kind === undefined) {
        const [first] = files;
        if (first !== undefined) {
          problems.push({
            file: toPosix(relative(root, join(folderPath, first))),
            line: 1,
            column: 1,
            severity: 'warning',
            rule: 'unknown-folder',
            message: `files in ${contentDir}/${folder}/ are not loaded (expected ${Object.keys(CONTENT_FOLDERS).join(', ')})`,
          });
        }
        continue;
      }
      for (const name of files) {
        fileCount += 1;
        const file = toPosix(relative(root, join(folderPath, name)));
        const result = validateContentFile(kind, file, readFileSync(join(folderPath, name), 'utf8'));
        problems.push(...result.problems);
        if (!hasErrors(result.problems) && result.parsed !== undefined) {
          (entities[kind] as Entity<unknown>[]).push({ data: result.data, file, parsed: result.parsed });
        } else {
          invalid[kind].add(name.replace(/\.ya?ml$/, ''));
        }
      }
    }
  }

  const sources = new Map(entities.source.map((e) => [e.data.id, e.data]));
  const parameters = new Map(entities.parameter.map((e) => [e.data.id, e.data]));
  const sourceEntity = new Map(entities.source.map((e) => [e.data.id, e]));
  const topicEntity = new Map(entities.topic.map((e) => [e.data.id, e]));

  for (const finding of checkSourceRegistry(entities.source.map((e) => e.data))) {
    const entity = sourceEntity.get(finding.sourceId);
    if (entity !== undefined) problems.push(at(entity, finding.path, finding.severity, finding.rule, finding.message));
  }
  for (const entity of entities.parameter) {
    const message = checkParameterUnit(entity.data);
    if (message !== undefined) problems.push(at(entity, ['unit'], 'error', 'parameter-unit', message));
  }
  const invalidIds = { topics: invalid.topic, parameters: invalid.parameter, sources: invalid.source };
  for (const finding of checkIntegrity(
    entities.topic.map((e) => e.data),
    parameters,
    sources,
    invalidIds,
  )) {
    const entity = topicEntity.get(finding.topicId);
    if (entity !== undefined) {
      problems.push(at(entity, finding.path, 'error', finding.rule, finding.message, finding.atKey === true));
    }
  }
  for (const entity of entities.topic) {
    for (const finding of checkTopicValues(entity.data, parameters)) {
      problems.push(at(entity, finding.path, finding.severity, finding.rule, finding.message));
    }
  }

  for (const entity of entities.prosthetic) {
    for (const finding of checkProsthetic(entity.data, parameters, sources, invalidIds)) {
      problems.push(at(entity, finding.path, 'error', finding.rule, finding.message));
    }
  }

  const topics = new Map(entities.topic.map((e) => [e.data.id, publishedNumbers(e)]));
  const prosthetics = new Map(entities.prosthetic.map((e) => [e.data.id, publishedStatistics(e)]));
  problems.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column);
  return { bundle: { topics, parameters, sources, prosthetics }, problems, fileCount };
}
