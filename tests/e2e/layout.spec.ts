import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// TS-04.1.2: design tokens, light/dark theme, base layout, draft banner (PO-3), CSP (ADR 0002).

test('every page has the Valvia header, a main landmark and the disclaimer', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('banner').getByRole('link', { name: 'Valvia home' })).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toContainText('Verify values against the original guideline');
});

test('pages declare a strict Content Security Policy and contain no inline scripts', async ({ page }) => {
  await page.goto('./');
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).not.toContain("'unsafe-inline'");
  const inlineScripts = await page.locator('script:not([src])').count();
  expect(inlineScripts).toBe(0);
  const inlineStyles = await page.locator('style').count();
  expect(inlineStyles).toBe(0);
});

test('unreviewed content is not indexed by search engines', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});

test('the site banner states that content is not yet clinically reviewed', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('status')).toContainText('Not yet clinically reviewed');
});

test('follows the system dark mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('./');
  const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.emulateMedia({ colorScheme: 'dark' });
  const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(dark).not.toBe(light);
});

test('has no detectable accessibility violations (WCAG 2.2 AA) in light and dark mode', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto('./');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations, `${colorScheme}: ${results.violations.map((v) => v.id).join(', ')}`).toEqual([]);
  }
});
