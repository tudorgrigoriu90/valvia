# Changelog

> **Purpose:** audit trail of clinical content changes (TS-06.4.2, NFR-06): who approved and merged each content pull
> request, when, and which sources and topics it changed.
> **Audience:** SME, engineer, auditors. **Last updated:** 2026-11-13

- **Content pull requests** (§3.2 of [`CLAUDE.md`](CLAUDE.md)) get a row automatically when merged
  ([`content-audit.yml`](.github/workflows/content-audit.yml)); "Approved by" is the latest review state per reviewer.
  A row with **none** means the PR was merged without an approval and must be investigated.
- **Initial seed** (decision PO-3, 2026-11-02 onwards): content was pushed directly to `main` without approval, as
  `status: draft`. Those changes are in the Git history (`git log -- content/`) and on the site's
  [What's new](https://valvia-echo.se/whats-new/) page, not in this table.
- **Code changes** are logged in the push log of [`docs/TASK_PLAN.md`](docs/TASK_PLAN.md).

## Content audit log

<!-- audit-log: new rows go below the header (pipeline/audit) -->

| Merged | Pull request | Approved by | Merged by | Sources | Topics |
|---|---|---|---|---|---|
