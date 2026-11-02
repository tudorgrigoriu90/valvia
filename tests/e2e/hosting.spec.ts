import { expect, test } from '@playwright/test';

// ADR 0002: GitHub Pages hosting requirements for the production build.

test('ships .nojekyll so GitHub Pages serves the _astro/ asset folder', async ({ request }) => {
  const response = await request.get('.nojekyll');
  expect(response.status()).toBe(200);
});

test('unknown URLs show a helpful 404 page that links home', async ({ page }) => {
  await page.goto('this-page-does-not-exist/');
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  await page.getByRole('link', { name: 'Go to the Valvia home page' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Valvia' })).toBeVisible();
});
