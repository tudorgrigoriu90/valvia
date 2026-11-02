/** Generates TypeScript types from the JSON Schemas in /schema (ADR 0003, CH-4). */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { compile, type JSONSchema } from 'json-schema-to-typescript';

export const SCHEMA_DIR = 'schema';
export const GENERATED_DIR = 'schema/generated';
/** Schemas that only hold shared `$defs` and have no entity of their own. */
const SHARED_ONLY = new Set(['common.schema.json']);

const BANNER = `/**
 * DO NOT EDIT: generated from /schema by \`npm run gen:types\` (ADR 0003).
 * A unit test fails when this file is out of date.
 */`;

/** Returns generated module contents keyed by file name (e.g. `topic.ts`). */
export async function generateTypes(schemaDir: string): Promise<Map<string, string>> {
  const files = new Map<string, string>();
  const schemaFiles = readdirSync(schemaDir)
    .filter((name) => name.endsWith('.schema.json') && !SHARED_ONLY.has(name))
    .sort();

  for (const name of schemaFiles) {
    const schema = JSON.parse(readFileSync(join(schemaDir, name), 'utf8')) as JSONSchema;
    const output = await compile(schema, String(schema.title), {
      bannerComment: BANNER,
      additionalProperties: false,
      unreachableDefinitions: false,
      style: { singleQuote: true, printWidth: 120, trailingComma: 'all' },
      // Relative $refs (e.g. common.schema.json#/$defs/id) resolve against the schema folder.
      cwd: schemaDir,
    });
    files.set(name.replace('.schema.json', '.ts'), output);
  }
  return files;
}
