# /content: clinical content (YAML)

**Data changes here go through a pull request approved by the SME** (`CLAUDE.md` §3.2).
This README is documentation; YAML files are data.

| Folder | One file per | File name |
|---|---|---|
| `sources/` | Source document (ESC / EACVI / ASE, cited z-score dataset) | `<source-id>.yaml` |
| `parameters/` | Measured parameter | `<parameter-id>.yaml` |
| `topics/` | Taxonomy node; leaves hold content blocks and values | `<node-id>.yaml` |
| `prosthetics/` | Prosthetic valve reference catalogue (W2) | `<catalogue-id>.yaml` |

Schemas: [`/schema`](../schema/README.md). Modelling rules: [ADR 0003](../docs/adr/0003-content-as-code.md) and `CLAUDE.md` §12.
