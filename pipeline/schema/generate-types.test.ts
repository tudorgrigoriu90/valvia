import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateTypes, GENERATED_DIR, SCHEMA_DIR } from './generate-types';

const root = resolve(import.meta.dirname, '../..');

describe('generateTypes', () => {
  it('generates one TypeScript module per entity schema, skipping shared definitions', async () => {
    const files = await generateTypes(join(root, SCHEMA_DIR));
    expect([...files.keys()]).toContain('topic.ts');
    expect([...files.keys()]).not.toContain('common.ts');
  });

  it('exports an interface named after the schema title with documented fields', async () => {
    const topic = (await generateTypes(join(root, SCHEMA_DIR))).get('topic.ts') ?? '';
    expect(topic).toMatch(/export interface TopicNode \{/);
    expect(topic).toContain('parent: string | null;');
    expect(topic).toContain("population: 'adult' | 'paediatric' | 'both';");
    expect(topic).toContain('DO NOT EDIT');
  });

  it('committed types are up to date with the schemas (run `npm run gen:types`)', async () => {
    const files = await generateTypes(join(root, SCHEMA_DIR));
    for (const [name, content] of files) {
      const path = join(root, GENERATED_DIR, name);
      expect(existsSync(path), `${GENERATED_DIR}/${name} is missing`).toBe(true);
      expect(readFileSync(path, 'utf8'), `${GENERATED_DIR}/${name} is stale`).toBe(content);
    }
  });
});
