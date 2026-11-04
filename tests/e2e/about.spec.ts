import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// TS-07.1.2: intended-use statement and disclaimer.

test('every footer links to the intended use and disclaimer page', async ({ page }) => {
  await page.goto('./');
  await page
    .getByRole('contentinfo')
    .getByRole('link', { name: /About Valvia/ })
    .click();
  await expect(page.getByRole('heading', { level: 1, name: 'About Valvia' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Intended use' })).toBeVisible();
  await expect(page.locator('#intended-use + p + p')).toContainText('not a medical device');
  await expect(page.getByRole('heading', { level: 2, name: 'Disclaimer' })).toBeVisible();
});

test('the about page has no detectable accessibility violations', async ({ page }) => {
  await page.goto('about/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});
