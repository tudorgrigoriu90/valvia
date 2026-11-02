import type { LinkProblem } from './check';

export interface FormatOptions {
  /** Emit a GitHub Actions `::error` workflow command instead of plain text. */
  github: boolean;
  /** Directory prefix for the file path (e.g. `dist` for built pages). */
  directory?: string;
}

const escapeData = (value: string): string => value.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');

export function formatProblem(problem: LinkProblem, options: FormatOptions): string {
  const file = options.directory === undefined ? problem.file : `${options.directory}/${problem.file}`;
  const message = `${problem.target}: ${problem.reason}`;
  return options.github
    ? `::error file=${file},line=${String(problem.line)},title=Broken link::${escapeData(message)}`
    : `${file}:${String(problem.line)} ${message}`;
}
