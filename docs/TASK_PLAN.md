# Valvia: Task plan

> **Purpose:** single source of truth for task status and the push log. Updated in **every push** (see `CLAUDE.md` §9).
> **Audience:** Claude Code sessions, software engineer, product owner.
> **Last updated:** 2026-11-04
> **Task details and acceptance criteria:** [`product/valvia-backlog.md`](product/valvia-backlog.md)

Status values: `todo` · `in progress` · `done` · `blocked` (with reason) · `dropped` (with reason) · `manual` (engineer task; Claude prepares checklists and verifies where possible).

## Current status

| | |
|---|---|
| Release in progress | **R0: Walking skeleton** |
| Last completed | TS-03.0.2 Content status page (per node: draft / in review / published; wave) |
| Next up | TS-01.2.5: content PR template |

## Next up: R0 sequence

R0 exit criterion: the SME approves a real content PR from the phone and sees it live on GitHub Pages.
Suggested order (one push each):

1. TS-01.1.1 → TS-01.1.4: ADRs (site generator, hosting, content as code, search)
2. TS-01.2.1: repository structure
3. TS-01.2.3 + CH-1: TypeScript/ESLint/Prettier, then test tooling with coverage thresholds (two pushes)
4. TS-01.3.1, TS-01.3.2: CI (on push to `main` and on PRs) and deploy to GitHub Pages
5. TS-01.3.4, TS-01.2.5: CODEOWNERS, content PR template (no hosted previews, ADR 0005)
6. TS-02.1.1, TS-02.2.1–TS-02.2.7, TS-02.3.1–TS-02.3.2: core schemas (one task per push)
7. Minimal leaf page for one node (e.g. 3.2.1.2 *Primary MR → severity grading*)
8. First content PR (SME approval) → live
9. In parallel, engineer: TS-08.1, TS-08.3, TS-08.4, TS-01.3.5 (`manual`)

## Workflow changes vs backlog v0.3

The user set the following rules on 2026-11-02 (recorded in `CLAUDE.md`); they supersede backlog §0 working rules 1–2:

- Code, config, tests and docs are committed **directly to `main`**; only **data updates** (`/content/**`, source registry) go through PRs, approved by the SME.
- One task per push; TDD; coverage ≥ 80 %; README updated every turn; this plan updated every push.

Content PRs target `main` as base and are reviewed in the PR (summary + diff); no hosted previews and no `gh-pages` branch (ADR 0005, 2026-11-02).

Initial content seed (PO-3, 2026-11-02): Claude fetches the sources and pushes the first content directly to `main` as `status: draft`, labelled "Not yet clinically reviewed" on the site; later changes go through SME-reviewed PRs.

Consequences: TS-01.2.5 needs only a content PR template; TS-01.3.5 ruleset must allow direct pushes to `main` while a CI path guard rejects direct changes to `/content/**`; the engineer reviews code after it lands on `main`.

## Backlog

### EP-00: Discovery & SME validation (MVP)

| Key | Summary | SP | Status | Notes |
|---|---|---|---|---|
| TS-00.1 | Taxonomy validation with SME | 2 | in progress | SME answers applied (taxonomy v0.3); F2–F5 open |
| TS-00.2 | Record SME decisions in `/docs/decisions` (✅ answers received 2 Nov 2026; F1 answered: z-score datasets cited by ESC/ASE included; follow-ups F2–F5 open) | 1 | todo |  |
| TS-00.3 | Competitor scan (ESC Pocket Guidelines app, ASE app, others); define differentiation | 2 | todo |  |
| TS-00.4 | Confirm delivery waves (all content P1) and success metrics | 1 | todo |  |
| TS-00.5 | Agree emergency-rollback rule with SME (engineer may revert, never add or change values) | 1 | todo |  |
| TS-00.6 | Usability test of clickable prototype with 3 echocardiographers (incl. 1 paediatric) | 1 | todo |  |

### EP-01: Foundation, CI/CD & Claude Code workflow (MVP)

