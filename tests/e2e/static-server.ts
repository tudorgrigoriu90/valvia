/**
 * Minimal static server for E2E tests that mirrors GitHub Pages: serves dist/ under the base path,
 * resolves directory URLs to index.html, answers unknown paths with 404.html and status 404.
 * Used instead of `astro preview`, which may detach into the background in some environments.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../dist');
const base = process.env.VALVIA_BASE ?? '/valvia/';
const port = Number(process.env.PORT ?? '4322');

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.wasm': 'application/wasm',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
};

function resolveFile(urlPath: string): string | undefined {
  if (!urlPath.startsWith(base)) return undefined;
  const relative = normalize(decodeURIComponent(urlPath.slice(base.length))).replace(/^(\.\.(\/|\\|$))+/, '');
  let file = join(root, relative);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  return existsSync(file) && statSync(file).isFile() ? file : undefined;
}

createServer((request, response) => {
  const urlPath = new URL(request.url ?? '/', 'http://localhost').pathname;
  if (urlPath === base.slice(0, -1)) {
    response.writeHead(301, { location: base }).end();
    return;
  }
  const file = resolveFile(urlPath);
  const target = file ?? join(root, '404.html');
  response.writeHead(file === undefined ? 404 : 200, {
    'content-type': TYPES[extname(target)] ?? 'application/octet-stream',
  });
  createReadStream(target).pipe(response);
}).listen(port, () => {
  process.stdout.write(`serving ${root} at http://localhost:${String(port)}${base}\n`);
});
