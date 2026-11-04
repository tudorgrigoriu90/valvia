import { describe, expect, it } from 'vitest';
import { redirectPage } from './page';

describe('redirectPage (TS-02.1.3)', () => {
  it('renders a static redirect with meta refresh, canonical, noindex, strict CSP and a visible link', () => {
    const html = redirectPage('https://example.org', '/valvia/vhd/mitral/');
    expect(html).toContain('<meta http-equiv="refresh" content="0; url=/valvia/vhd/mitral/">');
    expect(html).toContain('<link rel="canonical" href="https://example.org/valvia/vhd/mitral/">');
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(html).toContain(`content="default-src 'none'"`);
    expect(html).toContain('<a href="/valvia/vhd/mitral/">');
  });

  it('escapes the target URL', () => {
    expect(redirectPage('https://example.org', '/valvia/a"b/')).toContain('/valvia/a&quot;b/');
  });
});
