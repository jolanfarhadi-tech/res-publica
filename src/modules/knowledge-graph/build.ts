import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Entity, EntityAlias, EntityExtractor, KnowledgeGraph } from "./types";
import { frontmatterEntityExtractor } from "./extractors/frontmatter-extractor";
import type { BusinessDomain } from "../../platform/domain";

function findMdxFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMdxFiles(full));
    } else if (entry.name.endsWith(".mdx")) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Knowledge Graph build — extracts entities and co-occurrence
 * relationships from Git-committed MDX, per `ADR-007`. Deterministic:
 * every relationship traces to a specific source file, never inferred
 * live. `extractor` defaults to the frontmatter-based strategy but accepts
 * any `EntityExtractor` — the extension point for future NLP work.
 */
export function buildKnowledgeGraph(
  contentDir: string,
  root: string,
  extractor: EntityExtractor = frontmatterEntityExtractor,
  domain: BusinessDomain = "civic"
): KnowledgeGraph {
  const entities = new Map<string, Entity>();
  const relationships: KnowledgeGraph["relationships"] = [];

  for (const file of findMdxFiles(contentDir)) {
    const raw = fs.readFileSync(file, "utf8");
    const { data, content } = matter(raw);
    const declared = extractor.extract({ frontmatter: data, body: content });
    if (declared.length === 0) continue;

    const relative = path.relative(root, file);
    const locale = relative.split(path.sep)[0];

    for (const d of declared) {
      const existing = entities.get(d.id);
      const alias: EntityAlias = { locale, name: d.name };
      if (existing) {
        existing.sources.push({ file: relative, locale });
        if (!existing.aliases.some((a) => a.locale === alias.locale && a.name === alias.name)) {
          existing.aliases.push(alias);
        }
      } else {
        entities.set(d.id, {
          id: d.id,
          domain,
          type: d.type,
          canonicalName: d.name,
          aliases: [alias],
          sources: [{ file: relative, locale }],
        });
      }
    }

    const ids = declared.map((d) => d.id);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        relationships.push({
          domain,
          fromEntityId: ids[i],
          toEntityId: ids[j],
          type: "co-occurs",
          source: { file: relative, locale },
        });
      }
    }
  }

  return { entities, relationships };
}
