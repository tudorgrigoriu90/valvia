# Valvia

Quick lookup of echocardiography reference and cut-off values (adult and paediatric) from
**ESC (incl. EACVI)** and **ASE** documents. Every value is cited, disagreements between societies
are shown side by side, and superseded values stay visible as "Previous recommendations".
Mobile first, works offline, static site on GitHub Pages.

> **Disclaimer:** Valvia is a reference aid, not a medical device. Always verify values against the original guideline.

## Current status

| | |
|---|---|
| Release | R0: Walking skeleton (not yet started in code) |
| Last completed task | TS-01.2.2: `CLAUDE.md` engineering guidelines |
| Next task | TS-01.1.1: ADR, static site generator |
| Full plan | [`docs/TASK_PLAN.md`](docs/TASK_PLAN.md) |

## Quick start

No application code exists yet. Once the tooling tasks land (TS-01.2.1, TS-01.2.3, CH-1), local setup will be:

```bash
npm install
npm run dev       # local site
npm test          # unit tests with coverage (≥ 80 %)
npm run verify    # lint + typecheck + tests + build (run before every push)
```

## Repository layout

| Path | Contents |
|---|---|
| `CLAUDE.md` | Engineering guidelines every contributor and Claude session follows |
| `docs/TASK_PLAN.md` | Task status and push log |
| `docs/architecture.md` | Architecture overview with diagrams |
| `docs/product/` | Product backlog and content taxonomy |
| `/site`, `/content`, `/schema`, `/pipeline` | Planned (TS-01.2.1) |

## How to contribute

Read [`CLAUDE.md`](CLAUDE.md) first. In short:

- Code, config, tests and docs: commit **directly to `main`**, one task per push.
- Clinical data (`/content/**`, source registry): **pull request**, approved only by the SME.
- TDD, coverage ≥ 80 %, docs in Markdown with Mermaid diagrams, README and task plan updated with every change.

## Documentation

- [Engineering guidelines](CLAUDE.md)
- [Task plan](docs/TASK_PLAN.md)
- [Architecture](docs/architecture.md)
- [Product backlog](docs/product/valvia-backlog.md)
- [Content taxonomy](docs/product/valvia-taxonomy.md)

## License

[Apache License 2.0](LICENSE)
