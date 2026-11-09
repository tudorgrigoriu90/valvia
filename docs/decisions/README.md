# Decision log

> **Purpose:** product-owner and SME decisions that change how Valvia is built or governed.
> **Audience:** everyone. **Last updated:** 2026-11-09
> Architecture decisions live in [`../adr/`](../adr/README.md); clinical SME decisions of 2 Nov 2026 are in the [taxonomy](../product/valvia-taxonomy.md#sme-decisions-2-nov-2026).

| # | Date | Decided by | Decision | Consequences |
|---|---|---|---|---|
| PO-1 | 2026-11-02 | Product owner | Code, config, tests and docs are committed directly to `main`; one task per push; TDD; coverage ≥ 80 %; README and task plan updated with every push | Supersedes backlog §0 rules 1–2; `CLAUDE.md` §2–3 |
| PO-2 | 2026-11-02 | Product owner | No `gh-pages` branch and no hosted PR previews; content reviews happen in PRs targeting `main` | [ADR 0005](../adr/0005-pages-actions-deploy-no-previews.md); TS-01.3.3 dropped |
| PO-3 | 2026-11-02 | Product owner | **Initial content seed without approval:** Claude Code fetches the source documents, builds the initial content and pushes it directly to `main`, without SME approval | Every seeded topic has `status: draft` and the site labels it "Not yet clinically reviewed" until the SME reviews it; values only from fetched or supplied documents with locators, never from memory; later content changes go through PRs reviewed by the SME (`CLAUDE.md` §3.2–3.3) |
| PO-4 | 2026-11-09 | Product owner | **Units as published:** every value is shown in the unit printed in the guideline; no conversion to house units | Supersedes NFR-15 house units, the display part of TS-02.2.7 and pending SME question F4; the unit layer only compares values across sources (discrepancies); CH-18 |
| PO-5 | 2026-11-09 | Product owner | **Four main categories:** Adults, Children, **TEE** and **Stress echo**, chosen in the header; TEE and stress values are their own categories | New value field `technique`; new top-level TEE branch; TEE and stress content from ASE / EACVI documents; CH-19 to CH-21, CH-24 to CH-28 |
| PO-6 | 2026-11-09 | Product owner | Besides normal and abnormal cut-offs, show **mildly, moderately and severely abnormal** grades wherever the source publishes them | Content only, never derived; CH-22, CH-23 |
