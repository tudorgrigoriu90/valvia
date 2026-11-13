/** Society filter groups (TS-04.3.5): ESC family (ESC, EACVI and other ESC associations, EAE) and ASE. */
const ESC_FAMILY: ReadonlySet<string> = new Set([
  'ESC',
  'EACVI',
  'EAE',
  'EAPCI',
  'HFA',
  'EHRA',
  'EAPC',
  'ACVC',
  'ACNAP',
]);

export type SocietyGroup = 'esc' | 'ase';

export function societiesOf(issuers: readonly string[]): SocietyGroup[] {
  const groups: SocietyGroup[] = [];
  if (issuers.includes('ASE')) groups.push('ase');
  if (issuers.some((issuer) => ESC_FAMILY.has(issuer))) groups.push('esc');
  return groups;
}

/** Badge tone (TS-04.1.3): ESC family, ASE, joint ESC-family + ASE document, or another issuer (cited datasets). */
export type SocietyTone = 'esc' | 'ase' | 'joint' | 'other';

export interface SocietyBadge {
  /** Issuers as printed on the document, e.g. 'ASE/EACVI'. Always shown, so the badge never relies on colour. */
  label: string;
  tone: SocietyTone;
  /** Accessible description, e.g. 'Joint document issued by ASE and EACVI'. */
  description: string;
}

const listed = (items: readonly string[]): string =>
  items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${String(items.at(-1))}`;

export function societyBadge(issuers: readonly string[]): SocietyBadge {
  const groups = societiesOf(issuers);
  const tone: SocietyTone = groups.length === 2 ? 'joint' : (groups[0] ?? 'other');
  const description = `${tone === 'joint' ? 'Joint document issued' : 'Issued'} by ${listed(issuers)}`;
  return { label: issuers.join('/'), tone, description };
}
