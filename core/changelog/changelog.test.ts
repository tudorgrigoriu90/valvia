import { describe, expect, it } from 'vitest';
import { GIT_LOG_ARGS, contentChanges, parseGitLog } from './changelog';

const RS = '\u001e';
const US = '\u001f';
const record = (sha: string, date: string, author: string, subject: string, files: string[]): string =>
  `${RS}${sha}${US}${date}${US}${author}${US}${subject}\n\n${files.join('\n')}\n`;

const LOG =
  record('a'.repeat(40), '2026-11-13', 'Claude', 'CH-57: contrast echo indications', [
    'content/topics/contrast-echocardiography.yaml',
    'content/sources/ase-2018-uea.yaml',
  ]) +
  record('b'.repeat(40), '2026-11-12', 'SME Name', 'Merge pull request #12 from x/content/3.2.1.2-mr', [
    'content/topics/primary-mr-severity-grading.yaml',
    'content/parameters/eroa.yaml',
    'content/README.md',
  ]) +
  record('c'.repeat(40), '2026-11-11', 'Claude', 'TS-02.1.1: schema', []);

describe('parseGitLog (TS-06.4.1)', () => {
  it('reads commits with date, author, subject and changed files', () => {
    const commits = parseGitLog(LOG);
    expect(commits).toHaveLength(3);
    expect(commits[0]).toEqual({
      sha: 'a'.repeat(40),
      date: '2026-11-13',
      author: 'Claude',
      subject: 'CH-57: contrast echo indications',
      files: ['content/topics/contrast-echocardiography.yaml', 'content/sources/ase-2018-uea.yaml'],
    });
    expect(commits[2]?.files).toEqual([]);
  });

  it('returns nothing for empty output (no git, shallow clone without history)', () => {
    expect(parseGitLog('')).toEqual([]);
    expect(parseGitLog('\n')).toEqual([]);
  });

  it('skips malformed records', () => {
    expect(parseGitLog(`${RS}only-a-sha\n`)).toEqual([]);
  });

  it('documents the git arguments that produce this format', () => {
    expect(GIT_LOG_ARGS).toContain('--name-only');
    expect(GIT_LOG_ARGS.at(-1)).toBe('content/');
  });
});

describe('contentChanges', () => {
  const known = new Set(['contrast-echocardiography', 'primary-mr-severity-grading']);

  it('maps changed YAML files to topics, sources and parameters, and drops commits without content data', () => {
    expect(contentChanges(parseGitLog(LOG), known)).toEqual([
      {
        sha: 'aaaaaaa',
        date: '2026-11-13',
        author: 'Claude',
        subject: 'CH-57: contrast echo indications',
        pullRequest: undefined,
        topics: ['contrast-echocardiography'],
        sources: ['ase-2018-uea'],
        parameters: [],
      },
      {
        sha: 'bbbbbbb',
        date: '2026-11-12',
        author: 'SME Name',
        subject: 'Merge pull request #12 from x/content/3.2.1.2-mr',
        pullRequest: 12,
        topics: ['primary-mr-severity-grading'],
        sources: [],
        parameters: ['eroa'],
      },
    ]);
  });

  it('leaves out topics that no longer exist', () => {
    const log = record('d'.repeat(40), '2026-11-10', 'Claude', 'remove', ['content/topics/gone.yaml']);
    expect(contentChanges(parseGitLog(log), known)).toEqual([]);
  });

  it('reads the pull request number of a squash merge subject', () => {
    const log = record('e'.repeat(40), '2026-11-10', 'SME', 'Content: AS grading (#34)', [
      'content/topics/primary-mr-severity-grading.yaml',
    ]);
    expect(contentChanges(parseGitLog(log), known)[0]?.pullRequest).toBe(34);
  });

  it('keeps at most the requested number of entries', () => {
    expect(contentChanges(parseGitLog(LOG), known, 1)).toHaveLength(1);
  });
});
