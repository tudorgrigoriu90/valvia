/**
 * DO NOT EDIT: generated from /schema by `npm run gen:types` (ADR 0003).
 * A unit test fails when this file is out of date.
 */

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
   * Cross-links (→ in the taxonomy): ids of nodes whose content is also relevant here.
   *
   * Items: Stable identifier: lowercase kebab-case, never changed or reused (ADR 0003).
   */
  seeAlso?: string[];
}
