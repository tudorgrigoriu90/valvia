import { expect, test } from '@playwright/test';

test('home page renders the Valvia heading', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1, name: 'Valvia' })).toBeVisible();
});

test('home page has no horizontal scroll', async ({ page }) => {
  await page.goto('./');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
