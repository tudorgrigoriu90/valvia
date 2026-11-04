/**
 * DO NOT EDIT: generated from /schema by `npm run gen:types` (ADR 0003).
 * A unit test fails when this file is out of date.
 */

/**
 * A measured or derived echocardiographic parameter (TS-02.2.1). One file per parameter: content/parameters/<id>.yaml. Values reference parameters by id.
 */
export interface Parameter {
  /**
   * Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  id: string;
  /**
   * Full name, e.g. 'Effective regurgitant orifice area'.
   */
  name: string;
  /**
   * Abbreviation shown in tables and indexed by search, e.g. 'EROA'.
   */
  abbreviation?: string;
  /**
   * Physical quantity of a parameter; decides the display unit (NFR-15) and which units a value may use.
   */
  quantity:
    | 'dimensionless'
    | 'ratio'
    | 'percent'
    | 'length'
    | 'indexed-length'
    | 'area'
    | 'indexed-area'
    | 'volume'
    | 'indexed-volume'
    | 'mass'
    | 'indexed-mass'
    | 'velocity-blood'
    | 'velocity-tissue'
    | 'velocity-time-integral'
    | 'acceleration'
    | 'pressure'
    | 'time'
    | 'heart-rate'
    | 'flow-rate'
    | 'calcium-score'
    | 'angle'
    | 'age';
  /**
   * Display unit of the parameter (house unit per NFR-15). Values may be published in another unit of the same quantity and are converted for display.
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
    | 'm/s'
    | 'cm/s'
    | 'm/s²'
    | 'mmHg'
    | 'ms'
    | 's'
    | 'bpm'
    | 'mL/s'
    | 'AU'
    | '°'
    | 'years';
  /**
   * Modalities in which the parameter is measured; each value names one of them.
   *
   * @minItems 1
   *
   * Items: Imaging modality (SME decision 4: CT and CMR values are included and badged).
   */
  modalities: ['Echo' | 'CT' | 'CMR', ...('Echo' | 'CT' | 'CMR')[]];
  /**
   * Alternative names and abbreviations indexed by search (ADR 0004).
   *
   * Items: Non-empty single-line text.
   */
  synonyms?: string[];
  /**
   * View / method note: how and where it is measured, pitfalls (METH).
   */
  method?: string;
}
