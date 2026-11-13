/**
 * `tsx pipeline/summary/cli.ts <base root> <head root>`: prints the clinical change summary (Markdown) of the content
 * under <head root>/content compared with <base root>/content (TS-06.2.4). Used by .github/workflows/content-summary.yml.
 */
import { resolve } from 'node:path';
import { loadContent } from '../../core/content/loader';
import { renderSummary, summariseChanges } from './summary';

const [baseRoot, headRoot] = process.argv.slice(2);
if (baseRoot === undefined || headRoot === undefined) {
  throw new Error('usage: tsx pipeline/summary/cli.ts <base root> <head root>');
}
const base = loadContent(resolve(baseRoot)).bundle;
const head = loadContent(resolve(headRoot)).bundle;
process.stdout.write(renderSummary(summariseChanges(base, head)));
