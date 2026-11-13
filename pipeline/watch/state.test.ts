import { describe, expect, it } from 'vitest';
import {
  EMPTY_STATE,
  candidateKeys,
  markSeen,
  newCandidates,
  parseState,
  serializeState,
  type Candidate,
} from './state';

const candidate = (overrides: Partial<Candidate> = {}): Candidate => ({
  origin: 'pubmed',
  title: 'Recommendations for X',
  journal: 'J Am Soc Echocardiogr',
  date: '2026-11-01',
  pmid: '41000001',
  doi: '10.1016/J.ECHO.2026.01.001',
  ...overrides,
});

describe('candidateKeys (TS-06.1.4)', () => {
  it('keys a candidate by PMID and lower-cased DOI', () => {
    expect(candidateKeys(candidate())).toEqual(['pmid:41000001', 'doi:10.1016/j.echo.2026.01.001']);
  });

  it('works with only one identifier', () => {
    expect(candidateKeys(candidate({ pmid: undefined }))).toEqual(['doi:10.1016/j.echo.2026.01.001']);
    expect(candidateKeys(candidate({ doi: undefined }))).toEqual(['pmid:41000001']);
  });
});

describe('newCandidates', () => {
  it('drops candidates already seen in an earlier run (by PMID or DOI)', () => {
    const state = markSeen(EMPTY_STATE, [candidate()], '2026-11-06');
    expect(newCandidates([candidate({ pmid: undefined })], state, new Set())).toEqual([]);
    expect(newCandidates([candidate({ doi: undefined })], state, new Set())).toEqual([]);
  });

  it('drops documents already in the source registry (DOI match, case-insensitive)', () => {
    expect(newCandidates([candidate()], EMPTY_STATE, new Set(['10.1016/j.echo.2026.01.001']))).toEqual([]);
  });

  it('keeps one candidate when two queries return the same document', () => {
    const fromCrossref = candidate({ origin: 'crossref', pmid: undefined });
    expect(newCandidates([candidate(), fromCrossref], EMPTY_STATE, new Set())).toEqual([candidate()]);
  });

  it('keeps candidates without any identifier out (cannot be deduplicated or cited)', () => {
    expect(newCandidates([candidate({ pmid: undefined, doi: undefined })], EMPTY_STATE, new Set())).toEqual([]);
  });

  it('keeps genuinely new candidates in their order', () => {
    const second = candidate({ pmid: '41000002', doi: '10.1093/ehjci/jeab999' });
    expect(newCandidates([candidate(), second], EMPTY_STATE, new Set())).toEqual([candidate(), second]);
  });
});

describe('state file', () => {
  it('records when each key was first seen and the date of the run', () => {
    const state = markSeen(EMPTY_STATE, [candidate()], '2026-11-06');
    expect(state).toEqual({
      version: 1,
      lastRun: '2026-11-06',
      seen: { 'doi:10.1016/j.echo.2026.01.001': '2026-11-06', 'pmid:41000001': '2026-11-06' },
      pages: {},
    });
    expect(markSeen(state, [candidate()], '2026-11-13').seen['pmid:41000001']).toBe('2026-11-06');
  });

  it('round-trips through stable, sorted JSON (small diffs in Git)', () => {
    const state = markSeen(
      { ...EMPTY_STATE, pages: { 'https://b.example/': 'x', 'https://a.example/': 'y' } },
      [candidate()],
      '2026-11-06',
    );
    const text = serializeState(state);
    expect(text.endsWith('\n')).toBe(true);
    expect(text.indexOf('a.example')).toBeLessThan(text.indexOf('b.example'));
    expect(text.indexOf('doi:')).toBeLessThan(text.indexOf('pmid:'));
    expect(parseState(text)).toEqual(state);
  });

  it('starts empty when there is no state file yet', () => {
    expect(parseState(undefined)).toEqual(EMPTY_STATE);
    expect(parseState(serializeState(EMPTY_STATE))).toEqual(EMPTY_STATE);
  });

  it('refuses a malformed state file instead of silently starting over (would re-report everything)', () => {
    expect(() => parseState('{oops')).toThrow(/state file/);
    expect(() => parseState('null')).toThrow(/version/);
    expect(() => parseState('{"version":2,"seen":{},"pages":{}}')).toThrow(/version/);
    expect(() => parseState('{"version":1,"seen":[],"pages":{}}')).toThrow(/seen/);
    expect(() => parseState('{"version":1,"seen":{"a":1},"pages":{}}')).toThrow(/seen/);
    expect(() => parseState('{"version":1,"seen":{},"pages":{"u":2}}')).toThrow(/pages/);
    expect(() => parseState('{"version":1,"seen":{},"pages":{},"lastRun":5}')).toThrow(/lastRun/);
  });
});
