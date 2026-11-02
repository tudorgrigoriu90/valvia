import { describe, expect, it } from 'vitest';
import { extractHtmlLinks, extractMarkdownHeadingSlugs, extractMarkdownLinks, githubSlug } from './extract';

describe('extractMarkdownLinks', () => {
  it('finds inline links with their line numbers', () => {
    const md = 'Intro\n\nSee [the plan](docs/TASK_PLAN.md) and [ADR](adr/0001.md#context).\n';
    expect(extractMarkdownLinks(md)).toEqual([
      { target: 'docs/TASK_PLAN.md', line: 3 },
      { target: 'adr/0001.md#context', line: 3 },
    ]);
  });

  it('finds image links and reference definitions', () => {
    const md = '![logo](img/logo.svg)\n\n[ref]: ../README.md\n';
    expect(extractMarkdownLinks(md)).toEqual([
      { target: 'img/logo.svg', line: 1 },
      { target: '../README.md', line: 3 },
    ]);
  });

  it('ignores links inside fenced code blocks and inline code', () => {
    const md = '```markdown\n[not a link](missing.md)\n```\nUse `[x](y.md)` syntax.\n[real](real.md)\n';
    expect(extractMarkdownLinks(md)).toEqual([{ target: 'real.md', line: 5 }]);
  });

  it('strips optional titles and angle brackets', () => {
    const md = '[a](file.md "Title") [b](<with space.md>)';
    expect(extractMarkdownLinks(md)).toEqual([
      { target: 'file.md', line: 1 },
      { target: 'with space.md', line: 1 },
    ]);
  });
});

describe('githubSlug', () => {
  it.each([
    ['Golden rules (non-negotiable)', 'golden-rules-non-negotiable'],
    ['3.2 Data updates → pull request', '32-data-updates--pull-request'],
    ['`CLAUDE.md` file', 'claudemd-file'],
    ['Units / BSA', 'units--bsa'],
    ['Ünïcode Héading', 'ünïcode-héading'],
  ])('slugs %j as %j', (heading, slug) => {
    expect(githubSlug(heading)).toBe(slug);
  });
});

describe('extractMarkdownHeadingSlugs', () => {
  it('returns slugs for all headings, numbering duplicates like GitHub', () => {
    const md = '# Title\n## Context\ntext\n## Context\n```\n# not a heading\n```\n';
    expect(extractMarkdownHeadingSlugs(md)).toEqual(new Set(['title', 'context', 'context-1']));
  });
});

describe('extractHtmlLinks', () => {
  it('finds href and src attribute values with line numbers', () => {
    const html =
      '<a href="/valvia/topics/">x</a>\n<script type="module" src="/valvia/_astro/a.js"></script>\n<img src=\'logo.svg\'>';
    expect(extractHtmlLinks(html)).toEqual([
      { target: '/valvia/topics/', line: 1 },
      { target: '/valvia/_astro/a.js', line: 2 },
      { target: 'logo.svg', line: 3 },
    ]);
  });

  it('decodes HTML entities in attribute values', () => {
    expect(extractHtmlLinks('<a href="/a/?x=1&amp;y=2">x</a>')).toEqual([{ target: '/a/?x=1&y=2', line: 1 }]);
  });
});
