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
  return results.sort((left, right) => left.localeCompare(right, "en"));
}

function sourceReference(data: Record<string, unknown>, file: string, locale: string) {
  const canonicalSource = typeof data.source === "string" && data.source.trim()
    ? data.source.trim()
    : null;
  return {
    file,
    locale,
    canonicalSource,
    publicEligible:
      data.visibility === "public" && data.reviewed === true && canonicalSource !== null,
  };
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
    const declared = extractor
      .extract({ frontmatter: data, body: content })
      .sort((left, right) =>
        left.id.localeCompare(right.id, "en") || left.name.localeCompare(right.name, "en")
      );
    if (declared.length === 0) continue;

    const relative = path.relative(root, file);
    const locale = path.relative(contentDir, file).split(path.sep)[0];
    const source = sourceReference(data, relative, locale);

    for (const d of declared) {
      const existing = entities.get(d.id);
      const alias: EntityAlias = { locale, name: d.name };
      if (existing) {
        if (!existing.sources.some((candidate) => candidate.file === source.file && candidate.locale === source.locale)) {
          existing.sources.push(source);
          existing.sources.sort((left, right) => left.file.localeCompare(right.file, "en"));
        }
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
          sources: [source],
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
          source,
        });
      }
    }
  }

  relationships.sort((left, right) =>
    `${left.fromEntityId}\0${left.toEntityId}\0${left.source.file}`.localeCompare(
      `${right.fromEntityId}\0${right.toEntityId}\0${right.source.file}`,
      "en"
    )
  );
  return { entities, relationships };
}
