/** Single-file validation: YAML syntax, JSON Schema and file naming (ADR 0003 steps 1–2). */
import { basename } from 'node:path';
import type { Problem } from './problem';
import { getDefinitionValidator, getValidator, type ContentKind, type DefinitionName } from './schemas';
import { schemaProblems } from './schema-errors';
import { parseYaml, type ParsedYaml, type Position } from './yaml';

const syntaxProblems = (file: string, errors: readonly { message: string; position: Position }[]): Problem[] =>
  errors.map(({ message, position }) => ({ file, ...position, severity: 'error', rule: 'yaml-syntax', message }));

export interface FileValidation {
  /** Parsed data when the YAML was syntactically valid (even if the schema failed). */
  data?: unknown;
  /** Parsed document with positions, for follow-up rules. */
  parsed?: ParsedYaml;
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
    return { problems: syntaxProblems(file, parsed.errors) };
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
  return { data, parsed: parsed.value, problems };
}

/** Validates a YAML fragment against a shared definition such as `citation` (no file-name rule). */
export function validateDefinition(name: DefinitionName, text: string): FileValidation {
  const file = `<definition:${name}>`;
  const parsed = parseYaml(text);
  if (!parsed.ok) {
    return { problems: syntaxProblems(file, parsed.errors) };
  }
  const validate = getDefinitionValidator(name);
  const { data } = parsed.value;
  return { data, problems: validate(data) ? [] : schemaProblems(validate.errors ?? [], parsed.value, file, name) };
}
