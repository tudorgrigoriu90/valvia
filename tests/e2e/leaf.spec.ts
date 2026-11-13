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

test('shows values in the unit printed in the guideline (vena contracta in cm, PO-4)', async ({ page }) => {
  await page.goto(LEAF);
  const vcw = page.getByRole('table', { name: 'Semiquantitative signs' }).getByRole('row', { name: /VCW/ });
  await expect(vcw.getByRole('rowheader')).toContainText('cm');
  await expect(vcw.getByRole('cell').nth(1)).toContainText('≥ 0.7');
  await expect(page.locator('main details.original')).toHaveCount(0);
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

// TS-04.3.2: criteria checklist; note and algorithm reference blocks (FT-04.3).

test('renders criteria checklists as lists', async ({ page }) => {
  await page.goto(LEAF);
  const severe = page.locator('#specific-criteria-severe').getByRole('list');
  await expect(severe.getByRole('listitem')).toHaveCount(6);
  await expect(severe).toContainText('Flail leaflet');
});

test('renders notes as text and algorithm references as links to the source', async ({ page }) => {
  await page.goto(LEAF);
  await expect(page.locator('#integration')).toContainText('integrating several parameters');
  const link = page.locator('#algorithm').getByRole('link', { name: /Open the algorithm in the source/ });
  await expect(link).toHaveAttribute('href', 'https://doi.org/10.1016/j.echo.2017.01.007');
  await expect(page.locator('#algorithm')).toContainText('Figure 18');
});

// TS-04.3.3: source chips.

test('each block shows its sources; tapping a chip reveals the full citation and DOI', async ({ page }) => {
  await page.goto(LEAF);
  const chip = page.locator('#quantitative-grading').getByText(/ASE native regurgitation 2017 · Table 8, p\. 332/);
  await chip.click();
  const citation = page.locator('#quantitative-grading .source-chip__body');
  await expect(citation).toContainText('Recommendations for Noninvasive Evaluation of Native Valvular Regurgitation');
  await expect(citation.getByRole('link', { name: /10\.1016\/j\.echo\.2017\.01\.007/ })).toHaveAttribute(
    'href',
    'https://doi.org/10.1016/j.echo.2017.01.007',
  );
});

// TS-04.2.3: jump menu with section anchors.

test('leaf pages with several sections have an "On this page" menu that jumps to each section', async ({ page }) => {
  await page.goto(LEAF);
  const menu = page.getByRole('navigation', { name: 'On this page' });
  await expect(menu.getByRole('link')).toHaveText([
    'Quantitative grading of chronic MR',
    'Semiquantitative signs',
    'Specific criteria for severe MR',
    'Specific criteria for mild MR',
    'Note',
    'Algorithm for integrating multiple parameters of MR severity',
  ]);
  await menu.getByRole('link', { name: 'Specific criteria for mild MR' }).click();
  await expect(page).toHaveURL(/#specific-criteria-mild$/);
});

// TS-04.5.2: review status and content version.

test('leaf pages state their review status and the footer shows the content version', async ({ page }) => {
  await page.goto(LEAF);
  await expect(page.locator('.review-status')).toHaveText('Draft: not yet clinically reviewed');
  await expect(page.getByRole('contentinfo')).toContainText(/Content version \S+ · built \d{4}-\d{2}-\d{2}/);
});

test('parameter deep links jump to the first row of that parameter (TS-04.5.1)', async ({ page }) => {
  await page.goto(`${LEAF}#p-eroa`);
  const row = page.locator('#p-eroa');
  await expect(row).toHaveCount(1);
  await expect(row.getByRole('rowheader')).toContainText('EROA');
  await expect(row).toBeInViewport();
  expect(await page.locator('[id^="p-"]').evaluateAll((els) => els.length)).toBe(
    await page.locator('[id^="p-"]').evaluateAll((els) => new Set(els.map((el) => el.id)).size),
  );
});
