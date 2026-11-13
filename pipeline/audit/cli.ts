/**
 * `tsx pipeline/audit/cli.ts <pr.json> <reviews.json> <files.json>`: adds the audit row of a merged content PR to
 * CHANGELOG.md (TS-06.4.2). Run by .github/workflows/content-audit.yml with data fetched from the GitHub API.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { auditEntry, recordEntry, type PullRequest, type Review } from './audit';

const [prFile, reviewsFile, filesFile] = process.argv.slice(2);
if (prFile === undefined || reviewsFile === undefined || filesFile === undefined) {
  throw new Error('usage: tsx pipeline/audit/cli.ts <pr.json> <reviews.json> <files.json>');
}
const read = (file: string): unknown => JSON.parse(readFileSync(file, 'utf8'));
const pr = read(prFile) as PullRequest;
const reviews = read(reviewsFile) as Review[];
const files = (read(filesFile) as { filename: string }[]).map((file) => file.filename);
const entry = auditEntry(pr, reviews, files);
if (entry === undefined) {
  process.stdout.write('not a merged content PR: nothing recorded\n');
} else {
  const changelog = resolve(import.meta.dirname, '../../CHANGELOG.md');
  writeFileSync(changelog, recordEntry(readFileSync(changelog, 'utf8'), entry));
  process.stdout.write(`recorded PR #${String(entry.number)}\n`);
}