| Key | Summary | SP | Status | Notes |
|---|---|---|---|---|
| TS-01.1.1 | ADR: static site generator (Astro vs Eleventy) | 2 | done | Astro chosen ([ADR 0001](adr/0001-static-site-generator.md)) |
| TS-01.1.2 | ADR: GitHub Pages hosting, PR previews, meta-CSP and static redirects | 1 | done | Deployment/preview parts superseded by [ADR 0005](adr/0005-pages-actions-deploy-no-previews.md) |
| TS-01.1.3 | ADR: content as code (YAML in Git) | 1 | done | [ADR 0003](adr/0003-content-as-code.md) |
| TS-01.1.4 | ADR: client-side search (Pagefind) | 1 | done | [ADR 0004](adr/0004-client-side-search-pagefind.md) |
| TS-01.2.1 | Repo structure: `/site`, `/content`, `/schema`, `/pipeline`, `/docs` | 2 | done | Added `/core` for framework-free domain logic |
| TS-01.2.2 | `CLAUDE.md`: architecture, coding conventions, content-modelling rules, units, DoD | 2 | done | Workflow rules from user: direct-to-main for code, PR for data only |
| TS-01.2.3 | TypeScript strict, ESLint, Prettier | 1 | done | TS 6 (typescript-eslint not yet compatible with TS 7); 13 moderate dev-only audit findings via minimatch, left to Renovate |
| TS-01.2.4 | Renovate config with auto-merge for patch/minor on green CI | 1 | todo |  |
| TS-01.2.5 | PR templates: code PR; content PR (clinical change summary table, sources, preview link, reviewer checklist) | 1 | todo | Only the content PR template is needed (code goes to main directly) |
| CH-1 | Test tooling: Vitest + coverage thresholds (≥ 80 % global, 100 % safety-critical modules), Playwright, `npm run verify` | 2 | done | Added for CLAUDE.md rules (TDD, coverage); not in backlog |
| CH-2 | Internal link checker (Markdown docs + built site, offline), run in CI | 1 | done | Built test-first; external URLs deliberately not checked |
| CH-3 | Fix: Prettier formatting of 404 page pushed with TS-01.3.2 | 0 | done | Push was not gated on verify exit code; now always gated |
| CH-4 | Generate TypeScript types from JSON Schema (`npm run gen:types`) with a staleness test | 1 | done | First part of TS-02.2.4 (types); plausibility checks stay in TS-02.2.4 |
| CH-5 | Deploy via GitHub Actions Pages; drop `gh-pages` branch and hosted PR previews; PR site artifact | 1 | done | PO decision 2026-11-02 |
| CH-6 | Content loader: read all YAML, keep published number text, cross-file integrity (ids, references, tree), run all rules; `npm run validate:content` in verify and CI | 3 | done | ADR 0003 step 3; implements FT-02.2/02.3 rule wiring |
| CH-7 | Fix: formatting pushed with TS-02.2.4; plan update missed | 0 | done | Heredoc broke the verify-gated command chain; now plan edits run before the gate |
| CH-8 | Record PO decisions (direct-to-main, no previews, initial content seed without approval) and the seed rules | 0 | done | Starts TS-00.2 (decision log) |
| CH-9 | Give generic leaf titles their parent context (search results, tabs) and fix a truncated title | 0 | done | Ids and slugs unchanged |
| CH-10 | Population-aware tables: grading rows per population, normal-range tables (population columns), threshold lists | 1 | done | Completes the normal-range part of TS-04.3.1 |
| CH-11 | Exclusive range bounds (minExclusive/maxExclusive) in schema, display, tables and discrepancy comparison | 1 | done | Needed for ASE 2025 right heart grading (> x to ≤ y) |
| CH-12 | Compare discrepancies within a topic only (thresholds are condition-specific) | 0 | done | False positives seen between MR, TR, AR and prosthetic AR vena contracta |
| CH-13 | Own static server for E2E (Astro 7 preview can detach into the background) | 0 | done | Mirrors GitHub Pages: base path, directory index, 404.html |
| CH-14 | Velocity-time integral quantity displayed in cm | 0 | done | VTI thresholds (e.g. tricuspid inflow > 60 cm) |
| TS-01.3.1 | CI: build, schema validation, unit tests, Lighthouse CI, axe, broken-link check | 3 | done | Schema validation, axe, Lighthouse and link checks join CI with their own tasks (EP-02, CH-2, TS-07.4.2, TS-05.2.1) |
| TS-01.3.2 | Deploy to GitHub Pages via Actions on merge to `main` | 1 | done | Actions Pages deploy since CH-5 ([ADR 0005](adr/0005-pages-actions-deploy-no-previews.md)) |
| TS-01.3.3 | PR previews with `pr-preview-action` (deploy, comment link, clean up on close); exclude previews from search engines | 2 | dropped | PO decision 2026-11-02: no `gh-pages` branch; content PRs reviewed in the PR (ADR 0005) |
| TS-01.3.4 | CODEOWNERS: `/content/**` → SME only; everything else → engineer | 1 | todo | CODEOWNERS now only matters for `/content/**` PRs |
| TS-01.3.5 | Branch ruleset on `main`: PR required, required checks, CODEOWNER review, auto-merge allowed, delete branch on merge; admin bypass reserved for emergency reverts | 1 | manual | Adapt: allow direct pushes for code; block direct changes to `/content/**` (CI path guard) |

### EP-02: Content model & source registry (MVP)

| Key | Summary | SP | Status | Notes |
|---|---|---|---|---|
| TS-02.1.1 | Topic node schema: `id`, `slug`, `title`, `parent`, `order`, `synonyms`, `population`, `wave`, `status` | 2 | done |  |
| TS-02.1.2 | Encode taxonomy v0.2 as content tree (unpopulated nodes hidden) | 2 | done | Direct to main per PO-3; hiding of unpopulated nodes is a site behaviour (EP-04) |
| TS-02.1.3 | Stable ID & URL policy; static redirect pages on slug rename | 2 | todo |  |
| TS-02.2.1 | Parameter schema: name, abbreviation, unit, modality, view/method note | 2 | done | Unit/quantity consistency enforced in TS-02.2.7 |
| TS-02.2.2 | Value schema: population qualifiers, grade, operator, value/range, unit, context, caveats, citation | 5 | done | Modality field added by TS-02.2.6; numeric plausibility in TS-02.2.4 |
| TS-02.2.3 | Content block types: grading table, normal range table, criteria checklist (favourable / challenging / unsuitable), threshold list, note, algorithm reference (link to source) | 3 | done |  |
| TS-02.2.4 | JSON Schema + generated TS types; plausibility checks (unit vs parameter, monotonic grades) | 3 | done | Generated types delivered in CH-4 |
| TS-02.2.5 | Paediatric qualifiers: `ageGroup` (adult / paediatric), age band, BSA band, z-score reference (as published, no computation) | 1 | done |  |
| TS-02.2.6 | Value-level `modality` (Echo / CT / CMR) | 1 | done |  |
| TS-02.2.7 | Unit layer: store as published, display in house units (NFR-15), original on tap; exhaustive conversion tests | 2 | done | 100 % coverage; indexed-length and indexed-mass shown as published pending F4 |
| TS-02.2.8 | Prosthetic valve catalogue schema: position, type, model, size → expected values with citation | 2 | todo |  |
| TS-02.3.1 | Source schema incl. status, supersession, allowed-society check and `citedBy` for cited z-score datasets | 2 | done |  |
| TS-02.3.2 | Per-value citation locator (table, figure, section, page) | 1 | done | Source existence is checked by the cross-file loader (planned) |
| TS-02.3.3 | Seed registry from taxonomy Appendix A (content PR, SME verifies) | 2 | done | Initial seed per PO-3; values only from documents read in full |
| TS-02.4.1 | Build-time discrepancy detection | 3 | done | 100 % coverage |
| TS-02.4.2 | Supersession → history data (current vs previous recommendations) | 2 | done |  |
| TS-02.4.3 | Unit tests with fixtures (agreement, disagreement, superseded) | 2 | todo |  |

### EP-03: Clinical content production (MVP)

