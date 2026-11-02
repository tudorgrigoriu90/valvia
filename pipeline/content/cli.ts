/**
 * `npm run validate:content`: validates everything under content/ (ADR 0003) and exits non-zero on errors.
 * Warnings are printed but do not fail. In GitHub Actions, problems become file annotations.
 */
import { resolve } from 'node:path';
import { hasErrors, loadContent } from '../../core/content/loader';
import { formatGithubAnnotation, formatProblem } from '../../core/content/problem';

const root = resolve(import.meta.dirname, '../..');
const { problems, fileCount } = loadContent(root);
const github = process.env.GITHUB_ACTIONS === 'true';

for (const problem of problems) {
  console.error(github ? formatGithubAnnotation(problem) : formatProblem(problem));
}
const errors = problems.filter((p) => p.severity === 'error').length;
const summary = `${String(fileCount)} content file(s) checked: ${String(errors)} error(s), ${String(problems.length - errors)} warning(s).`;
if (hasErrors(problems)) {
  console.error(summary);
  process.exit(1);
}
process.stdout.write(`${summary}\n`);
