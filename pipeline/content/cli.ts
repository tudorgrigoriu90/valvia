/**
 * `npm run validate:content`: validates everything under content/ (ADR 0003) and exits non-zero on errors.
 * Warnings are printed but do not fail. In GitHub Actions, problems become file annotations.
 */
import { resolve } from 'node:path';
import { hasErrors, loadContent } from '../../core/content/loader';
import { formatGithubAnnotation, formatProblem } from '../../core/content/problem';
import { detectDiscrepancies } from '../../core/discrepancy/discrepancy';

const root = resolve(import.meta.dirname, '../..');
const { bundle, problems, fileCount } = loadContent(root);
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

// Informational: disagreements between current sources are shown side by side on the site (TS-02.4.1).
const discrepancies = detectDiscrepancies(bundle);
for (const d of discrepancies) {
  const label = [d.parameter, d.context, d.grade, d.modality, d.population.ageGroup].filter(Boolean).join(' / ');
  process.stdout.write(
    `differs by source: ${label}: ${d.entries.map((e) => `${e.source} ${e.display}`).join(' vs ')}\n`,
  );
}
process.stdout.write(`${String(discrepancies.length)} discrepancy group(s) between current sources.\n`);
