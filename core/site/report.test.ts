import { describe, expect, it } from 'vitest';
import { REPOSITORY, contactEmail, reportIssueUrl, reportMailto } from './report';

const context = {
  pageUrl: 'https://valvia-echo.se/valvular-heart-disease/primary-mr/#severity',
  topic: 'Primary MR: severity grading',
  section: 'Severity grading',
};

describe('reportIssueUrl (TS-06.5.1)', () => {
  it('opens the value-problem issue form of the repository', () => {
    const url = new URL(reportIssueUrl(context));
    expect(`${url.origin}${url.pathname}`).toBe(`https://github.com/${REPOSITORY}/issues/new`);
    expect(url.searchParams.get('template')).toBe('value-problem.yml');
  });

  it('prefills the title and the page field with the section link', () => {
    const url = new URL(reportIssueUrl(context));
    expect(url.searchParams.get('title')).toBe('Value problem: Primary MR: severity grading › Severity grading');
    expect(url.searchParams.get('page')).toBe(context.pageUrl);
  });
});

describe('reportMailto', () => {
  it('builds an e-mail with subject and the page link in the body, all encoded', () => {
    const href = reportMailto('reports@example.org', context);
    expect(href.startsWith('mailto:reports@example.org?subject=')).toBe(true);
    const params = new URLSearchParams(href.slice(href.indexOf('?') + 1).replaceAll('+', '%2B'));
    expect(params.get('subject')).toBe('Value problem: Primary MR: severity grading › Severity grading');
    expect(params.get('body')).toContain(context.pageUrl);
    expect(params.get('body')).toContain('Which value');
    expect(href).not.toMatch(/\s/);
  });
});

describe('contactEmail', () => {
  it('is off unless VALVIA_CONTACT_EMAIL is set', () => {
    expect(contactEmail({})).toBeUndefined();
    expect(contactEmail({ VALVIA_CONTACT_EMAIL: '' })).toBeUndefined();
  });

  it('accepts a plain address', () => {
    expect(contactEmail({ VALVIA_CONTACT_EMAIL: 'reports@example.org' })).toBe('reports@example.org');
  });

  it.each(['not-an-address', 'a@b', 'a b@example.org', 'a@example.org?cc=x@example.org', 'mailto:a@example.org'])(
    'fails the build for a malformed address %j',
    (value) => {
      expect(() => contactEmail({ VALVIA_CONTACT_EMAIL: value })).toThrow(/VALVIA_CONTACT_EMAIL/);
    },
  );
});
