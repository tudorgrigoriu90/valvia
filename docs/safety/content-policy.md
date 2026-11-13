# Content policy

> **Purpose:** what Valvia may publish from society documents and how (TS-07.2.2).
> **Audience:** Claude Code sessions, engineer, SME. **Last updated:** 2026-11-13
> **Related:** [`CLAUDE.md`](../../CLAUDE.md) §12, [content guide](../content-guide.md), [copyright assessment](copyright-assessment.md), [hazard log](hazard-log.md).

## Rules

1. **Sources.** Only ESC (including EACVI) and ASE documents, plus paediatric z-score datasets that one of them cites
   (registered with `citedBy`). No manufacturer charts, textbooks, other societies or individual studies as sources.
   Joint documents count when ESC/EACVI or ASE is an issuing society.
2. **Facts, not expression.** Valvia publishes the **numbers** a document gives (cut-offs, ranges, grades) with their
   units, populations and conditions. It does not reproduce a document's text, tables or figures as such.
3. **Own-format tables.** Values are stored one by one in YAML and rendered by Valvia's own table, list and checklist
   components. Never copy a table's layout, colour coding, captions or footnote wording.
4. **No figures.** Never copy, redraw or trace a figure, algorithm, diagram or image. Algorithms are linked
   (`algorithm-reference` blocks) to the source DOI with the figure number.
5. **Notes in our own words.** Notes and caveats are short paraphrases (a sentence or two) that point to the page; never
   paragraphs copied from the source. Short labels that must stay exact for clinical meaning (e.g. a grade name or
   "Not recommended after edge-to-edge repair") may be quoted.
6. **Always cite and link.** Every value cites a registered source and a locator (table, figure, section or page); every
   source has a DOI link; source chips show the full citation.
7. **No calculation.** Scores and z-scores are shown as their published definition only; Valvia computes nothing for a
   patient.
8. **Gaps stay visible.** When a document cannot be obtained or does not publish a value, the topic stays empty or shows
   "no society-endorsed value"; nothing is filled from memory or from other sources.
9. **Bulk tables need clearance.** Large reference tables reproduced nearly in full (e.g. prosthetic valve values by model
   and size from guideline appendices) are entered only after the copyright assessment clears them
   ([copyright assessment](copyright-assessment.md)).

## Review

Content PRs (after the initial seed) follow the [PR template](../../.github/pull_request_template.md); the SME checks the
values against the PDF, and reviewers check rules 2–6 in the diff.
