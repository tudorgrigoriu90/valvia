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

## Topic tree

`topics/` holds the 164 nodes of taxonomy v0.3 ([`docs/product/valvia-taxonomy.md`](../docs/product/valvia-taxonomy.md)),
encoded once by TS-02.1.2 (initial seed, decision PO-3). From now on edit the files directly: **ids never change**;
rename a URL by changing `slug` and adding the old one to `formerSlugs`.

- `ref` is the taxonomy number; `order` follows the taxonomy order among siblings.
- `population`: root 8 (congenital) and 14 (reference) are `both`, root 15 (paediatric) is `paediatric`, all others `adult`.
- `wave` comes from the root (4.1 is W2).
- Cross-links (→) are `seeAlso`.
- Every node is `status: draft`; nodes without blocks are hidden on the site until content is added.
