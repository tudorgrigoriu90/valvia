# /content: clinical content (YAML)

**Data changes here go through a pull request approved by the SME** (`CLAUDE.md` §3.2).
This README is documentation; YAML files are data.

| Folder | One file per | File name |
|---|---|---|
| `sources/` | Source document (ESC / EACVI / ASE, cited z-score dataset) | `<source-id>.yaml` |
| `parameters/` | Measured parameter | `<parameter-id>.yaml` |
| `topics/` | Taxonomy node; leaves hold content blocks and values | `<node-id>.yaml` |
| `prosthetics/` | Prosthetic valve model in one position, with expected values by labelled size (W2, schema TS-02.2.8; entries need publisher permission first, see the [copyright assessment](../docs/safety/copyright-assessment.md)) | `<position>-<model>.yaml` |

Schemas: [`/schema`](../schema/README.md). Modelling rules: [ADR 0003](../docs/adr/0003-content-as-code.md) and `CLAUDE.md` §12.

## Topic tree

`topics/` holds the 164 nodes of taxonomy v0.3 ([`docs/product/valvia-taxonomy.md`](../docs/product/valvia-taxonomy.md)),
encoded once by TS-02.1.2 (initial seed, decision PO-3). From now on edit the files directly: **ids never change**;
rename a URL by changing `slug` and adding the old one to `formerSlugs`.

- `ref` is the taxonomy number; `order` follows the taxonomy order among siblings.
- Renaming a URL: change `slug` and add the old slug to `formerSlugs`; the build writes a redirect page for the old URL
  and for the old URLs of all descendants (`pipeline/redirects`).
- `population`: root 8 (congenital) and 14 (reference) are `both`, root 15 (paediatric) is `paediatric`, all others `adult`.
- `wave` comes from the root (4.1 is W2).
- Cross-links (→) are `seeAlso`: listed under "See also" on the page; an empty leaf with a cross-link to a topic with
  content is shown as a pointer page instead of being hidden (CH-67).
- Every node is `status: draft`; nodes without blocks are hidden on the site until content is added.

## Source registry

`sources/` holds the 29 documents of taxonomy Appendix A whose PubMed record could be retrieved (TS-02.3.3, initial seed).
Title, journal, DOI and year come from the PubMed record named in each file's `notes`; `year` is the year in the
document title (print year may differ). Entries marked "verify" in Appendix A note that they were the most recent
version found on 2026-11-02. Not yet registered: the 2026 ESC heart failure guideline (no PubMed record yet) and the
NORRE papers (registered when their values are used).

Values are only entered from documents that could be read in full. ASE documents are downloaded from asecho.org;
ESC/EACVI full texts (academic.oup.com) cannot be fetched automatically and are added when supplied.
