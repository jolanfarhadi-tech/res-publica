/**
 * Knowledge Graph — Foundation Build Order Step 5, MVP module #1 (`ADR-007`).
 *
 * Canonical data structures: Entity, Relationship, EntitySourceReference
 * (folded into each Entity/Relationship's `sources`/`source` field), and
 * EntityAlias — matching `mvp-module-blueprint.md`'s Database Entities
 * list for this module.
 */

export type EntityType = "person" | "organization" | "topic" | "legislation" | "dialogue" | "finding";

export type EntitySourceReference = {
  /** Path relative to the repository root. */
  file: string;
  locale: string;
};

/** German/English/Persian name variants that resolve to one canonical entity. */
export type EntityAlias = {
  locale: string;
  name: string;
};

export type Entity = {
  id: string;
  type: EntityType;
  canonicalName: string;
  aliases: EntityAlias[];
  sources: EntitySourceReference[];
};

export type RelationshipType = "co-occurs";

export type Relationship = {
  fromEntityId: string;
  toEntityId: string;
  type: RelationshipType;
  source: EntitySourceReference;
};

export type KnowledgeGraph = {
  entities: Map<string, Entity>;
  relationships: Relationship[];
};

/** A single entity declaration extracted from one content file. */
export type DeclaredEntity = {
  id: string;
  type: EntityType;
  name: string;
};

/**
 * Extension point for future extraction strategies. Per `ADR-007`: "No
 * relationship goes live without appearing in the extraction pipeline's
 * own output... deterministically derived from committed content, not
 * freely generated." A future NLP/NER-based extractor is an additive
 * implementation of this same interface — never a prerequisite for
 * today's deterministic, frontmatter-based one.
 */
export type EntityExtractor = {
  name: string;
  extract(input: { frontmatter: unknown; body: string }): DeclaredEntity[];
};
