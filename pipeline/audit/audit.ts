/**
 * Content audit trail (TS-06.4.2, NFR-06): when a content pull request is merged, a row with merge time, approvers,
 * merger, sources and topics is added to CHANGELOG.md. The workflow fetches the PR data; this module only formats it.
 * PR titles are untrusted input: line breaks are flattened, table pipes escaped and HTML neutralised.
 */
export interface PullRequest {
  number: number;
  title: string;
  html_url: string;
  merged_at: string | null;
  merged_by: { login: string } | null;
}

export interface Review {
  user: { login: string } | null;
  state: string;
  submitted_at: string | null;
}

export interface AuditEntry {
  number: number;
  row: string;
}

export const AUDIT_MARKER = '<!-- audit-log: new rows go below the header (pipeline/audit) -->';

export const CHANGELOG_TEMPLATE = `# Changelog

## Content audit log

${AUDIT_MARKER}

| Merged | Pull request | Approved by | Merged by | Sources | Topics |
|---|---|---|---|---|---|
`;

const utc = (iso: string): string => `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;

const cell = (text: string): string =>
  text
    .replace(/\s+/g, ' ')
    .trim()
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('|', '\\|');

const idsIn = (files: readonly string[], folder: string): string[] =>
  files.flatMap((file) => {
    const match = new RegExp(`^content/${folder}/([^/]+)\\.ya?ml$`).exec(file);
    return match?.[1] === undefined ? [] : [match[1]];
  });

const list = (items: readonly string[]): string => (items.length === 0 ? '—' : items.map(cell).join(', '));

function approvals(reviews: readonly Review[]): string[] {
  const latest = new Map<string, Review>();
  const dated = reviews.filter((r) => r.user !== null && r.submitted_at !== null && r.state !== 'COMMENTED');
  for (const review of [...dated].sort((a, b) => String(a.submitted_at).localeCompare(String(b.submitted_at)))) {
    latest.set(String(review.user?.login), review);
  }
  return [...latest.entries()]
    .filter(([, review]) => review.state === 'APPROVED')
    .map(([login, review]) => `${cell(login)} (${utc(String(review.submitted_at))})`);
}

export function auditEntry(
  pr: PullRequest,
  reviews: readonly Review[],
  files: readonly string[],
): AuditEntry | undefined {
  if (pr.merged_at === null) return undefined;
  const sources = idsIn(files, 'sources');
  const topics = idsIn(files, 'topics');
  if (sources.length + topics.length + idsIn(files, 'parameters').length === 0) return undefined;
  const approved = approvals(reviews);
  const row = [
    utc(pr.merged_at),
    `[#${String(pr.number)}](${pr.html_url}) ${cell(pr.title)}`,
    approved.length === 0 ? '**none**' : approved.join(', '),
    pr.merged_by === null ? '—' : cell(pr.merged_by.login),
    list(sources),
    list(topics),
  ].join(' | ');
  return { number: pr.number, row: `| ${row} |` };
}

export function recordEntry(changelog: string, entry: AuditEntry): string {
  const marker = changelog.indexOf(AUDIT_MARKER);
  if (marker === -1) throw new Error(`CHANGELOG.md has no audit marker (${AUDIT_MARKER})`);
  if (changelog.includes(`[#${String(entry.number)}](`)) return changelog;
  const lines = changelog.split('\n');
  const separator = lines.findIndex(
    (line, index) => index > changelog.slice(0, marker).split('\n').length - 1 && line.startsWith('|---'),
  );
  lines.splice(separator + 1, 0, entry.row);
  return lines.join('\n');
}
