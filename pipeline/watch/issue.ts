/**
 * One GitHub issue per watcher candidate (TS-06.2.1): metadata, links, the registered sources it may update or
 * correct, and the Valvia topics to check. Titles come from external services and are untrusted: mentions, HTML
 * and line breaks are neutralised before they reach GitHub.
 */
import type { Candidate } from './state';

export interface SourceSummary {
  id: string;
  title: string;
  year: number;
}

export interface TopicLink {
  id: string;
  title: string;
  url: string;
}

export interface IssueContext {
  sources: readonly SourceSummary[];
  /** Source id → topics citing it. */
  topicsBySource: ReadonlyMap<string, readonly TopicLink[]>;
}

export interface Issue {
  title: string;
  body: string;
  labels: string[];
}

const MAX_TITLE = 256;

export const safeText = (text: string): string =>
  text
    .replace(/\s+/g, ' ')
    .trim()
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('@', '@​');

const STOP_WORDS = new Set(
  'the for and from with into of in by on to an guideline guidelines recommendation recommendations echocardiography echocardiographic assessment evaluation american society european association cardiovascular imaging update report adults adult patients statement consensus expert clinical document using'.split(
    ' ',
  ),
);

const words = (title: string): Set<string> =>
  new Set(
    title
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length >= 4 && !STOP_WORDS.has(word)),
  );

/** Registered sources whose titles share at least two content words and 40 % of all (Jaccard). */
export function relatedSources(candidate: Candidate, sources: readonly SourceSummary[]): SourceSummary[] {
  const own = words(candidate.title);
  return sources
    .map((source) => {
      const other = words(source.title);
      const shared = [...own].filter((word) => other.has(word)).length;
      const union = new Set([...own, ...other]).size;
      return { source, shared, score: shared / union };
    })
    .filter(({ shared, score }) => shared >= 2 && score >= 0.4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ source }) => source);
}

const sourceIds = (candidate: Candidate, context: IssueContext): string[] =>
  candidate.updates === undefined
    ? relatedSources(candidate, context.sources).map((source) => source.id)
    : [candidate.updates.source];

export function affectedTopics(candidate: Candidate, context: IssueContext): TopicLink[] {
  const topics = new Map<string, TopicLink>();
  for (const id of sourceIds(candidate, context)) {
    for (const topic of context.topicsBySource.get(id) ?? []) topics.set(topic.id, topic);
  }
  return [...topics.values()];
}

function issueTitle(candidate: Candidate): string {
  const suffix = ` (${safeText(candidate.journal)}, ${candidate.date.slice(0, 4)})`;
  const prefix =
    candidate.updates === undefined
      ? 'New document: '
      : `${candidate.updates.kind.charAt(0).toUpperCase()}${candidate.updates.kind.slice(1)} to ${candidate.updates.source}: `;
  const shownTitle = safeText(
    candidate.updates === undefined ? candidate.title : candidate.title.replace(/^[^:]*: /, ''),
  );
  const room = MAX_TITLE - prefix.length - suffix.length;
  const title = shownTitle.length > room ? `${shownTitle.slice(0, room - 1)}…` : shownTitle;
  return `${prefix}${title}${suffix}`;
}

export function candidateIssue(candidate: Candidate, context: IssueContext): Issue {
  const rows = [
    `| Title | ${safeText(candidate.title).replaceAll('|', '\\|')} |`,
    `| Journal | ${safeText(candidate.journal)} |`,
    `| Date | ${candidate.date} |`,
    ...(candidate.pmid === undefined
      ? []
      : [`| PMID | [${candidate.pmid}](https://pubmed.ncbi.nlm.nih.gov/${candidate.pmid}/) |`]),
    ...(candidate.doi === undefined ? [] : [`| DOI | [${candidate.doi}](https://doi.org/${candidate.doi}) |`]),
  ];
  const topics = affectedTopics(candidate, context);
  const related = candidate.updates === undefined ? relatedSources(candidate, context.sources) : [];
  const sections: string[] = [
    candidate.updates === undefined
      ? 'The weekly source watcher found a possibly new society document (EP-06).'
      : `The weekly source watcher found a ${candidate.updates.kind} notice. Corrects registered source \`${candidate.updates.source}\`.`,
    ['| Field | Value |', '|---|---|', ...rows].join('\n'),
  ];
  if (related.length > 0) {
    sections.push(
      `### Registered sources it may update\n\n${related.map((s) => `- \`${s.id}\` (${String(s.year)})`).join('\n')}`,
    );
  }
  sections.push(
    topics.length === 0
      ? '### Topics to check\n\nNo registered source or topic matched; check the taxonomy for where it belongs.'
      : `### Topics to check\n\n${topics.map((t) => `- [${safeText(t.title)}](${t.url})`).join('\n')}`,
    candidate.updates === undefined
      ? [
          '### Next steps',
          '',
          '1. Only ESC (incl. EACVI) and ASE documents are used (`CLAUDE.md` §12): close this issue otherwise.',
          '2. Attach the PDF (ESC/EACVI) or link the open-access full text (ASE).',
          '3. Add the label `new-source` to start drafting; content changes go through a content PR approved by the SME.',
        ].join('\n')
      : [
          '### Next steps',
          '',
          '1. Read the notice and compare it with the values taken from the corrected source.',
          '2. If a value changes, open a content PR (approved by the SME) and record the notice DOI in the source `notes`.',
          '3. Close this issue with a note when nothing in Valvia is affected.',
        ].join('\n'),
    '_Metadata comes from PubMed or Crossref and is untrusted: verify it against the publisher page._',
  );
  return {
    title: issueTitle(candidate),
    body: `${sections.join('\n\n')}\n`,
    labels: candidate.updates === undefined ? ['source-candidate'] : ['source-candidate', 'erratum'],
  };
}
