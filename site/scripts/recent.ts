/**
 * Recently viewed topics (TS-04.6.1): the last 10 leaf pages, stored on this device only (no account, no server).
 * Paths are stored relative to the site base so they survive a base-path change. Stored data is treated as untrusted:
 * only safe site paths and plain titles are read back. Every storage access tolerates blocked storage.
 */
export const RECENT_KEY = 'valvia.recent';
export const RECENT_MAX = 10;

export interface RecentTopic {
  /** Topic path relative to the site base, e.g. 'valvular-heart-disease/aortic-stenosis/'. */
  path: string;
  title: string;
}

const SAFE_PATH = /^[a-z0-9-]+(?:\/[a-z0-9-]+)*\/$/;
const MAX_TITLE = 200;

const isRecentTopic = (entry: unknown): entry is RecentTopic => {
  if (typeof entry !== 'object' || entry === null) return false;
  const { path, title } = entry as Record<string, unknown>;
  return (
    typeof path === 'string' &&
    SAFE_PATH.test(path) &&
    typeof title === 'string' &&
    title.length > 0 &&
    title.length <= MAX_TITLE
  );
};

export function recordVisit(list: readonly RecentTopic[], visit: RecentTopic): RecentTopic[] {
  return [visit, ...list.filter((entry) => entry.path !== visit.path)].slice(0, RECENT_MAX);
}

export function readRecent(storage: Storage | undefined): RecentTopic[] {
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(RECENT_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isRecentTopic)
      .map(({ path, title }) => ({ path, title }))
      .slice(0, RECENT_MAX);
  } catch {
    return [];
  }
}

export function writeRecent(storage: Storage | undefined, list: readonly RecentTopic[]): void {
  try {
    storage?.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    // Storage unavailable: nothing is remembered.
  }
}

export function clearRecent(storage: Storage | undefined): void {
  try {
    storage?.removeItem(RECENT_KEY);
  } catch {
    // Storage unavailable: nothing to clear.
  }
}
