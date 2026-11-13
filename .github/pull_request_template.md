<!--
Content PR template (CLAUDE.md §3.2, backlog TS-01.2.5 / TS-06.3.1).
Code changes go straight to main; this template is for changes under content/**.
Branch: content/<node-id>-<short-slug> or source/<source-id>. Base: main.
-->

## Clinical change summary

<!-- The "Content summary" check posts this table, generated from the YAML diff, as a comment and updates it on every push (TS-06.2.4). Summarise the intent here; the generated comment lists every value. -->

| Topic | Parameter | Population | Society / source | Old value | New value | Locator |
|---|---|---|---|---|---|---|
| | | | | | | |

## Sources

- Source id(s) and full citation:
- How the document was obtained (download URL or supplied PDF):

## Reviewer checklist (SME)

- [ ] Values match the source document (number, operator, unit)
- [ ] Population and qualifiers are correct (adult/paediatric, sex, age/BSA band, rhythm)
- [ ] Units are exactly as published (values are never converted for display, decision PO-4)
- [ ] Modality is correct (Echo / CT / CMR)
- [ ] Discrepancies between current sources are shown side by side, not resolved
- [ ] Superseded values appear under "Previous recommendations"
- [ ] Every value has a locator (table, figure, section or page)

## Checks

- [ ] `npm run validate:content` passes (CI annotations are clean)
- [ ] Built site artifact `site-pr-<number>` reviewed where useful
- [ ] Verification run (clinical-reviewer persona) green, or override documented in a comment
