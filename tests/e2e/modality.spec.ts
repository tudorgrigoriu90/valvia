import { expect, test } from '@playwright/test';

// TS-04.7.3: CT and CMR values carry a text badge; echo values do not.
const PAGE = 'prosthetic-valves-and-valve-interventions/prosthetic-tricuspid-and-pulmonary-valves/';

test('CMR values are badged in text, echo values are not', async ({ page }) => {
  await page.goto(PAGE);
  const table = page.getByRole('table', { name: 'Prosthetic pulmonary regurgitation' });
  const rf = table.getByRole('row', { name: /RF/ });
  await expect(rf.locator('.modality-badge')).toHaveCount(3);
  await expect(rf.locator('.modality-badge').first()).toContainText('CMR');
  await expect(rf.locator('.modality-badge').first()).toContainText('Measured by cardiac magnetic resonance');
  const jet = table.getByRole('row', { name: /PR jet width/ });
  await expect(jet.locator('.modality-badge')).toHaveCount(0);
});
