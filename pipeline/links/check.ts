/** Offline internal link checker for Markdown docs and the built site (CH-2). */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, posix, relative, sep } from 'node:path';
import { extractHtmlIds, extractHtmlLinks, extractMarkdownHeadingSlugs, extractMarkdownLinks } from './extract';

export type TargetKind = 'external' | 'anchor' | 'internal';

export interface LinkProblem {
  file: string;
  line: number;
  target: string;
  reason: string;
}

const SKIPPED_DIRECTORIES = new Set([
  'node_modules',
  'dist',
  'coverage',
  '.git',
  '.astro',
  'playwright-report',
  'test-results',
]);

export function classifyTarget(target: string): TargetKind {
  if (target === '' || target.startsWith('#')) return 'anchor';
  if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('//')) return 'external';
  return 'internal';
}

function listFiles(directory: string, extension: string, skip: ReadonlySet<string>): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!skip.has(entry.name)) files.push(...listFiles(join(directory, entry.name), extension, skip));
    } else if (entry.name.endsWith(extension)) {
      files.push(join(directory, entry.name));
    }
  }
  return files.sort();
}

const toPosix = (path: string): string => path.split(sep).join('/');

function splitTarget(target: string): { path: string; fragment: string } {
  const hashIndex = target.indexOf('#');
  const withoutFragment = hashIndex === -1 ? target : target.slice(0, hashIndex);
  const fragment = hashIndex === -1 ? '' : decodeURIComponent(target.slice(hashIndex + 1));
  const queryIndex = withoutFragment.indexOf('?');
  const path = queryIndex === -1 ? withoutFragment : withoutFragment.slice(0, queryIndex);
  return { path: decodeURIComponent(path), fragment };
}

/** Checks relative links and heading anchors in every Markdown file under `root`. */
export function checkMarkdown(root: string): LinkProblem[] {
  const problems: LinkProblem[] = [];
  const slugCache = new Map<string, Set<string>>();
  const slugsOf = (file: string): Set<string> => {
    let slugs = slugCache.get(file);
    if (slugs === undefined) {
      slugs = extractMarkdownHeadingSlugs(readFileSync(join(root, file), 'utf8'));
      slugCache.set(file, slugs);
    }
    return slugs;
  };

  for (const absolute of listFiles(root, '.md', SKIPPED_DIRECTORIES)) {
    const file = toPosix(relative(root, absolute));
    for (const { target, line } of extractMarkdownLinks(readFileSync(absolute, 'utf8'))) {
      const kind = classifyTarget(target);
      if (kind === 'external') continue;
      const { path, fragment } = splitTarget(target);
      const resolved =
        kind === 'anchor'
          ? file
          : path.startsWith('/')
            ? posix.normalize(path.slice(1))
            : posix.join(posix.dirname(file), path);
      if (!existsSync(join(root, resolved))) {
        problems.push({ file, line, target, reason: `file not found: ${resolved}` });
        continue;
      }
      const isMarkdownFile = resolved.endsWith('.md') && statSync(join(root, resolved)).isFile();
      if (fragment !== '' && isMarkdownFile && !slugsOf(resolved).has(fragment)) {
        problems.push({ file, line, target, reason: `anchor not found in ${resolved}` });
      }
    }
  }
  return problems;
}

/** Maps a site path below the base (e.g. `topics/mr/`) to the built file that serves it. */
function builtFileFor(distDir: string, sitePath: string): { file: string; found: boolean } {
  if (sitePath === '' || sitePath.endsWith('/')) {
    const file = `${sitePath}index.html`;
    return { file, found: existsSync(join(distDir, file)) };
  }
  if (existsSync(join(distDir, sitePath)) && statSync(join(distDir, sitePath)).isFile()) {
    return { file: sitePath, found: true };
  }
  const index = `${sitePath}/index.html`;
  if (existsSync(join(distDir, index))) return { file: index, found: true };
  return { file: sitePath, found: false };
}

/** Checks that every internal link in the built HTML stays under `base` and resolves to a built file and anchor. */
export function checkBuiltSite(distDir: string, base: string): LinkProblem[] {
  const problems: LinkProblem[] = [];
  const idCache = new Map<string, Set<string>>();
  const idsOf = (file: string): Set<string> => {
    let ids = idCache.get(file);
    if (ids === undefined) {
      ids = extractHtmlIds(readFileSync(join(distDir, file), 'utf8'));
      idCache.set(file, ids);
    }
    return ids;
  };

  for (const absolute of listFiles(distDir, '.html', new Set())) {
    const file = toPosix(relative(distDir, absolute));
    const directory = posix.dirname(file);
    const pageDirectory = directory === '.' ? base : `${base}${directory}/`;
    for (const { target, line } of extractHtmlLinks(readFileSync(absolute, 'utf8'))) {
      const kind = classifyTarget(target);
      if (kind === 'external') continue;
      const { path, fragment } = splitTarget(target);
      let targetFile = file;
      if (kind === 'internal' && path !== '') {
        // posix.join/normalize keep a trailing slash, so directory-style URLs stay directory-style.
        const absolutePath = posix.normalize(path.startsWith('/') ? path : posix.join(pageDirectory, path));
        const normalised = absolutePath === base.slice(0, -1) ? base : absolutePath;
        if (!normalised.startsWith(base)) {
          problems.push({ file, line, target, reason: `link outside base path ${base}` });
          continue;
        }
        const built = builtFileFor(distDir, normalised.slice(base.length));
        if (!built.found) {
          problems.push({ file, line, target, reason: `not found in build: ${built.file}` });
          continue;
        }
        targetFile = built.file;
      }
      if (fragment !== '' && targetFile.endsWith('.html') && !idsOf(targetFile).has(fragment)) {
        problems.push({ file, line, target, reason: `anchor not found in ${targetFile}` });
      }
    }
  }
  return problems;
}
