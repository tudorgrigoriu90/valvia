# 0001. Static site generator: Astro

- **Status:** Accepted
- **Date:** 2026-11-02
- **Backlog:** TS-01.1.1

## Context

Valvia is a static, mobile-first reference site (backlog §2). The generator must:

- ship almost no JavaScript by default (NFR-02: ≤ 50 KB gzipped JS per topic page, Lighthouse ≥ 95, LCP ≤ 1.5 s on 4G);
- allow small interactive islands (society filter, adult/paediatric switch, citation popovers, prosthetic picker, search UI);
- render from our own typed content model (YAML validated by JSON Schema, see ADR 0003) at build time;
- produce plain static files for GitHub Pages (NFR-12 portability);
- work well with TypeScript strict and with Vitest/Playwright;
- be easy for Claude Code to work in (popular, well documented, stable conventions).

## Options considered

| Criterion | Astro | Eleventy (11ty) |
|---|---|---|
| Default JS shipped | 0 KB; opt-in islands (`client:*`) | 0 KB; islands require hand-rolled scripts or WebC |
| Interactive components | First class (Astro components, optional UI frameworks, plain `<script>` modules bundled by Vite) | Manual bundling or plugins |
| TypeScript | Native, typed props, `astro check` | Possible, not native in templates |
| Build tooling | Vite (shared with Vitest) | Own pipeline; separate bundler for TS |
| Static output | Yes (`output: 'static'`) | Yes |
| Data loading | Any TS module in frontmatter; content layer optional | Global data files |
| Ecosystem fit | Pagefind, PWA and sitemap integrations; widely used for docs/reference sites | Pagefind works; PWA manual |
| Lock-in | `.astro` templates | Nunjucks/Liquid/WebC templates |

## Decision

Use **Astro** (major version 7) in **static output** mode, with TypeScript strict.

- Domain logic (content loading, validation, units, discrepancies, history) lives in framework-free
  TypeScript modules (`/core`) and is only *consumed* by Astro pages. Astro is a rendering layer.
- Interactivity uses small Astro `<script>` modules (vanilla TS) first; a UI framework is added only
  through a new ADR if a component genuinely needs one.
- We do not depend on Astro content collections for our model: the content loader is our own
  (ADR 0003), so validation runs identically in CI, the pipeline and the site build.

## Consequences

- Positive: near-zero JS, Vite shared with Vitest, typed templates, simple static deploy.
- Positive: framework-free core keeps the most safety-critical code testable without Astro.
- Negative: Astro major upgrades arrive yearly; Renovate (TS-01.2.4) only auto-merges patch/minor, majors are a planned task.
- Negative: `.astro` files need their own lint/format plugins (`eslint-plugin-astro`, `prettier-plugin-astro`).

## Cost

€0 (MIT licensed, runs in GitHub Actions free minutes).

## Exit strategy

Pages are thin views over `/core`. Moving to another generator (Eleventy, Vite SSG) means rewriting
templates and components only; content, schema, validation and logic are untouched. Estimated effort:
a few days for the template layer. Output is plain HTML, so hosting is unaffected.
