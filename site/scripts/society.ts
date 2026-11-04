/** Society filter preference (TS-04.3.5), stored on the device; every access tolerates blocked storage. */
export type SocietyFilter = 'all' | 'esc' | 'ase';
export const SOCIETY_KEY = 'valvia.society';

export function readSociety(storage: Storage | undefined): SocietyFilter {
  try {
    const value = storage?.getItem(SOCIETY_KEY);
    return value === 'esc' || value === 'ase' ? value : 'all';
  } catch {
    return 'all';
  }
}

export function writeSociety(storage: Storage | undefined, value: SocietyFilter): void {
  try {
    storage?.setItem(SOCIETY_KEY, value);
  } catch {
    // Storage unavailable: the choice applies to this page view only.
  }
}
