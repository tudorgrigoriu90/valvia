/** Presentation helpers for checklists and citations (TS-04.3.2). */
import type { LoadedValue } from '../content/types';

export type FeasibilityCategory = 'favourable' | 'challenging' | 'unsuitable';

/** Feasibility categories always carry text and a symbol, never colour alone (NFR-09). */
export const CATEGORY_LABELS: Readonly<Record<FeasibilityCategory, { label: string; symbol: string }>> = {
  favourable: { label: 'Favourable', symbol: '✓' },
  challenging: { label: 'Challenging', symbol: '!' },
  unsuitable: { label: 'Unsuitable', symbol: '✕' },
};

type Locator = LoadedValue['citation']['locator'];

/** e.g. { table: '8', page: '332' } → 'Table 8, p. 332'. */
export function describeLocator(locator: Locator): string {
  return [
    locator.table === undefined ? undefined : `Table ${locator.table}`,
    locator.figure === undefined ? undefined : `Figure ${locator.figure}`,
    locator.section === undefined ? undefined : `Section ${locator.section}`,
    locator.page === undefined ? undefined : `p. ${locator.page}`,
  ]
    .filter((part) => part !== undefined)
    .join(', ');
}
