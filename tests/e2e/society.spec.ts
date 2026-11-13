import { expect, test } from '@playwright/test';

// TS-04.3.5: society filter, persisted on the device.
const LEAF = 'valvular-heart-disease/mitral-valve-disease/mitral-regurgitation/primary-mr-severity-grading/';

test('filters values by society and remembers the choice', async ({ page }) => {
  await page.goto(LEAF);
  const filter = page.getByRole('group', { name: 'Show values from' });
  await expect(filter.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
  const eroaSevere = page
    .getByRole('table', { name: 'Quantitative grading of chronic MR' })
    .getByRole('row', { name: /EROA/ })
    .locator('.value')
    .last();
  await expect(eroaSevere).toBeVisible();
  await filter.getByRole('button', { name: 'ESC/EACVI' }).click();
  await expect(eroaSevere).toBeHidden();
  await page.reload();
  await expect(
    page.getByRole('group', { name: 'Show values from' }).getByRole('button', { name: 'ESC/EACVI' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('group', { name: 'Show values from' }).getByRole('button', { name: 'ASE' }).click();
  await expect(eroaSevere).toBeVisible();
  await page.getByRole('group', { name: 'Show values from' }).getByRole('button', { name: 'All' }).click();
});

// TS-04.1.3: society badges carry the issuers as text (never colour alone) and a description for assistive technology.
test('labels each source with a society badge in text', async ({ page }) => {
  await page.goto(LEAF);
  const badge = page.locator('.source-chip summary .society-badge').first();
  await expect(badge).toHaveText('ASE');
  await expect(badge).toHaveAttribute('data-tone', 'ase');
  await expect(badge).toHaveAccessibleName('Issued by ASE');
});

test('marks joint ESC-family and ASE documents as joint', async ({ page }) => {
  await page.goto('chamber-size-and-function/left-atrium/');
  const badge = page.locator('.source-chip summary .society-badge', { hasText: 'ASE/EACVI' }).first();
  await expect(badge).toHaveAttribute('data-tone', 'joint');
  await expect(badge).toHaveAccessibleName('Joint document issued by ASE and EACVI');
});
