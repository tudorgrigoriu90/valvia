/** A content validation finding, always tied to a file position (ADR 0003). */
export interface Problem {
  file: string;
  /** 1-based line. */
  line: number;
  /** 1-based column. */
  column: number;
  severity: 'error' | 'warning';
  /** Machine-readable rule name, e.g. `schema`, `yaml-syntax`, `file-name`. */
  rule: string;
  message: string;
}

export const formatProblem = (p: Problem): string =>
  `${p.file}:${String(p.line)}:${String(p.column)} ${p.severity} ${p.rule} ${p.message}`;

const escapeData = (value: string): string => value.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');

/** GitHub Actions workflow command, shown as an annotation on the file in the run and PR. */
export const formatGithubAnnotation = (p: Problem): string =>
  `::${p.severity} file=${p.file},line=${String(p.line)},col=${String(p.column)},title=${p.rule}::${escapeData(p.message)}`;
