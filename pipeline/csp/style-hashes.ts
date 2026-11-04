/**
 * Inline style hashes (CH-15): Astro inlines the stylesheet to avoid a render-blocking request; this step adds the
 * SHA-256 of every inline <style> to the page's CSP style-src, so 'unsafe-inline' is never needed (ADR 0002).
 */
import { createHash } from 'node:crypto';

const STYLE = /<style\b[^>]*>([\s\S]*?)<\/style>/g;
const CSP_META = /(<meta http-equiv="Content-Security-Policy" content=")([^"]*)(")/;

export function withStyleHashes(html: string): string {
  const meta = CSP_META.exec(html);
  if (meta === null) return html;
  const hashes = [...new Set([...html.matchAll(STYLE)].map((m) => m[1] ?? ''))].map(
    (css) => `'sha256-${createHash('sha256').update(css, 'utf8').digest('base64')}'`,
  );
  if (hashes.length === 0) return html;
  const policy = (meta[2] ?? '').replace(
    /style-src ([^;]*)/,
    (_all, sources: string) => `style-src ${sources} ${hashes.join(' ')}`,
  );
  return html.replace(CSP_META, `$1${policy}$3`);
}
