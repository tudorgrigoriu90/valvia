import { expect, test } from '@playwright/test';

// TS-03.0.2: content status page.

test('the content status page lists every root category with coverage and review counts', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('contentinfo').getByRole('link', { name: 'Content status' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Content status' })).toBeVisible();
  const table = page.getByRole('table', { name: 'Content status by category' });
  await expect(table.getByRole('row')).toHaveCount(16);
  await expect(table.getByRole('row', { name: /Valvular heart disease/ })).toContainText(/W1\s*\d+ \/ \d+/);
  await expect(page.locator('.lead')).toContainText(/\d+ of \d+ topics have content/);
});
