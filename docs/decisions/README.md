# Decision log

> **Purpose:** product-owner and SME decisions that change how Valvia is built or governed.
> **Audience:** everyone. **Last updated:** 2026-11-02
> Architecture decisions live in [`../adr/`](../adr/README.md); clinical SME decisions of 2 Nov 2026 are in the [taxonomy](../product/valvia-taxonomy.md#sme-decisions-2-nov-2026).

| # | Date | Decided by | Decision | Consequences |
|---|---|---|---|---|
| PO-1 | 2026-11-02 | Product owner | Code, config, tests and docs are committed directly to `main`; one task per push; TDD; coverage ≥ 80 %; README and task plan updated with every push | Supersedes backlog §0 rules 1–2; `CLAUDE.md` §2–3 |
| PO-2 | 2026-11-02 | Product owner | No `gh-pages` branch and no hosted PR previews; content reviews happen in PRs targeting `main` | [ADR 0005](../adr/0005-pages-actions-deploy-no-previews.md); TS-01.3.3 dropped |
| PO-3 | 2026-11-02 | Product owner | **Initial content seed without approval:** Claude Code fetches the source documents, builds the initial content and pushes it directly to `main`, without SME approval | Every seeded topic has `status: draft` and the site labels it "Not yet clinically reviewed" until the SME reviews it; values only from fetched or supplied documents with locators, never from memory; later content changes go through PRs reviewed by the SME (`CLAUDE.md` §3.2–3.3) |
