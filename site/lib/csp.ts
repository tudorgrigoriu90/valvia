/**
 * Content Security Policy delivered as a <meta> tag (ADR 0002; 'wasm-unsafe-eval' for Pagefind, ADR 0004).
 * No 'unsafe-inline': Astro is configured not to inline scripts or styles. frame-ancestors cannot be set via meta.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');
