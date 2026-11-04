import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { withStyleHashes } from './style-hashes';

const csp = "default-src 'self'; style-src 'self'; object-src 'none'";
const page = (styles: string[]): string =>
  `<html><head><meta http-equiv="Content-Security-Policy" content="${csp}"><style>${styles[0] ?? ''}</style></head><body>${styles
    .slice(1)
    .map((s) => `<style>${s}</style>`)
    .join('')}</body></html>`;
const sha = (s: string): string => `'sha256-${createHash('sha256').update(s, 'utf8').digest('base64')}'`;

describe('withStyleHashes (CH-15)', () => {
  it('adds the hash of every inline style block to style-src, without unsafe-inline', () => {
    const out = withStyleHashes(page(['a{color:red}', 'b{color:blue}']));
    expect(out).toContain(`style-src 'self' ${sha('a{color:red}')} ${sha('b{color:blue}')};`);
    expect(out).not.toContain('unsafe-inline');
  });

  it('deduplicates identical style blocks and leaves pages without styles unchanged', () => {
    expect(withStyleHashes(page(['a{}', 'a{}']))).toContain(`style-src 'self' ${sha('a{}')};`);
    const plain = `<html><head><meta http-equiv="Content-Security-Policy" content="${csp}"></head></html>`;
    expect(withStyleHashes(plain)).toBe(plain);
  });

  it('leaves pages without a CSP meta tag unchanged (development)', () => {
    const html = '<html><head><style>a{}</style></head></html>';
    expect(withStyleHashes(html)).toBe(html);
  });

  it('handles style tags with attributes', () => {
    const html = `<html><head><meta http-equiv="Content-Security-Policy" content="${csp}"><style data-x="1">c{}</style></head></html>`;
    expect(withStyleHashes(html)).toContain(sha('c{}'));
  });
});
