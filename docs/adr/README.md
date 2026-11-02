# Architecture Decision Records

> **Purpose:** index of the architecture decisions for Valvia and the template for new ones.
> **Audience:** software engineer, Claude Code sessions. **Last updated:** 2026-11-02

Every ADR states its **cost** and **exit strategy** (backlog FT-01.1). ADRs are immutable once accepted:
to change a decision, add a new ADR that supersedes the old one and update the old one's status.

| ADR | Title | Status | Backlog |
|---|---|---|---|
| [0001](0001-static-site-generator.md) | Static site generator: Astro | Accepted | TS-01.1.1 |
| [0002](0002-hosting-github-pages.md) | Hosting: GitHub Pages, PR previews, meta CSP, static redirects | Accepted | TS-01.1.2 |

## Template

```markdown
# NNNN. Title

- **Status:** Proposed | Accepted | Superseded by NNNN
- **Date:** YYYY-MM-DD
- **Backlog:** TS-…

## Context
## Options considered
## Decision
## Consequences
## Cost
## Exit strategy
```
