import { expect, test } from '@playwright/test';

// TS-04.7.1: global adult/paediatric switch, persisted on the device.
const LEAF = 'valvular-heart-disease/mitral-valve-disease/mitral-regurgitation/primary-mr-severity-grading/';

test('defaults to adults and shows adult values', async ({ page }) => {
  await page.goto(LEAF);
  const group = page.getByRole('group', { name: 'Population' });
  await expect(group.getByRole('button', { name: 'Adults' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('table', { name: 'Quantitative grading of chronic MR' })).toBeVisible();
  await expect(page.locator('[data-population-notice="paediatric"]')).toBeHidden();
});

test('switching to children hides adult-only content, explains why, and persists across pages', async ({ page }) => {
  await page.goto(LEAF);
  await page.getByRole('button', { name: 'Children' }).click();
  await expect(page.getByRole('button', { name: 'Children' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('table', { name: 'Quantitative grading of chronic MR' })).toBeHidden();
  await expect(page.locator('[data-population-notice="paediatric"]')).toBeVisible();
  await page.goto('./');
  await expect(page.getByRole('button', { name: 'Children' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Adults' }).click();
  await page.goto(LEAF);
  await expect(page.getByRole('table', { name: 'Quantitative grading of chronic MR' })).toBeVisible();
});
