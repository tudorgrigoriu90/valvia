/**
 * `tsx pipeline/stale/cli.ts <prs.json>`: reads `gh pr list --json number,headRefName,isDraft,createdAt,updatedAt,labels`
 * output and prints the reminder and escalation actions as JSON (TS-06.3.3). Used by .github/workflows/stale-prs.yml.
 */
import { readFileSync } from 'node:fs';
import { staleActions, type PullRequestInfo } from './stale';

const [file] = process.argv.slice(2);
if (file === undefined) throw new Error('usage: tsx pipeline/stale/cli.ts <prs.json>');
const prs = JSON.parse(readFileSync(file, 'utf8')) as PullRequestInfo[];
process.stdout.write(`${JSON.stringify(staleActions(prs, new Date().toISOString()))}\n`);
