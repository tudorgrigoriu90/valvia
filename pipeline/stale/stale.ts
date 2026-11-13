/**
 * Stale content PR reminders (TS-06.3.3): content PRs wait for the SME, the only approver. After 7 days without
 * activity the PR gets a reminder comment; after 14 days open it is labelled `review-overdue` once, so the engineer
 * can follow up. The reminder comment itself counts as activity, so reminders repeat at most weekly.
 */
export const REMIND_DAYS = 7;
export const ESCALATE_DAYS = 14;
export const OVERDUE_LABEL = 'review-overdue';

export interface PullRequestInfo {
  number: number;
  headRefName: string;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  labels: { name: string }[];
}

export interface StaleAction {
  number: number;
  action: 'remind' | 'escalate';
  comment: string;
  label?: string;
}

const DAY = 24 * 60 * 60 * 1000;
const daysBetween = (from: string, to: string): number => Math.floor((Date.parse(to) - Date.parse(from)) / DAY);
const isContentPr = (pr: PullRequestInfo): boolean => /^(content|source)\//.test(pr.headRefName) && !pr.isDraft;

export function staleActions(prs: readonly PullRequestInfo[], now: string): StaleAction[] {
  const actions: StaleAction[] = [];
  for (const pr of prs.filter(isContentPr)) {
    const open = daysBetween(pr.createdAt, now);
    const idle = daysBetween(pr.updatedAt, now);
    if (open >= ESCALATE_DAYS && !pr.labels.some((label) => label.name === OVERDUE_LABEL)) {
      actions.push({
        number: pr.number,
        action: 'escalate',
        label: OVERDUE_LABEL,
        comment: `This content PR has been open for ${String(open)} days without being merged. Labelled \`${OVERDUE_LABEL}\` for the engineer to follow up with the SME (runbook: docs/runbooks/content-update.md).`,
      });
    } else if (idle >= REMIND_DAYS) {
      actions.push({
        number: pr.number,
        action: 'remind',
        comment: `This content PR has had no activity for ${String(idle)} days. It is waiting for SME review (CLAUDE.md §3.2): please review it, or comment if it is blocked.`,
      });
    }
  }
  return actions;
}
