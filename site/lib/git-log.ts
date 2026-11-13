/**
 * Reads the Git history of content/ at build time (TS-06.4.1). Without git or history (e.g. a shallow clone) it
 * returns an empty string and the What's new page says so; CI checks out full history.
 */
import { execFileSync } from 'node:child_process';
import { GIT_LOG_ARGS } from '../../core/changelog/changelog';

export function contentGitLog(): string {
  try {
    return execFileSync('git', [...GIT_LOG_ARGS], {
      cwd: process.cwd(),
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return '';
  }
}