| Key | Summary | SP | Status | Notes |
|---|---|---|---|---|
| TS-03.0.1 | Content YAML templates + content guide (modelling, citing, units, history, modality, paediatric values) | 2 | todo |  |
| TS-03.0.2 | Content status page (per node: draft / in review / published; wave) | 2 | done |  |
| FT-03.1 | 1 Chamber size & function (W1) | 8 | in progress | Chamber, LV/RV/LA strain done |
| FT-03.2 | 2 Diastolic function & filling pressures (W1) | 5 | in progress | Diastolic (ASE 2025): 2.1 and 2.2 done; special populations and HFpEF pending |
| FT-03.3 | 3.1 VHD: aortic valve (incl. TAVI considerations, AR TAVI) (W1) | 10 | in progress | AR and AS grading done (ASE/EACVI); intervention thresholds and TAVI pending ESC |
| FT-03.4 | 3.2 VHD: mitral valve (primary/secondary MR, TEER feasibility, repair likelihood, MS, MAC) (W1) | 10 | in progress | Primary MR (ASE 2017) done; ESC/EACVI and CMR values pending document access |
| FT-03.5 | 3.3–3.5 VHD: tricuspid, pulmonary, multiple & mixed (W1) | 5 | in progress | TR, PR, TS, PS done (ASE) |
| FT-03.6 | 3.6 VHD: infective endocarditis (W1) | 3 | todo |  |
| FT-03.7 | 4.2–4.6 Prosthetic valves & valve interventions (grading, PPM, post-repair, BVD) (W1) | 8 | in progress | Prosthetic grading (ASE 2024) done; reference values by model (4.1) pending |
| FT-03.8 | 4.1 Prosthetic valve reference values by model and size (W2) | 8 | todo |  |
| FT-03.9 | 5 Pulmonary hypertension & right heart (W1) | 6 | in progress | Right heart (ASE 2025) done; PH probability and ESC/ERS 2022 pending |
| FT-03.10 | 6 Cardiomyopathies & heart failure (W1) | 8 | in progress | HCM (ASE 2022) done; other cardiomyopathies pending ESC 2023 |
| FT-03.11 | 7 Pericardial disease (W1) | 3 | in progress | Pericardial (ASE 2013): 7.1-7.3 done; 7.4 pending ESC 2025 |
| FT-03.12 | 8 Congenital heart disease, paediatric & adult (W2) | 10 | todo |  |
| FT-03.13 | 15 Paediatric echocardiography (normal values, function, PH, cardiomyopathies) (W2) | 8 | todo |  |
| FT-03.14 | 9 Stress echocardiography (W2) | 5 | todo |  |
| FT-03.15 | 10 Aortic disease (W2) | 3 | todo |  |
| FT-03.16 | 11 Cardio-oncology (W2) | 3 | todo |  |
| FT-03.17 | 12 Cardiac masses & embolic sources (W2) | 3 | todo |  |
| FT-03.18 | 13 Special populations (W2) | 3 | todo |  |
| FT-03.19 | 14 Reference & methodology (glossary, units, DuBois BSA, formulas) (W1) | 2 | todo |  |

### EP-04: Navigation & lookup UX (MVP)

| Key | Summary | SP | Status | Notes |
|---|---|---|---|---|
| TS-04.1.1 | Mobile-first clickable prototype: home, category list, leaf page, compare view, history, search | 3 | todo |  |
| TS-04.1.2 | Design tokens, light/dark theme, system font stack, Valvia wordmark and icon | 2 | done | Wordmark/icon included; society badges are TS-04.1.3 |
| TS-04.1.3 | Society badges (ESC, EACVI, ASE, joint) with text label + colour | 1 | todo |  |
| TS-04.2.1 | Home: grid of root categories + search bar | 2 | done | Search bar deferred to TS-04.4.2 |
| TS-04.2.2 | Drill-down list pages with breadcrumbs | 3 | done |  |
| TS-04.2.3 | Leaf page with section anchors and "jump to" menu | 3 | done |  |
| TS-04.3.1 | Responsive grading / normal-range table component | 5 | done | Normal-range table layout follows with NORM content |
| TS-04.3.2 | Criteria checklist component (e.g. TEER feasibility) | 3 | done |  |
| TS-04.3.3 | Source chip + citation popover; original-unit popover | 3 | done | Society badges are text-only for now (TS-04.1.3) |
| TS-04.3.4 | Discrepancy marker + side-by-side comparison view | 5 | todo |  |
| TS-04.3.5 | Society filter toggle (localStorage, wrapped in try/catch) | 2 | todo |  |
| TS-04.3.6 | Caveats/footnotes rendering (e.g. "not valid in AF") | 1 | done |  |
| TS-04.4.1 | Pagefind index incl. synonyms, abbreviations and valve models | 3 | done | Valve model names join with the prosthetic catalogue (TS-02.2.8) |
| TS-04.4.2 | Instant search UI (mobile keyboard friendly) | 2 | done |  |
| TS-04.5.1 | Stable deep links to topics and parameter anchors | 1 | todo |  |
| TS-04.5.2 | "Last reviewed" date and content version on every page | 1 | done |  |
| TS-04.6.1 | Last 10 viewed topics on home screen (localStorage) | 2 | todo |  |
| TS-04.7.1 | Adult / paediatric switch (global, persisted) | 2 | todo |  |
| TS-04.7.2 | "Previous recommendations" history view (source, year, superseded by) | 2 | done | E2E pending superseded content |
| TS-04.7.3 | Modality badges (Echo / CT / CMR) | 1 | done |  |
| TS-04.7.4 | Prosthetic valve picker (lookup only) | 3 | todo |  |

### EP-05: Mobile, performance & offline (MVP)

