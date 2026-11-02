# Valvia

Quick lookup of echocardiography reference and cut-off values (adult and paediatric) from
**ESC (incl. EACVI)** and **ASE** documents. Every value is cited, disagreements between societies
are shown side by side, and superseded values stay visible as "Previous recommendations".
Mobile first, works offline, static site on GitHub Pages.

> **Disclaimer:** Valvia is a reference aid, not a medical device. Always verify values against the original guideline.

## Current status

| | |
|---|---|
| Release | R0: Walking skeleton |
| Last completed task | TS-01.2.1: Repo structure: /site, /content, /schema, /pipeline, /docs |
| Next task | TS-01.2.3: TypeScript strict, ESLint, Prettier |
| Full plan | [`docs/TASK_PLAN.md`](docs/TASK_PLAN.md) |

## Quick start

Prerequisites: Node.js version in [`.nvmrc`](.nvmrc) (22.23.4 or later) and npm.

```bash
npm install
npm run dev       # local site at http://localhost:4321/valvia/
npm run build     # static output in dist/
```

Coming with the next tasks: `npm test` (coverage ≥ 80 %) and `npm run verify` (lint + typecheck + tests + build).

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
- [Product backlog](docs/product/valvia-backlog.md)
- [Content taxonomy](docs/product/valvia-taxonomy.md)

## License

[Apache License 2.0](LICENSE)
