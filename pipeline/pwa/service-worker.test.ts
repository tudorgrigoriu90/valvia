import { describe, expect, it } from 'vitest';
import { precacheUrls, renderServiceWorker, versionOf } from './service-worker';

describe('precacheUrls (TS-05.3.2)', () => {
  it('maps built files to URLs under the base path, directory pages to their folder URL', () => {
    expect(
      precacheUrls(
        [
          'index.html',
          'a/b/index.html',
          '404.html',
          '_astro/x.css',
          'pagefind/pagefind.js',
          'icon.svg',
          'sw.js',
          'robots.txt',
          'x.map',
        ],
        '/valvia/',
      ),
    ).toEqual([
      '/valvia/',
      '/valvia/a/b/',
      '/valvia/404.html',
      '/valvia/_astro/x.css',
      '/valvia/pagefind/pagefind.js',
      '/valvia/icon.svg',
      '/valvia/robots.txt',
    ]);
  });
});

describe('versionOf', () => {
  it('changes when any file content changes and is stable otherwise', () => {
    const a = versionOf([
      ['a.html', 'x'],
      ['b.js', 'y'],
    ]);
    expect(
      versionOf([
        ['b.js', 'y'],
        ['a.html', 'x'],
      ]),
    ).toBe(a);
    expect(
      versionOf([
        ['a.html', 'x2'],
        ['b.js', 'y'],
      ]),
    ).not.toBe(a);
    expect(a).toMatch(/^[0-9a-f]{12}$/);
  });
});

describe('renderServiceWorker', () => {
  it('embeds the version, base and precache list as JSON', () => {
    const sw = renderServiceWorker(['/valvia/', '/valvia/x.css'], 'abc123', '/valvia/');
    expect(sw).toContain('const VERSION = "abc123";');
    expect(sw).toContain('const BASE = "/valvia/";');
    expect(sw).toContain('const PRECACHE = ["/valvia/","/valvia/x.css"];');
    expect(sw).toContain("self.addEventListener('fetch'");
  });
});
