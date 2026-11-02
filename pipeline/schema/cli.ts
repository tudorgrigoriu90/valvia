/** `npm run gen:types`: writes generated types to schema/generated/. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { generateTypes, GENERATED_DIR, SCHEMA_DIR } from './generate-types';

const root = resolve(import.meta.dirname, '../..');
const files = await generateTypes(join(root, SCHEMA_DIR));
mkdirSync(join(root, GENERATED_DIR), { recursive: true });
for (const [name, content] of files) {
  writeFileSync(join(root, GENERATED_DIR, name), content);
  process.stdout.write(`wrote ${GENERATED_DIR}/${name}\n`);
}
