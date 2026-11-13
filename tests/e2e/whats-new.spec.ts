import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// TS-06.4.1: What's new page generated from the Git history of content/.

test('lists recent content changes with links to the changed topics', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('contentinfo').getByRole('link', { name: "What's new" }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("What's new");
  const changes = page.locator('.change');
  expect(await changes.count()).toBeGreaterThan(0);
  const first = changes.first();
  await expect(first.locator('time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
  await expect(first.getByRole('link', { name: /^(commit [0-9a-f]{7}|pull request #\d+)$/ })).toBeVisible();
  const topic = page.locator('.change__topics a').first();
  const title = await topic.textContent();
  await topic.click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title ?? '');
});

test("what's new has no detectable accessibility violations", async ({ page }) => {
  await page.goto('whats-new/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
});
