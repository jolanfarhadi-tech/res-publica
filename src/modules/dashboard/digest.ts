import { lookupEntity, relatedEntities } from "../knowledge-graph/api";
import type { Entity, KnowledgeGraph } from "../knowledge-graph/types";
import type { UserPreference } from "./types";

/**
 * Get Personalized Digest — real integration with Knowledge Graph.
 * Cold-start (no followed topics) returns an empty digest; the caller
 * shows the topic-chip picker instead, per the spec's validation
 * requirement. Matching is deterministic lookup, never a score of the
 * user.
 */
export function getPersonalizedDigest(graph: KnowledgeGraph, preference: UserPreference): Entity[] {
  if (preference.followedTopics.length === 0) {
    return [];
  }
  const results: Entity[] = [];
  for (const topicId of preference.followedTopics) {
    const entity = lookupEntity(graph, topicId);
    if (entity) results.push(entity);
    results.push(...relatedEntities(graph, topicId));
  }
  const seen = new Set<string>();
  return results.filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)));
}
