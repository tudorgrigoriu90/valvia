import { describe, expect, it } from 'vitest';
import { affectedTopics, candidateIssue, relatedSources, safeText, type IssueContext } from './issue';
import type { Candidate } from './state';

const CONTEXT: IssueContext = {
  sources: [
    {
      id: 'ase-2025-right-heart',
      title: 'Guidelines for the Echocardiographic Assessment of the Right Heart in Adults',
      year: 2025,
    },
    {
      id: 'ase-2017-native-regurgitation',
      title: 'Recommendations for Noninvasive Evaluation of Native Valvular Regurgitation',
      year: 2017,
    },
    {
      id: 'ase-eacvi-2015-chamber-quantification',
      title: 'Recommendations for Cardiac Chamber Quantification by Echocardiography in Adults',
      year: 2015,
    },
  ],
  topicsBySource: new Map([
    [
      'ase-eacvi-2015-chamber-quantification',
      [
        {
          id: 'left-atrium',
          title: 'Left atrium',
          url: 'https://valvia-echo.se/chamber-size-and-function/left-atrium/',
        },
      ],
    ],
    ['ase-2025-right-heart', [{ id: 'rv-size', title: 'RV size', url: 'https://valvia-echo.se/x/rv-size/' }]],
  ]),
};

const NEW_DOC: Candidate = {
  origin: 'pubmed',
  pmid: '42000001',
  doi: '10.1016/j.echo.2026.05.001',
  journal: 'J Am Soc Echocardiogr',
  date: '2026-05-01',
  title: 'Guidelines for the Echocardiographic Assessment of the Right Heart in Children',
};

const ERRATUM: Candidate = {
  origin: 'crossref',
  doi: '10.1016/j.echo.2016.01.015',
  journal: 'Journal of the American Society of Echocardiography',
  date: '2016-03-01',
  title: 'Erratum: Correction',
  updates: { source: 'ase-eacvi-2015-chamber-quantification', kind: 'erratum' },
};

describe('safeText (TS-06.2.1)', () => {
  it('neutralises mentions, HTML and line breaks from untrusted titles', () => {
    expect(safeText('Ping @someone <img src=x>\nnext')).toBe('Ping @​someone &lt;img src=x&gt; next');
  });
});

describe('relatedSources', () => {
  it('finds registered sources whose titles share most content words', () => {
    expect(relatedSources(NEW_DOC, CONTEXT.sources).map((s) => s.id)).toEqual(['ase-2025-right-heart']);
  });

  it('orders several matches by similarity, best first', () => {
    const sources = [
      { id: 'partial', title: 'Right heart function in children with disease', year: 2020 },
      { id: 'close', title: 'Right heart in children', year: 2024 },
    ];
    expect(relatedSources(NEW_DOC, sources).map((s) => s.id)).toEqual(['close', 'partial']);
  });

  it('returns nothing when no title is similar enough', () => {
    expect(relatedSources({ ...NEW_DOC, title: 'Guidelines for sonographer ergonomics' }, CONTEXT.sources)).toEqual([]);
  });
});

describe('affectedTopics', () => {
  it('lists the topics citing the corrected source for an erratum', () => {
    expect(affectedTopics(ERRATUM, CONTEXT).map((t) => t.id)).toEqual(['left-atrium']);
  });

  it('lists the topics citing similar registered sources for a new document', () => {
    expect(affectedTopics(NEW_DOC, CONTEXT).map((t) => t.id)).toEqual(['rv-size']);
  });
});

describe('candidateIssue', () => {
  it('opens a source-candidate issue with metadata, links, possibly superseded sources and topics', () => {
    const issue = candidateIssue(NEW_DOC, CONTEXT);
    expect(issue.title).toBe(
      'New document: Guidelines for the Echocardiographic Assessment of the Right Heart in Children (J Am Soc Echocardiogr, 2026)',
    );
    expect(issue.labels).toEqual(['source-candidate']);
    expect(issue.body).toContain('| PMID | [42000001](https://pubmed.ncbi.nlm.nih.gov/42000001/) |');
    expect(issue.body).toContain('| DOI | [10.1016/j.echo.2026.05.001](https://doi.org/10.1016/j.echo.2026.05.001) |');
    expect(issue.body).toContain('`ase-2025-right-heart` (2025)');
    expect(issue.body).toContain('[RV size](https://valvia-echo.se/x/rv-size/)');
    expect(issue.body).toContain('Only ESC (incl. EACVI) and ASE documents');
  });

  it('opens an erratum issue naming the corrected source and the topics to re-check', () => {
    const issue = candidateIssue(ERRATUM, CONTEXT);
    expect(issue.title).toBe(
      'Erratum to ase-eacvi-2015-chamber-quantification: Correction (Journal of the American Society of Echocardiography, 2016)',
    );
    expect(issue.labels).toEqual(['source-candidate', 'erratum']);
    expect(issue.body).toContain('Corrects registered source `ase-eacvi-2015-chamber-quantification`');
    expect(issue.body).toContain('[Left atrium](https://valvia-echo.se/chamber-size-and-function/left-atrium/)');
    expect(issue.body).not.toContain('| PMID |');
  });

  it('says so when no topic is affected and sanitises the title', () => {
    const issue = candidateIssue({ ...NEW_DOC, title: 'Consensus @team on <b>x</b>', doi: undefined }, CONTEXT);
    expect(issue.title).toContain('Consensus @​team on &lt;b&gt;x&lt;/b&gt;');
    expect(issue.body).toContain('No registered source or topic matched');
    expect(issue.body).not.toContain('| DOI |');
  });

  it('links the society page for a document found by a page watcher', () => {
    const issue = candidateIssue(
      {
        origin: 'page',
        url: 'https://www.asecho.org/guideline/x/',
        title: 'X',
        journal: 'ASE website',
        date: '2026-11-20',
      },
      CONTEXT,
    );
    expect(issue.title).toBe('New document: X (ASE website, 2026)');
    expect(issue.body).toContain('| Page | <https://www.asecho.org/guideline/x/> |');
  });

  it('keeps issue titles within GitHub limits', () => {
    expect(candidateIssue({ ...NEW_DOC, title: 'x'.repeat(400) }, CONTEXT).title.length).toBeLessThanOrEqual(256);
  });
});
