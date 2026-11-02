# /site: Astro application

Rendering layer only (ADR 0001): pages, layouts, components, styles and small client-side scripts.
All domain logic (loading, validation, units, discrepancies, history) is imported from [`/core`](../core/README.md).

| Path | Contents |
|---|---|
| `pages/` | Routes: `index.astro` (home), `[...path].astro` (one page per visible topic, URL = slugs from the root), `404.astro` |
| `lib/content.ts` | Loads content once with the shared loader; the build fails on content errors |
| `layouts/Base.astro` | Page shell: header with wordmark, review banner, main, footer disclaimer, CSP and robots meta |
| `components/` | `Logo`, `ReviewBanner` (decision PO-3: "Not yet clinically reviewed"), `Breadcrumbs`, `TopicList` |
| `styles/global.css` | Design tokens (colours, spacing, radius, fonts) and base styles; light/dark via `prefers-color-scheme` |
| `lib/csp.ts` | Content Security Policy (ADR 0002/0004), emitted only in production builds |
| `public/` | Static files copied as-is (icons, `robots.txt`, manifest) |

Configuration: [`astro.config.mjs`](../astro.config.mjs). Base path and origin come from `VALVIA_BASE` and `VALVIA_SITE` (ADR 0002).

## Design tokens

Colours are CSS custom properties on `:root`, redefined for dark mode; every text/background pair meets WCAG 2.2 AA
(checked by axe in `tests/e2e/layout.spec.ts`). Touch targets use `--touch-target` (44 px, NFR-01). System font stack only.
While content is unreviewed, every page carries `noindex, nofollow` and the review banner.

## Search index (ADR 0004)

`npm run build` runs `pagefind --site dist` after Astro. Only leaf topics are indexed (`data-pagefind-body` on the
article); a visually hidden, `aria-hidden` line adds topic synonyms and the names, abbreviations and synonyms of every
parameter on the page (`core/navigation/search-terms.ts`) with a higher weight. Header, banner and footer are not indexed.
The index lives in `dist/pagefind/` and is loaded with a dynamic import from `<base>pagefind/pagefind.js` (CSP allows
`'wasm-unsafe-eval'`).
