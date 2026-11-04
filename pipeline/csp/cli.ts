/** Post-build step (CH-15): adds inline style hashes to the CSP of every built HTML page. */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { withStyleHashes } from './style-hashes';

const dist = resolve(import.meta.dirname, '../../dist');
let count = 0;
const walk = (directory: string): void => {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith('.html')) {
      const html = readFileSync(path, 'utf8');
      const updated = withStyleHashes(html);
      if (updated !== html) {
        writeFileSync(path, updated);
        count += 1;
      }
    }
  }
};
walk(dist);
process.stdout.write(`CSP style hashes added to ${String(count)} page(s)\n`);
