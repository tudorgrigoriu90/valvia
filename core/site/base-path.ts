/**
 * Base-path helpers (ADR 0002). The site is served under a configurable base
 * (`/valvia/`, `/valvia/pr-preview/pr-N/` or `/`), so every internal link must be built here.
 */

/** Returns the base with exactly one leading and one trailing slash, collapsing repeated slashes. */
export function normaliseBase(base: string): string {
  const segments = base.split('/').filter((segment) => segment.length > 0);
  return segments.length === 0 ? '/' : `/${segments.join('/')}/`;
}

/** Prefixes an internal, site-relative path with the base. Absolute URLs are rejected. */
export function withBase(base: string, path: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith('//')) {
    throw new Error(`withBase() expects a site-relative path, got an absolute URL: ${path}`);
  }
  return normaliseBase(base) + path.replace(/^\/+/, '');
}
