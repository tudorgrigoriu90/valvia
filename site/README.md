# /site: Astro application

Rendering layer only (ADR 0001): pages, layouts, components, styles and small client-side scripts.
All domain logic (loading, validation, units, discrepancies, history) is imported from [`/core`](../core/README.md).

| Path | Contents |
|---|---|
| `pages/` | Routes (`index.astro` = home, `404.astro`) |
| `layouts/Base.astro` | Page shell: header with wordmark, review banner, main, footer disclaimer, CSP and robots meta |
| `components/` | `Logo`, `ReviewBanner` (decision PO-3: "Not yet clinically reviewed") |
| `styles/global.css` | Design tokens (colours, spacing, radius, fonts) and base styles; light/dark via `prefers-color-scheme` |
| `lib/csp.ts` | Content Security Policy (ADR 0002/0004), emitted only in production builds |
| `public/` | Static files copied as-is (icons, `robots.txt`, manifest) |

Configuration: [`astro.config.mjs`](../astro.config.mjs). Base path and origin come from `VALVIA_BASE` and `VALVIA_SITE` (ADR 0002).

## Design tokens

Colours are CSS custom properties on `:root`, redefined for dark mode; every text/background pair meets WCAG 2.2 AA
(checked by axe in `tests/e2e/layout.spec.ts`). Touch targets use `--touch-target` (44 px, NFR-01). System font stack only.
While content is unreviewed, every page carries `noindex, nofollow` and the review banner.
