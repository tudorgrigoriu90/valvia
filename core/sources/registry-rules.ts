/**
 * Registry-wide source rules (TS-02.3.1): allowed bodies (SME decision 2), cited z-score datasets
 * (F1), ESC associations (F3, warning), supersession integrity. Safety-critical: 100 % coverage.
 */
import type { SourceDocument } from '../../schema/generated/source';
import type { PathSegment } from '../content/yaml';

export interface SourceFinding {
  sourceId: string;
  path: PathSegment[];
  severity: 'error' | 'warning';
  rule: 'source-allowlist' | 'source-reference' | 'source-supersession' | 'duplicate-id';
  message: string;
}

/** Bodies whose documents Valvia may cite. */
export const ALLOWED_ISSUERS: ReadonlySet<string> = new Set(['ESC', 'EACVI', 'ASE']);

/** ESC associations other than EACVI: allowed with a warning until SME question F3 is answered. */
export const ESC_ASSOCIATIONS: ReadonlySet<string> = new Set(['EAPCI', 'HFA', 'EHRA', 'EAPC', 'ACVC', 'ACNAP']);

const isAllowedDocument = (source: SourceDocument): boolean =>
  source.type !== 'z-score-dataset' && source.issuers.some((issuer) => ALLOWED_ISSUERS.has(issuer));

function checkIssuers(source: SourceDocument): SourceFinding[] {
  if (source.type === 'z-score-dataset' || isAllowedDocument(source)) return [];
  const associations = source.issuers.filter((issuer) => ESC_ASSOCIATIONS.has(issuer));
  if (associations.length > 0) {
    return [
      {
        sourceId: source.id,
        path: ['issuers'],
        severity: 'warning',
        rule: 'source-allowlist',
        message: `${associations.join(', ')} is an ESC association other than EACVI: allowed pending SME decision F3`,
      },
    ];
  }
  return [
    {
      sourceId: source.id,
      path: ['issuers'],
      severity: 'error',
      rule: 'source-allowlist',
      message: `issuers ${source.issuers.join(', ')} are not allowed: only ESC (incl. EACVI) and ASE documents may be cited (SME decision 2)`,
    },
  ];
}

function checkCitedBy(source: SourceDocument, byId: ReadonlyMap<string, SourceDocument>): SourceFinding[] {
  if (source.citedBy === undefined) return [];
  if (source.type !== 'z-score-dataset') {
    return [
      {
        sourceId: source.id,
        path: ['citedBy'],
        severity: 'error',
        rule: 'source-supersession',
        message: 'citedBy is only allowed on z-score datasets',
      },
    ];
  }
  return source.citedBy.flatMap((citingId, index): SourceFinding[] => {
    const citing = byId.get(citingId);
    const path = ['citedBy', index];
    if (citing === undefined) {
      return [
        {
          sourceId: source.id,
          path,
          severity: 'error',
          rule: 'source-reference',
          message: `citedBy[${String(index)}] refers to unknown source '${citingId}'`,
        },
      ];
    }
    if (!isAllowedDocument(citing)) {
      return [
        {
          sourceId: source.id,
          path,
          severity: 'error',
          rule: 'source-allowlist',
          message: `citedBy[${String(index)}] '${citingId}' is not an ESC (incl. EACVI) or ASE document`,
        },
      ];
    }
    return [];
  });
}

function checkSupersession(source: SourceDocument, byId: ReadonlyMap<string, SourceDocument>): SourceFinding[] {
  const { supersededBy } = source;
  if (supersededBy === undefined) return [];
  const finding = (rule: SourceFinding['rule'], message: string): SourceFinding[] => [
    { sourceId: source.id, path: ['supersededBy'], severity: 'error', rule, message },
  ];
  if (source.status !== 'superseded') {
    return finding('source-supersession', `supersededBy requires status 'superseded' (got '${source.status}')`);
  }
  if (supersededBy === source.id)
    return finding('source-supersession', 'supersededBy must not refer to the source itself');
  const successor = byId.get(supersededBy);
  if (successor === undefined)
    return finding('source-reference', `supersededBy refers to unknown source '${supersededBy}'`);
  if (successor.year < source.year) {
    return finding(
      'source-supersession',
      `successor '${successor.id}' (${String(successor.year)}) is older than this source (${String(source.year)})`,
    );
  }
  return [];
}

/** Reports each supersession cycle once, at the first member in registry order. */
function checkCycles(sources: readonly SourceDocument[], byId: ReadonlyMap<string, SourceDocument>): SourceFinding[] {
  const findings: SourceFinding[] = [];
  const reported = new Set<string>();
  for (const start of sources) {
    const chain = [start.id];
    let next = start.supersededBy;
    while (next !== undefined && next !== start.id && !chain.includes(next)) {
      chain.push(next);
      next = byId.get(next)?.supersededBy;
    }
    if (next === start.id && chain.length > 1 && !chain.some((id) => reported.has(id))) {
      chain.forEach((id) => reported.add(id));
      findings.push({
        sourceId: start.id,
        path: ['supersededBy'],
        severity: 'error',
        rule: 'source-supersession',
        message: `supersession cycle: ${[...chain, start.id].join(' → ')}`,
      });
    }
  }
  return findings;
}

export function checkSourceRegistry(sources: readonly SourceDocument[]): SourceFinding[] {
  const byId = new Map<string, SourceDocument>();
  const findings: SourceFinding[] = [];
  for (const source of sources) {
    if (byId.has(source.id)) {
      findings.push({
        sourceId: source.id,
        path: ['id'],
        severity: 'error',
        rule: 'duplicate-id',
        message: `duplicate source id '${source.id}'`,
      });
    } else {
      byId.set(source.id, source);
    }
  }
  for (const source of sources) {
    findings.push(...checkIssuers(source), ...checkCitedBy(source, byId), ...checkSupersession(source, byId));
  }
  return [...findings, ...checkCycles(sources, byId)];
}
