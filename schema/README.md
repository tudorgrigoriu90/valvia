# /schema: content schemas

JSON Schema (draft 2020-12) files are the single source of truth for the content model (ADR 0003).
TypeScript types are generated from them and committed; tests fail if they are stale.
