# Valvia

Quick lookup of echocardiography reference and cut-off values (adult and paediatric) from
**ESC (incl. EACVI)** and **ASE** documents. Every value is cited, disagreements between societies
are shown side by side, and superseded values stay visible as "Previous recommendations".
Mobile first, works offline, static site on GitHub Pages.

Live site (after Pages is enabled on the `gh-pages` branch): <https://tudorgrigoriu90.github.io/valvia/>

> **Disclaimer:** Valvia is a reference aid, not a medical device. Always verify values against the original guideline.

## Current status

| | |
|---|---|
| Release | R0: Walking skeleton |
| Last completed task | CH-4: Generate TypeScript types from JSON Schema (npm run gen:types) with a  |
| Next task | TS-02.3.1: source schema with allowlist |
| Full plan | [`docs/TASK_PLAN.md`](docs/TASK_PLAN.md) |

## Quick start

Prerequisites: Node.js version in [`.nvmrc`](.nvmrc) (22.23.4 or later) and npm.

```bash
npm install
npm run dev       # local site at http://localhost:4321/valvia/
npm run build     # static output in dist/
npm run lint      # ESLint, zero warnings
npm run typecheck # astro check (TypeScript strictest, incl. .astro files)
npm run format    # Prettier (code only; Markdown is hand-formatted)
npm test          # unit tests with coverage (≥ 80 % global, 100 % safety-critical)
npm run test:e2e  # Playwright E2E against the production build (run build first)
npm run check:links -- --site  # internal links in docs and dist/
npm run gen:types # regenerate TypeScript types after a schema change
npm run verify    # everything above in order: run before every push
```

Local Playwright browsers: `npx playwright install chromium` once. See [testing guide](docs/testing.md).

## Repository layout

| Path | Contents |
|---|---|
| `CLAUDE.md` | Engineering guidelines every contributor and Claude session follows |
| `docs/TASK_PLAN.md` | Task status and push log |
| `docs/architecture.md` | Architecture overview with diagrams |
| `docs/adr/` | Architecture Decision Records |
| `docs/product/` | Product backlog and content taxonomy |
| `site/` | Astro app (rendering only) |
| `core/` | Framework-free domain logic |
| `content/` | Clinical content as YAML (changes via SME-approved PR) |
| `schema/` | JSON Schemas and generated types |
| `pipeline/` | Update pipeline scripts |
| `.github/workflows/` | GitHub Actions (CI and deploy) |
| `astro.config.mjs` | Site configuration (base path from `VALVIA_BASE`) |

## How to contribute

Read [`CLAUDE.md`](CLAUDE.md) first. In short:

- Code, config, tests and docs: commit **directly to `main`**, one task per push.
- Clinical data (`/content/**`, source registry): **pull request**, approved only by the SME.
- TDD, coverage ≥ 80 %, docs in Markdown with Mermaid diagrams, README and task plan updated with every change.

## Documentation

- [Engineering guidelines](CLAUDE.md)
- [Task plan](docs/TASK_PLAN.md)
- [Architecture](docs/architecture.md)
- [Architecture Decision Records](docs/adr/README.md)
- [Content model reference](docs/content-model.md)
- [Testing guide](docs/testing.md)
- [CI/CD](docs/ci-cd.md)
- [Product backlog](docs/product/valvia-backlog.md)
- [Content taxonomy](docs/product/valvia-taxonomy.md)

## License

[Apache License 2.0](LICENSE)
