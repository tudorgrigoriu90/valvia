# 0003. Content as code: YAML in Git, JSON Schema, own loader

- **Status:** Accepted
- **Date:** 2026-11-02
- **Backlog:** TS-01.1.3

## Context

Clinical values must be versioned, diffable, reviewable by the SME in a pull request, traceable to a
source (NFR-06, NFR-07) and validated strictly before publication. v1 has no servers or databases (NFR-04).
Content changes must need no code changes (NFR-05) and invalid content must fail CI with a readable
message naming file and line (FT-02.2).

## Options considered

| Option | Review in PR | Validation | Cost | Notes |
|---|---|---|---|---|
| **YAML files in Git** | Line diffs, comments | JSON Schema + custom checks | €0 | Human-editable, supports comments |
| JSON files in Git | Line diffs | JSON Schema | €0 | No comments, noisier for clinicians |
| Markdown + front matter | Good for prose | Weak for tabular values | €0 | Values buried in prose |
| Headless CMS / database | UI, not diff | Vendor-specific | Free tier limits | Server dependency, weaker audit trail |

## Decision

**YAML files in Git, validated by JSON Schema (draft 2020-12), loaded by our own framework-free loader in `/core`.**

- **Layout:** one entity per file, file name = entity ID.
  ```
  content/
  ├── sources/<source-id>.yaml        # source registry (ESC / EACVI / ASE, cited z-score datasets)
  ├── parameters/<parameter-id>.yaml  # measured quantities (name, abbreviation, unit, modality)
  ├── topics/<node-id>.yaml           # taxonomy nodes; leaves hold content blocks and values
  └── prosthetics/<catalogue-id>.yaml # prosthetic valve reference tables (W2)
  ```
- **Schemas** live in `/schema/*.schema.json` and are the single source of truth. TypeScript types are
  generated from them (`npm run gen:types`) and committed; a test fails if they are stale.
- **Validation** runs in this order and reports *all* problems, not only the first:
  1. YAML syntax (with line/column);
  2. JSON Schema per file (Ajv, `allErrors`), each error mapped back to the YAML line/column of the offending node;
  3. cross-file integrity (unique IDs, existing references, tree without cycles, sibling slug uniqueness);
  4. content rules (source allowlist, units vs parameter quantity, plausibility such as monotonic grades).
  Output format: `content/topics/x.yaml:12:5 error <rule> <message>` (also GitHub annotations in CI).
- **Stable IDs:** `id` is a lowercase kebab-case string, never reused or changed; the file name must equal it.
  Taxonomy numbers (e.g. `3.2.1.2`) are stored as `ref` for humans and may change.
- **Values are stored as published** (number, operator, unit); display conversion happens in code (TS-02.2.7).
- The **same loader** is used by the CLI (`npm run validate:content`), CI, the update pipeline and the site build,
  so what CI validates is exactly what the site renders.
- Changes under `/content/**` only arrive through pull requests approved by the SME (`CLAUDE.md` §3.2).

## Consequences

- Positive: full audit trail via Git; readable diffs for the SME; zero infrastructure; schema-driven forms possible for the v2 CMS (EP-11).
- Positive: strict, line-precise errors make Claude-drafted content cheap to fix before review.
- Negative: we maintain a small loader instead of using Astro content collections (accepted, ADR 0001).
- Negative: YAML pitfalls (implicit types such as `no` → `false`, `1.10` → `1.1`). Mitigation: YAML 1.2 core schema, values that must keep trailing zeros are stored as numbers plus an explicit `decimals` hint only where needed, and the schema types every field.

## Cost

€0.

## Exit strategy

YAML and JSON Schema are open standards. Content can be converted to JSON or loaded into any database
or CMS with a script; the schemas transfer unchanged (e.g. to Decap/Sveltia CMS in v2).
