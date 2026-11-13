import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// TS-04.2.2: drill-down list pages with breadcrumbs; unpopulated nodes are hidden.

test('drills down from a root category to a leaf with breadcrumbs on every level', async ({ page }) => {
  await page.goto('valvular-heart-disease/');
  await expect(page.getByRole('heading', { level: 1, name: 'Valvular heart disease' })).toBeVisible();
  const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(crumbs.getByRole('link', { name: 'Home' })).toBeVisible();

  await page.getByRole('link', { name: /Mitral valve disease/ }).click();
  await page.getByRole('link', { name: /Mitral regurgitation/ }).click();
  await page.getByRole('link', { name: /Primary MR: severity grading/ }).click();

  await expect(page.getByRole('heading', { level: 1, name: /Primary MR: severity grading/ })).toBeVisible();
  await expect(crumbs.getByRole('link')).toHaveText([
    'Home',
    'Valvular heart disease',
    'Mitral valve disease',
    'Mitral regurgitation',
  ]);
  await expect(crumbs.locator('[aria-current="page"]')).toHaveText(/Primary MR: severity grading/);
});

// Nodes used below stay empty until ESC documents are supplied (no ASE source covers them).
test('category pages only list children that have content', async ({ page }) => {
  await page.goto('valvular-heart-disease/');
  await expect(page.getByRole('link', { name: /Mitral valve disease/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Multiple & mixed valve disease/ })).toHaveCount(0);
});

test('nodes without content have no page', async ({ request }) => {
  const response = await request.get('special-populations/pregnancy/');
  expect(response.status()).toBe(404);
});

test('list items are large enough to tap (44 px)', async ({ page }) => {
  await page.goto('valvular-heart-disease/');
  const box = await page.getByRole('link', { name: /Mitral valve disease/ }).boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
});

test('category pages have no detectable accessibility violations', async ({ page }) => {
  await page.goto('valvular-heart-disease/mitral-valve-disease/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});
