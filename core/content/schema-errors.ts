/** Turns Ajv errors into readable messages with YAML positions. */
import type { Problem } from './problem';
import type { ErrorObject } from './schemas';
import type { ParsedYaml, PathSegment } from './yaml';

export function pointerToPath(pointer: string): PathSegment[] {
  if (pointer === '') return [];
  return pointer
    .slice(1)
    .split('/')
    .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'))
    .map((segment) => (/^\d+$/.test(segment) ? Number(segment) : segment));
}

export function pathLabel(path: readonly PathSegment[], rootLabel: string): string {
  if (path.length === 0) return rootLabel;
  return path.reduce<string>(
    (label, segment) =>
      typeof segment === 'number' ? `${label}[${String(segment)}]` : label === '' ? segment : `${label}.${segment}`,
    '',
  );
}

function typeOf(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function describeValue(value: unknown): string {
  switch (typeOf(value)) {
    case 'string':
      return `string '${String(value)}'`;
    case 'number':
    case 'boolean':
      return `${typeOf(value)} ${String(value)}`;
    default:
      return typeOf(value);
  }
}

const quoted = (value: unknown): string => (typeof value === 'string' ? `'${value}'` : JSON.stringify(value));

function formatName(error: ErrorObject): string | undefined {
  const parent: unknown = error.parentSchema;
  if (parent !== null && typeof parent === 'object' && 'x-format-name' in parent) {
    const name = (parent as Record<string, unknown>)['x-format-name'];
    if (typeof name === 'string') return name;
  }
  return undefined;
}

function message(error: ErrorObject, label: string, prefix: string): string {
  const params = error.params as Record<string, unknown>;
  switch (error.keyword) {
    case 'required':
      return `${prefix}missing required property '${String(params.missingProperty)}'`;
    case 'additionalProperties':
      return `${prefix}unknown property '${String(params.additionalProperty)}'`;
    case 'enum':
      return `${label} must be one of: ${(params.allowedValues as unknown[]).map(String).join(', ')} (got ${quoted(error.data)})`;
    case 'const':
      return `${label} must be ${quoted(params.allowedValue)} (got ${quoted(error.data)})`;
    case 'type':
      return `${label} must be ${String(params.type)} (got ${describeValue(error.data)})`;
    case 'minLength':
      return params.limit === 1
        ? `${label} must not be empty`
        : `${label} must be at least ${String(params.limit)} characters`;
    case 'maxLength':
      return `${label} must be at most ${String(params.limit)} characters (got ${String((error.data as string).length)})`;
    case 'pattern': {
      if ((error.data as string).trim() === '') return `${label} must not be empty`;
      const name = formatName(error);
      return name === undefined
        ? `${label} must match ${String(params.pattern)} (got ${quoted(error.data)})`
        : `${label} must be ${name} (got ${quoted(error.data)})`;
    }
    case 'uniqueItems':
      return `${label} must not contain duplicates (items ${String(params.j)} and ${String(params.i)} are equal)`;
    default:
      return `${label} ${error.message ?? 'is invalid'}`;
  }
}

/**
 * Ajv reports one error per failed branch of `anyOf`/`oneOf` plus a summary. If some branch failed
 * for a reason other than type, that branch matched the value's type and its errors are the useful
 * ones; otherwise all branches had the wrong type and a single "must be A or B" error is clearer.
 */
function prune(errors: readonly ErrorObject[]): ErrorObject[] {
  const result: ErrorObject[] = [];
  let consumed = 0;
  errors.forEach((error, index) => {
    if (error.keyword !== 'anyOf' && error.keyword !== 'oneOf') return;
    // Ajv emits the branch errors immediately before the combinator summary (branches may be $refs,
    // so their schemaPath points elsewhere; position and instancePath identify them).
    const before = errors.slice(consumed, index);
    const branch = before.filter((e) => e.instancePath === error.instancePath);
    result.push(...before.filter((e) => e.instancePath !== error.instancePath));
    const typeErrors = branch.filter((e) => e.keyword === 'type');
    if (branch.length > typeErrors.length) {
      result.push(...branch.filter((e) => e.keyword !== 'type'));
    } else {
      const types = typeErrors.map((e) => String((e.params as Record<string, unknown>).type));
      result.push({ ...error, keyword: 'type', params: { type: types.join(' or ') } });
    }
    consumed = index + 1;
  });
  result.push(...errors.slice(consumed));
  return result;
}

export function schemaProblems(
  errors: readonly ErrorObject[],
  parsed: ParsedYaml,
  file: string,
  rootLabel: string,
): Problem[] {
  const seen = new Set<string>();
  const problems: Problem[] = [];
  // `if` errors only say "must match then schema"; the `then` branch reports the real problem.
  for (const error of prune(errors.filter((e) => e.keyword !== 'if'))) {
    const path = pointerToPath(error.instancePath);
    const label = pathLabel(path, rootLabel);
    const prefix = path.length === 0 ? '' : `${label}: `;
    const position =
      error.keyword === 'additionalProperties'
        ? parsed.locateKey(path, String((error.params as Record<string, unknown>).additionalProperty))
        : parsed.locate(path);
    const text = message(error, label, prefix);
    const key = `${String(position.line)}:${String(position.column)}:${text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    problems.push({ file, ...position, severity: 'error', rule: 'schema', message: text });
  }
  return problems.sort((a, b) => a.line - b.line || a.column - b.column);
}
