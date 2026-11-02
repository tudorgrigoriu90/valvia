# /site: Astro application

Rendering layer only (ADR 0001): pages, layouts, components, styles and small client-side scripts.
All domain logic (loading, validation, units, discrepancies, history) is imported from [`/core`](../core/README.md).

| Path | Contents |
|---|---|
| `pages/` | Routes (`index.astro` = home) |
| `public/` | Static files copied as-is (icons, `robots.txt`, manifest) |

Configuration: [`astro.config.mjs`](../astro.config.mjs). Base path and origin come from `VALVIA_BASE` and `VALVIA_SITE` (ADR 0002).
