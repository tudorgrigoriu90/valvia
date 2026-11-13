import { describe, expect, it } from 'vitest';
import { ESCALATE_DAYS, OVERDUE_LABEL, REMIND_DAYS, staleActions, type PullRequestInfo } from './stale';

const pr = (overrides: Partial<PullRequestInfo> = {}): PullRequestInfo => ({
  number: 7,
  headRefName: 'content/3.2.1.2-primary-mr-grading',
  isDraft: false,
  createdAt: '2026-11-01T10:00:00Z',
  updatedAt: '2026-11-01T10:00:00Z',
  labels: [],
  ...overrides,
});

describe('staleActions (TS-06.3.3)', () => {
  it('uses a 7-day reminder and a 14-day escalation', () => {
    expect([REMIND_DAYS, ESCALATE_DAYS]).toEqual([7, 14]);
  });

  it('does nothing for a content PR updated less than 7 days ago', () => {
    expect(staleActions([pr({ updatedAt: '2026-11-05T10:00:00Z' })], '2026-11-11T09:00:00Z')).toEqual([]);
  });

  it('reminds when a content PR has had no activity for 7 days', () => {
    expect(staleActions([pr()], '2026-11-08T10:00:00Z')).toEqual([
      {
        number: 7,
        action: 'remind',
        comment:
          'This content PR has had no activity for 7 days. It is waiting for SME review (CLAUDE.md §3.2): please review it, or comment if it is blocked.',
      },
    ]);
  });

  it('escalates once a content PR has been open for 14 days, then only reminds', () => {
    const [action] = staleActions([pr({ updatedAt: '2026-11-10T00:00:00Z' })], '2026-11-15T10:00:00Z');
    expect(action).toMatchObject({ number: 7, action: 'escalate', label: OVERDUE_LABEL });
    expect(action?.comment).toMatch(/open for 14 days/);
    const labelled = pr({ labels: [{ name: OVERDUE_LABEL }], updatedAt: '2026-11-01T10:00:00Z' });
    expect(staleActions([labelled], '2026-11-15T10:00:00Z').map((a) => a.action)).toEqual(['remind']);
  });

  it('covers source registry PRs and ignores drafts and code branches', () => {
    const today = '2026-11-20T10:00:00Z';
    expect(staleActions([pr({ headRefName: 'source/ase-2026-x' })], today)).toHaveLength(1);
    expect(staleActions([pr({ isDraft: true })], today)).toEqual([]);
    expect(staleActions([pr({ headRefName: 'renovate/astro-7.x' })], today)).toEqual([]);
  });
});
