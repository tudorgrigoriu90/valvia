/**
 * Clinical change summary for content pull requests (TS-06.2.4): compares the content of the base and the head of a
 * PR and lists every value that was added, removed or changed, in the columns of the content PR template, plus topic
 * status and source registry changes. The SME reads this next to the YAML diff (no hosted previews, ADR 0005).
 */
import type { ContentBundle, LoadedValue } from '../../core/content/types';
import { loadedValuesOf } from '../../core/content/walk';
import { describeLocator } from '../../core/values/criteria';
import { formatValue } from '../../core/values/format';
import { populationLabel } from '../../core/values/population-label';
import { stableKey } from '../../core/values/topic-rules';

export interface ValueChange {
  change: 'added' | 'removed' | 'changed';
  topic: string;
  parameter: string;
  population: string;
  source: string;
  old: string;
  new: string;
  locator: string;
}

export interface ChangeSummary {
  values: ValueChange[];
  topics: string[];
  sources: string[];
}

interface Entry {
  key: string;
  topic: string;
  value: LoadedValue;
}

function entries(bundle: ContentBundle): Map<string, Entry> {
  const map = new Map<string, Entry>();
  for (const topic of bundle.topics.values()) {
    for (const block of topic.blocks ?? []) {
      for (const { value } of loadedValuesOf(block, 0)) {
        const identity = stableKey({
          topic: topic.id,
          block: block.id,
          parameter: value.parameter,
          context: value.context,
          grade: value.grade ?? null,
          technique: value.technique ?? 'TTE',
          modality: value.modality,
          population: value.population,
          source: value.citation.source,
        });
        let key = identity;
        for (let n = 2; map.has(key); n += 1) key = `${identity}#${String(n)}`;
        map.set(key, { key, topic: topic.title, value });
      }
    }
  }
  return map;
}

function population(value: LoadedValue): string {
  const rest = populationLabel({ ...value.population, ageGroup: 'adult' });
  const technique = value.technique === undefined || value.technique === 'TTE' ? [] : [value.technique];
  return [value.population.ageGroup === 'paediatric' ? 'Children' : 'Adults', ...technique, rest]
    .filter((part) => part !== '')
    .join(' · ');
}

function describe(value: LoadedValue, bundle: ContentBundle): { text: string; parameter: string; source: string } {
  const parameter = bundle.parameters.get(value.parameter);
  const number = parameter === undefined ? undefined : formatValue(value, parameter);
  const source = bundle.sources.get(value.citation.source);
  const caveats = (value.caveats ?? []).length === 0 ? '' : ` (${(value.caveats ?? []).join(' ')})`;
  return {
    text: `${value.grade === undefined ? '' : `${value.grade}: `}${number ?? value.parameter}${caveats}`,
    parameter: parameter?.abbreviation ?? parameter?.name ?? value.parameter,
    source:
      source === undefined
        ? value.citation.source
        : `${source.issuers.join('/')} · ${source.shortTitle ?? source.title} (${String(source.year)})`,
  };
}

export function summariseChanges(base: ContentBundle, head: ContentBundle): ChangeSummary {
  const before = entries(base);
  const after = entries(head);
  const values: ValueChange[] = [];
  for (const [key, old] of before) {
    const now = after.get(key);
    const was = describe(old.value, base);
    const oldLocator = describeLocator(old.value.citation.locator);
    if (now === undefined) {
      values.push({
        change: 'removed',
        topic: old.topic,
        parameter: was.parameter,
        population: population(old.value),
        source: was.source,
        old: was.text,
        new: '—',
        locator: oldLocator,
      });
      continue;
    }
    const is = describe(now.value, head);
    const newLocator = describeLocator(now.value.citation.locator);
    if (was.text !== is.text || oldLocator !== newLocator || was.parameter !== is.parameter) {
      values.push({
        change: 'changed',
        topic: now.topic,
        parameter: is.parameter,
        population: population(now.value),
        source: is.source,
        old: was.text,
        new: is.text,
        locator: oldLocator === newLocator ? newLocator : `${oldLocator} → ${newLocator}`,
      });
    }
  }
  for (const [key, added] of after) {
    if (before.has(key)) continue;
    const is = describe(added.value, head);
    values.push({
      change: 'added',
      topic: added.topic,
      parameter: is.parameter,
      population: population(added.value),
      source: is.source,
      old: '—',
      new: is.text,
      locator: describeLocator(added.value.citation.locator),
    });
  }

  const topics: string[] = [];
  for (const topic of head.topics.values()) {
    const old = base.topics.get(topic.id);
    if (old === undefined) topics.push(`${topic.title}: added`);
    else if (old.status !== topic.status) topics.push(`${topic.title}: status ${old.status} → ${topic.status}`);
  }
  for (const topic of base.topics.values()) if (!head.topics.has(topic.id)) topics.push(`${topic.title}: removed`);

  const sources: string[] = [];
  const label = (id: string, title: string): string => `${id} (${title})`;
  for (const source of base.sources.values()) {
    const now = head.sources.get(source.id);
    if (now === undefined) sources.push(`${label(source.id, source.shortTitle ?? source.title)}: removed`);
    else if (now.status !== source.status) {
      sources.push(`${label(source.id, now.shortTitle ?? now.title)}: status ${source.status} → ${now.status}`);
    }
  }
  for (const source of head.sources.values()) {
    if (!base.sources.has(source.id)) sources.push(`${label(source.id, source.shortTitle ?? source.title)}: added`);
  }
  return { values, topics, sources };
}

const cell = (text: string): string => text.replace(/\s+/g, ' ').replaceAll('|', '\\|');

export function renderSummary(summary: ChangeSummary): string {
  const count = (change: ValueChange['change']): number => summary.values.filter((v) => v.change === change).length;
  const parts = ['## Clinical change summary', ''];
  if (summary.values.length === 0) {
    parts.push('No clinical value changed.');
  } else {
    const changed = count('changed');
    parts.push(
      `${String(changed)} value${changed === 1 ? '' : 's'} changed, ${String(count('added'))} added, ${String(count('removed'))} removed.`,
      '',
      '| Topic | Parameter | Population | Society / source | Old value | New value | Locator |',
      '|---|---|---|---|---|---|---|',
      ...summary.values.map(
        (v) => `| ${[v.topic, v.parameter, v.population, v.source, v.old, v.new, v.locator].map(cell).join(' | ')} |`,
      ),
    );
  }
  if (summary.topics.length > 0) parts.push('', '### Topics', '', ...summary.topics.map((t) => `- ${t}`));
  if (summary.sources.length > 0) parts.push('', '### Sources', '', ...summary.sources.map((s) => `- ${s}`));
  return `${parts.join('\n')}\n`;
}
