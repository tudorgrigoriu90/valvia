# Valvia: Task plan

> **Purpose:** single source of truth for task status and the push log. Updated in **every push** (see `CLAUDE.md` §9).
> **Audience:** Claude Code sessions, software engineer, product owner.
> **Last updated:** 2026-11-13
> **Task details and acceptance criteria:** [`product/valvia-backlog.md`](product/valvia-backlog.md)

Status values: `todo` · `in progress` · `done` · `blocked` (with reason) · `dropped` (with reason) · `manual` (engineer task; Claude prepares checklists and verifies where possible).

## Current status

| | |
|---|---|
| Release in progress | **R0: Walking skeleton** |
| Last completed | TS-07.3.1 Hazard log (wrong value, wrong unit or conversion, missing indexation, |
| Next up | TS-07.2.2: content policy |

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
| TS-01.2.4 | Renovate config with auto-merge for patch/minor on green CI | 1 | done | Engineer installs the Renovate app (manual) |
| TS-01.2.5 | PR templates: code PR; content PR (clinical change summary table, sources, preview link, reviewer checklist) | 1 | done | Also covers the TS-06.3.1 reviewer checklist |
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
| CH-15 | Inline critical CSS with CSP hashes to remove the render-blocking round-trip; make LCP ≤ 1.5 s blocking | 1 | done | LCP ~1.5 s on Lighthouse slow 4G (TS-05.2.1) |
| CH-16 | Fix: CI lint failed since TS-05.3.1 (Astro env types missing before build) | 0 | done | Local verify passed on a stale .astro/; now verified from a clean state |
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
| TS-02.1.3 | Stable ID & URL policy; static redirect pages on slug rename | 2 | done |  |
| TS-02.2.1 | Parameter schema: name, abbreviation, unit, modality, view/method note | 2 | done | Unit/quantity consistency enforced in TS-02.2.7 |
| TS-02.2.2 | Value schema: population qualifiers, grade, operator, value/range, unit, context, caveats, citation | 5 | done | Modality field added by TS-02.2.6; numeric plausibility in TS-02.2.4 |
| TS-02.2.3 | Content block types: grading table, normal range table, criteria checklist (favourable / challenging / unsuitable), threshold list, note, algorithm reference (link to source) | 3 | done |  |
| TS-02.2.4 | JSON Schema + generated TS types; plausibility checks (unit vs parameter, monotonic grades) | 3 | done | Generated types delivered in CH-4 |
| TS-02.2.5 | Paediatric qualifiers: `ageGroup` (adult / paediatric), age band, BSA band, z-score reference (as published, no computation) | 1 | done |  |
| TS-02.2.6 | Value-level `modality` (Echo / CT / CMR) | 1 | done |  |
| TS-02.2.7 | Unit layer: store as published, display in house units (NFR-15), original on tap; exhaustive conversion tests | 2 | done | 100 % coverage; display conversion superseded by PO-4 (CH-18): values shown as published, conversion used only for comparisons |
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
| TS-03.0.1 | Content YAML templates + content guide (modelling, citing, units, history, modality, paediatric values) | 2 | done |  |
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
| TS-04.3.4 | Discrepancy marker + side-by-side comparison view | 5 | done | E2E pending first ESC/ASE disagreement in content |
| TS-04.3.5 | Society filter toggle (localStorage, wrapped in try/catch) | 2 | done |  |
| TS-04.3.6 | Caveats/footnotes rendering (e.g. "not valid in AF") | 1 | done |  |
| TS-04.4.1 | Pagefind index incl. synonyms, abbreviations and valve models | 3 | done | Valve model names join with the prosthetic catalogue (TS-02.2.8) |
| TS-04.4.2 | Instant search UI (mobile keyboard friendly) | 2 | done |  |
| TS-04.5.1 | Stable deep links to topics and parameter anchors | 1 | todo |  |
| TS-04.5.2 | "Last reviewed" date and content version on every page | 1 | done |  |
| TS-04.6.1 | Last 10 viewed topics on home screen (localStorage) | 2 | todo |  |
| TS-04.7.1 | Adult / paediatric switch (global, persisted) | 2 | done | Replaced by the four-category switch (PO-5, CH-20) |
| TS-04.7.2 | "Previous recommendations" history view (source, year, superseded by) | 2 | done | E2E pending superseded content |
| TS-04.7.3 | Modality badges (Echo / CT / CMR) | 1 | done |  |
| TS-04.7.4 | Prosthetic valve picker (lookup only) | 3 | todo |  |

### EP-05: Mobile, performance & offline (MVP)

| Key | Summary | SP | Status | Notes |
|---|---|---|---|---|
| TS-05.1.1 | Breakpoints (360 / 768 / 1024) + real-device test matrix (iOS Safari, Android Chrome) | 3 | todo |  |
| TS-05.2.1 | Lighthouse CI budgets (LCP, JS weight, CLS) as blocking checks | 2 | done | LCP blocking after CH-15 |
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
| TS-07.3.1 | Hazard log (wrong value, wrong unit or conversion, missing indexation, adult value shown for a child, superseded value shown as current, wrong population) + mitigations | 2 | done |  |
| TS-07.3.2 | Pre-release content audit per wave: 100 % of values verified by the verification run and approved; SME spot-checks a random 10 % sample against the PDFs | 3 | todo |  |
| TS-07.4.1 | Manual screen-reader pass (VoiceOver, TalkBack) | 2 | todo |  |
| TS-07.4.2 | Playwright E2E at mobile viewport (browse, search, compare, history, adult/paediatric switch, prosthetic picker, offline) | 3 | todo |  |
| TS-07.5.1 | Cookieless analytics + privacy notice | 1 | done |  |

### EP-08: Engineer setup, release & operations (MVP)

| Key | Summary | SP | Status | Notes |
|---|---|---|---|---|
| TS-08.1 | Create public repo `valvia`; enable GitHub Pages (source: GitHub Actions); enable secret scanning + push protection | 1 | manual | Pages enabled (Source: GitHub Actions) and `gh-pages` deleted 2026-11-02; secret scanning/push protection still to confirm |
| TS-08.2 | Check name availability (domain, EUIPO trademark search); buy domain; DNS; custom domain on Pages; enforce HTTPS | 1 | manual | Domain `valvia-echo.se` bought at Loopia (2026-11-09); checklist in CH-29 |
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

## Change request 2026-11-09 (decisions PO-4 to PO-6)

The product owner asked on 2026-11-09 for three changes ([decision log](decisions/README.md)). All topics are still `status: draft`
and none has been SME-reviewed, so the content parts belong to the initial seed (PO-3) and are pushed to `main`.
Order: one push each, top to bottom (TS-07.5.1 was finished locally first and ships right after the plan update).

| Key | Summary | SP | Status | Notes |
|---|---|---|---|---|
| CH-17 | Plan update: record PO-4 to PO-6 and plan the tasks below | 0 | done |  |
| CH-18 | PO-4, units as published: show every value in the unit the guideline prints (no conversion to house units, no "original on tap"); the unit layer is kept only to compare values across sources for discrepancy detection; update `CLAUDE.md` §12, `docs/units.md`, content guide, about page, E2E | 2 | done | Supersedes NFR-15 house units and TS-02.2.7 display conversion |
| CH-19 | PO-5, schema: value-level `technique` (`TTE` default, `TEE`, `stress`; TEE and stress only with modality Echo); generated types; validation fixtures; content-model docs | 2 | done |  |
| CH-20 | PO-5, category switch: header switch Adults · Children · TEE · Stress echo (replaces Adults/Children); values, sections, topic lists and notices follow the chosen category (TTE values by age group, TEE and stress values by technique); stored on the device; E2E at 360 px and desktop, axe | 3 | done | Replaces the TS-04.7.1 switch |
| CH-21 | PO-5, taxonomy: add a top-level "Transoesophageal echocardiography (TEE)" branch; tag existing stress values (low-flow AS dobutamine stress, diastolic stress test) with `technique: stress` | 1 | done | No stress values existed to tag; stress content comes with CH-24/CH-25 |
| CH-22 | PO-6, content: abnormality grades (normal, mildly, moderately, severely abnormal) for chamber quantification where ASE/EACVI 2015 publishes them (LV size and volumes, LV mass, RV, LA/RA) | 2 | done | LA volume and LVEF already graded |
| CH-23 | PO-6, content: audit the other seeded leaves (right heart 2025, diastolic, strain, HCM, pericardial, prosthetic) for published mild/moderate/severe abnormality grades and add them | 2 | done | Only RV diastolic rows missing (source conflict, SME question F7) |
| CH-24 | PO-5, content: stress echo in ischaemic heart disease (ASE 2020 guideline) | 3 | done | Taxonomy 9.1 |
| CH-25 | PO-5, content: stress echo in non-ischaemic heart disease (EACVI/ASE 2017 recommendations): valvular, diastolic, pulmonary pressure, HCM | 3 | done | Taxonomy 9.2–9.4 |
| CH-26 | PO-5, content: TEE, cardiac source of embolism (ASE 2016 guideline): LAA, atrial septum, aortic atheroma | 2 | done |  |
| CH-27 | PO-5, content: TEE, regurgitation after percutaneous valve repair or replacement (ASE 2019) and intraprocedural TEER imaging | 3 | done |  |
| CH-28 | PO-5, content: TEE screening before structural heart interventions (ASE) | 2 | done | Only values the document publishes |
| CH-30 | Strengthen the discrepancy test 'keeps different populations, grades, contexts and modalities apart': its overrides change `value` but not the published text that is compared, so it passes trivially | 0 | done | Found during CH-19 |
| CH-31 | Fix: E2E tests hard-coded the `/valvia/` base path; CI red once `VALVIA_BASE=/` was set for the custom domain | 0 | done | Found on CI run of CH-30 |
| CH-29 | TS-08.2 checklist: custom domain `valvia-echo.se` (Loopia DNS → GitHub Pages, `VALVIA_SITE`/`VALVIA_BASE` variables) in `docs/ci-cd.md` | 0 | done | Engineer performs the DNS change (`manual`) |

## Content batch 2026-11-10 (ASE documents for the empty categories)

The product owner asked for more content (2026-11-10). Initial seed rules apply (PO-3: `status: draft`, values only from
documents read in the session, one subcategory per push). Order: Children first (the category is still empty), then
the empty adult categories. ESC/EACVI-only documents still wait for PDFs supplied by a person.

| Key | Summary | SP | Status | Notes |
|---|---|---|---|---|
| CH-32 | Plan update: content batch 2026-11-10 | 0 | done |  |
| CH-33 | Content: rheumatic heart disease (ASE 2023 guideline): echo criteria in children and adults | 2 | done | Children + valves |
| CH-34 | Content: targeted neonatal echocardiography (ASE 2024): neonatal cut-offs | 2 | done | Children (15.x) |
| CH-35 | Content: cardiac surveillance in paediatric cancer (ASE 2023) | 2 | done | Children + cardio-oncology |
| CH-36 | Content: thoracic aorta in adults (ASE/EACVI 2015): normal dimensions and thresholds | 2 | done | Aortic disease (10.x) |
| CH-37 | Content: repaired tetralogy of Fallot (ASE 2014) | 2 | done | Congenital (8.x) |
| CH-38 | Content: transposition of the great arteries (ASE 2016) | 2 | done | Congenital (8.x) |
| CH-39 | Content: ASD and PFO (ASE 2015) | 1 | done | Congenital (8.x) + TEE |
| CH-40 | Content: adult cancer therapy (ASE/EACVI 2014) | 2 | done | Cardio-oncology (11.x); check overlap with ASE 2025 strain |
| CH-41 | Content: echocardiography in adult hypertension (ASE/EACVI 2015) | 1 | done |  |
| CH-42 | Content: LVAD and temporary mechanical support (ASE 2024 update; the 2015 document is superseded) | 2 | done | Heart failure |
| CH-43 | Content: young adult competitive athletes (ASE 2020) | 1 | done | Special populations |

## Content batch 2026-11-13 (empty leaves from documents already obtained)

The product owner asked to continue until nothing is left (2026-11-13). Initial seed rules (PO-3). Each push fills one
subcategory from a document already downloaded from asecho.org; leaves that need ESC/EACVI-only documents stay empty.

| Key | Summary | SP | Status | Notes |
|---|---|---|---|---|
| CH-44 | Plan update: content batch 2026-11-13 | 0 | done |  |
| CH-45 | Content: PH and right heart (5.x) from ASE 2025 right heart: PH definitions, echo probability, RV–PA coupling | 2 | done |  |
| CH-46 | Content: IVC and RA pressure (1.6) from ASE 2025 right heart | 1 | done |  |
| CH-47 | Content: diastolic special populations, HFpEF and diastolic stress (2.3–2.5) from ASE 2025 diastolic | 2 | done |  |
| CH-48 | Content: aortic stenosis sub-leaves (3.1.1.2–3.1.1.5) from EACVI/ASE 2017 | 2 | done |  |
| CH-49 | Content: MR/TR mechanism and secondary MR (3.2.1, 3.3.1) from ASE 2017 native regurgitation | 2 | done |  |
| CH-50 | Content: regurgitation after transcatheter interventions (4.5) from ASE 2019 | 2 | done |  |
| CH-51 | Content: prosthetic reference values by model and size (4.1) from ASE 2024 appendix | 3 | blocked | Values are mean ± SD per model and size: needs the catalogue schema (TS-02.2.8) and the copyright assessment of appendix tables (TS-07.2.1) first |
| CH-52 | Content: masses and thrombus (12.1–12.3) from ASE 2016 embolism | 1 | done |  |
| CH-53 | Content: endocarditis (3.6) from ASE 2016 embolism | 1 | done |  |
| CH-54 | Content: cardiomyopathies (6.x) from ASE 2025 strain and others | 2 | done |  |
| CH-55 | Content: coarctation and acute aortic syndromes (8.6, 10.3) from ASE/EACVI 2015 aorta | 1 | done |  |
| CH-56 | Content: paediatric z-scores and HCM in children (15.x) | 1 | done |  |
| CH-58 | Units and quantities for values printed in mm/mmHg (RV–PA coupling), Wood units (PVR), g/m (LV mass/height), cm/s² (accelerations) and mL/min/kg (indexed flow) | 1 | done | Needed by CH-45 and earlier deferred values |
| CH-57 | Content: contrast echocardiography (9.5) from ASE 2018 UEA update | 1 | done |  |

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
| 2026-11-04 | TS-01.2.5 | Content PR template: clinical change summary table, sources and acquisition, SME reviewer checklist (values, population, units, modality, discrepancies, history, locators), checks | `TS-01.2.5: content PR template with reviewer checklist` |
| 2026-11-04 | TS-01.2.4 | renovate.json: weekly schedule, auto-merge patch/minor/pin/digest on green CI, majors manual, Playwright pinned, ESLint group; setup steps in CI/CD doc | `TS-01.2.4: Renovate configuration` |
| 2026-11-04 | TS-03.0.1 | Content guide: workflow diagram (seed vs PR), source rules, table-reading pitfalls learned (image tables, lost signs, exclusive bounds, strata, magnitudes), leaf template, pre-push checks | `TS-03.0.1: content guide` |
| 2026-11-04 | TS-05.2.1 | Lighthouse CI on home + two leaves (mobile): performance ≥ 0.95, CLS ≤ 0.1, JS ≤ 50 KB blocking; LCP ≤ 1.5 s warning pending CH-15; CI step + report artefact | `TS-05.2.1: Lighthouse budgets in CI` |
| 2026-11-04 | CH-15 | Stylesheet inlined (Astro inlineStylesheets always) with per-page SHA-256 hashes added to CSP style-src by pipeline/csp; LCP ≤ 1.5 s now a blocking Lighthouse assertion; CSP E2E checks hashes | `CH-15: inline critical CSS with CSP hashes` |
| 2026-11-04 | TS-04.7.1 | Adults/Children switch in the header (aria-pressed, persisted in localStorage with try/catch); values, sections and topic links tagged by population and hidden by CSS; notice when a page has no values for the chosen population | `TS-04.7.1: adult/paediatric switch` |
| 2026-11-04 | CH-16 | lint runs astro sync first so import.meta.env types exist in CI; local gate now deletes .astro/ and dist/ before verify | `CH-16: generate Astro types before lint (CI red since TS-05.3.1)` |
| 2026-11-04 | TS-04.3.5 | Society filter (All / ESC/EACVI / ASE) on leaf pages, persisted on the device with try/catch; values tagged with society groups from source issuers (joint documents count for both) | `TS-04.3.5: society filter` |
| 2026-11-04 | TS-04.3.4 | Leaf view maps values to topic discrepancies: ≠ marker (text + screen-reader label) on differing values and a 'Differs between sources' side-by-side panel per block; no value preferred | `TS-04.3.4: discrepancy marker and side-by-side comparison` |
| 2026-11-04 | TS-02.1.3 | Redirects for renamed slugs: core/navigation/redirects computes old→new URLs for visible nodes and descendants; post-build step writes meta-refresh pages (canonical, noindex, strict CSP, visible link) | `TS-02.1.3: static redirects for renamed slugs` |
| 2026-11-09 | CH-17 | Record PO-4 (units as published), PO-5 (Adults/Children/TEE/Stress echo categories), PO-6 (mild/moderate/severe abnormality grades) and plan CH-18 to CH-29; TS-08.2 domain note | `CH-17: plan units as published, TEE and stress categories, grades` |
| 2026-11-09 | TS-07.5.1 | Opt-in cookieless analytics (GoatCounter or Cloudflare via repository variable; validated, CSP admits only its origins; CSP moved to core/site/analytics.ts) and privacy page linked from every footer; E2E for link, no third-party script/cookies by default, axe | `TS-07.5.1: opt-in cookieless analytics and privacy notice` |
| 2026-11-09 | CH-18 | Values shown with the number and unit printed in the guideline (PO-4): no display conversion or original popover; parameters published in two units get one row per unit; core/units converts only for comparisons (discrepancies, plausibility); docs, schema descriptions, about page, E2E | `CH-18: show values in the units printed in the guidelines` |
| 2026-11-09 | CH-19 | Optional value field technique (TTE default, TEE, stress; TEE/stress only with modality Echo) in schema and generated types; discrepancies never compare across techniques; content-model docs | `CH-19: value-level technique (TTE, TEE, stress)` |
| 2026-11-09 | CH-20 | Header switch Adults · Children · TEE · Stress echo (PO-5) replaces Adults/Children: values, sections, topic lists and category cards (with per-category counts) follow the chosen category; per-category notices on leaf and home pages; choice stored on the device (old paediatric choice honoured); core/population/category.ts at 100 %; E2E incl. 360 px and axe | `CH-20: category switch Adults, Children, TEE, Stress echo` |
| 2026-11-09 | CH-21 | Taxonomy section 16 TEE (top-level node + 6 leaves: LAA, interatrial septum, aortic atheroma, residual regurgitation after transcatheter interventions, TEE guidance, structural screening) with cross-links; draft, hidden until populated; status E2E no longer hard-codes the root count | `CH-21: add the TEE branch to the taxonomy` |
| 2026-11-09 | CH-22 | Abnormality grades (normal, mildly, moderately, severely abnormal) by sex from ASE/EACVI 2015 Supplemental Table 3 (p. 39.e8): LV diameters, indexed diameters, volumes, indexed volumes; wall thickness and LV mass (linear and 2D); new parameters lvedd-index, lvesd-index | `CH-22: add LV size and mass severity partitions (ASE/EACVI 2015)` |
| 2026-11-09 | CH-23 | Audit of all seeded sources for published mild/moderate/severe grades: right heart 2025 Table 1, prosthetic 2024 Tables 8/13/16/21, native regurgitation 2017 and stenosis tables already entered; strain, HCM, pericardial and diastolic documents publish none; RV diastolic rows of right heart Table 1 not entered (conflict with Table 6), SME question F7; F4 resolved by PO-4 | `CH-23: audit severity grades; flag RV diastolic grading for the SME` |
| 2026-11-09 | CH-24 | Stress echo in ischaemic heart disease (ASE 2020, technique: stress): wall motion scoring by systolic thickening, WMSI note, scar criterion (≤ 6 mm), adequate stress (85% APMHR, 80% workload), risk by peak WMSI and RV WMSI, viability (contractile reserve in 4–5 segments); 7 parameters; E2E for the Stress echo category | `CH-24: stress echo in ischaemic heart disease (ASE 2020)` |
| 2026-11-09 | CH-25 | Stress echo in non-ischaemic heart disease (EACVI/ASE 2017 JASE, technique: stress): low-flow AS (flow reserve, true vs pseudo-severe, projected AVA note, Figure 17 link), valvular cut-offs (Table 2), diastolic stress test (normal/abnormal, SPAP limits, adverse markers), new leaf 9.6 cardiomyopathies/HF (LVOT, ΔWMSI, ΔLVEF, B-lines, CFR); source re-registered as the JASE 2017 publication; 10 parameters | `CH-25: stress echo in non-ischaemic heart disease (EACVI/ASE 2017)` |
| 2026-11-09 | CH-26 | TEE content from ASE 2016 cardiac source of embolism (technique: TEE): LAA peak flow velocity ≤ 27 cm/s + assessment note; aortic plaque ≥ 4 mm + views note; atrial septal aneurysm excursion ≥ 15 mm and large shunt > 20 bubbles; source registered from PubMed; 4 parameters; E2E for the TEE category | `CH-26: TEE values for cardiac sources of embolism (ASE 2016)` |
| 2026-11-09 | CH-27 | TEE content for transcatheter mitral interventions (technique: TEE): ASE 2026 M-TEER (anatomic suitability grades for MVA, gradient, posterior leaflet length; qualitative suitability checklist; morphology by MR mechanism; before/after deployment targets; leaflet length by device; additional-device note) and ASE 2019 Table 5 (VCW ≥ 0.7 cm, qualitative residual MR signs); 2 sources from PubMed; 6 parameters | `CH-27: TEE values for M-TEER and residual MR (ASE 2026, ASE 2019)` |
| 2026-11-09 | CH-28 | TEE screening before structural interventions (ASE 2022, technique: TEE): mitral prolapse ≥ 2 mm, aortic arch end-diastolic reversal > 20 cm/s, Ebstein > 8 mm/m², ASD rim < 5 mm; septal evaluation note; source from PubMed; 4 parameters | `CH-28: TEE screening criteria before structural interventions (ASE 2022)` |
| 2026-11-09 | CH-29 | Custom domain checklist for valvia-echo.se in docs/ci-cd.md: GitHub domain verification, Loopia DNS records (verified live), Pages custom domain + HTTPS, VALVIA_SITE/VALVIA_BASE variables, checks; diagram | `CH-29: document the valvia-echo.se custom domain setup` |
| 2026-11-09 | CH-30 | Discrepancy separation test now changes the published text that is compared, with a control case and one case per field (population, sex, grade, context, modality); mutation check: dropping modality from the grouping key now fails the test | `CH-30: make the discrepancy separation test meaningful` |
| 2026-11-09 | CH-31 | E2E (manifest, icon, search URL) and Lighthouse URLs derive the base path from VALVIA_BASE instead of hard-coding /valvia/; CI was red once VALVIA_BASE=/ was set for valvia-echo.se. Verified: 112 E2E pass and Lighthouse budgets pass with VALVIA_BASE=/; default base still verified | `CH-31: derive the base path in E2E and Lighthouse from VALVIA_BASE` |
| 2026-11-10 | CH-32 | Plan the 2026-11-10 content batch: 11 ASE documents (RHD, neonatal, paediatric oncology, thoracic aorta, rTOF, TGA, ASD/PFO, adult cancer therapy, hypertension, LVAD, athletes), Children first | `CH-32: plan the next content batch (Children first)` |
| 2026-11-10 | CH-33 | Rheumatic heart disease (ASE 2023): MS severity Table 1 (MVA, PHT, mean gradient, SPAP) in the rheumatic MS leaf; new leaf 3.7 with carditis criteria (MR/AR > 3 m/s) and pathological MR (jet ≥ 2 cm, ≥ 3 m/s) for adults and children, children's trace-regurgitation note, morphology note; first Children values; E2E for the Children category | `CH-33: rheumatic heart disease criteria and MS grading (ASE 2023)` |
| 2026-11-10 | CH-34 | Targeted neonatal echocardiography (ASE 2024): new leaf 15.6 with neonatal normal values from Table 3 (LVEF, FS, LA/Ao, RV FAC, systolic EI, RVET/PAAT, PAAT/RVET, branch PA diastolic velocity), GA-dependent note, suprasystemic PAP (≥ 60% right-to-left ductal flow) and pulmonary vein velocity > 1.0 m/s; 9 parameters; taxonomy doc lists 3.7 and 15.6 | `CH-34: neonatal normal values and haemodynamics (ASE 2024 TNE)` |
| 2026-11-10 | CH-35 | Paediatric cancer surveillance (ASE 2023): children's LVEF (≥ 55 / 50–54 / < 50%) and GLS (≤ −18 / −17 to −16 / > −16%) grading with follow-up caveats in the CTRCD leaf, EF-not-FS note, LA volume index < 34 mL/m² for children after anthracyclines; both leaves now population both | `CH-35: children's LV function grading in cancer surveillance (ASE 2023)` |
| 2026-11-10 | CH-36 | Thoracic aorta (ASE/EACVI 2015): aortic root ULN by sex and age band (Tables 1–2, BSA 2.0/1.7 m² with the published adjustment as caveat), CT/MRI upper limits (badged), age/sex/athlete note; atheroma severity grading (Table 26) with complex-atheroma note; 6 parameters | `CH-36: normal aortic dimensions and atheroma grading (ASE/EACVI 2015)` |
| 2026-11-10 | CH-37 | Repaired tetralogy of Fallot (ASE 2014): RVOT obstruction grading (velocity/gradient), Doppler predictors of severe/significant PR (jet ≥ 50% annulus, ratio > 0.7, PR index < 0.77, PHT < 100 ms) for adults and children, free-PR note, CMR surveillance triggers (RV EDVi ≥ 150, increase > 25 mL/m², RV EF ≤ 48% or ≥ 6% fall, badged CMR) and interval note; 4 parameters | `CH-37: repaired tetralogy of Fallot criteria (ASE 2014)` |
| 2026-11-10 | CH-38 | Transposition of the great arteries (ASE 2016): branch PA peak velocity < 2 m/s after the arterial switch, systemic RV after the atrial switch (FAC < 33% for CMR RV EF < 50%; RV GLS worse than −14% for RV EF < 45%), TR interpretation note; adults and children | `CH-38: transposition criteria after arterial and atrial switch (ASE 2016)` |
| 2026-11-10 | CH-39 | ASD and PFO (ASE/SCAI 2015): ASD rims ≥ 5 mm favourable and < 5 mm deficient (TEE), small ASD < 5 mm without RV enlargement or PH needs no closure, TTE/TEE note; atrial septal aneurysm (> 10 mm, total > 15 mm) in the PFO leaf; adults and children | `CH-39: ASD rims, small ASD and atrial septal aneurysm (ASE 2015)` |
| 2026-11-10 | CH-40 | Adult cancer therapy (ASE/EACVI 2014 consensus, JASE version): CTRCD as LVEF decrease > 10 points to < 53%, GLS relative reduction > 15% very likely abnormal and < 8% not significant, with confirmation caveats; shown alongside the ASE 2025 strain threshold (different context) | `CH-40: CTRCD definition and GLS change (ASE/EACVI 2014)` |
| 2026-11-10 | CH-41 | Hypertension (EACVI/ASE 2015, JASE version): LV mass/height^2.7 and RWT severity grades by sex (Table 3, RWT stored as a ratio with the source's 'cm' label as caveat), 3D LV mass index references (European, Japanese), LV geometry classes (Table 5); 2 parameters | `CH-41: LV mass/height^2.7, RWT grades and geometry (EACVI/ASE 2015)` |
| 2026-11-10 | CH-42 | LVAD and temporary mechanical support (ASE 2024, which updates the 2015 document): new leaf 6.10 with pre-implant risk markers (LVEF < 25%, LVIDd < 5.5 cm, TV annulus ≥ 41 mm), AR on support (outflow S/D < 5.0), excessive unloading (LV < 3 cm), recovery on LVAD, TMCS and VA ECMO weaning criteria, examination note; 4 parameters | `CH-42: LVAD and temporary mechanical support criteria (ASE 2024)` |
| 2026-11-10 | CH-43 | Young adult competitive athletes (ASE 2020): LV wall thickness > 15 mm suggests pathology (13–15 mm possible with exercise remodelling), aortic sinus/ascending aorta ≥ 40 mm (men) / ≥ 34 mm (women) uncommon → CTA/CMR, compacted layer < 5 mm with hypertrabeculation, nomogram note; 1 parameter | `CH-43: athlete's heart thresholds (ASE 2020)` |
| 2026-11-13 | CH-44 | Plan the 2026-11-13 content batch (CH-45 to CH-57): empty leaves fillable from ASE documents already obtained | `CH-44: plan the remaining content from obtained documents` |
| 2026-11-13 | CH-58 | Schema and unit layer support values printed in mm/mmHg (coupling-ratio), WU (vascular-resistance), g/m (mass-per-height), mL/min/kg (indexed-flow-rate) and cm/s² (acceleration, exact shift to m/s²); generated types; units doc; tests | `CH-58: add units for coupling ratio, Wood units, g/m, cm/s², mL/min/kg` |
| 2026-11-13 | CH-45 | PH and right heart (ASE 2025 right heart): haemodynamic PH definitions as a note (5.1), abnormal RVSP and supporting signs for pre- vs postcapillary PH from Table 8 (5.2), TAPSE/PASP normal, uncoupling and PAH thresholds in mm/mmHg (5.3); 4 parameters | `CH-45: PH definitions, echo signs and TAPSE/PASP (ASE 2025)` |
| 2026-11-13 | CH-46 | IVC and RA pressure (ASE 2025 right heart): RAP 3/8/15/20 mmHg from IVC size and collapse (Table 4) as a checklist with values; IVC ≤ 2.1 cm in ventilated patients; 1 parameter | `CH-46: RA pressure from IVC size and collapse (ASE 2025)` |
| 2026-11-13 | CH-47 | Diastolic function (ASE 2025): special populations Table 7 (AF, sinus tachycardia, HCM, restrictive, PH, MS, MR, MAC, LVAD, transplant; 10 blocks); HFpEF echo components (Table 8, ESC criteria as summarised), H2FPEF score definition, HFpEF algorithm link; diastolic exercise echo criteria (technique: stress); 9 parameters | `CH-47: diastolic special populations, HFpEF and exercise criteria (ASE 2025)` |
| 2026-11-13 | CH-48 | Aortic stenosis sub-leaves (EACVI/ASE 2017): classical LFLG definition, low-dose DSE criteria (technique: stress) and protocol note; paradoxical LFLG with Table 5 criteria incl. CT calcium score by sex; discordant grading flow status (SVi 35) and stepwise note; asymptomatic severe AS decision markers (> 5.5 m/s, exercise gradient rise > 20 mmHg) and progression note; 2 parameters | `CH-48: low-flow, discordant and asymptomatic AS criteria (EACVI/ASE 2017)` |
| 2026-11-13 | CH-49 | MR/TR mechanism and secondary MR (ASE 2017 native regurgitation): MVP ≥ 2 mm (PLAX), MR aetiology checklist (Table 5), mechanism note; secondary MR EROA ≥ 0.4 and ≥ 0.3 cm² (2D PISA) with considerations note; TR aetiology checklist (Table 12) | `CH-49: MR/TR aetiology, MVP and secondary MR EROA (ASE 2017)` |
| 2026-11-13 | CH-50 | Regurgitation after transcatheter interventions (ASE 2019): residual MR grading after transcatheter MV interventions (Table 7: VCW, VCA, EROA, RVol, RF, PISA radius) with integrative note in 4.5.1; residual TR grading after tricuspid interventions (Table 9: VC, PISA radius, EROA, RVol) with qualitative note in 4.5.2 | `CH-50: residual MR and TR grading after transcatheter repair (ASE 2019)` |
| 2026-11-13 | CH-52 | Masses and thrombus (ASE 2016 embolism): LV thrombus and LA/LAA thrombus recommendations (recommended / potentially useful / not recommended) and timing note; small valve masses (Lambl's excrescences ≤ 2 mm × 3–10 mm, papillary fibroelastoma < 20 mm, Libman-Sacks 1–4 mm); CH-51 marked blocked | `CH-52: thrombus and small-mass criteria (ASE 2016)` |
| 2026-11-13 | CH-53 | Endocarditis (ASE 2016 embolism): vegetation/abscess features (Table 5) and TTE vs TEE note (Table 4) in 3.6.1; vegetation size > 10 mm and > 15 mm with embolic predictors (Table 6) in 3.6.2; TTE/TEE recommendations in 3.6.3; 1 parameter | `CH-53: endocarditis features, vegetation size and TTE/TEE use (ASE 2016)` |
| 2026-11-13 | CH-54 | Cardiomyopathies: HFrEF LVEF < 40% and GLS abnormal/borderline as stage B HF marker (6.1), apical sparing ratio > 2 for amyloidosis and strain-pattern note (6.5), ARVC RV strain patterns note (6.4) from ASE 2025 strain; LVH thresholds by sex in g/m² and g/m^2.7 (6.7) from EACVI/ASE 2015 hypertension; 1 parameter | `CH-54: HF strain markers, amyloid apical sparing, LVH thresholds` |
| 2026-11-13 | CH-55 | Acute aortic syndromes (ASE/EACVI 2015): dissection definitions (Table 7), IMH wall thickness > 0.5 cm with Table 11 features, TTE/TEE note (10.3); coarctation key points (Table 25, 8.6); 1 parameter | `CH-55: aortic dissection, IMH and coarctation criteria (ASE/EACVI 2015)` |
| 2026-11-13 | CH-56 | Paediatric: z-score normal limits (−2 to +2) and z-score model note (ASE 2024 paediatric TTE, registered from PubMed via E-utilities) in 15.1; HCM in children (wall thickness z > 2) and phenocopy note (ASE 2022 HCM) in 15.5; 2 parameters | `CH-56: paediatric z-score limits and HCM in children` |
| 2026-11-13 | CH-57 | Contrast echocardiography (ASE 2018 UEA update, registered from PubMed via E-utilities): ≥ 2 non-visualised LV segments as the indication at rest and during stress (technique: stress), key recommendations (quantitative LVEF, flash, volumes caveat, injection technique); 1 parameter | `CH-57: contrast echo indications (ASE 2018)` |
| 2026-11-13 | TS-07.3.1 | Hazard log (docs/safety/hazard-log.md): 14 hazards (wrong value, unit, indexation, adult/child, qualifiers, superseded, hidden disagreement, TEE/stress, modality, draft status, offline staleness, citation, non-society source, calculation) with severity, controls, linked verification and residual risk | `TS-07.3.1: hazard log with controls and verification` |
