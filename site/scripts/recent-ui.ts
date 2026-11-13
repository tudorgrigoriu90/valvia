/** Records leaf visits and fills the "Recently viewed" list on the home page (TS-04.6.1). */
import { withBase } from '../../core/site/base-path';
import { clearRecent, readRecent, recordVisit, writeRecent } from './recent';

const storage = (() => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
})();

const visited = document.querySelector<HTMLElement>('[data-recent-path]');
const path = visited?.dataset.recentPath;
const title = visited?.dataset.recentTitle;
if (path !== undefined && title !== undefined) writeRecent(storage, recordVisit(readRecent(storage), { path, title }));

const section = document.querySelector<HTMLElement>('[data-recent]');
const list = section?.querySelector('ol');
if (section && list) {
  const base = document.documentElement.dataset.base ?? '/';
  const entries = readRecent(storage);
  for (const entry of entries) {
    const link = document.createElement('a');
    link.href = withBase(base, entry.path);
    link.textContent = entry.title;
    const item = document.createElement('li');
    item.append(link);
    list.append(item);
  }
  section.hidden = entries.length === 0;
  section.querySelector('[data-recent-clear]')?.addEventListener('click', () => {
    clearRecent(storage);
    list.replaceChildren();
    section.hidden = true;
  });
}
