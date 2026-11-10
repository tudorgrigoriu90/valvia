import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// PO-5 (replaces TS-04.7.1): global category switch Adults · Children · TEE · Stress echo, persisted on the device.
const LEAF = 'valvular-heart-disease/mitral-valve-disease/mitral-regurgitation/primary-mr-severity-grading/';
const MR_TABLE = 'Quantitative grading of chronic MR';

test('offers four categories and defaults to adults', async ({ page }) => {
  await page.goto(LEAF);
  const group = page.getByRole('group', { name: 'Category' });
  await expect(group.getByRole('button')).toHaveText(['Adults', 'Children', 'TEE', 'Stress echo']);
  await expect(group.getByRole('button', { name: 'Adults' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('table', { name: MR_TABLE })).toBeVisible();
  await expect(page.locator('[data-category-notice]:visible')).toHaveCount(0);
});

for (const label of ['Children', 'TEE', 'Stress echo']) {
  test(`choosing ${label} hides adult transthoracic values and explains why`, async ({ page }) => {
    await page.goto(LEAF);
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(page.getByRole('button', { name: label, exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('table', { name: MR_TABLE })).toBeHidden();
    await expect(page.locator('[data-category-notice]:visible')).toContainText(`No ${label} values on this page yet`);
  });
}

test('the choice persists across pages and reloads', async ({ page }) => {
  await page.goto(LEAF);
  await page.getByRole('button', { name: 'TEE', exact: true }).click();
  await page.goto('./');
  await expect(page.getByRole('button', { name: 'TEE', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Adults' }).click();
  await page.goto(LEAF);
  await expect(page.getByRole('table', { name: MR_TABLE })).toBeVisible();
});

test('the home page shows, for every category, its topics or an "in preparation" notice', async ({ page }) => {
  await page.goto('./');
  for (const label of ['Adults', 'Children', 'TEE', 'Stress echo']) {
    await page.getByRole('button', { name: label, exact: true }).click();
    const cards = page.locator('.category-grid > li:visible');
    const notice = page.locator('[data-category-notice]:visible');
    expect((await cards.count()) + (await notice.count())).toBeGreaterThan(0);
    for (const meta of await cards.locator('.category-card__meta:visible').all()) {
      await expect(meta).toHaveText(/^\d+ topics?$/);
    }
  }
});

test('the switch fits a 360 px screen without horizontal scrolling and passes axe', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('./');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  const results = await new AxeBuilder({ page })
    .include('.site-header')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});

test('stress echo values appear under Stress echo only (CH-24 content)', async ({ page }) => {
  await page.goto('stress-echocardiography/ischaemia-and-viability-criteria/');
  await expect(page.getByRole('table', { name: 'Segmental wall motion score by systolic thickening' })).toBeHidden();
  await expect(page.locator('[data-category-notice]:visible')).toContainText('Values here are for: Stress echo');
  await page.getByRole('button', { name: 'Stress echo', exact: true }).click();
  await expect(page.getByRole('table', { name: 'Segmental wall motion score by systolic thickening' })).toBeVisible();
  await page.goto('./');
  await expect(page.getByRole('link', { name: /Stress echocardiography/ })).toBeVisible();
  await page.getByRole('button', { name: 'Adults' }).click();
});

test('TEE values appear under TEE only (CH-26 content)', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'TEE', exact: true }).click();
  await page.getByRole('link', { name: /Transoesophageal echocardiography \(TEE\)/ }).click();
  await page.getByRole('link', { name: /interatrial septum/ }).click();
  await expect(page.locator('#septal-findings .threshold-list')).toBeVisible();
  await page.getByRole('button', { name: 'Adults' }).click();
  await expect(page.locator('#septal-findings .threshold-list')).toBeHidden();
});

test('children see paediatric values, e.g. rheumatic carditis criteria (CH-33 content)', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Children', exact: true }).click();
  await page.getByRole('link', { name: /Valvular heart disease/ }).click();
  await page.getByRole('link', { name: /Rheumatic heart disease/ }).click();
  const carditis = page.locator('#carditis .threshold-list');
  await expect(carditis.locator('[data-value-category="paediatric"]').first()).toBeVisible();
  await expect(carditis.locator('[data-value-category="adult"]').first()).toBeHidden();
  await page.getByRole('button', { name: 'Adults' }).click();
});
