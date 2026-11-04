import { describe, expect, it } from 'vitest';
import { contentVersion, reviewStatus } from './version';

describe('contentVersion (TS-04.5.2)', () => {
  it('prefers an explicit version, then the CI commit, else dev', () => {
    expect(contentVersion({ VALVIA_VERSION: '1.2.0', GITHUB_SHA: 'abcdef1234567' })).toBe('1.2.0');
    expect(contentVersion({ GITHUB_SHA: 'abcdef1234567' })).toBe('abcdef1');
    expect(contentVersion({})).toBe('dev');
  });
});

describe('reviewStatus', () => {
  it('labels draft topics as not yet clinically reviewed (PO-3)', () => {
    expect(reviewStatus({ status: 'draft' })).toEqual({ reviewed: false, label: 'Draft: not yet clinically reviewed' });
    expect(reviewStatus({ status: 'in-review' })).toEqual({ reviewed: false, label: 'In clinical review' });
  });

  it('shows the last review date of published topics', () => {
    expect(reviewStatus({ status: 'published', lastReviewed: '2026-11-10' })).toEqual({
      reviewed: true,
      label: 'Last reviewed: 2026-11-10',
    });
    expect(reviewStatus({ status: 'published' })).toEqual({ reviewed: true, label: 'Reviewed' });
  });
});
