import { describe, expect, it } from 'vitest';
import { validateContentFile } from './validate-file';

const VALID = `id: aortic-example-valve
name: Example Valve
position: aortic
type: transcatheter
typeLabel: Balloon-expandable
aliases: [Example THV]
sizes:
  - size: '23'
    values:
      - parameter: eoa
        statistic: mean-sd
        mean: 1.45
        sd: 0.26
        unit: cm²
        modality: Echo
        setting: native aortic stenosis
        population: { ageGroup: adult }
        citation: { source: ase-2024-prosthetic, locator: { table: A1 } }
      - parameter: mean-gradient
        statistic: mean
        mean: 8
        unit: mmHg
        modality: Echo
        population: { ageGroup: adult }
        caveats: [Limited data, no SD reported.]
        citation: { source: ase-2024-prosthetic, locator: { table: A6 } }
  - size: All sizes
    values:
      - parameter: mean-gradient
        statistic: median-iqr
        median: 7
        q1: 6
        q3: 9
        unit: mmHg
        modality: Echo
        population: { ageGroup: adult }
        citation: { source: ase-2024-prosthetic, locator: { table: A6 } }
      - parameter: peak-velocity
        statistic: threshold
        operator: '<'
        value: 2.5
        unit: m/s
        modality: Echo
        population: { ageGroup: adult }
        citation: { source: ase-2024-prosthetic, locator: { table: A7 } }
`;

const FILE = 'content/prosthetics/aortic-example-valve.yaml';
const validate = (text: string, file = FILE) => validateContentFile('prosthetic', file, text);
const messages = (text: string): string[] => validate(text).problems.map((p) => `${String(p.line)}: ${p.message}`);

describe('validateContentFile(prosthetic) (TS-02.2.8)', () => {
  it('accepts a valve with mean ± SD, mean-only, median (IQR) and threshold values', () => {
    expect(validate(VALID).problems).toEqual([]);
  });

  it.each([
    [
      'position: aortic',
      'position: apical',
      "position must be one of: aortic, mitral, tricuspid, pulmonary (got 'apical')",
    ],
    ['type: transcatheter', 'type: tavi', 'type must be one of:'],
    ['sizes:\n', 'sizes: []\nunused:\n', 'must NOT have'],
  ])('rejects %j → %j with a readable error', (from, to, expected) => {
    expect(messages(VALID.replace(from, to)).join('\n')).toContain(expected);
  });

  it('requires an SD for mean ± SD and points at the value', () => {
    const problems = messages(VALID.replace('        sd: 0.26\n', ''));
    expect(problems.join('\n')).toMatch(/sizes\[0\]\.values\[0\].*sd/);
  });

  it('rejects an SD on a mean-only value (the source reported none)', () => {
    const problems = messages(VALID.replace('        mean: 8\n', '        mean: 8\n        sd: 2\n'));
    expect(problems.join('\n')).toMatch(/sizes\[0\]\.values\[1\]\.sd/);
  });

  it('requires both quartiles for a median (IQR)', () => {
    expect(messages(VALID.replace('        q3: 9\n', '')).join('\n')).toMatch(/sizes\[1\]\.values\[0\].*q3/);
  });

  it('requires an operator for a threshold and rejects a mean on it', () => {
    const text = VALID.replace("        operator: '<'\n        value: 2.5\n", '        mean: 2.5\n');
    const joined = messages(text).join('\n');
    expect(joined).toMatch(/sizes\[1\]\.values\[1\].*operator/);
    expect(joined).toMatch(/sizes\[1\]\.values\[1\]\.mean/);
  });

  it('rejects a negative SD', () => {
    expect(messages(VALID.replace('sd: 0.26', 'sd: -0.26')).join('\n')).toMatch(/sd must be >= 0/);
  });

  it('rejects a value without population or citation (no orphan numbers)', () => {
    const text = VALID.replace(
      '        population: { ageGroup: adult }\n        citation: { source: ase-2024-prosthetic, locator: { table: A1 } }\n',
      '',
    );
    const joined = messages(text).join('\n');
    expect(joined).toMatch(/population/);
    expect(joined).toMatch(/citation/);
  });

  it('requires the file name to match the id', () => {
    expect(messages(VALID).length).toBe(0);
    expect(validate(VALID, 'content/prosthetics/other.yaml').problems.map((p) => p.rule)).toContain('file-name');
  });
});
