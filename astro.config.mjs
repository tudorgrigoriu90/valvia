// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Valvia site configuration (ADR 0001, ADR 0002).
 * Origin and base path come from the environment so the same build works for
 * production (/valvia/ or / on a custom domain) and PR previews (/valvia/pr-preview/pr-N/).
 */
const site = process.env.VALVIA_SITE ?? 'https://tudorgrigoriu90.github.io';
const base = process.env.VALVIA_BASE ?? '/valvia/';

export default defineConfig({
  site,
  base,
  output: 'static',
  srcDir: './site',
  publicDir: './site/public',
  outDir: './dist',
  trailingSlash: 'always',
  // The dev toolbar injects inline scripts that the CSP forbids; keep dev and production alike.
  devToolbar: { enabled: false },
  build: {
    format: 'directory',
    // ADR 0002: no inline styles or scripts, so the meta CSP can forbid them.
    inlineStylesheets: 'never',
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});
