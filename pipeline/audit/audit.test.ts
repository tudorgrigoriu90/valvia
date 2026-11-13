import { describe, expect, it } from 'vitest';
import { CHANGELOG_TEMPLATE, auditEntry, recordEntry, type PullRequest, type Review } from './audit';

const pr: PullRequest = {
  number: 12,
  title: 'Content: primary MR grading | ASE 2017',
  html_url: 'https://github.com/o/r/pull/12',
  merged_at: '2026-11-20T14:03:09Z',
  merged_by: { login: 'sme-login' },
};
const review = (login: string, state: string, submitted_at: string): Review => ({
  user: { login },
  state,
  submitted_at,
});
const files = [
  'content/topics/primary-mr-severity-grading.yaml',
  'content/sources/ase-2017-native-regurgitation.yaml',
  'content/parameters/eroa.yaml',
  'README.md',
];

describe('auditEntry (TS-06.4.2)', () => {
  it('records the merge time, approvers, merger, sources and topics of a merged content PR', () => {
    const entry = auditEntry(pr, [review('sme-login', 'APPROVED', '2026-11-20T13:58:00Z')], files);
    expect(entry).toEqual({
      number: 12,
      row:
        '| 2026-11-20 14:03 UTC | [#12](https://github.com/o/r/pull/12) Content: primary MR grading \\| ASE 2017 ' +
        '| sme-login (2026-11-20 13:58 UTC) | sme-login | ase-2017-native-regurgitation | primary-mr-severity-grading |',
    });
  });

  it('keeps only the latest review per reviewer and lists approvals only', () => {
    const entry = auditEntry(
      pr,
      [
        review('sme-login', 'APPROVED', '2026-11-19T10:00:00Z'),
        review('sme-login', 'CHANGES_REQUESTED', '2026-11-19T12:00:00Z'),
        review('sme-login', 'APPROVED', '2026-11-20T13:58:00Z'),
        review('engineer', 'COMMENTED', '2026-11-20T13:00:00Z'),
        review('other', 'CHANGES_REQUESTED', '2026-11-20T09:00:00Z'),
      ],
      files,
    );
    expect(entry?.row).toContain('| sme-login (2026-11-20 13:58 UTC) |');
    expect(entry?.row).not.toContain('engineer');
  });

  it('marks a merge without approval so it stands out in the audit', () => {
    expect(auditEntry(pr, [], files)?.row).toContain('| **none** |');
  });

  it('ignores PRs that were not merged or change no content YAML', () => {
    expect(auditEntry({ ...pr, merged_at: null }, [], files)).toBeUndefined();
    expect(auditEntry(pr, [], ['README.md', 'content/README.md'])).toBeUndefined();
  });

  it('flattens line breaks and escapes table pipes in the untrusted title', () => {
    const entry = auditEntry({ ...pr, title: 'a\nb | c\r\n<script>' }, [], files);
    expect(entry?.row).toContain('a b \\| c &lt;script&gt;');
  });

  it('shows a dash when GitHub reports no merger', () => {
    expect(auditEntry({ ...pr, merged_by: null }, [], files)?.row).toContain('| **none** | — |');
  });

  it('shows a dash when no source or topic file changed', () => {
    expect(auditEntry(pr, [], ['content/parameters/eroa.yaml'])?.row).toMatch(/\| — \| — \|$/);
  });
});

describe('recordEntry', () => {
  const entry = { number: 12, row: '| row 12 |' };

  it('adds the row at the top of the log, under the table header', () => {
    const once = recordEntry(CHANGELOG_TEMPLATE, entry);
    const twice = recordEntry(once, { number: 13, row: '| row 13 |' });
    const rows = twice.split('\n').filter((line) => line.startsWith('| row'));
    expect(rows).toEqual(['| row 13 |', '| row 12 |']);
  });

  it('is idempotent per PR (a re-run does not duplicate the row)', () => {
    const once = recordEntry(CHANGELOG_TEMPLATE, { number: 12, row: '| [#12](u) x |' });
    expect(recordEntry(once, { number: 12, row: '| [#12](u) x |' })).toBe(once);
  });

  it('refuses a changelog without the audit table marker', () => {
    expect(() => recordEntry('# Changelog\n', entry)).toThrow(/marker/);
  });
});
