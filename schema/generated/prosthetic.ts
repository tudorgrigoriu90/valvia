/**
 * DO NOT EDIT: generated from /schema by `npm run gen:types` (ADR 0003).
 * A unit test fails when this file is out of date.
 */

/**
 * One published expected value for one parameter at one size.
 */
export type ExpectedValue = {
  /**
   * Id of the parameter (content/parameters/<id>.yaml).
   */
  parameter: string;
  /**
   * How the source reports the value: mean-sd (mean ± SD), mean (no SD reported), median-iqr (median with interquartile range) or threshold (operator + value, e.g. '< 15').
   */
  statistic: 'mean-sd' | 'mean' | 'median-iqr' | 'threshold';
  mean?: number;
  sd?: number;
  median?: number;
  /**
   * Lower end of the published interquartile range.
   */
  q1?: number;
  /**
   * Upper end of the published interquartile range.
   */
  q3?: number;
  operator?: '<' | '<=' | '>' | '>=';
  value?: number;
  /**
   * Unit as published, also the unit displayed (decision PO-4).
   */
  unit:
    | '1'
    | '%'
    | 'mm'
    | 'cm'
    | 'mm/m²'
    | 'cm/m²'
    | 'mm²'
    | 'cm²'
    | 'cm²/m²'
    | 'mL'
    | 'mL/m²'
    | 'g'
    | 'g/m²'
    | 'g/m^2.7'
    | 'g/m'
    | 'm/s'
    | 'cm/s'
    | 'm/s²'
    | 'cm/s²'
    | 'mmHg'
    | 'ms'
    | 's'
    | 'bpm'
    | 'mL/s'
    | 'mL/min/kg'
    | 'AU'
    | '°'
    | 'years'
    | 'mm/mmHg'
    | 'WU';
  /**
   * Imaging modality (SME decision 4: CT and CMR values are included and badged).
   */
  modality: 'Echo' | 'CT' | 'CMR';
  /**
   * Non-empty single-line text.
   */
  setting?: string;
  population: PopulationQualifiers;
  /**
   * Footnotes printed with the value, e.g. 'Limited data, no SD reported.'
   *
   * Items: Non-empty text that may span lines (notes, caveats).
   */
  caveats?: string[];
  citation: Citation;
} & {
  /**
   * Id of the parameter (content/parameters/<id>.yaml).
   */
  parameter: string;
  /**
   * How the source reports the value: mean-sd (mean ± SD), mean (no SD reported), median-iqr (median with interquartile range) or threshold (operator + value, e.g. '< 15').
   */
  statistic: 'mean-sd' | 'mean' | 'median-iqr' | 'threshold';
  mean?: number;
  sd?: number;
  median?: number;
  /**
   * Lower end of the published interquartile range.
   */
  q1?: number;
  /**
   * Upper end of the published interquartile range.
   */
  q3?: number;
  operator?: '<' | '<=' | '>' | '>=';
  value?: number;
  /**
   * Unit as published, also the unit displayed (decision PO-4).
   */
  unit:
    | '1'
    | '%'
    | 'mm'
    | 'cm'
    | 'mm/m²'
    | 'cm/m²'
    | 'mm²'
    | 'cm²'
    | 'cm²/m²'
    | 'mL'
    | 'mL/m²'
    | 'g'
    | 'g/m²'
    | 'g/m^2.7'
    | 'g/m'
    | 'm/s'
    | 'cm/s'
    | 'm/s²'
    | 'cm/s²'
    | 'mmHg'
    | 'ms'
    | 's'
    | 'bpm'
    | 'mL/s'
    | 'mL/min/kg'
    | 'AU'
    | '°'
    | 'years'
    | 'mm/mmHg'
    | 'WU';
  /**
   * Imaging modality (SME decision 4: CT and CMR values are included and badged).
   */
  modality: 'Echo' | 'CT' | 'CMR';
  /**
   * Non-empty single-line text.
   */
  setting?: string;
  population: PopulationQualifiers;
  /**
   * Footnotes printed with the value, e.g. 'Limited data, no SD reported.'
   *
   * Items: Non-empty text that may span lines (notes, caveats).
   */
  caveats?: string[];
  citation: Citation;
};