| Key | Summary | SP | Status | Notes |
|---|---|---|---|---|
| TS-05.1.1 | Breakpoints (360 / 768 / 1024) + real-device test matrix (iOS Safari, Android Chrome) | 3 | todo |  |
| TS-05.2.1 | Lighthouse CI budgets (LCP, JS weight, CLS) as blocking checks | 2 | todo |  |
| TS-05.2.2 | System fonts, SVG-only icons; analytics beacon is the only third-party script | 1 | todo |  |
| TS-05.3.1 | Web app manifest ("Valvia"), icons, installability | 1 | done | PNG icon sizes can be added if a store or older browser needs them |
| TS-05.3.2 | Service worker precaching all content pages + search index | 3 | done |  |
| TS-05.3.3 | Update prompt + content version display | 2 | done |  |
| TS-05.3.4 | Offline indicator | 1 | done |  |

### EP-06: Guideline update pipeline with PR-based approval (MVP; watchers in R1.1)

| Key | Summary | SP | Status | Notes |
|---|---|---|---|---|
| TS-06.1.1 | Scheduled GitHub Action (weekly) with failure notification | 1 | todo |  |
| TS-06.1.2 | PubMed E-utilities / Crossref queries: EHJ, EHJ-CI, JASE (+ ESC journals for paediatric/CHD); guideline / recommendation / consensus types; echo keywords | 5 | todo |  |
| TS-06.1.3 | Page-change watchers: ESC guideline list, EACVI recommendations page, ASE guidelines page | 3 | todo |  |
| TS-06.1.4 | Deduplication and state (JSON state file in repo) | 2 | todo |  |
| TS-06.1.5 | Errata/corrigendum detection for registered sources (Crossref update relations) | 3 | todo |  |
| TS-06.2.1 | Issue per candidate with metadata and mapped affected topics | 3 | todo |  |
| TS-06.2.2 | Claude Code GitHub Action triggered by `new-source` label; prompt references `CLAUDE.md` content rules; monthly spending cap | 3 | todo |  |
| TS-06.2.3 | Source acquisition: download open-access PDF, else request attachment in the issue | 2 | todo |  |
| TS-06.2.4 | Clinical change-summary generator for the PR body | 3 | todo |  |
| TS-06.3.1 | Content PR template with reviewer checklist ("values match source", "population/units correct", "discrepancies labelled", "history correct") | 1 | todo |  |
| TS-06.3.2 | Enable auto-merge on content PRs once approved and green | 1 | todo |  |
| TS-06.3.3 | Stale-PR reminder and escalation job | 2 | todo |  |
| TS-06.3.4 | Verification run: fresh Claude context re-reads the source and compares every changed value; required status check; the SME can override a false mismatch with a PR comment | 3 | todo |  |
| TS-06.3.5 | SME quick guide (1 page): reviewing a content PR in the GitHub mobile app | 1 | todo |  |
| TS-06.3.6 | Claude clinical-reviewer persona (built and maintained by the engineer with SME input): echocardiography-expert review prompt and checklist, run as the verification run on every content PR; second reviewer, advisory only, never approves | 2 | todo |  |
| TS-06.4.1 | Auto-generated "What's new" page from merged content PRs | 3 | todo |  |
| TS-06.4.2 | Audit trail: approver, timestamp, source recorded in CHANGELOG + Git history | 1 | todo |  |
| TS-06.4.3 | Rollback runbook (revert PR → redeploy) | 1 | todo |  |
| TS-06.5.1 | "Report an issue" link per value: prefilled GitHub issue form, with a `mailto:` fallback for users without GitHub | 2 | todo |  |

### EP-07: Quality, compliance & legal (MVP)

| Key | Summary | SP | Status | Notes |
|---|---|---|---|---|
| TS-07.1.1 | EU MDR qualification memo (MDCG 2019-11 reasoning), incl. paediatric z-score references shown as published without patient computation; external review if unclear | 3 | todo |  |
| TS-07.1.2 | Intended-use statement + disclaimer ("verify against the original guideline") | 1 | done | Legal wording to be reviewed with the MDR memo (TS-07.1.1) |
| TS-07.2.1 | Copyright assessment: numeric values vs reproduced tables (incl. prosthetic model/size tables from guideline appendices); algorithms linked only; request permissions from ESC (OUP) / ASE (Elsevier) where needed | 3 | todo |  |
| TS-07.2.2 | Content policy: own-format tables, no copied figures, always cite and link | 1 | todo |  |
| TS-07.3.1 | Hazard log (wrong value, wrong unit or conversion, missing indexation, adult value shown for a child, superseded value shown as current, wrong population) + mitigations | 2 | todo |  |
| TS-07.3.2 | Pre-release content audit per wave: 100 % of values verified by the verification run and approved; SME spot-checks a random 10 % sample against the PDFs | 3 | todo |  |
| TS-07.4.1 | Manual screen-reader pass (VoiceOver, TalkBack) | 2 | todo |  |
| TS-07.4.2 | Playwright E2E at mobile viewport (browse, search, compare, history, adult/paediatric switch, prosthetic picker, offline) | 3 | todo |  |
| TS-07.5.1 | Cookieless analytics + privacy notice | 1 | todo |  |

### EP-08: Engineer setup, release & operations (MVP)

| Key | Summary | SP | Status | Notes |
|---|---|---|---|---|
| TS-08.1 | Create public repo `valvia`; enable GitHub Pages (source: GitHub Actions); enable secret scanning + push protection | 1 | manual | Pages enabled (Source: GitHub Actions) and `gh-pages` deleted 2026-11-02; secret scanning/push protection still to confirm |
| TS-08.2 | Check name availability (domain, EUIPO trademark search); buy domain; DNS; custom domain on Pages; enforce HTTPS | 1 | manual |  |
| TS-08.3 | Install Claude Code GitHub Action; add credentials as repo secret; set spending limit | 1 | manual |  |
| TS-08.4 | SME onboarding: GitHub account with 2FA, GitHub mobile app, notification settings, 15-min walkthrough of a sample PR | 1 | manual |  |
| TS-08.5 | Analytics account + uptime monitor (free tiers) | 1 | manual |  |
| TS-08.6 | Runbooks: content update, emergency rollback, rotating secrets | 2 | todo |  |
| TS-08.7 | Closed beta (SME + 3–5 colleagues), feedback collection, triage | 3 | todo |  |
| TS-08.8 | Go-live checklist | 2 | todo |  |

