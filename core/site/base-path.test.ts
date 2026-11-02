import { describe, expect, it } from 'vitest';
import { normaliseBase, withBase } from './base-path';

describe('normaliseBase', () => {
  it.each([
    ['/', '/'],
    ['', '/'],
    ['/valvia', '/valvia/'],
    ['/valvia/', '/valvia/'],
    ['valvia', '/valvia/'],
    ['/valvia/pr-preview/pr-12', '/valvia/pr-preview/pr-12/'],
    ['//valvia//', '/valvia/'],
  ])('normalises %j to %j', (input, expected) => {
    expect(normaliseBase(input)).toBe(expected);
  });
});

describe('withBase', () => {
  it('prefixes an internal path with the base', () => {
    expect(withBase('/valvia/', 'topics/primary-mr/')).toBe('/valvia/topics/primary-mr/');
  });

  it('does not duplicate slashes when the path starts with one', () => {
    expect(withBase('/valvia/', '/topics/primary-mr/')).toBe('/valvia/topics/primary-mr/');
  });

  it('returns the base for the home page', () => {
    expect(withBase('/valvia/', '')).toBe('/valvia/');
    expect(withBase('/valvia/', '/')).toBe('/valvia/');
  });

  it('works with a root base (custom domain)', () => {
    expect(withBase('/', 'topics/x/')).toBe('/topics/x/');
  });

  it('keeps query strings and fragments', () => {
    expect(withBase('/valvia/', 'topics/x/#grading')).toBe('/valvia/topics/x/#grading');
  });

  it('rejects absolute URLs so external links never pass through the base helper', () => {
    expect(() => withBase('/valvia/', 'https://example.org/')).toThrow(/absolute URL/);
    expect(() => withBase('/valvia/', '//example.org/')).toThrow(/absolute URL/);
  });
});
