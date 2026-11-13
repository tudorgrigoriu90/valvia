/**
 * `tsx pipeline/watch/cli.ts <output dir>`: one source-watcher run (TS-06.1.1). Writes `issues.json` (one entry per new
 * candidate) to the output directory and updates `pipeline/watch/state.json`. Run weekly by
 * .github/workflows/source-watch.yml, which opens the issues and commits the state.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { hasErrors, loadContent } from '../../core/content/loader';
import { normaliseBase } from '../../core/site/base-path';
import { WATCHED_PAGES } from './pages';
import { parseState, serializeState } from './state';
import { issueContext, registeredDois, runWatch, sourcesWithDoi } from './watch';

const root = resolve(import.meta.dirname, '../..');
const output = resolve(process.argv[2] ?? 'watch-output');
const statePath = join(root, 'pipeline/watch/state.json');

const { bundle, problems } = loadContent(root);
if (hasErrors(problems)) throw new Error('content has errors: run npm run validate:content');

const site = new URL(
  normaliseBase(process.env.VALVIA_BASE ?? '/valvia/'),
  process.env.VALVIA_SITE ?? 'https://tudorgrigoriu90.github.io',
).href;
const today = process.env.WATCH_TODAY ?? new Date().toISOString().slice(0, 10);
const state = parseState(existsSync(statePath) ? readFileSync(statePath, 'utf8') : undefined);

const pause = (ms: number): Promise<void> =>
  new Promise((done) => {
    setTimeout(done, ms);
  });

/** GET with a generic User-Agent (no personal data); retries rate limits and server errors. */
async function get(url: string, accept: string): Promise<Response> {
  for (let attempt = 1; ; attempt += 1) {
    const response = await fetch(url, { headers: { 'User-Agent': 'valvia-source-watcher', Accept: accept } });
    if (response.ok) return response;
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === 3) throw new Error(`${String(response.status)} from ${new URL(url).host}`);
    await pause(attempt * 5000);
  }
}

const fetchJson = async (url: string): Promise<unknown> => (await get(url, 'application/json')).json();
const fetchText = async (url: string): Promise<string> => (await get(url, 'text/html')).text();

const result = await runWatch({
  fetchJson,
  fetchText,
  watchedPages: WATCHED_PAGES,
  state,
  today,
  context: issueContext(bundle, site),
  registry: registeredDois(bundle),
  sourcesWithDoi: sourcesWithDoi(bundle),
});
mkdirSync(output, { recursive: true });
writeFileSync(join(output, 'issues.json'), `${JSON.stringify(result.issues, null, 2)}\n`);
writeFileSync(statePath, serializeState(result.state));
process.stdout.write(`${String(result.issues.length)} new candidate(s); state saved for ${today}\n`);
