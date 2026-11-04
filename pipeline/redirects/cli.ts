/** Post-build step (TS-02.1.3): writes a redirect page for every former slug URL. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { hasErrors, loadContent } from '../../core/content/loader';
import { redirects } from '../../core/navigation/redirects';
import { buildNavigation } from '../../core/navigation/tree';
import { normaliseBase } from '../../core/site/base-path';
import { redirectPage } from './page';

const root = resolve(import.meta.dirname, '../..');
const { bundle, problems } = loadContent(root);
if (hasErrors(problems)) throw new Error('content has errors: run npm run validate:content');
const base = normaliseBase(process.env.VALVIA_BASE ?? '/valvia/');
const site = process.env.VALVIA_SITE ?? 'https://tudorgrigoriu90.github.io';
const list = redirects(buildNavigation(bundle.topics));
for (const { from, to } of list) {
  const directory = join(root, 'dist', from);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'index.html'), redirectPage(site, `${base}${to}`));
}
process.stdout.write(`${String(list.length)} redirect page(s) written\n`);
