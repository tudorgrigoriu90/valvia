/** Web app manifest (TS-05.3.1), generated so start_url, scope and icons follow the base path (ADR 0002). */
import type { APIRoute } from 'astro';
import { withBase } from '../../core/site/base-path';

export const GET: APIRoute = () => {
  const base = import.meta.env.BASE_URL;
  const manifest = {
    name: 'Valvia',
    short_name: 'Valvia',
    description: 'Echocardiography reference and cut-off values from ESC/EACVI and ASE documents.',
    lang: 'en',
    start_url: withBase(base, '/'),
    scope: withBase(base, '/'),
    display: 'standalone',
    background_color: '#f6f7f9',
    theme_color: '#0b5c8c',
    icons: [
      { src: withBase(base, 'icon.svg'), type: 'image/svg+xml', sizes: 'any', purpose: 'any' },
      { src: withBase(base, 'icon.svg'), type: 'image/svg+xml', sizes: 'any', purpose: 'maskable' },
    ],
  };
  return new Response(JSON.stringify(manifest, null, 2), { headers: { 'Content-Type': 'application/manifest+json' } });
};
