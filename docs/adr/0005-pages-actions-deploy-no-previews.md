# 0005. Deploy with GitHub Actions Pages; no hosted PR previews

- **Status:** Accepted
- **Date:** 2026-11-02
- **Backlog:** TS-01.3.2, TS-01.3.3
- **Supersedes:** the deployment and preview parts of [ADR 0002](0002-hosting-github-pages.md)

## Context

ADR 0002 deployed to a `gh-pages` branch only so that hosted PR previews (`pr-preview/pr-N/`) could sit next
to production. The product owner decided on 2026-11-02 to drop the `gh-pages` branch: content reviews happen in
pull requests that target `main` directly, and the reviewer works from the PR itself.

## Decision

- **Production deploy** uses GitHub's built-in Pages deployment: the `verify` job uploads `dist/` with
  `actions/upload-pages-artifact`, and the `deploy` job publishes it with `actions/deploy-pages`
  (`pages: write`, `id-token: write`, environment `github-pages`). Pages source: **GitHub Actions**. No `gh-pages` branch.
- **No hosted PR previews.** TS-01.3.3 is dropped. Content PRs target `main`; the SME reviews:
  1. the clinical change summary table at the top of the PR body (old → new per parameter, population, society, locator);
  2. the YAML diff;
  3. the verification-run comment (Claude clinical-reviewer persona).
  Every PR build also uploads the built site as an artifact (`site-pr-N`, 14 days) for anyone who wants to open it locally.
- **Enablement:** Pages is enabled once with Source = GitHub Actions (TS-08.1, done 2026-11-02).
- `.nojekyll` is no longer needed (Actions deployments do not run Jekyll) and is removed.
- Still valid from ADR 0002: env-driven `VALVIA_SITE`/`VALVIA_BASE`, meta CSP without inline scripts, static redirect pages.

## Consequences

- Positive: no generated-files branch in the repo, no history growth, simpler permissions (no `contents: write`).
- Positive: GitHub-maintained actions only for deployment.
- Negative: the SME cannot tap a preview link on the phone; review relies on the change summary and diff. The
  content PR template (TS-01.2.5) and the change-summary generator (TS-06.2.4) must make the clinical change readable without the site.

## Cost

€0.

## Exit strategy

Hosted previews can be added later without a `gh-pages` branch (e.g. Cloudflare Pages or Netlify previews) through a new ADR.
Moving production to another static host is unchanged from ADR 0002 (< 1 day).
