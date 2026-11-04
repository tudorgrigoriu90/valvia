/**
 * DO NOT EDIT: generated from /schema by `npm run gen:types` (ADR 0003).
 * A unit test fails when this file is out of date.
 */

/**
 * A content block on a leaf topic (TS-02.2.3). The type selects the block shape.
 */
export type Block = {
  /**
   * Block type.
   */
  type:
    'grading-table' | 'normal-range-table' | 'threshold-list' | 'criteria-checklist' | 'note' | 'algorithm-reference';
} & (
  | GradingTableBlock
  | NormalRangeTableBlock
  | ThresholdListBlock
  | CriteriaChecklistBlock
  | NoteBlock
  | AlgorithmReferenceBlock
);
/**
 * One published number (or range) for a parameter, with who it applies to and where it comes from (TS-02.2.2). Stored exactly as published.
 */
export type Value = {
  /**
   * Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  parameter: string;
  /**
   * What the value is used for: grading (GRADE), normal-range (NORM), intervention-threshold (INTV), feasibility (FEAS), diagnostic-criterion (CRIT), prognostic-marker (PROG).
   */
  context:
    | 'grading'
    | 'normal-range'
    | 'intervention-threshold'
    | 'feasibility'
    | 'diagnostic-criterion'
    | 'prognostic-marker';
  /**
   * Non-empty single-line text.
   */
  grade?: string;
  /**
   * Comparison as published. 'range' uses min and max; all others use value.
   */
  operator: '<' | '<=' | '>' | '>=' | '=' | 'range';
  /**
   * The published number (single bound).
   */
  value?: number;
  /**
   * Lower end of a published range.
   */
  min?: number;
  /**
   * Upper end of a published range.
   */
  max?: number;
  /**
   * Range only: the lower bound is exclusive (published as '> min'). Default: inclusive.
   */
  minExclusive?: boolean;
  /**
   * Range only: the upper bound is exclusive (published as '< max'). Default: inclusive.
   */
  maxExclusive?: boolean;
  /**
   * Unit as published (converted for display by core/units).
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
   * Modality the value was defined for (Echo, CT or CMR); CT/CMR values are badged (SME decision 4). Must be one of the parameter's modalities.
   */
  modality: 'Echo' | 'CT' | 'CMR';
  population: PopulationQualifiers;
  /**
   * Conditions and footnotes printed with the value, e.g. 'Not valid in atrial fibrillation.'
   *
   * Items: Non-empty text that may span lines (notes, caveats).
   */
  caveats?: string[];
  citation: Citation;
} & {
  /**
   * Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  parameter: string;
  /**
   * What the value is used for: grading (GRADE), normal-range (NORM), intervention-threshold (INTV), feasibility (FEAS), diagnostic-criterion (CRIT), prognostic-marker (PROG).
   */
  context:
    | 'grading'
    | 'normal-range'
    | 'intervention-threshold'
    | 'feasibility'
    | 'diagnostic-criterion'
    | 'prognostic-marker';
  /**
   * Non-empty single-line text.
   */
  grade?: string;
  /**
   * Comparison as published. 'range' uses min and max; all others use value.
   */
  operator: '<' | '<=' | '>' | '>=' | '=' | 'range';
  /**
   * The published number (single bound).
   */
  value?: number;
  /**
   * Lower end of a published range.
   */
  min?: number;
  /**
   * Upper end of a published range.
   */
  max?: number;
  /**
   * Range only: the lower bound is exclusive (published as '> min'). Default: inclusive.
   */
  minExclusive?: boolean;
  /**
   * Range only: the upper bound is exclusive (published as '< max'). Default: inclusive.
   */
  maxExclusive?: boolean;
  /**
   * Unit as published (converted for display by core/units).
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
   * Modality the value was defined for (Echo, CT or CMR); CT/CMR values are badged (SME decision 4). Must be one of the parameter's modalities.
   */
  modality: 'Echo' | 'CT' | 'CMR';
  population: PopulationQualifiers;
  /**
   * Conditions and footnotes printed with the value, e.g. 'Not valid in atrial fibrillation.'
   *
   * Items: Non-empty text that may span lines (notes, caveats).
   */
  caveats?: string[];
  citation: Citation;
} & {
  /**
   * Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  parameter: string;
  /**
   * What the value is used for: grading (GRADE), normal-range (NORM), intervention-threshold (INTV), feasibility (FEAS), diagnostic-criterion (CRIT), prognostic-marker (PROG).
   */
  context:
    | 'grading'
    | 'normal-range'
    | 'intervention-threshold'
    | 'feasibility'
    | 'diagnostic-criterion'
    | 'prognostic-marker';
  /**
   * Non-empty single-line text.
   */
  grade?: string;
  /**
   * Comparison as published. 'range' uses min and max; all others use value.
   */
  operator: '<' | '<=' | '>' | '>=' | '=' | 'range';
  /**
   * The published number (single bound).
   */
  value?: number;
  /**
   * Lower end of a published range.
   */
  min?: number;
  /**
   * Upper end of a published range.
   */
  max?: number;
  /**
   * Range only: the lower bound is exclusive (published as '> min'). Default: inclusive.
   */
  minExclusive?: boolean;
  /**
   * Range only: the upper bound is exclusive (published as '< max'). Default: inclusive.
   */
  maxExclusive?: boolean;
  /**
   * Unit as published (converted for display by core/units).
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
   * Modality the value was defined for (Echo, CT or CMR); CT/CMR values are badged (SME decision 4). Must be one of the parameter's modalities.
   */
  modality: 'Echo' | 'CT' | 'CMR';
  population: PopulationQualifiers;
  /**
   * Conditions and footnotes printed with the value, e.g. 'Not valid in atrial fibrillation.'
   *
   * Items: Non-empty text that may span lines (notes, caveats).
   */
  caveats?: string[];
  citation: Citation;
} & {
  /**
   * Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  parameter: string;
  /**
   * What the value is used for: grading (GRADE), normal-range (NORM), intervention-threshold (INTV), feasibility (FEAS), diagnostic-criterion (CRIT), prognostic-marker (PROG).
   */
  context:
    | 'grading'
    | 'normal-range'
    | 'intervention-threshold'
    | 'feasibility'
    | 'diagnostic-criterion'
    | 'prognostic-marker';
  /**
   * Non-empty single-line text.
   */
  grade?: string;
  /**
   * Comparison as published. 'range' uses min and max; all others use value.
   */
  operator: '<' | '<=' | '>' | '>=' | '=' | 'range';
  /**
   * The published number (single bound).
   */
  value?: number;
  /**
   * Lower end of a published range.
   */
  min?: number;
  /**
   * Upper end of a published range.
   */
  max?: number;
  /**
   * Range only: the lower bound is exclusive (published as '> min'). Default: inclusive.
   */
  minExclusive?: boolean;
  /**
   * Range only: the upper bound is exclusive (published as '< max'). Default: inclusive.
   */
  maxExclusive?: boolean;
  /**
   * Unit as published (converted for display by core/units).
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
   * Modality the value was defined for (Echo, CT or CMR); CT/CMR values are badged (SME decision 4). Must be one of the parameter's modalities.
   */
  modality: 'Echo' | 'CT' | 'CMR';
  population: PopulationQualifiers;
  /**
   * Conditions and footnotes printed with the value, e.g. 'Not valid in atrial fibrillation.'
   *
   * Items: Non-empty text that may span lines (notes, caveats).
   */
  caveats?: string[];
  citation: Citation;
} & {
  /**
   * Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  parameter: string;
  /**
   * What the value is used for: grading (GRADE), normal-range (NORM), intervention-threshold (INTV), feasibility (FEAS), diagnostic-criterion (CRIT), prognostic-marker (PROG).
   */
  context:
    | 'grading'
    | 'normal-range'
    | 'intervention-threshold'
    | 'feasibility'
    | 'diagnostic-criterion'
    | 'prognostic-marker';
  /**
   * Non-empty single-line text.
   */
  grade?: string;
  /**
   * Comparison as published. 'range' uses min and max; all others use value.
   */
  operator: '<' | '<=' | '>' | '>=' | '=' | 'range';
  /**
   * The published number (single bound).
   */
  value?: number;
  /**
   * Lower end of a published range.
   */
  min?: number;
  /**
   * Upper end of a published range.
   */
  max?: number;
  /**
   * Range only: the lower bound is exclusive (published as '> min'). Default: inclusive.
   */
  minExclusive?: boolean;
  /**
   * Range only: the upper bound is exclusive (published as '< max'). Default: inclusive.
   */
  maxExclusive?: boolean;
  /**
   * Unit as published (converted for display by core/units).
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
   * Modality the value was defined for (Echo, CT or CMR); CT/CMR values are badged (SME decision 4). Must be one of the parameter's modalities.
   */
  modality: 'Echo' | 'CT' | 'CMR';
  population: PopulationQualifiers;
  /**
   * Conditions and footnotes printed with the value, e.g. 'Not valid in atrial fibrillation.'
   *
   * Items: Non-empty text that may span lines (notes, caveats).
   */
  caveats?: string[];
  citation: Citation;
} & {
  /**
   * Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  parameter: string;
  /**
   * What the value is used for: grading (GRADE), normal-range (NORM), intervention-threshold (INTV), feasibility (FEAS), diagnostic-criterion (CRIT), prognostic-marker (PROG).
   */
  context:
    | 'grading'
    | 'normal-range'
    | 'intervention-threshold'
    | 'feasibility'
    | 'diagnostic-criterion'
    | 'prognostic-marker';
  /**
   * Non-empty single-line text.
   */
  grade?: string;
  /**
   * Comparison as published. 'range' uses min and max; all others use value.
   */
  operator: '<' | '<=' | '>' | '>=' | '=' | 'range';
  /**
   * The published number (single bound).
   */
  value?: number;
  /**
   * Lower end of a published range.
   */
  min?: number;
  /**
   * Upper end of a published range.
   */
  max?: number;
  /**
   * Range only: the lower bound is exclusive (published as '> min'). Default: inclusive.
   */
  minExclusive?: boolean;
  /**
   * Range only: the upper bound is exclusive (published as '< max'). Default: inclusive.
   */
  maxExclusive?: boolean;
  /**
   * Unit as published (converted for display by core/units).
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
   * Modality the value was defined for (Echo, CT or CMR); CT/CMR values are badged (SME decision 4). Must be one of the parameter's modalities.
   */
  modality: 'Echo' | 'CT' | 'CMR';
  population: PopulationQualifiers;
  /**
   * Conditions and footnotes printed with the value, e.g. 'Not valid in atrial fibrillation.'
   *
   * Items: Non-empty text that may span lines (notes, caveats).
   */
  caveats?: string[];
  citation: Citation;
} & {
  /**
   * Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  parameter: string;
  /**
   * What the value is used for: grading (GRADE), normal-range (NORM), intervention-threshold (INTV), feasibility (FEAS), diagnostic-criterion (CRIT), prognostic-marker (PROG).
   */
  context:
    | 'grading'
    | 'normal-range'
    | 'intervention-threshold'
    | 'feasibility'
    | 'diagnostic-criterion'
    | 'prognostic-marker';
  /**
   * Non-empty single-line text.
   */
  grade?: string;
  /**
   * Comparison as published. 'range' uses min and max; all others use value.
   */
  operator: '<' | '<=' | '>' | '>=' | '=' | 'range';
  /**
   * The published number (single bound).
   */
  value?: number;
  /**
   * Lower end of a published range.
   */
  min?: number;
  /**
   * Upper end of a published range.
   */
  max?: number;
  /**
   * Range only: the lower bound is exclusive (published as '> min'). Default: inclusive.
   */
  minExclusive?: boolean;
  /**
   * Range only: the upper bound is exclusive (published as '< max'). Default: inclusive.
   */
  maxExclusive?: boolean;
  /**
   * Unit as published (converted for display by core/units).
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
   * Modality the value was defined for (Echo, CT or CMR); CT/CMR values are badged (SME decision 4). Must be one of the parameter's modalities.
   */
  modality: 'Echo' | 'CT' | 'CMR';
  population: PopulationQualifiers;
  /**
   * Conditions and footnotes printed with the value, e.g. 'Not valid in atrial fibrillation.'
   *
   * Items: Non-empty text that may span lines (notes, caveats).
   */
  caveats?: string[];
  citation: Citation;
};

