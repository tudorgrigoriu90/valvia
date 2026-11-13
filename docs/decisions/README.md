# Decision log

> **Purpose:** product-owner and SME decisions that change how Valvia is built or governed.
> **Audience:** everyone. **Last updated:** 2026-11-13
> Architecture decisions live in [`../adr/`](../adr/README.md). The SME's clinical decisions are summarised below; their full wording
> and effect on the topic tree are in the [taxonomy](../product/valvia-taxonomy.md#sme-decisions-2-nov-2026).

| # | Date | Decided by | Decision | Consequences |
|---|---|---|---|---|
| PO-1 | 2026-11-02 | Product owner | Code, config, tests and docs are committed directly to `main`; one task per push; TDD; coverage ≥ 80 %; README and task plan updated with every push | Supersedes backlog §0 rules 1–2; `CLAUDE.md` §2–3 |
| PO-2 | 2026-11-02 | Product owner | No `gh-pages` branch and no hosted PR previews; content reviews happen in PRs targeting `main` | [ADR 0005](../adr/0005-pages-actions-deploy-no-previews.md); TS-01.3.3 dropped |
| PO-3 | 2026-11-02 | Product owner | **Initial content seed without approval:** Claude Code fetches the source documents, builds the initial content and pushes it directly to `main`, without SME approval | Every seeded topic has `status: draft` and the site labels it "Not yet clinically reviewed" until the SME reviews it; values only from fetched or supplied documents with locators, never from memory; later content changes go through PRs reviewed by the SME (`CLAUDE.md` §3.2–3.3) |
| PO-4 | 2026-11-09 | Product owner | **Units as published:** every value is shown in the unit printed in the guideline; no conversion to house units | Supersedes NFR-15 house units, the display part of TS-02.2.7 and pending SME question F4; the unit layer only compares values across sources (discrepancies); CH-18 |
| PO-5 | 2026-11-09 | Product owner | **Four main categories:** Adults, Children, **TEE** and **Stress echo**, chosen in the header; TEE and stress values are their own categories | New value field `technique`; new top-level TEE branch; TEE and stress content from ASE / EACVI documents; CH-19 to CH-21, CH-24 to CH-28 |
| PO-6 | 2026-11-09 | Product owner | Besides normal and abnormal cut-offs, show **mildly, moderately and severely abnormal** grades wherever the source publishes them | Content only, never derived; CH-22, CH-23 |

## SME decisions (2 Nov 2026, TS-00.2)

| # | Topic | Decision | Implemented by |
|---|---|---|---|
| SME-1 | Population | Adults **and** children | Root 15, `ageGroup` on every value, category switch (PO-5) |
| SME-2 | Sources | ESC (incl. EACVI) and ASE only; paediatric z-score datasets cited by them allowed (F1) | Source allowlist in the registry rules; `citedBy` on datasets |
| SME-3 | Superseded values | Keep as history | "Previous recommendations" (TS-02.4.2) |
| SME-4 | CT / CMR cut-offs | Include, badged | `modality` on every value; CT/CMR badges (TS-04.7.3) |
| SME-5 | Algorithms | Link to the source, never redraw | `algorithm-reference` blocks |
| SME-6 | Prosthetic model/size values | Include | Catalogue schema (TS-02.2.8); data waits for publisher permission (CH-51) |
| SME-7 | Language | English only | |
| SME-8 | Units / BSA | mm, cm², m/s, tissue Doppler cm/s; DuBois BSA | Units superseded by **PO-4** (as published); BSA wording open as **F8** |
| SME-9 | Priorities | All P1, two delivery waves | Waves W1 / W2 in the task plan |
| SME-10 | Approval | The SME is the only content approver; Claude clinical-reviewer persona as advisory second reviewer | Content PR flow (`CLAUDE.md` §3.2), audit log (TS-06.4.2) |
| SME-11 | Missing topics | Proceed with the current tree | Paediatric nodes proposed, see F2 |

## Open questions for the SME

| # | Question | Raised | Current handling |
|---|---|---|---|
| F2 | Paediatric scope: nodes 8.0, 8.13, 8.14, root 15; fetal echo? | 2026-11-02 | Nodes kept; no fetal content |
| F3 | Do other ESC associations (EAPCI, HFA, EHRA) count as ESC? | 2026-11-02 | Accepted with a warning by the registry rules |
| F5 | Gaps in prosthetic coverage without manufacturer charts | 2026-11-02 | Gaps shown as "no society-endorsed value" |
| F7 | RV diastolic grading: Table 1 vs Table 6 of ASE 2025 right heart | 2026-11-10 | Not entered |
| F8 | BSA formula: DuBois (SME-8) vs ASE advice against DuBois in congenital heart disease | 2026-11-13 | 14.2 states that Valvia computes no BSA and cites the ASE advice |

Full wording: [taxonomy, Appendix B](../product/valvia-taxonomy.md).

## Decisions taken during implementation (for the product owner to confirm)

| # | Date | Decision | Why | Where |
|---|---|---|---|---|
| IMP-1 | 2026-11-13 | "Report a problem" link per **section**, not per value | A link in every table cell does not fit 360 px tables; the form asks which value | TS-06.5.1 |
| IMP-2 | 2026-11-13 | What's new lists all commits under `content/`, not only merged PRs | During the seed (PO-3) content lands as direct commits | TS-06.4.1 |
| IMP-3 | 2026-11-13 | Prosthetic picker blocked until catalogue data exists | Cannot be built or tested without data; data waits for publisher permission | TS-04.7.4, CH-51 |
| IMP-4 | 2026-11-13 | The source watcher never adds `new-source` itself | Drafting starts only after a person triages the issue | TS-06.2.1 |
| IMP-5 | 2026-11-13 | Report-a-problem e-mail fallback only when `VALVIA_CONTACT_EMAIL` is set | No maintainer address may be hard-coded | TS-06.5.1 |
