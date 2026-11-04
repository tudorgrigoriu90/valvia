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