/**
 * A node of the content taxonomy (category, subcategory or leaf). One file per node: content/topics/<id>.yaml (TS-02.1.1).
 */
export interface TopicNode {
  /**
   * Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  id: string;
  /**
   * Taxonomy number for humans (e.g. 3.2.1.2). May change when the tree is reorganised; never used in URLs.
   */
  ref?: string;
  /**
   * URL segment: lowercase kebab-case. May change; old slugs go to formerSlugs.
   */
  slug: string;
  /**
   * Previous slugs of this node; each gets a static redirect page (TS-02.1.3).
   *
   * Items: URL segment: lowercase kebab-case. May change; old slugs go to formerSlugs.
   */
  formerSlugs?: string[];
  /**
   * Non-empty single-line text.
   */
  title: string;
  /**
   * Parent node id, or null for a root category.
   */
  parent: string | null;
  /**
   * Sort position among siblings.
   */
  order: number;
  /**
   * Alternative names and abbreviations indexed by search (ADR 0004).
   *
   * Items: Non-empty single-line text.
   */
  synonyms?: string[];
  /**
   * Population a node applies to (SME decision 1).
   */
  population: 'adult' | 'paediatric' | 'both';
  /**
   * Delivery wave (sequencing only; all content is P1).
   */
  wave: 'W1' | 'W2';
  /**
   * Editorial status shown on the content status page (TS-03.0.2).
   */
  status: 'draft' | 'in-review' | 'published';
  /**
   * Date of the last SME review (YYYY-MM-DD); shown on the page (TS-04.5.2).
   */
  lastReviewed?: string;
  /**
   * Cross-links (→ in the taxonomy): ids of nodes whose content is also relevant here.
   *
   * Items: Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  seeAlso?: string[];
  /**
   * Content blocks of a leaf node, in display order. Only leaves have blocks; nodes without published blocks are hidden.
   */
  blocks?: Block[];
}
/**
 * Severity grading table: one column per grade, in order.
 */
