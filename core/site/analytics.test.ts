import { describe, expect, it } from 'vitest';
import { analyticsConfig, contentSecurityPolicy } from './analytics';

describe('analyticsConfig (TS-07.5.1)', () => {
  it('is off unless a cookieless provider is configured', () => {
    expect(analyticsConfig({})).toBeUndefined();
    expect(analyticsConfig({ VALVIA_GOATCOUNTER: '', VALVIA_CF_BEACON_TOKEN: '' })).toBeUndefined();
  });

  it('configures GoatCounter from its site code', () => {
    expect(analyticsConfig({ VALVIA_GOATCOUNTER: 'valvia' })).toEqual({
      provider: 'GoatCounter',
      src: 'https://gc.zgo.at/count.js',
      attributes: { 'data-goatcounter': 'https://valvia.goatcounter.com/count' },
      scriptOrigin: 'https://gc.zgo.at',
      connectOrigin: 'https://valvia.goatcounter.com',
    });
  });

  it('configures Cloudflare Web Analytics from its beacon token', () => {
    expect(analyticsConfig({ VALVIA_CF_BEACON_TOKEN: 'abc123DEF' })).toEqual({
      provider: 'Cloudflare Web Analytics',
      src: 'https://static.cloudflareinsights.com/beacon.min.js',
      attributes: { 'data-cf-beacon': '{"token":"abc123DEF"}' },
      scriptOrigin: 'https://static.cloudflareinsights.com',
      connectOrigin: 'https://cloudflareinsights.com',
    });
  });

  it('rejects malformed codes so nothing can be injected into the page or the CSP', () => {
    expect(() => analyticsConfig({ VALVIA_GOATCOUNTER: 'evil.com/x' })).toThrow(/VALVIA_GOATCOUNTER/);
    expect(() => analyticsConfig({ VALVIA_CF_BEACON_TOKEN: '"};alert(1)' })).toThrow(/VALVIA_CF_BEACON_TOKEN/);
  });

  it('refuses two providers at once', () => {
    expect(() => analyticsConfig({ VALVIA_GOATCOUNTER: 'valvia', VALVIA_CF_BEACON_TOKEN: 'abc' })).toThrow(/only one/);
  });
});

describe('contentSecurityPolicy', () => {
  it('allows only the site itself without analytics', () => {
    const policy = contentSecurityPolicy(undefined);
    expect(policy).toContain("script-src 'self' 'wasm-unsafe-eval';");
    expect(policy).toContain("connect-src 'self';");
    expect(policy).toContain("img-src 'self' data:;");
    expect(policy).not.toContain('https://');
  });

  it('adds exactly the analytics script and beacon origins when configured', () => {
    const policy = contentSecurityPolicy(analyticsConfig({ VALVIA_GOATCOUNTER: 'valvia' }));
    expect(policy).toContain("script-src 'self' 'wasm-unsafe-eval' https://gc.zgo.at;");
    expect(policy).toContain("connect-src 'self' https://valvia.goatcounter.com;");
    expect(policy).toContain("img-src 'self' data: https://valvia.goatcounter.com;");
    expect(policy).toContain("style-src 'self';");
  });
});
