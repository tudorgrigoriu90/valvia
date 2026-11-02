import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const LEAF = 'valvular-heart-disease/mitral-valve-disease/mitral-regurgitation/primary-mr-severity-grading/';

// TS-04.3.1: responsive grading table.

test('renders the quantitative grading table with grade columns and parameter rows', async ({ page }) => {
  await page.goto(LEAF);
  const table = page.getByRole('table', { name: 'Quantitative grading of chronic MR' });
  await expect(table.getByRole('columnheader')).toHaveText([
    'Parameter',
    'Mild (grade I)',
    'Moderate (grade II)',
    'Moderate (grade III)',
    'Severe (grade IV)',
  ]);
  const eroa = table.getByRole('row', { name: /EROA/ });
  await expect(eroa.getByRole('cell')).toHaveText([/^< 0\.20/, /^0\.20–0\.29/, /^0\.30–0\.39/, /^≥ 0\.40/]);
  await expect(eroa.getByRole('rowheader')).toContainText('cm²');
});

test('shows values in house units (vena contracta in mm)', async ({ page }) => {
  await page.goto(LEAF);
  const vcw = page.getByRole('table', { name: 'Semiquantitative signs' }).getByRole('row', { name: /VCW/ });
  await expect(vcw.getByRole('rowheader')).toContainText('mm');
  await expect(vcw.getByRole('cell').nth(1)).toContainText('≥ 7');
});

test('the table scrolls inside its own region on a 360 px screen, not the page', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto(LEAF);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(
    page.getByRole('region', { name: 'Quantitative grading of chronic MR (scrollable table)' }),
  ).toBeVisible();
});

test('leaf page has no detectable accessibility violations', async ({ page }) => {
  await page.goto(LEAF);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});

// TS-04.3.6: caveats and footnotes.

test('shows caveats as numbered footnotes linked from the values', async ({ page }) => {
  await page.goto(LEAF);
  const section = page.locator('#quantitative-grading');
  const notes = section.getByRole('list', { name: 'Notes for Quantitative grading of chronic MR' });
  await expect(notes).toContainText('May be lower in secondary MR with an elliptical regurgitant orifice.');
  const eroaSevere = section.getByRole('row', { name: /EROA/ }).getByRole('cell').nth(3);
  const marker = eroaSevere.getByRole('link', { name: /Footnote \d/ });
  await marker.click();
  await expect(page).toHaveURL(/#quantitative-grading-fn-\d$/);
});
