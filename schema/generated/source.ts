/**
 * DO NOT EDIT: generated from /schema by `npm run gen:types` (ADR 0003).
 * A unit test fails when this file is out of date.
 */

/**
 * A registered source document: an ESC (incl. EACVI) or ASE document, or a paediatric z-score dataset cited by one (TS-02.3.1). One file per source: content/sources/<id>.yaml.
 */
export type SourceDocument = {
  /**
   * Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  id: string;
  /**
   * Full title as published (single line; publication titles can be long).
   */
  title: string;
  /**
   * Short label for source chips (e.g. 'ESC/EACTS VHD 2025').
   */
  shortTitle?: string;
  /**
   * Issuing societies as acronyms (e.g. [ESC, EACTS]). Only ESC, EACVI and ASE documents are allowed, except cited z-score datasets (SME decision 2, F1).
   *
   * @minItems 1
   */
  issuers: [string, ...string[]];
  /**
   * Document type.
   */
  type:
    | 'guideline'
    | 'recommendation'
    | 'consensus-statement'
    | 'position-statement'
    | 'focused-update'
    | 'standardized-definitions'
    | 'z-score-dataset';
  /**
   * Publication year.
   */
  year: number;
  /**
   * Journal name.
   */
  journal?: string;
  /**
   * Digital Object Identifier, without the https://doi.org/ prefix.
   */
  doi?: string;
  /**
   * Landing page of the document (https).
   */
  url?: string;
  /**
   * Current documents are shown as recommendations; superseded and withdrawn ones only as history (SME decision 3).
   */
  status: 'current' | 'superseded' | 'withdrawn';
  /**
   * Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  supersededBy?: string;
  /**
   * For z-score datasets: ids of the registered ESC/ASE documents that cite this dataset.
   *
   * @minItems 1
   *
   * Items: Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  citedBy?: [string, ...string[]];
  /**
   * Internal notes for maintainers.
   */
  notes?: string;
};
