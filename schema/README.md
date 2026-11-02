# /schema: content schemas

JSON Schema (draft 2020-12) files are the single source of truth for the content model (ADR 0003).
Field reference: [`docs/content-model.md`](../docs/content-model.md).

| File | Entity | Generated type |
|---|---|---|
| `common.schema.json` | Shared `$defs` (id, slug, text, population, wave, modality, unit, quantity, citation, populationQualifiers, value, block types) | none |
| `topic.schema.json` | Taxonomy node | `TopicNode` in `generated/topic.ts` |
| `source.schema.json` | Source document (registry) | `SourceDocument` in `generated/source.ts` |
| `parameter.schema.json` | Measured parameter | `Parameter` in `generated/parameter.ts` |

## Changing a schema

1. Write the failing test first (valid and invalid examples in `core/content/*.test.ts`).
2. Edit the schema; keep `description` on every property (it becomes the TSDoc of the generated type).
3. Run `npm run gen:types` and commit `generated/` with the schema. A unit test fails if the generated types are stale.
4. Update `docs/content-model.md`.

Conventions: `$id` is `https://valvia.invalid/schema/<file>` (never fetched); shared definitions are referenced
relatively (`common.schema.json#/$defs/id`); `x-format-name` gives patterns a readable name for error messages.
