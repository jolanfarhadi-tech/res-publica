import { z } from "zod";
import type { EntityExtractor } from "../types";

const declaredEntitySchema = z.object({
  id: z.string().min(1),
  type: z.enum(["person", "organization", "topic", "legislation", "dialogue", "finding"]),
  name: z.string().min(1),
});

const entityFrontmatterSchema = z.object({
  entities: z.array(declaredEntitySchema).optional(),
});

/**
 * Deterministic extraction from explicit, author-declared frontmatter.
 *
 * Scope, disclosed rather than silently assumed: no NLP/NER model is
 * chosen or used anywhere in this repository, and selecting one is a real
 * technology decision closer to an external-service question than a
 * routine tooling choice. This extractor reads only what a content author
 * explicitly wrote in an `entities:` frontmatter field — it infers nothing
 * from prose. Against today's real content, this finds zero entities,
 * since no page yet declares that field; the pipeline is correct and
 * ready, the content isn't populated yet. A future prose-based extractor
 * would implement the same `EntityExtractor` interface as an addition,
 * never a replacement this one depends on.
 */
export const frontmatterEntityExtractor: EntityExtractor = {
  name: "frontmatter-v1",
  extract({ frontmatter }) {
    const parsed = entityFrontmatterSchema.safeParse(frontmatter);
    if (!parsed.success || !parsed.data.entities) return [];
    return parsed.data.entities;
  },
};
