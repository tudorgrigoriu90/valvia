/** Link and anchor extraction for Markdown and HTML (CH-2). Pure functions, no I/O. */

export interface ExtractedLink {
  target: string;
  line: number;
}

const FENCE = /^\s{0,3}(```|~~~)/;
const INLINE_LINK = /!?\[(?:[^\]\\]|\\.)*\]\(\s*(<[^>]*>|[^)\s]+)(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g;
const REFERENCE_DEFINITION = /^\s{0,3}\[[^\]]+\]:\s*(<[^>]*>|\S+)/;
const HEADING = /^\s{0,3}#{1,6}\s+(.*?)\s*#*\s*$/;

/** Yields the lines of a Markdown document that are outside fenced code blocks, with 1-based numbers. */
function* proseLines(markdown: string): Generator<{ text: string; line: number }> {
  let inFence = false;
  const lines = markdown.split('\n');
  for (const [index, text] of lines.entries()) {
    if (FENCE.test(text)) {
      inFence = !inFence;
      continue;
    }
    if (!inFence) yield { text, line: index + 1 };
  }
}

const stripInlineCode = (text: string): string => text.replace(/`[^`]*`/g, (code) => ' '.repeat(code.length));
const unwrapAngle = (target: string): string =>
  target.startsWith('<') && target.endsWith('>') ? target.slice(1, -1) : target;

export function extractMarkdownLinks(markdown: string): ExtractedLink[] {
  const links: ExtractedLink[] = [];
  for (const { text, line } of proseLines(markdown)) {
    const prose = stripInlineCode(text);
    const definition = REFERENCE_DEFINITION.exec(prose);
    if (definition?.[1] !== undefined) {
      links.push({ target: unwrapAngle(definition[1]), line });
      continue;
    }
    for (const match of prose.matchAll(INLINE_LINK)) {
      if (match[1] !== undefined) links.push({ target: unwrapAngle(match[1]), line });
    }
  }
  return links;
}

/** GitHub-compatible heading anchor (github-slugger rules, without duplicate numbering). */
export function githubSlug(heading: string): string {
  return heading
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

/** All heading anchors of a Markdown document; duplicates get `-1`, `-2`, … like on GitHub. */
export function extractMarkdownHeadingSlugs(markdown: string): Set<string> {
  const slugs = new Set<string>();
  const seen = new Map<string, number>();
  for (const { text } of proseLines(markdown)) {
    const heading = HEADING.exec(text);
    if (heading?.[1] === undefined) continue;
    const slug = githubSlug(heading[1]);
    const count = seen.get(slug) ?? 0;
    seen.set(slug, count + 1);
    slugs.add(count === 0 ? slug : `${slug}-${String(count)}`);
  }
  return slugs;
}

const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
const decodeEntities = (value: string): string => value.replace(/&(?:amp|lt|gt|quot|#39);/g, (e) => ENTITIES[e] ?? e);
const lineAt = (text: string, index: number): number => text.slice(0, index).split('\n').length;

export function extractHtmlLinks(html: string): ExtractedLink[] {
  const links: ExtractedLink[] = [];
  for (const match of html.matchAll(/\b(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    const value = match[1] ?? match[2] ?? '';
    links.push({ target: decodeEntities(value), line: lineAt(html, match.index) });
  }
  return links;
}

export function extractHtmlIds(html: string): Set<string> {
  const ids = new Set<string>();
  for (const match of html.matchAll(/\bid\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    ids.add(decodeEntities(match[1] ?? match[2] ?? ''));
  }
  return ids;
}
