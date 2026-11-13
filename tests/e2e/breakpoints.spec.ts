import { expect, test } from '@playwright/test';

// TS-05.1.1 / NFR-01: the fluid layout works at the 360, 768 and 1024 px breakpoints: no horizontal page scroll, wide
// tables scroll inside their own region, and the category and society switches stay at least 44 px tall.
const WIDTHS = [360, 768, 1024];
const PAGES = [
  './',
  'valvular-heart-disease/mitral-valve-disease/mitral-regurgitation/primary-mr-severity-grading/',
  'chamber-size-and-function/left-atrium/',
  'reference-and-methodology/abbreviations-and-glossary/',
  'status/',
];

for (const width of WIDTHS) {
  test.describe(`${String(width)} px`, () => {
    test.use({ viewport: { width, height: 800 } });

    for (const path of PAGES) {
      test(`no horizontal page scroll: ${path}`, async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== 'desktop', 'viewport set per test; one project is enough');
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(0);
        for (const region of await page.locator('.table-scroll').all()) {
          const box = await region.boundingBox();
          expect(box?.width ?? 0).toBeLessThanOrEqual(width);
        }
      });
    }

    test('category and society switches keep 44 px touch targets', async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'viewport set per test; one project is enough');
      await page.goto('valvular-heart-disease/mitral-valve-disease/mitral-regurgitation/primary-mr-severity-grading/');
      const controls = await page.locator('[data-category-choice], [data-society-choice]').all();
      expect(controls.length).toBeGreaterThanOrEqual(7);
      for (const control of controls) {
        const box = await control.boundingBox();
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      }
    });
  });
}