export interface GradingTableBlock {
  /**
   * Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  id: string;
  type: 'grading-table';
  /**
   * Taxonomy content tag.
   */
  tag: 'GRADE';
  /**
   * Non-empty single-line text.
   */
  title?: string;
  /**
   * Grades in display order, from least to most severe (as printed).
   *
   * @minItems 2
   *
   * Items: Non-empty single-line text.
   */
  grades: [string, string, ...string[]];
  /**
   * Values shown in the block.
   *
   * @minItems 1
   */
  values: [Value, ...Value[]];
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
   * Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  zScoreReference?: string;
}
/**
 * Where a value comes from: a registered source plus a locator inside it (TS-02.3.2). Every value has one.
 */
export interface Citation {
  /**
   * Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
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
/**
 * Normal reference ranges (sex/age/BSA specific via population qualifiers).
 */
export interface NormalRangeTableBlock {
  /**
   * Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  id: string;
  type: 'normal-range-table';
  /**
   * Taxonomy content tag.
   */
  tag: 'NORM';
  /**
   * Non-empty single-line text.
   */
  title?: string;
  /**
   * Values shown in the block.
   *
   * @minItems 1
   */
  values: [Value, ...Value[]];
}
/**
 * List of thresholds (intervention triggers, prognostic markers, criteria).
 */
export interface ThresholdListBlock {
  /**
   * Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  id: string;
  type: 'threshold-list';
  /**
   * Taxonomy content tag.
   */
  tag: 'INTV' | 'PROG' | 'CRIT';
  /**
   * Non-empty single-line text.
   */
  title?: string;
  /**
   * Values shown in the block.
   *
   * @minItems 1
   */
  values: [Value, ...Value[]];
}
/**
 * Checklist of criteria, e.g. TEER feasibility (favourable / challenging / unsuitable).
 */
export interface CriteriaChecklistBlock {
  /**
   * Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  id: string;
  type: 'criteria-checklist';
  /**
   * Taxonomy content tag.
   */
  tag: 'FEAS' | 'CRIT';
  /**
   * Non-empty single-line text.
   */
  title?: string;
  /**
   * Criteria in display order.
   *
   * @minItems 1
   */
  criteria: [
    {
      /**
       * Non-empty text that may span lines (notes, caveats).
       */
      text: string;
      /**
       * Feasibility category, when the source assigns one.
       */
      category?: 'favourable' | 'challenging' | 'unsuitable';
      /**
       * Numeric thresholds belonging to the criterion.
       */
      values?: Value[];
      citation: Citation;
    },
    ...{
      /**
       * Non-empty text that may span lines (notes, caveats).
       */
      text: string;
      /**
       * Feasibility category, when the source assigns one.
       */
      category?: 'favourable' | 'challenging' | 'unsuitable';
      /**
       * Numeric thresholds belonging to the criterion.
       */
      values?: Value[];
      citation: Citation;
    }[],
  ];
}
/**
 * Free-text note, e.g. measurement method or pitfalls.
 */
export interface NoteBlock {
  /**
   * Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  id: string;
  type: 'note';
  /**
   * Taxonomy content tag.
   */
  tag: 'METH' | 'CRIT';
  /**
   * Non-empty single-line text.
   */
  title?: string;
  /**
   * Non-empty text that may span lines (notes, caveats).
   */
  text: string;
  citation?: Citation;
}
/**
 * Link to an algorithm in the source document; never redrawn (SME decision 5).
 */
export interface AlgorithmReferenceBlock {
  /**
   * Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  id: string;
  type: 'algorithm-reference';
  /**
   * Taxonomy content tag.
   */
  tag: 'ALG';
  /**
   * Non-empty single-line text.
   */
  title: string;
  citation: Citation;
  /**
   * Direct https link to the algorithm, when available.
   */
  url?: string;
}
