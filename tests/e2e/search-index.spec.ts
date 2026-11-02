import { expect, test, type Page } from '@playwright/test';

// TS-04.4.1: Pagefind index over topic pages with parameter synonyms (ADR 0004).

interface PagefindResult {
  data: () => Promise<{ url: string; meta: { title?: string } }>;
}
interface Pagefind {
  search: (query: string) => Promise<{ results: PagefindResult[] }>;
}

async function search(page: Page, query: string): Promise<string[]> {
  return page.evaluate(async (q) => {
    const base = document.documentElement.dataset.base ?? '/';
    const pagefind = (await import(/* @vite-ignore */ `${base}pagefind/pagefind.js`)) as Pagefind;
    const { results } = await pagefind.search(q);
    const data = await Promise.all(results.map((r) => r.data()));
    return data.map((d) => `${d.meta.title ?? ''} ${d.url}`);
  }, query);
}

test('finds leaves by abbreviation, parameter name and synonym', async ({ page }) => {
  await page.goto('./');
  expect(await search(page, 'EROA')).toEqual(
    expect.arrayContaining([expect.stringMatching(/Primary MR: severity grading/)]),
  );
  expect(await search(page, 'pressure half-time')).toEqual(
    expect.arrayContaining([expect.stringMatching(/aortic-regurgitation/)]),
  );
  expect(await search(page, 'PISA')).toEqual(expect.arrayContaining([expect.stringMatching(/TR severity grading/)]));
});

test('does not index navigation, banner or footer text', async ({ page }) => {
  await page.goto('./');
  expect(await search(page, 'medical device')).toEqual([]);
});
