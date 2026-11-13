import { expect, test } from '@playwright/test';

// TS-05.2.2 / NFR-02: system fonts, SVG-only icons and images, and no third-party requests. The optional analytics
// beacon is the only allowed exception and is off in test builds (TS-07.5.1), so every request must be same-origin.

const PAGES = [
  './',
  'valvular-heart-disease/mitral-valve-disease/mitral-regurgitation/primary-mr-severity-grading/',
  'about/',
  'whats-new/',
];

for (const path of PAGES) {
  test(`loads only same-origin resources: ${path}`, async ({ page, baseURL }) => {
    const origin = new URL(baseURL ?? 'http://localhost').origin;
    const foreign: string[] = [];
    const fonts: string[] = [];
    const rasterImages: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.protocol.startsWith('http') && url.origin !== origin) foreign.push(request.url());
      if (request.resourceType() === 'font') fonts.push(request.url());
      if (request.resourceType() === 'image' && !url.pathname.endsWith('.svg')) rasterImages.push(request.url());
    });
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    expect(foreign).toEqual([]);
    expect(fonts).toEqual([]);
    expect(rasterImages).toEqual([]);
  });
}

test('uses the system font stack', async ({ page }) => {
  await page.goto('./');
  const family = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(family.startsWith('system-ui')).toBe(true);
});

test('declares only SVG icons in the manifest and the page head', async ({ page, request }) => {
  await page.goto('./');
  const icons = await page
    .locator('link[rel~="icon"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('type')));
  expect(icons).toEqual(['image/svg+xml']);
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
  const manifest = (await (await request.get(new URL(manifestHref ?? '', page.url()).href)).json()) as {
    icons: { type: string }[];
  };
  expect(manifest.icons.length).toBeGreaterThan(0);
  expect(manifest.icons.every((icon) => icon.type === 'image/svg+xml')).toBe(true);
});
