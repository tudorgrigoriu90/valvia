# Content model reference

> **Purpose:** field-by-field reference of the content schemas and how content is validated.
> **Audience:** engineer, Claude Code sessions drafting content, SME (for review context).
> **Last updated:** 2026-11-02 | **Source of truth:** [`/schema`](../schema/README.md) (this page explains it)

## Validation pipeline

```mermaid
flowchart LR
    yaml["content/**/*.yaml"] --> syntax["1 YAML syntax<br/>(YAML 1.2 core, unique keys)"]
    syntax --> schema["2 JSON Schema per file<br/>Ajv 2020, allErrors"]
    schema --> name["file name = id"]
    name --> cross["3 Cross-file integrity<br/>(planned)"]
    cross --> rules["4 Content rules<br/>source allowlist + supersession (done)<br/>units, plausibility (planned)"]
    rules --> out["file:line:column severity rule message"]
```

Every problem names the file, the 1-based line and column of the offending YAML node, and a readable message, e.g.

```
content/topics/primary-mr-grading.yaml:8:13 error schema population must be one of: adult, paediatric, both (got 'neonates')
```

All problems are reported in one run, not only the first. Code: [`core/content/`](../core/content).

TypeScript types are generated from the schemas into [`schema/generated/`](../schema/generated) (`npm run gen:types`); see [`schema/README.md`](../schema/README.md) for the change procedure.

## Shared definitions (`common.schema.json`)

| Definition | Rule |
|---|---|
| `id` | lowercase kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`), ≤ 80 chars; stable, never changed or reused |
| `slug` | same format as `id`; may change (old values go to `formerSlugs`) |
| `text` | non-blank single line, ≤ 300 chars |
| `longText` | non-blank, may span lines, ≤ 4000 chars |
| `population` | `adult` · `paediatric` · `both` |
| `wave` | `W1` · `W2` |
| `locatorText` | non-blank single line, ≤ 40 chars; always a string so `1.10` is never read as `1.1` |
| `citation` | `source` (registered source id) + `locator` with at least one of `table`, `figure`, `section`, `page` (TS-02.3.2) |

Citation example (used by every value):

```yaml
citation:
  source: esc-eacts-2025-vhd
  locator:
    table: "8"
    section: "6.2.1"
```

Shared definitions can be validated on their own with `validateDefinition('citation', yaml)` (`core/content/validate-file.ts`).

## Topic node (`topic.schema.json`, TS-02.1.1)

One file per node: `content/topics/<id>.yaml`. The tree is built from `parent` links.

| Field | Required | Type | Meaning |
|---|---|---|---|
| `id` | yes | `id` | Stable identifier; must equal the file name |
| `ref` | no | dotted number | Taxonomy number for humans (`3.2.1.2`); may change, never in URLs |
| `slug` | yes | `slug` | URL segment |
| `formerSlugs` | no | `slug[]` | Previous slugs → static redirect pages (TS-02.1.3) |
| `title` | yes | `text` | Display title |
| `parent` | yes | `id` or `null` | Parent node; `null` for a root category |
| `order` | yes | integer ≥ 0 | Position among siblings |
| `synonyms` | no | `text[]` | Alternative names/abbreviations indexed by search |
| `population` | yes | `population` | Adult, paediatric or both (drives the adult/paediatric switch) |
| `wave` | yes | `wave` | Delivery wave (sequencing only) |
| `status` | yes | `draft` · `in-review` · `published` | Editorial status (content status page) |
| `seeAlso` | no | `id[]` | Cross-links (→ in the taxonomy) |

Example:

```yaml
id: primary-mr-grading
ref: 3.2.1.2
slug: severity-grading
title: Primary MR severity grading
parent: primary-mr
order: 1
synonyms: [primary mitral regurgitation, degenerative MR]
population: adult
wave: W1
status: draft
```

## Source document (`source.schema.json`, TS-02.3.1)

One file per source: `content/sources/<id>.yaml`. Every value cites a source id plus a locator.

| Field | Required | Type | Meaning |
|---|---|---|---|
| `id` | yes | `id` | e.g. `esc-eacts-2025-vhd` |
| `title` | yes | `text` | Full title |
| `shortTitle` | no | `text` | Label for source chips |
| `issuers` | yes | acronym[] (≥ 1) | Issuing societies, e.g. `[ESC, EACTS]` |
| `type` | yes | enum | `guideline` · `recommendation` · `consensus-statement` · `position-statement` · `focused-update` · `standardized-definitions` · `z-score-dataset` |
| `year` | yes | integer 1990–2100 | Publication year |
| `journal` | no | `text` | Journal |
| `doi` | no | DOI | Without `https://doi.org/` |
| `url` | no | https URL | Landing page |
| `status` | yes | `current` · `superseded` · `withdrawn` | Only `current` sources supply current recommendations |
| `supersededBy` | when superseded | `id` | Successor document |
| `citedBy` | for z-score datasets | `id[]` | Registered ESC/ASE documents citing the dataset |
| `notes` | no | `longText` | Maintainer notes |

### Registry rules (`core/sources/registry-rules.ts`, 100 % coverage)

```mermaid
flowchart TD
    s["source"] --> z{"type = z-score-dataset?"}
    z -- no --> a{"issuers include<br/>ESC, EACVI or ASE?"}
    a -- yes --> ok(["allowed"])
    a -- no --> assoc{"ESC association?<br/>EAPCI, HFA, EHRA, EAPC, ACVC, ACNAP"}
    assoc -- yes --> warn(["warning: pending SME F3"])
    assoc -- no --> err(["error: not an allowed body"])
    z -- yes --> c{"every citedBy is a registered,<br/>allowed, non-dataset document?"}
    c -- yes --> ok
    c -- no --> err2(["error"])
```

Also enforced: unique ids; `supersededBy` only with status `superseded`, must exist, must not be the source itself,
must not be older, and supersession chains must not form cycles; `citedBy` only on z-score datasets.

Example:

```yaml
id: esc-eacts-2025-vhd
title: ESC/EACTS Guidelines for the management of valvular heart disease
shortTitle: ESC/EACTS VHD 2025
issuers: [ESC, EACTS]
type: guideline
year: 2025
journal: European Heart Journal
status: current
```
