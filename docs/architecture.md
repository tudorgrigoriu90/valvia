# Valvia: Architecture overview

> **Purpose:** how Valvia is built, deployed and updated, for maintenance and onboarding.
> **Audience:** software engineer, Claude Code sessions, new contributors.
> **Last updated:** 2026-11-02 | **Status:** target architecture; decisions marked *pending* await their ADR (`docs/adr/`).
> **Source:** backlog §2 ([`product/valvia-backlog.md`](product/valvia-backlog.md)).

## 1. Principles

- **Static first:** no servers or databases in v1; the output is plain static files (NFR-12).
- **Content as code:** clinical content is YAML in Git, validated by JSON Schema, reviewed in pull requests.
- **Every value has a source:** society, document, year, locator, DOI.
- **Lookup, not calculation:** no calculators or patient-specific scores in v1.
- **Near-zero cost:** GitHub (public repo, Pages, Actions) plus a domain.

## 2. System context

```mermaid
flowchart LR
    user["Echocardiographer<br/>(phone, often offline)"]
    sme["SME<br/>(sole content approver)"]
    eng["Software engineer"]
    cc["Claude Code<br/>(sole developer)"]

    subgraph gh["GitHub (public repo)"]
        repo[("Repository<br/>main branch")]
        actions["GitHub Actions<br/>CI, deploy, watchers"]
        pages["GitHub Pages<br/>static site + PWA"]
    end

    srcs["PubMed / Crossref /<br/>ESC, EACVI, ASE pages"]

    cc -- "code: push to main" --> repo
    cc -- "data: content PR" --> repo
    sme -- "approves content PRs" --> repo
    eng -- "reviews code, manual setup" --> repo
    repo --> actions
    actions -- "build & deploy" --> pages
    actions -- "weekly watch" --> srcs
    user -- "HTTPS" --> pages
```

## 3. Repository layout

| Path | Contents | Change path |
|---|---|---|
| `/site` | Astro app: pages, components, styles ([ADR 0001](adr/0001-static-site-generator.md)) | Direct to `main` |
| `/content` | Topic tree, parameters, values, source registry, prosthetic catalogue (YAML) | **PR + SME approval** |
| `/schema` | JSON Schemas, generated TS types, plausibility rules | Direct to `main` |
| `/pipeline` | Source watchers, drafting and verification scripts | Direct to `main` |
| `/docs` | Documentation, ADRs, runbooks, task plan | Direct to `main` |

## 4. Change flows

### 4.1 Code change (direct to `main`)

```mermaid
flowchart LR
    task["Pick task<br/>docs/TASK_PLAN.md"] --> red["Write failing test"]
    red --> green["Make it pass"]
    green --> refactor["Refactor"]
    refactor --> docs["Update docs,<br/>README, task plan"]
    docs --> verify["npm run verify<br/>(lint, types, tests ≥ 80 %, build)"]
    verify --> push["git push origin main"]
    push --> ci["CI on main"]
    ci --> deploy["Deploy to GitHub Pages"]
```

### 4.2 Data update (pull request, SME approval)

```mermaid
sequenceDiagram
    autonumber
    participant CC as Claude Code
    participant PR as Content PR + preview
    participant Ver as Verification run (clinical-reviewer persona)
    participant SME as SME
    participant Pages as GitHub Pages

    CC->>PR: Branch content/<node-id>-<slug>, YAML + clinical change summary
    PR->>Ver: Required check: re-read source, compare every value
    Ver-->>PR: Pass / mismatch table (advisory, can block, never approves)
    PR->>SME: Review requested (CODEOWNERS)
    SME->>PR: Approve or request changes
    PR->>Pages: Auto-merge, build, deploy
```

The automated update pipeline (weekly watchers → issue → drafting → PR) is described in backlog §2 and EP-06.

## 5. Content model (outline)

To be detailed by the schema tasks (TS-02.x); field lists below are from the backlog.

```mermaid
erDiagram
    TOPIC_NODE ||--o{ TOPIC_NODE : "parent of"
    TOPIC_NODE ||--o{ CONTENT_BLOCK : shows
    CONTENT_BLOCK ||--o{ VALUE : contains
    PARAMETER ||--o{ VALUE : "measured as"
    SOURCE ||--o{ VALUE : "cited by (with locator)"
    SOURCE |o--o| SOURCE : "supersededBy / citedBy"

    TOPIC_NODE {
        string id "stable, never changes"
        string slug
        string title
        int order
        string population
        string wave
        string status
    }
    PARAMETER {
        string name
        string abbreviation
        string unit
        string modality
    }
    VALUE {
        string ageGroup
        string operator
        string value
        string unit
        string context
        string modality
        string grade
    }
    SOURCE {
        string id
        string society
        string type
        int year
        string doi
        string status
    }
    CONTENT_BLOCK {
        string type "NORM GRADE INTV FEAS CRIT PROG METH ALG"
    }
```

## 6. Quality gates

| Gate | Where | Blocking |
|---|---|---|
| Lint, format, typecheck | local `npm run verify`, CI | yes |
| Unit/integration tests, coverage ≥ 80 % (100 % safety-critical) | local, CI | yes |
| Content schema + plausibility | CI | yes |
| E2E (Playwright, 360 px), axe | CI | yes |
| Lighthouse budgets (NFR-02) | CI | yes |
| Broken links | CI | yes |
| Verification run | content PRs | yes (SME override by comment) |
