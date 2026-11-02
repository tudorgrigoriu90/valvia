# 0004. Client-side search: Pagefind

- **Status:** Accepted
- **Date:** 2026-11-02
- **Backlog:** TS-01.1.4

## Context

Users must reach a value in ≤ 10 s with one search (success metrics). Search must find topics, parameters,
abbreviations and synonyms (e.g. "EROA", "PISA", "TAPSE", "Wilkins", valve model names), give instant results,
work **offline** (NFR-03) and cost nothing to run (NFR-04). No server is available (static hosting, ADR 0002).

## Options considered

| Option | Offline | Payload | Synonyms / weighting | Server | Cost |
|---|---|---|---|---|---|
| **Pagefind** | Yes (static index files, cacheable by the service worker) | Chunked index; loads only fragments needed for the query (~tens of KB) | Custom metadata, filters, weights, extra indexed text | None | €0 |
| Lunr / MiniSearch with a prebuilt JSON index | Yes | Whole index downloaded up front, grows with content | Manual | None | €0 |
| Algolia / Typesense Cloud | No | Small | Strong | Hosted | Free tier limits, vendor lock-in |
| Fuse.js over a JSON list | Yes | Whole list | Fuzzy only | None | €0 |

## Decision

Use **Pagefind**, run as a post-build step over `dist/`.

- Pages mark searchable regions with `data-pagefind-body`; navigation, footers and disclaimers are excluded.
- Synonyms, abbreviations and valve model names from the content model are rendered into a visually hidden
  but indexed element (`data-pagefind-weight` raised for titles and abbreviations) so queries such as "TAPSE" hit the right leaf.
- Filters (`data-pagefind-filter`) for root category and population (adult / paediatric) enable scoped search later.
- The search UI is our own small TS module using the Pagefind JS API (not the default UI) to stay within the JS budget and design system.
- The service worker precaches the Pagefind index and fragments for offline search (TS-05.3.2).
- PR previews build their own index under their base path.

## Consequences

- Positive: zero infrastructure, offline by design, index scales by chunking.
- Positive: index is built from what is actually rendered, so search never shows unpublished content.
- Negative: search is unavailable in `astro dev` until a build has run (documented in README).
- Negative: Pagefind loads a WASM file; it must be allowed by CSP (`script-src 'self' 'wasm-unsafe-eval'`). Accepted; ADR 0002's policy is extended accordingly.

## Cost

€0 (MIT).

## Exit strategy

Searchable data comes from our content model, not from Pagefind. Switching to MiniSearch or a hosted
search means generating a JSON index from `/core` at build time and replacing the search UI module: about a day.
