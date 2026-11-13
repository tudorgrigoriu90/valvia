# Testing guide

> **Purpose:** how Valvia is tested, how to run the tests and what the gates are.
> **Audience:** engineer, Claude Code sessions. **Last updated:** 2026-11-13

Valvia is built test-first (TDD, `CLAUDE.md` §5). Every push runs the full local gate:

```bash
npm run verify   # format:check → lint → typecheck → test (coverage) → validate:content → build → check:links --site → test:e2e
```

## Test layers

```mermaid
flowchart LR
    unit["Unit / integration<br/>Vitest · core/, pipeline/, site/ *.test.ts"] --> cov{"Coverage gate<br/>≥ 80 % global<br/>100 % safety-critical"}
    cov --> build["astro build"]
    build --> e2e["E2E · Playwright<br/>tests/e2e/*.spec.ts<br/>360 px + desktop"]
```

| Layer | Command | Location | Notes |
|---|---|---|---|
| Unit / integration | `npm test` (`npm run test:watch` while developing) | next to the code: `foo.ts` + `foo.test.ts` | Node environment, deterministic, no network |
| E2E | `npm run test:e2e` | `tests/e2e/` | Runs against the production build served by `tests/e2e/static-server.ts` at `/valvia/` (mirrors GitHub Pages: directory index, `404.html`); build first |
| Third-party guard | part of `npm run test:e2e` | `tests/e2e/assets.spec.ts` | TS-05.2.2: every request same-origin (the opt-in analytics beacon is off in test builds), no web fonts, system font stack, SVG-only icons and images |
| Internal links | `npm run check:links` (add `-- --site` after a build) | `pipeline/links/` | Markdown relative links + heading anchors; built pages stay under the base path and resolve to built files/ids. External URLs are not checked (offline, deterministic) |
| Content validation | `npm run validate:content` | `/content` | YAML syntax, schema, file names, integrity, source allowlist, units, plausibility |

## Coverage

Configured in [`vitest.config.ts`](../vitest.config.ts); `npm test` fails below the thresholds.

| Scope | Lines / branches / functions / statements |
|---|---|
| Global (`core/`, `pipeline/`, `site/` TypeScript) | ≥ 80 % |
| `core/units/**`, `core/sources/**`, `core/population/**`, `core/discrepancy/**`, `core/history/**` | 100 % |

Reports: terminal summary, `coverage/index.html`, `coverage/lcov.info`. Exclusions are listed in the config with a reason.

## Browsers

Playwright is pinned to the version whose Chromium is installed in the cloud environment (1.63.0).
On a local machine run `npx playwright install chromium` once.

## Writing tests

- Test behaviour through public functions; name tests as specifications.
- Table-driven tests (`it.each`) for conversions, schema rules and grading boundaries.
- Fixtures live in `__fixtures__/` folders next to the tests that use them.
- **Shared scenario fixtures (TS-02.4.3):** [`core/view/__fixtures__/content/`](../core/view/__fixtures__/content/) is a
  small content tree with **fictional** values (three sources, one superseded; two parameters; one leaf). It goes through
  the real loader, discrepancy detection, history logic and leaf view in
  [`fixtures.test.ts`](../core/view/fixtures.test.ts): agreement across units (7 mm vs 0.7 cm, not flagged),
  disagreement (0.40 vs 0.30 cm², flagged and shown side by side), different populations (not compared) and a superseded
  value (moved to previous recommendations with its successor, never compared). Extend it when a new rule touches these
  paths, and keep its values obviously fictional.
- A bug fix starts with a failing test that reproduces it.
