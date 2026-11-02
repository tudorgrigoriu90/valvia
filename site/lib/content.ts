/**
 * Loads the content once per build with the same loader as `npm run validate:content` (ADR 0003).
 * The build fails on content errors, so nothing invalid can be published.
 */
import { hasErrors, loadContent } from '../../core/content/loader';
import { formatProblem } from '../../core/content/problem';
import type { ContentBundle } from '../../core/content/types';
import { buildNavigation, type Navigation } from '../../core/navigation/tree';

let cache: { bundle: ContentBundle; navigation: Navigation } | undefined;

export function getContent(): { bundle: ContentBundle; navigation: Navigation } {
  if (cache === undefined) {
    const { bundle, problems } = loadContent(process.cwd());
    if (hasErrors(problems)) {
      throw new Error(`Content has errors:\n${problems.map(formatProblem).join('\n')}`);
    }
    cache = { bundle, navigation: buildNavigation(bundle.topics) };
  }
  return cache;
}
