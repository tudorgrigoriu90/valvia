/**
 * Link check CLI (CH-2).
 *   npm run check:links            Markdown docs only
 *   npm run check:links -- --site  also the built site in dist/ (run `npm run build` first)
 * Base path: VALVIA_BASE (default /valvia/), matching astro.config.mjs.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { normaliseBase } from '../../core/site/base-path';
import { checkBuiltSite, checkMarkdown } from './check';
import { formatProblem } from './report';

const root = resolve(import.meta.dirname, '../..');
const github = process.env.GITHUB_ACTIONS === 'true';
const lines: string[] = [];

for (const problem of checkMarkdown(root)) lines.push(formatProblem(problem, { github }));

if (process.argv.includes('--site')) {
  const dist = resolve(root, 'dist');
  if (!existsSync(dist)) {
    console.error('dist/ not found: run `npm run build` before `check:links -- --site`.');
    process.exit(2);
  }
  const base = normaliseBase(process.env.VALVIA_BASE ?? '/valvia/');
  for (const problem of checkBuiltSite(dist, base)) lines.push(formatProblem(problem, { github, directory: 'dist' }));
}

if (lines.length > 0) {
  console.error(lines.join('\n'));
  console.error(`\n${String(lines.length)} broken link(s).`);
  process.exit(1);
}
process.stdout.write('No broken internal links.\n');
