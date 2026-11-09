/**
 * Cookieless analytics (TS-07.5.1, NFR-11). Off unless the build sets exactly one provider:
 * VALVIA_GOATCOUNTER (site code) or VALVIA_CF_BEACON_TOKEN (Cloudflare Web Analytics token).
 * The beacon is the only third-party script (TS-05.2.2); the CSP admits only its origins.
 */
export interface AnalyticsConfig {
  provider: 'GoatCounter' | 'Cloudflare Web Analytics';
  src: string;
  attributes: Record<string, string>;
  scriptOrigin: string;
  connectOrigin: string;
}

type Env = Readonly<Record<string, string | undefined>>;

const GOATCOUNTER_CODE = /^[a-z0-9-]{1,63}$/;
const CF_TOKEN = /^[A-Za-z0-9]{1,64}$/;

function setting(env: Env, name: string, pattern: RegExp): string | undefined {
  const value = env[name];
  if (value === undefined || value === '') return undefined;
  if (!pattern.test(value)) throw new Error(`${name} has an invalid format: expected ${pattern.source}`);
  return value;
}

export function analyticsConfig(env: Env): AnalyticsConfig | undefined {
  const code = setting(env, 'VALVIA_GOATCOUNTER', GOATCOUNTER_CODE);
  const token = setting(env, 'VALVIA_CF_BEACON_TOKEN', CF_TOKEN);
  if (code !== undefined && token !== undefined) {
    throw new Error('Configure only one analytics provider (VALVIA_GOATCOUNTER or VALVIA_CF_BEACON_TOKEN)');
  }
  if (code !== undefined) {
    const endpoint = `https://${code}.goatcounter.com`;
    return {
      provider: 'GoatCounter',
      src: 'https://gc.zgo.at/count.js',
      attributes: { 'data-goatcounter': `${endpoint}/count` },
      scriptOrigin: 'https://gc.zgo.at',
      connectOrigin: endpoint,
    };
  }
  if (token !== undefined) {
    return {
      provider: 'Cloudflare Web Analytics',
      src: 'https://static.cloudflareinsights.com/beacon.min.js',
      attributes: { 'data-cf-beacon': JSON.stringify({ token }) },
      scriptOrigin: 'https://static.cloudflareinsights.com',
      connectOrigin: 'https://cloudflareinsights.com',
    };
  }
  return undefined;
}

/**
 * Content Security Policy delivered as a <meta> tag (ADR 0002; 'wasm-unsafe-eval' for Pagefind, ADR 0004).
 * No 'unsafe-inline': scripts are never inlined and inline styles get hashes after the build (pipeline/csp).
 * frame-ancestors cannot be set via meta.
 */
export function contentSecurityPolicy(analytics: AnalyticsConfig | undefined): string {
  const extra = (origin: string | undefined): string => (origin === undefined ? '' : ` ${origin}`);
  return [
    "default-src 'self'",
    `script-src 'self' 'wasm-unsafe-eval'${extra(analytics?.scriptOrigin)}`,
    "style-src 'self'",
    `img-src 'self' data:${extra(analytics?.connectOrigin)}`,
    `connect-src 'self'${extra(analytics?.connectOrigin)}`,
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ');
}
