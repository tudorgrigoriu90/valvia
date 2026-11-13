# Runbook: secret rotation

> **Purpose:** inventory of credentials used by Valvia and how to rotate or revoke each (TS-08.6).
> **Audience:** engineer (repository admin). **Last updated:** 2026-11-13
> **Rule:** no secrets in the repository ([`CLAUDE.md`](../../CLAUDE.md) §13). Secrets live only in GitHub Actions
> secrets or the provider's own account, with the least privilege that works.

## Inventory

| Credential | Where it lives | Used by | Status |
|---|---|---|---|
| `GITHUB_TOKEN` | Issued per workflow run by GitHub | CI, deploy (`pages: write`, `id-token: write` in the deploy job only) | Automatic; nothing to rotate |
| Claude Code GitHub Action credential (API key or OAuth token) | Repository secret | Content drafting and verification run (EP-06) | Not set up yet (TS-08.3) |
| `VALVIA_GOATCOUNTER` / `VALVIA_CF_BEACON_TOKEN` | Repository **variables** | Analytics beacon | Public by design (shipped in the page); not secrets |
| `VALVIA_SITE`, `VALVIA_BASE` | Repository variables | Build | Not secrets |
| Renovate | GitHub App installation | Dependency PRs | Managed by the app; no token in the repo |
| GitHub accounts (engineer, SME) | GitHub | Push, approvals | 2FA required |
| Domain registrar account (Loopia) | Registrar | DNS for `valvia-echo.se` | 2FA recommended; DNS changes break the site |
| Analytics and uptime accounts | Provider | TS-08.5 | 2FA recommended |

## Routine rotation (Claude Code credential)

At least every 12 months, or when the provider's key expires:

1. Create a new key in the provider's console, with a monthly spending limit.
2. *Settings → Secrets and variables → Actions → Secrets*: update the secret value (same name).
3. Trigger a run that uses it (e.g. *Run workflow* on the drafting workflow) and check it succeeds.
4. Revoke the old key in the provider's console.
5. Record the date in the task plan push log (`CH-<n>`), never the value.

## Suspected leak

1. **Revoke first**: delete the key at the provider (and the repository secret) immediately; don't wait for a replacement.
2. Check the provider's usage log for calls you don't recognise; note the time window.
3. If the leak was a commit: secret scanning alerts (*Security → Secret scanning*) show where. Rewriting history is not
   enough (forks and caches keep it); revocation is what protects you.
4. Issue a new key and update the secret (steps above).
5. Record what happened and the cause, and add a control (e.g. push protection, narrower token scope).

## When a person leaves

Remove their repository access, rotate any credential they could read (repository secrets are not readable after
saving, but provider console keys may be), and transfer registrar and analytics account ownership if needed.
