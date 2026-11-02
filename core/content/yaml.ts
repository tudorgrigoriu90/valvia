/** YAML parsing that keeps source positions so errors can name file, line and column (ADR 0003). */
import { isMap, isScalar, LineCounter, parseDocument, type Document, type Node } from 'yaml';

export type PathSegment = string | number;

export interface Position {
  line: number;
  column: number;
}

export interface ParsedYaml {
  data: unknown;
  /** Position of the value at `path`; falls back to the nearest existing ancestor. */
  locate: (path: readonly PathSegment[]) => Position;
  /** Position of the key `key` inside the mapping at `path` (e.g. an unknown property). */
  locateKey: (path: readonly PathSegment[], key: string) => Position;
  /** Exact source text of the scalar at `path` (e.g. '0.40' for a number parsed as 0.4). */
  sourceText: (path: readonly PathSegment[]) => string | undefined;
}

export type ParseResult =
  { ok: true; value: ParsedYaml } | { ok: false; errors: { message: string; position: Position }[] };

export function parseYaml(text: string): ParseResult {
  const lineCounter = new LineCounter();
  const doc: Document = parseDocument(text, {
    lineCounter,
    version: '1.2',
    schema: 'core',
    uniqueKeys: true,
    keepSourceTokens: true,
  });
  if (doc.errors.length > 0) {
    return {
      ok: false,
      errors: doc.errors.map((error) => ({
        message: error.message.split('\n')[0] ?? error.message,
        position: { line: error.linePos?.[0].line ?? 1, column: error.linePos?.[0].col ?? 1 },
      })),
    };
  }

  const toPosition = (offset: number): Position => {
    const { line, col } = lineCounter.linePos(offset);
    return { line, column: col };
  };

  const nodeAt = (path: readonly PathSegment[]): Node | null => {
    for (let depth = path.length; depth >= 0; depth -= 1) {
      const node: unknown = doc.getIn(path.slice(0, depth), true);
      if (node !== undefined && node !== null && typeof node === 'object' && 'range' in node) return node as Node;
    }
    return doc.contents;
  };

  const locate = (path: readonly PathSegment[]): Position => toPosition(nodeAt(path)?.range?.[0] ?? 0);

  const locateKey = (path: readonly PathSegment[], key: string): Position => {
    const node = nodeAt(path);
    if (isMap(node)) {
      const pair = node.items.find((item) => isScalar(item.key) && String(item.key.value) === key);
      if (pair && isScalar(pair.key) && pair.key.range) return toPosition(pair.key.range[0]);
    }
    return locate(path);
  };

  const sourceText = (path: readonly PathSegment[]): string | undefined => {
    const node: unknown = doc.getIn(path, true);
    if (!isScalar(node) || node.srcToken === undefined || !('source' in node.srcToken)) return undefined;
    return node.srcToken.source;
  };

  return { ok: true, value: { data: doc.toJS({ maxAliasCount: 0 }) as unknown, locate, locateKey, sourceText } };
}
