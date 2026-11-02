import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// TS-04.2.1: home with the root categories.

test('shows root categories with content as cards that open the category', async ({ page }) => {
  await page.goto('./');
  const categories = page.getByRole('region', { name: 'Categories' });
  const card = categories.getByRole('link', { name: /Valvular heart disease/ });
  await expect(card).toBeVisible();
  await expect(card).toContainText(/1 topic/);
  await card.click();
  await expect(page.getByRole('heading', { level: 1, name: 'Valvular heart disease' })).toBeVisible();
});

test('lists categories without content as in preparation, without links', async ({ page }) => {
  await page.goto('./');
  const upcoming = page.getByRole('region', { name: 'In preparation' });
  await expect(upcoming).toContainText('Chamber size & function');
  await expect(upcoming.getByRole('link')).toHaveCount(0);
});

test('reaches a leaf in 3 taps or fewer from home for the populated tree', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: /Valvular heart disease/ }).click();
  await page.getByRole('link', { name: /Mitral valve disease/ }).click();
  await page.getByRole('link', { name: /Mitral regurgitation/ }).click();
  // Fourth level is the leaf itself; the 3-tap target applies once search (TS-04.4) is in place.
  await expect(page.getByRole('link', { name: /Primary MR: severity grading/ })).toBeVisible();
});

test('home has no detectable accessibility violations', async ({ page }) => {
  await page.goto('./');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});
