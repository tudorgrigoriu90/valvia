import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// CH-62 (taxonomy 14.1): the glossary leaf lists every registered parameter, generated from content/parameters.
const GLOSSARY = 'reference-and-methodology/abbreviations-and-glossary/';

test('lists parameters with abbreviation, full name and unit', async ({ page }) => {
  await page.goto(GLOSSARY);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Abbreviations & glossary');
  const eroa = page.locator('#g-eroa');
  await expect(eroa.locator('dt')).toHaveText('EROA');
  await expect(eroa.locator('dd')).toContainText('Effective regurgitant orifice area');
  await expect(eroa.locator('dd')).toContainText('cm²');
  expect(await page.locator('.glossary__entry').count()).toBeGreaterThan(100);
});

test('is reachable from the reference category and has no accessibility violations', async ({ page }) => {
  await page.goto('reference-and-methodology/');
  await page.getByRole('link', { name: /Abbreviations/ }).click();
  await expect(page).toHaveURL(new RegExp(`${GLOSSARY}$`));
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
});