/**
 * Expected (normal) Doppler values of one prosthetic valve model in one position, by labelled size (TS-02.2.8). One file per model and position: content/prosthetics/<id>.yaml. Values are stored as published (mean ± SD, median (IQR), mean only, or a threshold); nothing is computed for a patient.
 */
export interface ProstheticValve {
  /**
   * Stable id, conventionally <position>-<model>, e.g. 'aortic-sapien-3'.
   */
  id: string;
  /**
   * Model name as printed in the source table, e.g. 'SAPIEN 3' or 'Abbott Trifecta'.
   */
  name: string;
  /**
   * Implant position.
   */
  position: 'aortic' | 'mitral' | 'tricuspid' | 'pulmonary';
  /**
   * Prosthesis type, used for the picker's second step.
   */
  type:
    | 'mechanical'
    | 'bioprosthetic-stented'
    | 'bioprosthetic-stentless'
    | 'homograft'
    | 'valved-conduit'
    | 'transcatheter';
  /**
   * Type wording printed in the source, when more specific than the enum, e.g. 'Bileaflet' or 'Stented pericardial bioprosthesis'.
   */
  typeLabel?: string;
  /**
   * Other names of the same model indexed by search, e.g. earlier trade names.
   *
   * Items: Non-empty single-line text.
   */
  aliases?: string[];
  /**
   * Labelled sizes in the order printed, each with its expected values.
   *
   * @minItems 1
   */
  sizes: [Size, ...Size[]];
}
export interface Size {
  /**
   * Non-empty single-line text.
   */
  size: string;
  /**
   * @minItems 1
   */
  values: [ExpectedValue, ...ExpectedValue[]];
}
/**
 * Who a value applies to (TS-02.2.5). ageGroup is mandatory so adult and paediatric values are never mixed (hazard log). Bands use inclusive min and exclusive max.
 */
export interface PopulationQualifiers {
  /**
   * Population of this value: exactly one of adult or paediatric.
   */
  ageGroup: 'adult' | 'paediatric';
  /**
   * Sex-specific value; omit when the value applies to both sexes.
   */
  sex?: 'male' | 'female';
  /**
   * Age range the value applies to (min inclusive, max exclusive).
   */
  ageBand?: (
    | {
        min: unknown;
      }
    | {
        max: unknown;
      }
  ) & {
    /**
     * Lower bound (inclusive).
     */
    min?: number;
    /**
     * Upper bound (exclusive).
     */
    max?: number;
    /**
     * Unit of the bounds.
     */
    unit: 'days' | 'months' | 'years';
    /**
     * Non-empty single-line text.
     */
    label?: string;
  };
  /**
   * Body surface area range in m² (DuBois), min inclusive, max exclusive.
   */
  bsaBand?: (
    | {
        min: unknown;
      }
    | {
        max: unknown;
      }
  ) & {
    /**
     * Lower bound in m² (inclusive).
     */
    min?: number;
    /**
     * Upper bound in m² (exclusive).
     */
    max?: number;
    /**
     * Non-empty single-line text.
     */
    label?: string;
  };
  /**
   * Rhythm-specific value (e.g. diastolic function in atrial fibrillation); omit when rhythm-independent.
   */
  rhythm?: 'sinus' | 'atrial-fibrillation';
  /**
   * Id of the cited z-score dataset (source of type z-score-dataset) a z-score value refers to. Shown as published; no patient z-score is computed.
   */
  zScoreReference?: string;
}
/**
 * Where a value comes from: a registered source plus a locator inside it (TS-02.3.2). Every value has one.
 */
export interface Citation {
  /**
   * Id of a registered source document.
   */
  source: string;
  /**
   * Position in the source; at least one field is required.
   */
  locator: {
    /**
     * Table number or label (e.g. '8', 'S3').
     */
    table?: string;
    /**
     * Figure number or label (e.g. '2B').
     */
    figure?: string;
    /**
     * Section number (e.g. '6.2.1').
     */
    section?: string;
    /**
     * Page (e.g. 'e45').
     */
    page?: string;
  };
}
