import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// TS-07.5.1: privacy notice; analytics are off unless a cookieless provider is configured at build time.
const analyticsConfigured = [process.env.VALVIA_GOATCOUNTER, process.env.VALVIA_CF_BEACON_TOKEN].some(
  (value) => value !== undefined && value !== '',
);

test('every footer links to the privacy notice', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy' })).toBeVisible();
  await expect(page.locator('#summary + p')).toContainText('sets no cookies');
  await expect(page.locator('#analytics + p')).toContainText(
    analyticsConfigured ? 'cookieless service' : 'does not measure usage',
  );
});

test('the default build loads no third-party script and sets no cookie', async ({ page, context }) => {
  test.skip(analyticsConfigured, 'an analytics beacon is configured for this build');
  await page.goto('./');
  const external = await page
    .locator('script[src]')
    .evaluateAll((scripts) =>
      scripts.map((s) => (s as HTMLScriptElement).src).filter((src) => new URL(src).origin !== location.origin),
    );
  expect(external).toEqual([]);
  expect(await context.cookies()).toEqual([]);
});

test('the privacy page has no detectable accessibility violations', async ({ page }) => {
  await page.goto('privacy/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});
