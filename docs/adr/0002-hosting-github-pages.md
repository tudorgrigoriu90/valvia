# 0002. Hosting: GitHub Pages, PR previews, meta CSP, static redirects

- **Status:** Accepted
- **Date:** 2026-11-02
- **Backlog:** TS-01.1.2

## Context

Backlog §2 chooses GitHub Pages on a public repository: free hosting, HTTPS, one platform for code,
review, CI and hosting. Requirements: deploy on every push to `main` in < 5 min (FT-01.3), a preview
for every **content PR** (the only PRs under the workflow in `CLAUDE.md`), previews removed when the PR
closes and hidden from search engines, a Content Security Policy (NFR-10), and working URLs when a
slug is renamed (FT-02.1). GitHub Pages serves static files only: no custom headers, no server redirects.

## Options considered

1. **Pages "source: GitHub Actions"** (`actions/deploy-pages`). Clean artefact deploys, but every deploy
   replaces the whole site, so per-PR previews cannot live next to production.
2. **Pages "source: branch" (`gh-pages`)**, production deployed to the branch root and previews to
   `pr-preview/pr-N/` with `rossjrw/pr-preview-action`. Previews and production coexist.
3. External host for previews (Netlify, Cloudflare Pages). Adds an account and a second platform.

## Decision

**Option 2.**

- **Production:** on push to `main`, CI builds and deploys `dist/` to the root of the `gh-pages` branch,
  keeping the `pr-preview/` folder (`clean-exclude: pr-preview/`). Pages source: branch `gh-pages`, folder `/`.
  *Engineer action (TS-08.1):* set Pages source to the `gh-pages` branch instead of "GitHub Actions".
- **Previews:** for pull requests (content PRs), `pr-preview-action` deploys to `pr-preview/pr-N/`,
  comments the link and removes it when the PR closes. Forked PRs do not get previews (no write token).
- **Base path:** the site never hard-codes its origin or path. `VALVIA_SITE` (origin) and `VALVIA_BASE`
  (path, e.g. `/valvia/`, `/valvia/pr-preview/pr-12/`, or `/` on a custom domain) are read at build time.
  All internal links go through one helper that prefixes the base. A test checks built pages have no root-relative links that ignore the base.
- **No indexing of previews:** preview builds (`VALVIA_PREVIEW=1`) add `<meta name="robots" content="noindex, nofollow">`;
  production `robots.txt` disallows `/pr-preview/`.
- **CSP via `<meta http-equiv="Content-Security-Policy">`** in the base layout:
  `default-src 'self'; script-src 'self' <analytics origin>; style-src 'self'; img-src 'self' data:; connect-src 'self' <analytics origin>; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests`.
  Astro is configured not to inline scripts or stylesheets, and a build test fails if any page has inline
  `<script>`/`<style>` or event-handler attributes. `frame-ancestors` cannot be set by a meta tag (accepted).
- **Renamed slugs:** each node keeps a list of former slugs; the build emits a static page at every old URL with
  `<meta http-equiv="refresh" content="0; url=…">`, `<link rel="canonical">`, `noindex`, and a visible link.
- **HTTPS:** enforced in Pages settings; custom domain later (TS-08.2) only changes `VALVIA_SITE`/`VALVIA_BASE` and adds `CNAME`.

## Consequences

- Positive: one platform, €0, previews next to production, SME reviews on the phone via the preview link.
- Negative: the `gh-pages` branch grows with every deploy (history of built files). Mitigation: deploy with
  `force_orphan`-style single-commit history is incompatible with previews, so we accept growth and prune
  the branch yearly if it exceeds 500 MB (runbook, TS-08.6).
- Negative: no response headers (no HSTS control, no `frame-ancestors`, no `X-Content-Type-Options`). Accepted for a public, PII-free reference site.

## Cost

€0 (public repository: Pages and Actions are free). Domain ~€10–15/year when added.

## Exit strategy

The build output is plain static files that work under any base path. Moving to Cloudflare Pages,
Netlify or any static host is a new deploy job plus DNS change: under a day (NFR-12). Real HTTP
redirects and headers can then replace the meta-refresh pages and meta CSP.
