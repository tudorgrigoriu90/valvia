/** Pure helpers for the search UI (TS-04.4.2). */
export interface PagefindData {
  url: string;
  meta: { title?: string; context?: string };
}

export interface ResultItem {
  title: string;
  context: string;
  url: string;
}

export const toResultItems = (data: readonly PagefindData[]): ResultItem[] =>
  data.map((d) => ({ title: d.meta.title ?? d.url, context: d.meta.context ?? '', url: d.url }));

export const resultCountLabel = (count: number): string =>
  count === 0 ? 'No results' : `${String(count)} ${count === 1 ? 'result' : 'results'}`;
