import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { checkBuiltSite, checkMarkdown, classifyTarget } from './check';

describe('classifyTarget', () => {
  it.each([
    ['https://example.org', 'external'],
    ['http://example.org', 'external'],
    ['//cdn.example.org/x.js', 'external'],
    ['mailto:someone@example.org', 'external'],
    ['data:image/png;base64,AAA', 'external'],
    ['#section', 'anchor'],
    ['docs/x.md', 'internal'],
    ['/valvia/', 'internal'],
    ['', 'anchor'],
  ])('classifies %j as %s', (target, kind) => {
    expect(classifyTarget(target)).toBe(kind);
  });
});

let root: string;
const write = (relative: string, content: string): void => {
  const file = join(root, relative);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
};

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'valvia-links-'));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('checkMarkdown', () => {
  it('reports no problems when every relative link and anchor resolves', () => {
    write('README.md', '[guide](docs/guide.md#setup) [self](#readme) [ext](https://example.org)\n# README\n');
    write('docs/guide.md', '# Guide\n## Setup\n[back](../README.md)\n');
    expect(checkMarkdown(root)).toEqual([]);
  });

  it('reports missing files with file and line', () => {
    write('docs/a.md', 'line 1\n[missing](nope.md)\n');
    expect(checkMarkdown(root)).toEqual([
      { file: 'docs/a.md', line: 2, target: 'nope.md', reason: 'file not found: docs/nope.md' },
    ]);
  });

  it('reports missing anchors in the same and other Markdown files', () => {
    write('a.md', '# A\n[x](#nope) [y](b.md#missing)\n');
    write('b.md', '# B\n');
    expect(checkMarkdown(root)).toEqual([
      { file: 'a.md', line: 2, target: '#nope', reason: 'anchor not found in a.md' },
      { file: 'a.md', line: 2, target: 'b.md#missing', reason: 'anchor not found in b.md' },
    ]);
  });

  it('accepts links to directories and non-Markdown files', () => {
    write('a.md', '[dir](sub/) [file](LICENSE)\n');
    write('sub/x.txt', 'x');
    write('LICENSE', 'x');
    expect(checkMarkdown(root)).toEqual([]);
  });

  it('decodes percent-encoded paths', () => {
    write('a.md', '[x](my%20file.md)\n');
    write('my file.md', '# x\n');
    expect(checkMarkdown(root)).toEqual([]);
  });

  it('skips node_modules, dist and coverage folders', () => {
    write('node_modules/pkg/README.md', '[x](missing.md)\n');
    write('dist/a.md', '[x](missing.md)\n');
    write('coverage/a.md', '[x](missing.md)\n');
    expect(checkMarkdown(root)).toEqual([]);
  });
});

describe('checkBuiltSite', () => {
  const base = '/valvia/';

  it('accepts base-prefixed links to pages, assets and anchors that exist', () => {
    write('dist/index.html', '<a href="/valvia/topics/mr/#grading">MR</a><script src="/valvia/_astro/a.js"></script>');
    write(
      'dist/topics/mr/index.html',
      '<h2 id="grading">Grading</h2><a href="../../">home</a><a href="#grading">x</a>',
    );
    write('dist/_astro/a.js', '');
    expect(checkBuiltSite(join(root, 'dist'), base)).toEqual([]);
  });

  it('reports root-relative links that ignore the base path', () => {
    write('dist/index.html', '<a href="/topics/">x</a>');
    expect(checkBuiltSite(join(root, 'dist'), base)).toEqual([
      { file: 'index.html', line: 1, target: '/topics/', reason: 'link outside base path /valvia/' },
    ]);
  });

  it('reports links to pages that were not built', () => {
    write('dist/index.html', '<a href="/valvia/missing/">x</a>\n<a href="gone.html">y</a>');
    expect(checkBuiltSite(join(root, 'dist'), base)).toEqual([
      { file: 'index.html', line: 1, target: '/valvia/missing/', reason: 'not found in build: missing/index.html' },
      { file: 'index.html', line: 2, target: 'gone.html', reason: 'not found in build: gone.html' },
    ]);
  });

  it('reports anchors that do not exist on the target page', () => {
    write('dist/index.html', '<a href="#nope">x</a>');
    expect(checkBuiltSite(join(root, 'dist'), base)).toEqual([
      { file: 'index.html', line: 1, target: '#nope', reason: 'anchor not found in index.html' },
    ]);
  });

  it('ignores external links and query strings', () => {
    write('dist/index.html', '<a href="https://doi.org/10.1/x">doi</a><a href="/valvia/?q=tapse">s</a>');
    expect(checkBuiltSite(join(root, 'dist'), base)).toEqual([]);
  });
});

describe('checkBuiltSite base without trailing slash', () => {
  it('treats a link to the base without its trailing slash as the home page', () => {
    write('dist/index.html', '<a href="/valvia">home</a>');
    expect(checkBuiltSite(join(root, 'dist'), '/valvia/')).toEqual([]);
  });

  it('resolves extensionless page links to their index.html', () => {
    write('dist/index.html', '<a href="/valvia/about">about</a>');
    write('dist/about/index.html', '<h1>About</h1>');
    expect(checkBuiltSite(join(root, 'dist'), '/valvia/')).toEqual([]);
  });
});
