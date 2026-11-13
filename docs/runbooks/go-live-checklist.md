# Go-live checklist

> **Purpose:** the gate between the draft beta and a public launch of Valvia (TS-08.8). Every box must be ticked, or
> explicitly waived by the product owner with a note in the [decision log](../decisions/README.md).
> **Audience:** product owner, engineer, SME. **Last updated:** 2026-11-13
> Boxes ticked below were verified on the date shown; everything else is open.

## 1. Regulatory and legal

- [ ] [EU MDR qualification memo](../safety/mdr-qualification.md) reviewed by a qualified regulatory adviser; outcome in the decision log (PO).
- [ ] Intended-use and disclaimer text on the About page reviewed together with the memo (TS-07.1.2 follow-up) (PO).
- [ ] [Copyright assessment](../safety/copyright-assessment.md) reviewed; permission requests sent where needed and answers recorded (PO, engineer).
- [ ] Privacy page matches the analytics actually enabled (TS-07.5.1, TS-08.5) (engineer).
- [ ] Name check done (domain, EUIPO trademark search) (TS-08.2) (PO).

## 2. Content

- [ ] SME review of every topic that will be published: topic `status: published` and `lastReviewed` set through content PRs ([content update runbook](content-update.md)) (SME).
- [ ] Pre-release content audit (TS-07.3.2): every value verified against the source; the SME spot-checks a random 10 % sample against the PDFs (SME).
- [ ] Hazards H1 and H5 in the [hazard log](../safety/hazard-log.md) moved to L1 after the review (engineer).
- [ ] Topics still in draft are either hidden or clearly labelled "Not yet clinically reviewed" (decision by PO).
- [ ] Open SME questions in the [taxonomy](../product/valvia-taxonomy.md) (e.g. F7) answered or their topics left empty (SME).
- [ ] Search-engine indexing enabled for published topics only (CH-59) (engineer).

## 3. Quality gates (automated, every push)

- [x] Unit tests with coverage ≥ 80 % globally, 100 % on safety-critical modules (`npm test`) — enforced in CI, 2026-11-13.
- [x] Content validation: schema, source allowlist, plausibility, discrepancies (`npm run validate:content`) — CI, 2026-11-13.
- [x] E2E at 360 px and desktop with axe WCAG 2.2 AA (`npm run test:e2e`) — CI, 2026-11-13.
- [x] Lighthouse budgets (NFR-02) blocking — CI, 2026-11-13.
- [x] Internal links in docs and the built site — CI, 2026-11-13.
- [ ] Manual screen-reader pass with VoiceOver and TalkBack (TS-07.4.1) (engineer).
- [ ] Real-device check on iOS Safari and Android Chrome, light and dark mode, offline after first visit (TS-05.1.1) (engineer).
- [ ] Closed beta: SME + 3–5 colleagues for 2 weeks, zero critical content defects (TS-08.7, R1 exit criterion) (PO).

## 4. Security

- [ ] Secret scanning and push protection enabled (TS-08.1) (engineer).
- [ ] Branch ruleset on `main`: no force pushes, required CI check, admin bypass only for emergency reverts; CI path guard rejects direct `/content/**` changes once the seed is complete (TS-01.3.5) (engineer).
- [ ] CODEOWNERS: `/content/**` → SME (TS-01.3.4; needs the SME's GitHub username) (engineer).
- [ ] 2FA on every GitHub account with write access, the registrar account and the analytics account ([secret rotation](secret-rotation.md)) (all).
- [x] Meta CSP without inline scripts; no third-party script except the optional analytics beacon (TS-07.5.1) — built site, 2026-11-13.

## 5. Operations

- [x] Custom domain `valvia-echo.se` serves the site (checked 2026-11-10).
- [ ] *Enforce HTTPS* ticked in *Settings → Pages*; `http://` and `www.` redirect to `https://valvia-echo.se/` (engineer).
- [ ] Uptime monitor on `https://valvia-echo.se/` with alerts to the engineer (TS-08.5) (engineer).
- [ ] Analytics enabled (or explicitly not) via repository variable (TS-08.5) (PO).
- [x] Runbooks for content update, emergency rollback and secret rotation ([runbooks](README.md)) — 2026-11-13.
- [ ] Rollback rehearsed once: revert a test commit and see it deployed, footer version updated (engineer).
- [ ] "Report an issue" link reaches someone who triages it (TS-06.5.1) (engineer).

## 6. Launch day

1. Confirm the last CI run on `main` is green and deployed; note the footer **content version**.
2. Open the home page, one leaf per category (Adults, Children, TEE, Stress echo), search, and the About page on a phone.
3. Announce to the beta group and the SME; share the report-an-issue route.
4. Record the launch in the [task plan](../TASK_PLAN.md) push log and the README status.

## 7. First two weeks

- Check reported issues daily; any wrong value with severity S3 → [emergency rollback](emergency-rollback.md) first.
- Review analytics and uptime weekly; review the hazard log after any incident.