### EP-09: User accounts (v2)

| Key | Summary | SP | Status | Notes |
|---|---|---|---|---|
| TS-09.1 | Spike: Supabase vs Firebase (cost, EU data residency, free-tier limits; Supabase free projects pause when inactive) | 2 | todo |  |
| TS-09.2 | Google sign-in | 2 | todo |  |
| TS-09.3 | Microsoft sign-in (personal + work accounts) | 3 | todo |  |
| TS-09.4 | Facebook sign-in (needs Meta app review + business verification; confirm value first) | 3 | todo |  |
| TS-09.5 | Account page: sign out, delete account (GDPR art. 17), export data | 3 | todo |  |
| TS-09.6 | Privacy notice update, DPA with provider, record of processing (`manual` parts by engineer) | 2 | todo |  |
| TS-09.7 | Auth as isolated client-side island so content pages stay within the performance budget | 2 | todo |  |

### EP-10: Favourites (v2)

| Key | Summary | SP | Status | Notes |
|---|---|---|---|---|
| TS-10.1 | Star/unstar any node (category, subcategory, leaf) | 3 | todo |  |
| TS-10.2 | Favourites section on home + dedicated screen | 2 | todo |  |
| TS-10.3 | Cross-device sync with offline queue | 3 | todo |  |
| TS-10.4 | Import device-local "recently viewed" on first sign-in | 1 | todo |  |

### EP-11: Admin content management (v2)

| Key | Summary | SP | Status | Notes |
|---|---|---|---|---|
| TS-11.1 | Roles: reader, editor (admin, GitHub collaborator), approver (content CODEOWNER) | 2 | todo |  |
| TS-11.2 | Git-based CMS at `/admin` with forms generated from the content schema | 5 | todo |  |
| TS-11.3 | Add / rename / move categories with stable IDs and generated redirects | 3 | todo |  |
| TS-11.4 | Edit values with source picker from registry; cannot save without citation | 3 | todo |  |
| TS-11.5 | CMS editorial workflow opens a PR; verification run + approval apply | 2 | todo |  |
| TS-11.6 | Manage source registry (mark superseded, add errata) | 2 | todo |  |

### EP-12: Notifications for favourites (v2)

| Key | Summary | SP | Status | Notes |
|---|---|---|---|---|
| TS-12.1 | On merge to `main`, GitHub Action computes changed node IDs from the content diff | 2 | todo |  |
| TS-12.2 | Per-user preference per favourite: instant / weekly digest / off | 3 | todo |  |
| TS-12.3 | Digest email via free email tier (e.g. Resend), one-click unsubscribe, batching | 3 | todo |  |
| TS-12.4 | In-app "updated since your last visit" badge | 2 | todo |  |
| TS-12.5 | Optional web push (stretch) | 3 | todo |  |

## Push log

One row per push (newest last). Content PRs are logged when opened and when merged.

