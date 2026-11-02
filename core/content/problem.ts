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
