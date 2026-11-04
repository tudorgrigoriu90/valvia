/**
 * Static redirects for renamed slugs (TS-02.1.3, ADR 0002): every former slug of a visible node redirects its old URL,
 * and the old URLs of its visible descendants, to the current ones. Hidden nodes get no redirect (nothing to show).
 */
import type { Navigation } from './tree';

export interface Redirect {
  /** Old site-relative path, e.g. 'valves/mitral/'. */
  from: string;
  /** Current site-relative path. */
  to: string;
}

export function redirects(navigation: Navigation): Redirect[] {
  const out: Redirect[] = [];
  const descendants = (id: string): string[] =>
    navigation.visibleChildren(id).flatMap((child) => [child.id, ...descendants(child.id)]);
  for (const node of navigation.visibleNodes()) {
    const current = navigation.urlPath(node.id);
    const parentPath = current.slice(0, current.length - node.slug.length - 1);
    for (const former of node.formerSlugs ?? []) {
      const oldPrefix = `${parentPath}${former}/`;
      out.push({ from: oldPrefix, to: current });
      for (const id of descendants(node.id)) {
        const target = navigation.urlPath(id);
        out.push({ from: oldPrefix + target.slice(current.length), to: target });
      }
    }
  }
  return out;
}
