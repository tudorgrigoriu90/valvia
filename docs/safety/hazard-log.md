# Hazard log

> **Purpose:** list what could go wrong with a value Valvia shows, how each hazard is controlled, and how the control is verified (TS-07.3.1).
> **Audience:** engineer, SME, Claude Code sessions, anyone assessing Valvia's safety. **Last updated:** 2026-11-13
> **Related:** [`CLAUDE.md`](../../CLAUDE.md) §6 (coverage targets) and §12 (content rules), [content guide](../content-guide.md), [units](../units.md).

Valvia is a lookup aid, not a medical device (intended use on the About page): it shows published cut-off and reference values with
their source and never computes anything for a patient. The remaining harm path is a clinician reading a **wrong or misleading
value** and acting on it. Every hazard below is about that path.

## Scales

| Severity | Meaning |
|---|---|
| S3 | Could change a clinical decision (e.g. grade a lesion severe instead of moderate) |
| S2 | Misleading but likely noticed (e.g. obviously implausible number, wrong label) |
| S1 | Cosmetic or navigational |

| Likelihood (after controls) | Meaning |
|---|---|
| L3 | Expected to occur without the control |
| L2 | Possible; depends on a manual step |
| L1 | Unlikely; prevented by an automatic check |

## Hazards and controls

| ID | Hazard | Cause | Sev. | Controls | Verification | Residual |
|---|---|---|---|---|---|---|
| H1 | **Wrong value** shown | Transcription error from the PDF; table misread (image tables, lost ≥/≤ signs) | S3 | Values only from documents read in the session, each with a locator; rendered-page check for image tables and signs ([content guide §3](../content-guide.md)); plausibility rules (ranges ordered, signs, monotonic grades) in [`topic-rules.ts`](../../core/values/topic-rules.ts); SME review of content PRs; every page labelled "Not yet clinically reviewed" until reviewed | [`topic-rules.test.ts`](../../core/values/topic-rules.test.ts); `npm run validate:content` in CI; [PR template](../../.github/pull_request_template.md) checklist | L2 during the initial seed (no SME review yet, PO-3); L1 after review |
| H2 | **Wrong unit**, or a value converted wrongly | Unit typed incorrectly; conversion arithmetic | S3 | Values are displayed exactly as published, never converted (PO-4); the unit must belong to the parameter's quantity (schema + rule); conversions only for comparisons, by exact decimal shifts | [`units.test.ts`](../../core/units/units.test.ts) (100 % coverage, round trips), [`format.test.ts`](../../core/values/format.test.ts), [`table.test.ts`](../../core/values/table.test.ts) | L1 |
| H3 | **Missing indexation** (absolute value read as indexed, or vice versa) | Indexed and absolute parameters confused | S3 | Separate parameters and quantities for indexed values (e.g. `lv-mass` vs `lv-mass-index`, mL vs mL/m²); unit shown next to every value; different indexations (g/m² vs g/m^2.7) never compared | [`units.test.ts`](../../core/units/units.test.ts) (incompatible pairs refused), [`validate-value.test.ts`](../../core/content/validate-value.test.ts) | L1 |
| H4 | **Adult value shown for a child** (or the reverse) | Population missing or ignored in the UI | S3 | Every value must have an `ageGroup` (schema); category switch (Adults, Children, TEE, Stress echo) hides values of other categories; notices when a page has no values for the chosen category | [`category.test.ts`](../../core/population/category.test.ts) (100 %), [`category.spec.ts`](../../tests/e2e/category.spec.ts) | L1 |
| H5 | **Wrong population qualifier** (sex, age band, rhythm, BSA band) | Qualifier omitted or mis-assigned | S3 | Qualifiers are structured fields, shown in each row; values with different qualifiers are never merged or compared | [`validate-value.test.ts`](../../core/content/validate-value.test.ts), [`discrepancy.test.ts`](../../core/discrepancy/discrepancy.test.ts) | L2 (relies on transcription) |
| H6 | **Superseded value shown as current** | Older document still treated as current | S3 | Source registry with status and `supersededBy`; superseded values move to "Previous recommendations" with year and successor; registry rules | [`history.test.ts`](../../core/history/history.test.ts) (100 %), [`registry-rules.test.ts`](../../core/sources/registry-rules.test.ts), [`leaf.test.ts`](../../core/view/leaf.test.ts) | L2 (supersession must be recorded when a new document appears; watchers planned in EP-06) |
| H7 | **Disagreement hidden** (one society's value shown as if it were the only one) | One value picked when sources differ | S3 | Discrepancies between current sources are detected at build time and shown side by side with a marker; never resolved by picking one | [`discrepancy.test.ts`](../../core/discrepancy/discrepancy.test.ts) (100 %), [`leaf.test.ts`](../../core/view/leaf.test.ts) | L1 |
| H8 | **TEE or stress value read as a resting TTE value** | Technique not recorded | S3 | `technique` field (TTE default, TEE, stress); TEE and stress values form their own categories | [`validate-value.test.ts`](../../core/content/validate-value.test.ts), [`category.test.ts`](../../core/population/category.test.ts) | L1 |
| H9 | **CT/CMR value read as an echo value** | Modality ignored | S2 | `modality` required; CT and CMR values carry a text badge | [`modality.spec.ts`](../../tests/e2e/modality.spec.ts) | L1 |
| H10 | **Unreviewed content trusted as reviewed** | Draft status not visible | S3 | Site-wide banner and per-page "Not yet clinically reviewed" label for draft topics; no indexing by search engines while draft | [`version.test.ts`](../../core/site/version.test.ts), [`layout.spec.ts`](../../tests/e2e/layout.spec.ts) | L1 |
| H11 | **Stale content offline** after an update | Service worker keeps an old version | S2 | Pages network-first; "New content available" prompt; content version and build date in every footer | [`pwa.spec.ts`](../../tests/e2e/pwa.spec.ts), [`register-sw.ts`](../../site/scripts/register-sw.ts) | L1 |
| H12 | **Value attributed to the wrong source or location** | Citation or locator wrong | S2 | Every value cites a registered source and a locator; source chips show the full citation and DOI | [`registry-rules.test.ts`](../../core/sources/registry-rules.test.ts), [`leaf.spec.ts`](../../tests/e2e/leaf.spec.ts) | L2 |
| H13 | **Non-society source** used | A value from a paper or manufacturer chart | S2 | Allowlist of societies in the registry rules; CI rejects other issuers | [`registry-rules.test.ts`](../../core/sources/registry-rules.test.ts) | L1 |
| H14 | **Calculation mistaken for guidance** | A score or z-score computed for a patient | S3 | No calculators by design: scores (Wilkins, H2FPEF) and z-score limits are shown as definitions only | Product rule (`CLAUDE.md` §12); no calculation code exists | L1 |

## Open items

- H1 and H5 stay at L2 until the SME reviews the seeded content (TS-07.3.2 pre-release audit, decision PO-3).
- H6 depends on noticing new documents: source watchers and the verification run are planned in EP-06.
- Review this log whenever a new hazard is found; add a row before changing the code that controls it.
