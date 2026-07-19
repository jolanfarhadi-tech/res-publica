import type { Entity, KnowledgeGraph } from "./types";
import type { BusinessDomain } from "../../platform/domain";

/** Entity Lookup — retrieve an entity and its known relationships. */
export function lookupEntity(graph: KnowledgeGraph, entityId: string): Entity | undefined {
  return graph.entities.get(entityId);
}

/** Related-Content — entities related to a given entity via any relationship. */
export function relatedEntities(graph: KnowledgeGraph, entityId: string): Entity[] {
  const relatedIds = new Set<string>();
  for (const rel of graph.relationships) {
    if (rel.fromEntityId === entityId) relatedIds.add(rel.toEntityId);
    if (rel.toEntityId === entityId) relatedIds.add(rel.fromEntityId);
  }
  return [...relatedIds]
    .map((id) => graph.entities.get(id))
    .filter((e): e is Entity => e !== undefined);
}

/** Graph Search — query entities by name, alias, or type (deterministic substring match). */
export function searchEntities(graph: KnowledgeGraph, query: string, domain?: BusinessDomain): Entity[] {
  const lower = query.toLowerCase();
  return [...graph.entities.values()].filter(
    (e) =>
      (domain === undefined || e.domain === domain) &&
      e.canonicalName.toLowerCase().includes(lower) ||
      e.aliases.some((a) => a.name.toLowerCase().includes(lower)) ||
      e.type.toLowerCase().includes(lower)
  );
}
