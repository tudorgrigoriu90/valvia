import { expect, test } from '@playwright/test';

// TS-05.3.1: web app manifest ("Valvia"), icon, installability basics.

interface Manifest {
  name: string;
  short_name: string;
  start_url: string;
  scope: string;
  display: string;
  icons: { src: string; type: string; sizes: string; purpose?: string }[];
}

test('pages link a valid web app manifest scoped to the base path', async ({ page, request }) => {
  await page.goto('./');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBe('/valvia/manifest.webmanifest');
  const response = await request.get('manifest.webmanifest');
  expect(response.status()).toBe(200);
  const manifest = (await response.json()) as Manifest;
  expect(manifest).toMatchObject({
    name: 'Valvia',
    short_name: 'Valvia',
    start_url: '/valvia/',
    scope: '/valvia/',
    display: 'standalone',
  });
  expect(manifest.icons.length).toBeGreaterThan(0);
  for (const icon of manifest.icons) expect((await request.get(icon.src.replace('/valvia/', ''))).status()).toBe(200);
});

test('pages declare an icon and theme colour', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/valvia/icon.svg');
  await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute('content', /#[0-9a-f]{6}/i);
});

// TS-05.3.2: all pages and search work offline after one online visit.

test('after one online visit, pages and search work in airplane mode', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.goto('valvular-heart-disease/mitral-valve-disease/mitral-regurgitation/primary-mr-severity-grading/');
  await expect(page.getByRole('heading', { level: 1, name: /Primary MR: severity grading/ })).toBeVisible();
  await page.goto('./');
  await page.getByRole('searchbox', { name: 'Search' }).fill('TAPSE');
  await expect(page.getByRole('search').getByRole('link').first()).toBeVisible();
  await context.setOffline(false);
});

// TS-05.3.3: the update prompt stays hidden on a first visit (shown only when a new version is waiting).

test('the update prompt is present but hidden on a first visit', async ({ page }) => {
  await page.goto('./');
  const prompt = page.locator('[data-update-prompt]');
  await expect(prompt).toHaveCount(1);
  await expect(prompt).toBeHidden();
  await expect(prompt.locator('button', { hasText: 'Refresh' })).toHaveCount(1);
});

// TS-05.3.4: offline indicator.

test('shows an offline indicator while the connection is lost', async ({ page, context }) => {
  await page.goto('./');
  const indicator = page.locator('[data-offline-indicator]');
  await expect(indicator).toBeHidden();
  await context.setOffline(true);
  await expect(indicator).toBeVisible();
  await expect(indicator).toHaveText('Offline: showing saved content.');
  await context.setOffline(false);
  await expect(indicator).toBeHidden();
});
