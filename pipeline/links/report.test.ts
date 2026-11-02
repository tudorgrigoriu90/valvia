import { describe, expect, it } from 'vitest';
import { formatProblem } from './report';

const problem = { file: 'docs/a.md', line: 3, target: 'nope.md', reason: 'file not found: docs/nope.md' };

describe('formatProblem', () => {
  it('formats a problem as file:line for terminals', () => {
    expect(formatProblem(problem, { github: false })).toBe('docs/a.md:3 nope.md: file not found: docs/nope.md');
  });

  it('formats a GitHub Actions error annotation, prefixing the file with a directory', () => {
    expect(formatProblem(problem, { github: true, directory: 'dist' })).toBe(
      '::error file=dist/docs/a.md,line=3,title=Broken link::nope.md: file not found: docs/nope.md',
    );
  });

  it('escapes characters that break annotation syntax', () => {
    const tricky = { ...problem, reason: 'a%b\nc' };
    expect(formatProblem(tricky, { github: true })).toBe(
      '::error file=docs/a.md,line=3,title=Broken link::nope.md: a%25b%0Ac',
    );
  });
});
