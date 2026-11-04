/** Post-build step: writes dist/sw.js with the precache list (run by `npm run build`). */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { normaliseBase } from '../../core/site/base-path';
import { precacheUrls, renderServiceWorker, versionOf } from './service-worker';

const dist = resolve(import.meta.dirname, '../../dist');
const base = normaliseBase(process.env.VALVIA_BASE ?? '/valvia/');

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [relative(dist, path).split(sep).join('/')];
  });
}

const files = walk(dist).sort();
const version = versionOf(files.map((file) => [file, readFileSync(join(dist, file), 'utf8')] as const));
const urls = precacheUrls(files, base);
writeFileSync(join(dist, 'sw.js'), renderServiceWorker(urls, version, base));
process.stdout.write(`sw.js: ${String(urls.length)} URLs precached, version ${version}\n`);
