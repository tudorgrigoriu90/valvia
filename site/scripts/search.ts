/**
 * Instant search (TS-04.4.2, ADR 0004). Loads the Pagefind index on first use and renders results as you type.
 * Progressive enhancement: without JavaScript the search box is hidden behind a notice.
 */
import { resultCountLabel, toResultItems, type PagefindData } from './search-model';

interface Pagefind {
  search: (query: string) => Promise<{ results: { data: () => Promise<PagefindData> }[] }>;
}

const MAX_RESULTS = 10;
let pagefind: Promise<Pagefind> | undefined;

function loadPagefind(): Promise<Pagefind> {
  const base = document.documentElement.dataset.base ?? '/';
  pagefind ??= import(/* @vite-ignore */ `${base}pagefind/pagefind.js`) as Promise<Pagefind>;
  return pagefind;
}

function render(list: HTMLElement, status: HTMLElement, items: ReturnType<typeof toResultItems>): void {
  list.replaceChildren(
    ...items.map((item) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = item.url;
      const title = document.createElement('span');
      title.className = 'search-results__title';
      title.textContent = item.title;
      link.append(title);
      if (item.context !== '') {
        const context = document.createElement('span');
        context.className = 'search-results__context';
        context.textContent = item.context;
        link.append(context);
      }
      li.append(link);
      return li;
    }),
  );
  status.textContent = resultCountLabel(items.length);
}

for (const form of document.querySelectorAll<HTMLFormElement>('[data-search]')) {
  const input = form.querySelector<HTMLInputElement>('input[type="search"]');
  const list = form.querySelector<HTMLElement>('[data-search-results]');
  const status = form.querySelector<HTMLElement>('[data-search-status]');
  if (input === null || list === null || status === null) continue;
  form.hidden = false;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });
  let latest = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const query = input.value.trim();
      const ticket = ++latest;
      if (query === '') {
        list.replaceChildren();
        status.textContent = '';
        return;
      }
      void loadPagefind()
        .then((pf) => pf.search(query))
        .then(({ results }) => Promise.all(results.slice(0, MAX_RESULTS).map((r) => r.data())))
        .then((data) => {
          if (ticket === latest) render(list, status, toResultItems(data));
        });
    }, 120);
  });
}
