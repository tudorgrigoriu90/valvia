import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// CH-67: taxonomy cross-links (→). Empty leaves that point elsewhere become pointer pages; topics list "See also".

test('an empty leaf with a cross-link points to the topic that holds its values', async ({ page }) => {
  await page.goto('special-populations/');
  await page.getByRole('link', { name: 'Athletes' }).click();
  const covered = page.getByRole('region', { name: 'Covered under' });
  await expect(covered).toContainText('no values of its own');
  await covered.getByRole('link', { name: /Athlete's heart vs cardiomyopathy/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("Athlete's heart vs cardiomyopathy (grey zone)");
});

test('topic pages list their cross-links under See also, without pointer pages', async ({ page }) => {
  await page.goto('stress-echocardiography/diastolic-stress-test/');
  // Topic lists follow the category switch; the linked topic holds stress values.
  await page.getByRole('button', { name: 'Stress echo' }).click();
  const seeAlso = page.getByRole('navigation', { name: 'See also' });
  await expect(seeAlso.getByRole('link', { name: 'Diastolic stress echocardiography' })).toBeVisible();
  await page.goto('aortic-disease/normal-aortic-dimensions/');
  await expect(page.getByRole('navigation', { name: 'See also' })).toHaveCount(0);
});

test('pointer pages have no detectable accessibility violations and are not counted as topics', async ({ page }) => {
  await page.goto('special-populations/athletes/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
  await page.goto('special-populations/');
  await expect(page.getByRole('link', { name: 'Athletes' })).not.toContainText('topic');
});
