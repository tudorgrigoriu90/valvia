import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// TS-04.4.2: instant search UI.

test('typing an abbreviation shows matching topics with their context; a result opens the topic', async ({ page }) => {
  await page.goto('./');
  const search = page.getByRole('search', { name: 'Search topics and parameters' });
  await search.getByRole('searchbox', { name: 'Search' }).fill('EROA');
  const result = search.getByRole('link', { name: /Primary MR: severity grading/ });
  await expect(result).toBeVisible();
  await expect(result).toContainText('Valvular heart disease › Mitral valve disease › Mitral regurgitation');
  await expect(search.getByText(/\d+ results?/)).toBeVisible();
  await result.click();
  await expect(page.getByRole('heading', { level: 1, name: /Primary MR: severity grading/ })).toBeVisible();
});

test('says so when nothing matches and clears results when the box is emptied', async ({ page }) => {
  await page.goto('./');
  const box = page.getByRole('searchbox', { name: 'Search' });
  await box.fill('qwertyzz');
  await expect(page.getByText('No results')).toBeVisible();
  await box.fill('');
  await expect(page.getByText('No results')).toHaveCount(0);
});

test('pressing Enter does not reload the page', async ({ page }) => {
  await page.goto('./');
  const box = page.getByRole('searchbox', { name: 'Search' });
  await box.fill('PISA');
  await box.press('Enter');
  await expect(page).toHaveURL(new URL(process.env.VALVIA_BASE ?? '/valvia/', page.url()).href);
  await expect(page.getByRole('search').getByRole('link').first()).toBeVisible();
});

test('search with results has no detectable accessibility violations', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('searchbox', { name: 'Search' }).fill('regurgitant');
  await expect(page.getByRole('search').getByRole('link').first()).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});
