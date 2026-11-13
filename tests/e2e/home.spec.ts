import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// TS-04.2.1: home with the root categories.

test('shows root categories with content as cards that open the category', async ({ page }) => {
  await page.goto('./');
  const categories = page.getByRole('region', { name: 'Categories' });
  const card = categories.getByRole('link', { name: /Valvular heart disease/ });
  await expect(card).toBeVisible();
  await expect(card).toContainText(/\d+ topics?/);
  await card.click();
  await expect(page.getByRole('heading', { level: 1, name: 'Valvular heart disease' })).toBeVisible();
});

test('shows a category whose only page is a cross-link pointer as a card (CH-67)', async ({ page }) => {
  await page.goto('./');
  // Special populations has no values of its own; its Athletes leaf points to 6.8, so the category has a page.
  const categories = page.getByRole('region', { name: 'Categories' });
  await expect(categories.getByRole('link', { name: /Special populations/ })).toBeVisible();
  // Every root has at least one page since 2026-11-13, so nothing is listed as in preparation.
  await expect(page.getByRole('region', { name: 'In preparation' })).toHaveCount(0);
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

test('lists recently viewed topics on the home page, newest first, and can clear them (TS-04.6.1)', async ({
  page,
}) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Recently viewed' })).toBeHidden();
  await page.goto('valvular-heart-disease/mitral-valve-disease/mitral-regurgitation/primary-mr-severity-grading/');
  await page.goto('chamber-size-and-function/left-atrium/');
  await page.goto('./');
  const recent = page.getByRole('region', { name: 'Recently viewed' });
  await expect(recent.getByRole('link')).toHaveText([
    'Left atrium',
    'Primary MR: severity grading (incl. CMR quantification)',
  ]);
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations,
  ).toEqual([]);
  await recent.getByRole('link', { name: 'Left atrium' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Left atrium');
  await page.goto('./');
  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(recent).toBeHidden();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Recently viewed' })).toBeHidden();
});
