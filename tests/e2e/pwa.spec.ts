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
