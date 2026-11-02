/** Single-file validation: YAML syntax, JSON Schema and file naming (ADR 0003 steps 1–2). */
import { basename } from 'node:path';
import type { Problem } from './problem';
import { getValidator, type ContentKind } from './schemas';
import { schemaProblems } from './schema-errors';
import { parseYaml } from './yaml';

export interface FileValidation {
  /** Parsed data when the YAML was syntactically valid (even if the schema failed). */
  data?: unknown;
  problems: Problem[];
}

export function validateContentFile(kind: ContentKind, file: string, text: string): FileValidation {
  if (text.trim() === '') {
    return {
      problems: [{ file, line: 1, column: 1, severity: 'error', rule: 'yaml-syntax', message: 'file is empty' }],
    };
  }
  const parsed = parseYaml(text);
  if (!parsed.ok) {
    return {
      problems: parsed.errors.map(({ message, position }) => ({
        file,
        ...position,
        severity: 'error' as const,
        rule: 'yaml-syntax',
        message,
      })),
    };
  }

  const { data } = parsed.value;
  const validate = getValidator(kind);
  const problems: Problem[] = validate(data) ? [] : schemaProblems(validate.errors ?? [], parsed.value, file, kind);

  if (data !== null && typeof data === 'object' && 'id' in data && typeof data.id === 'string') {
    const expected = `${data.id}.yaml`;
    if (basename(file) !== expected) {
      problems.push({
        file,
        ...parsed.value.locate(['id']),
        severity: 'error',
        rule: 'file-name',
        message: `file name '${basename(file)}' must equal id '${data.id}' + '.yaml'`,
      });
    }
  }
  return { data, problems };
}