| Date | Task | Summary | Commit / PR |
|---|---|---|---|
| 2026-11-02 | TS-01.2.2 | Add `CLAUDE.md` (workflow, TDD, coverage, docs, README and plan rules, architecture, content rules); README; task plan; architecture overview; product docs imported | `TS-01.2.2: add CLAUDE.md engineering guidelines` |
| 2026-11-02 | TS-01.1.1 | ADR 0001: Astro 7 static output; logic framework-free in /core; ADR index and template | `TS-01.1.1: ADR 0001 static site generator (Astro)` |
| 2026-11-02 | TS-01.1.2 | ADR 0002: gh-pages branch deploy with PR previews, env-driven base path, meta CSP without inline scripts, static redirect pages | `TS-01.1.2: ADR 0002 hosting on GitHub Pages` |
| 2026-11-02 | TS-01.1.3 | ADR 0003: YAML one entity per file, JSON Schema source of truth, generated types, shared loader with line-precise errors | `TS-01.1.3: ADR 0003 content as code` |
| 2026-11-02 | TS-01.1.4 | ADR 0004: Pagefind post-build index with synonyms, own search UI, offline precache; CSP allows wasm | `TS-01.1.4: ADR 0004 client-side search (Pagefind)` |
| 2026-11-02 | TS-01.2.1 | Folders site/core/content/schema/pipeline with READMEs; package.json, .nvmrc, .gitignore, .editorconfig; Astro 7 config (env base path, no inlining) and placeholder home page | `TS-01.2.1: repository structure and Astro skeleton` |
| 2026-11-02 | TS-01.2.3 | TypeScript 6 strictest, ESLint 10 flat config (typescript-eslint strict type-checked, astro plugin), Prettier with astro plugin; lint/typecheck/format scripts | `TS-01.2.3: TypeScript strictest, ESLint and Prettier` |
| 2026-11-02 | CH-1 | Vitest 5 with v8 coverage gates (80 % global, 100 % safety-critical globs, verified to fail), Playwright 1.63 (360 px + desktop) smoke tests, npm run verify, base-path helper built test-first, testing guide | `CH-1: test tooling with coverage gates and verify script` |
| 2026-11-02 | TS-01.3.1 | CI workflow on push to main and PRs: format, lint, typecheck, unit tests with coverage, build, Playwright E2E, artefacts; CI/CD doc | `TS-01.3.1: CI workflow` |
| 2026-11-02 | CH-2 | Offline internal link checker (Markdown links + GitHub heading anchors; built pages under base path, files and ids), GitHub annotations, in verify and CI | `CH-2: internal link checker for docs and built site` |
| 2026-11-02 | TS-01.3.2 | Deploy job after green verify on main: site artefact to gh-pages root (keeps pr-preview/), env-driven base via repo variables, .nojekyll, 404 page, E2E hosting tests | `TS-01.3.2: deploy to GitHub Pages from CI` |
| 2026-11-02 | CH-3 | Format 404 page; verify green | `CH-3: format 404 page` |
| 2026-11-02 | TS-02.1.1 | Topic node JSON Schema + shared defs; core/content validator (YAML positions, readable Ajv messages incl. anyOf, file name = id, all errors); content model reference doc | `TS-02.1.1: topic node schema and file validator` |
| 2026-11-02 | CH-4 | json-schema-to-typescript generator (gen:types), committed schema/generated/topic.ts, staleness test, schema change procedure | `CH-4: generate TypeScript types from JSON Schema` |
| 2026-11-02 | TS-02.3.1 | Source schema (issuers, type, year, DOI, https URL, status, supersededBy, citedBy) + registry rules: allowlist, F3 warning, cited z-score datasets, supersession integrity and cycles (100 % coverage) | `TS-02.3.1: source schema and registry rules` |
| 2026-11-02 | TS-02.3.2 | Citation definition (source id + locator with ≥ 1 of table/figure/section/page, text-only locators), validateDefinition for shared definitions, readable minProperties message | `TS-02.3.2: per-value citation locator` |
| 2026-11-02 | CH-5 | ADR 0005: GitHub Actions Pages deploy (upload-pages-artifact + deploy-pages), no gh-pages branch, TS-01.3.3 dropped, PR builds attach site artifact, .nojekyll removed; docs updated | `CH-5: deploy via GitHub Actions Pages, drop gh-pages and previews` |
| 2026-11-02 | TS-02.2.1 | Parameter schema (name, abbreviation, quantity, display unit, modalities, synonyms, method) + shared modality/unit/quantity definitions | `TS-02.2.1: parameter schema` |
| 2026-11-02 | TS-02.2.7 | Unit layer: house unit per quantity, exact decimal-shift conversions, original-on-tap display model, parameter unit rule; exhaustive round-trip tests; docs/units.md | `TS-02.2.7: unit layer with exact conversions` |
| 2026-11-02 | TS-02.2.5 | populationQualifiers definition: mandatory ageGroup (adult|paediatric), sex, age band (days/months/years), BSA band, rhythm, z-score dataset reference; readable 'at least one of' messages | `TS-02.2.5: population qualifiers incl. paediatric` |
| 2026-11-02 | TS-02.2.2 | Value definition: parameter, context, grade (required for grading/feasibility), operator with value or min/max (mutually exclusive), unit as published, population, caveats, citation | `TS-02.2.2: value schema` |
| 2026-11-02 | TS-02.2.6 | Mandatory value-level modality (Echo/CT/CMR) + rule: value modality must be one of the parameter's modalities | `TS-02.2.6: value-level modality` |
| 2026-11-02 | TS-02.2.3 | Block types (grading table, normal-range table, threshold list, criteria checklist, note, algorithm reference) with type/tag fit, discriminator-selected errors; topic.blocks | `TS-02.2.3: content block types` |
| 2026-11-02 | TS-02.2.4 | Plausibility rules per topic: unit vs quantity, modality, non-negative sizes, ordered ranges, known grades, monotonic thresholds across grades (converted units, grouped by parameter/population/modality/source); generated types done in CH-4 | `TS-02.2.4: plausibility checks` |
| 2026-11-02 | CH-7 | Prettier, lint and type fixes in topic-rules tests; TS-02.2.4 plan row and log entry restored | `CH-7: fix formatting, lint, types and plan entry from TS-02.2.4` |
| 2026-11-02 | CH-6 | Content loader (published number text, invalid-file aware), cross-file integrity (tree, cycles, sibling/former slugs, leaf-only blocks, block ids, parameter/source/z-score references), registry/unit/plausibility rules mapped to file positions; validate:content CLI with GitHub annotations in verify and CI | `CH-6: content loader and validate:content` |
| 2026-11-02 | TS-02.4.1 | Discrepancy detection across topics for current sources (display-unit comparison, operator and range aware, key-order-insensitive populations), value formatter, loaded-value walker; listed by validate:content | `TS-02.4.1: build-time discrepancy detection` |
| 2026-11-02 | CH-8 | Decision log docs/decisions (PO-1..PO-3); CLAUDE.md §3.3 initial content seed rules: direct to main, status draft, site label, values only from documents read in session | `CH-8: decision log and initial content seed rules` |
| 2026-11-02 | TS-02.1.2 | Taxonomy v0.3 encoded as 164 topic files (stable curated ids for ambiguous/long nodes, short-title slugs, ref, order, population, wave, seeAlso cross-links, status draft); validate:content clean | `TS-02.1.2: encode taxonomy tree as topic files` |
| 2026-11-02 | TS-02.3.3 | Source registry seeded with 29 Appendix A documents from PubMed records (title, journal, DOI, year, issuers, type, status; ASE/EACVI 2016 diastolic superseded by ASE 2025); source titles allow 600 chars | `TS-02.3.3: seed source registry from PubMed records` |
| 2026-11-02 | FT-03.4 | Primary MR severity grading (3.2.1.2) from ASE 2017 Table 8 / Figure 18: 6 parameters, quantitative (EROA, RVol, RF) and semiquantitative (VCW, PISA radius, E velocity) grading, specific criteria, method note, algorithm link; draft | `FT-03.4: primary MR severity grading from ASE 2017` |
| 2026-11-02 | TS-04.1.2 | Design tokens (light/dark, AA contrast), system fonts, base layout (header wordmark + mark, skip link, footer disclaimer), review banner (PO-3), meta CSP without inline assets, noindex while draft; axe WCAG 2.2 AA E2E in both themes | `TS-04.1.2: design tokens, base layout and review banner` |
| 2026-11-02 | TS-04.2.2 | Navigation module (order, visibility = content in subtree, slug URLs, ancestors, leaf counts) + one static page per visible topic with breadcrumbs and 44 px topic list; build fails on content errors; E2E incl. axe | `TS-04.2.2: drill-down pages with breadcrumbs` |
| 2026-11-02 | TS-04.2.1 | Home: intro, responsive card grid of root categories with content (topic counts), 'In preparation' list of empty categories without links; axe-clean | `TS-04.2.1: home with root categories` |
| 2026-11-02 | TS-04.3.1 | Grading table model (parameter rows × grade columns, display units, original kept) and component: sticky first column, own scroll region at 360 px, unit in row header, abbr with full name; leaf blocks rendered as anchored sections | `TS-04.3.1: responsive grading table` |
| 2026-11-02 | TS-04.3.6 | Caveats rendered as numbered footnotes per table (shared numbers for identical text), superscript links from values to the notes list | `TS-04.3.6: caveats and footnotes` |
| 2026-11-02 | TS-04.3.2 | Criteria checklist (feasibility badges = text + symbol, nested values formatted), note paragraphs, algorithm references linking to the source with locator (FT-04.3) | `TS-04.3.2: criteria checklist, notes and algorithm links` |
| 2026-11-02 | TS-04.3.3 | Per-block source chips (society badge text + short title + locators; full citation, journal, year, DOI on tap) and original-value popovers on converted values, both no-JS details; WCAG 2.2 target sizes | `TS-04.3.3: source chips and original-unit popovers` |
| 2026-11-02 | FT-03.3 | AR severity grading (3.1.2.1) from ASE 2017 Table 11 / Figure 25: quantitative grades I–IV (RVol, RF, EROA), central jet ratios, VCW and PHT, integration note, algorithm link; 3 new parameters; E2E tests made independent of content counts | `FT-03.3: aortic regurgitation severity grading from ASE 2017` |
| 2026-11-02 | FT-03.5 | TR severity grading (3.3.2) from ASE 2017 Table 14 / Figure 31: EROA, RVol, VCW, PISA radius, jet area, 3D VCA, IVC diameter, tricuspid E; 4 new parameters | `FT-03.5: tricuspid regurgitation severity grading from ASE 2017` |
| 2026-11-02 | FT-03.5 | PR grading (3.4.2) from ASE 2017 Table 16 / Figure 35: RF, jet width/annulus, PR index, deceleration time, PHT; 3 new parameters | `FT-03.5: pulmonary regurgitation grading from ASE 2017` |
| 2026-11-02 | TS-04.4.1 | Pagefind post-build index of leaf pages with weighted synonyms, parameter names and abbreviations; html data-base for the client; E2E queries EROA, pressure half-time, PISA | `TS-04.4.1: Pagefind search index with synonyms` |
| 2026-11-02 | CH-9 | 19 leaf titles prefixed with their parent context (e.g. 'Aortic regurgitation: severity grading'); truncated HCM title fixed; ids and slugs unchanged | `CH-9: contextual leaf titles` |
| 2026-11-02 | TS-04.4.2 | Instant search box on home (debounced, lazy-loads Pagefind, top 10 results with breadcrumb context, live result count, Enter safe, no-JS notice); CSP-clean bundled script | `TS-04.4.2: instant search UI` |
| 2026-11-02 | CH-10 | Population labels; grading rows per parameter + population; normal-range tables with population columns; threshold lists; shared ValueTable/ValueText/Footnotes components | `CH-10: population-aware tables, normal ranges and threshold lists` |
| 2026-11-02 | FT-03.1 | LV dimensions & volumes (1.1.1) normal ranges by sex from ASE/EACVI 2015 Table 2; chamber parameter catalogue (LV, LA, RV) added | `FT-03.1: LV dimensions and volumes (ASE/EACVI 2015)` |
| 2026-11-02 | FT-03.1 | LV global systolic function (1.1.3): sex-specific LVEF grading (normal, mildly, moderately, severely abnormal) from ASE/EACVI 2015 Table 4 + method note | `FT-03.1: LVEF grading by sex (ASE/EACVI 2015)` |
| 2026-11-02 | FT-03.1 | Left atrium (1.2): maximum LA volume index grading (normal 16–34, mildly 35–41, moderately 42–48, severely >48 mL/m²) from ASE/EACVI 2015 Table 4 | `FT-03.1: LA volume index grading (ASE/EACVI 2015)` |
| 2026-11-02 | FT-03.1 | LV wall thickness, mass & geometry (1.1.2): linear and 2D normal ranges by sex (LV mass, index, RWT, septal and posterior wall) from ASE/EACVI 2015 Table 6 + geometry note | `FT-03.1: LV mass, wall thickness and geometry (ASE/EACVI 2015)` |
| 2026-11-02 | FT-03.1 | RV dimensions (1.3.1): normal ranges for RV diameters, RVOT, wall thickness and sex-specific indexed EDA/EDV/ESV from ASE/EACVI 2015 Table 8 | `FT-03.1: RV dimensions (ASE/EACVI 2015)` |
| 2026-11-02 | FT-03.1 | RV systolic function (1.3.2): abnormality thresholds for TAPSE, S′ (PW and colour DTI), FAC, free-wall strain, 3D RVEF, MPI from ASE/EACVI 2015 Table 10 | `FT-03.1: RV systolic function thresholds (ASE/EACVI 2015)` |
| 2026-11-02 | FT-03.3 | AS severity grading (3.1.1.1) from EACVI/ASE 2017 Table 3: Vmax, mean gradient, AVA, indexed AVA, velocity ratio (sclerosis/mild/moderate/severe) + integration note; registry entry switched to the JASE publication read | `FT-03.3: aortic stenosis severity grading (EACVI/ASE 2017)` |
| 2026-11-04 | CH-11 | Optional minExclusive/maxExclusive on ranges; shared valueText formatter renders '> 5.8 to ≤ 6.3' (or 'a–b' when inclusive); tables, originals and discrepancy signatures respect inclusivity | `CH-11: exclusive range bounds` |
| 2026-11-04 | FT-03.9 | Right heart reference limits and mild/moderate/severe grading from ASE 2025 Table 1: RA size (1.4), RV size incl. PA diameter (1.3.1), RV systolic function (1.3.2), haemodynamics TRV/RVSP/RAP/RVOT AccT (5.4); 21 new parameters | `FT-03.9: right heart grading from ASE 2025` |
| 2026-11-04 | FT-03.2 | Diastolic function from ASE 2025: normal ranges by age (2.1, Table 5) for E, A, E/A, e′, E/e′, LAVi, TRV, LARS; dysfunction criteria (2.2, Figure 2/key points) with LAP algorithm link; 9 new parameters | `FT-03.2: diastolic normal ranges and dysfunction criteria (ASE 2025)` |
| 2026-11-04 | FT-03.7 | Prosthetic aortic valve (4.2) from ASE 2024: obstruction grading (Table 5, all valves + SAVR), PPM by indexed EOA and BMI (Table 7), regurgitation incl. paravalvular extent (Table 8), algorithm link; 4 new parameters | `FT-03.7: prosthetic aortic valve grading (ASE 2024)` |
| 2026-11-04 | CH-12 | Discrepancy groups now include the topic: the same parameter has condition-specific thresholds (VC width in MR vs TR vs prosthetic AR were false positives) | `CH-12: compare discrepancies within a topic only` |
| 2026-11-04 | FT-03.7 | Prosthetic mitral valve (4.3) from ASE 2024: obstruction (Table 11), regurgitation (Table 13), PPM by indexed EOA and BMI (Table 7); 4 new parameters | `FT-03.7: prosthetic mitral valve grading (ASE 2024)` |
| 2026-11-04 | FT-03.7 | Prosthetic tricuspid & pulmonary valves (4.4) from ASE 2024: pulmonary stenosis by valve type (Table 15), prosthetic PR incl. CMR RF (Table 16, p. 36), tricuspid stenosis by valve type (Table 19), TR after TVR/repair (Table 21); 5 new parameters | `FT-03.7: prosthetic tricuspid and pulmonary valves (ASE 2024)` |
| 2026-11-04 | CH-13 | E2E tests served by tests/e2e/static-server.ts (base path, directory index, 404.html with status 404) instead of astro preview, which detached into the background locally | `CH-13: own static server for E2E tests` |
| 2026-11-04 | TS-04.7.3 | CT/CMR values carry a text badge with an accessible description in tables and threshold lists; echo is the unbadged default | `TS-04.7.3: modality badges for CT and CMR values` |
| 2026-11-04 | TS-04.2.3 | 'On this page' jump menu on leaves with several blocks; readable default headings per block type; stable block anchors | `TS-04.2.3: jump menu and block headings` |
| 2026-11-04 | TS-04.5.2 | Per-leaf review status badge (draft / in review / last reviewed date), optional lastReviewed topic field, content version (env/commit) and build date in the footer | `TS-04.5.2: review status and content version` |
| 2026-11-04 | TS-02.4.2 | History logic: withoutHistory removes superseded/withdrawn-source values from blocks; previousRecommendations lists them with year, status and current successor (cycle-safe chain); 100 % coverage | `TS-02.4.2: supersession history logic` |
| 2026-11-04 | TS-04.7.2 | Leaf view model (current values vs previous recommendations per block, gap flag); collapsed 'Previous recommendations' section with source, year and current successor; 'No current society-endorsed value' gap message | `TS-04.7.2: previous recommendations view` |
| 2026-11-04 | CH-14 | New quantity velocity-time-integral (unit cm, displayed in cm, never converted to mm) | `CH-14: velocity-time integral quantity` |
| 2026-11-04 | FT-03.5 | EAE/ASE 2009 valve stenosis (registered, PMID 19130998): tricuspid stenosis criteria (3.3.5, Table 10), pulmonary stenosis grading (3.4.1, Table 11), Wilkins score for PMC suitability (3.2.2.2, Table 5); MS classification deliberately not used (ASE note) | `FT-03.5: tricuspid/pulmonary stenosis and Wilkins score (EAE/ASE 2009)` |
| 2026-11-04 | FT-03.1 | Strain from ASE/EACVI 2025 consensus: LV GLS normal/borderline/abnormal, RV free-wall strain LLN by sex, LA reservoir strain limits (1.7, p. 995/1007); relative GLS decline >12% in cardio-oncology (11.2, p. 1000); 2 new parameters | `FT-03.1: myocardial strain and CTRCD surveillance (ASE 2025 strain)` |
| 2026-11-04 | FT-03.10 | HCM from ASE 2022 (registered, PMID 35659037): diagnostic wall thickness (6.2.1), LVOT/midventricular obstruction + provocation note (6.2.2), SCD imaging risk markers incl. CMR LGE (6.2.3), gradient threshold for septal reduction (6.2.4); 4 new parameters | `FT-03.10: hypertrophic cardiomyopathy imaging thresholds (ASE 2022)` |
| 2026-11-04 | FT-03.11 | Pericardial disease from ASE 2013 (registered, PMID 23998693): effusion size grading (7.1), tamponade respiratory variation + Table 6 signs (7.2), constriction findings incl. CT pericardial thickness and differentiation note (7.3); 6 new parameters | `FT-03.11: pericardial effusion, tamponade and constriction (ASE 2013)` |
| 2026-11-04 | TS-05.3.1 | Web app manifest endpoint (name/short_name Valvia, start_url and scope follow the base path, standalone, theme colours) and SVG icon (any + maskable) linked from every page | `TS-05.3.1: web app manifest and icon` |
| 2026-11-04 | TS-05.3.2 | Generated service worker precaching all pages, assets and Pagefind index (content-hash version, old caches removed, pages network-first, assets cache-first); registration script; offline E2E (pages + search in airplane mode) | `TS-05.3.2: service worker for offline use` |
| 2026-11-04 | TS-05.3.3 | 'New content available' status bar when an updated worker waits; Refresh activates it and reloads; no reload on first install (fixes a mid-test reload found by E2E) | `TS-05.3.3: update prompt for new content` |
| 2026-11-04 | TS-05.3.4 | Offline indicator ('Offline: showing saved content.') driven by navigator.onLine and online/offline events | `TS-05.3.4: offline indicator` |
| 2026-11-04 | TS-07.1.2 | About page: intended use (reference aid, not a medical device, no patient calculation), disclaimer incl. draft status, source policy, how values are shown, report-a-problem link; linked from every footer | `TS-07.1.2: intended use and disclaimer page` |
| 2026-11-04 | TS-03.0.2 | Content status page: per root category wave, topics with content / total leaves, draft / in review / reviewed counts, totals; linked from the footer | `TS-03.0.2: content status page` |
