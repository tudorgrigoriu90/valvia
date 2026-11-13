/**
 * Content change log from Git history (TS-06.4.1 "What's new", TS-06.4.2 audit trail). Git is the record of every
 * content change; this module turns `git log` output into entries. Running git is left to the caller (I/O at the edge).
 */
const RS = '\u001e';
const US = '\u001f';

/** Arguments for `git log` whose output `parseGitLog` reads (newest first, files changed under content/). */
export const GIT_LOG_ARGS: readonly string[] = [
  'log',
  '--date=short',
  `--format=${RS}%H${US}%ad${US}%an${US}%s`,
  '--name-only',
  '--',
  'content/',
];

export interface Commit {
  sha: string;
  date: string;
  author: string;
  subject: string;
  files: string[];
}

export interface ContentChange {
  /** Abbreviated commit SHA (7 characters). */
  sha: string;
  date: string;
  /** Commit author; for a merged pull request, the person who merged it. */
  author: string;
  subject: string;
  pullRequest: number | undefined;
  topics: string[];
  sources: string[];
  parameters: string[];
}

export function parseGitLog(output: string): Commit[] {
  const commits: Commit[] = [];
  for (const record of output.split(RS)) {
    const [header = '', ...rest] = record.split('\n');
    const [sha, date, author, subject] = header.split(US);
    if (sha === undefined || date === undefined || author === undefined || subject === undefined) continue;
    commits.push({ sha, date, author, subject, files: rest.map((line) => line.trim()).filter((line) => line !== '') });
  }
  return commits;
}

const PULL_REQUEST = /(?:^Merge pull request #(\d+)\b|\(#(\d+)\)$)/;

const idsIn = (files: readonly string[], folder: string): string[] =>
  files.flatMap((file) => {
    const match = new RegExp(`^content/${folder}/([^/]+)\\.ya?ml$`).exec(file);
    return match?.[1] === undefined ? [] : [match[1]];
  });

export function contentChanges(
  commits: readonly Commit[],
  knownTopics: ReadonlySet<string>,
  limit = 50,
): ContentChange[] {
  const changes: ContentChange[] = [];
  for (const commit of commits) {
    const topics = idsIn(commit.files, 'topics').filter((id) => knownTopics.has(id));
    const sources = idsIn(commit.files, 'sources');
    const parameters = idsIn(commit.files, 'parameters');
    if (topics.length + sources.length + parameters.length === 0) continue;
    const pr = PULL_REQUEST.exec(commit.subject);
    const number = pr?.[1] ?? pr?.[2];
    changes.push({
      sha: commit.sha.slice(0, 7),
      date: commit.date,
      author: commit.author,
      subject: commit.subject,
      pullRequest: number === undefined ? undefined : Number(number),
      topics,
      sources,
      parameters,
    });
    if (changes.length === limit) break;
  }
  return changes;
}
