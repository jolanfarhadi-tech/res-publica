import { createHash } from "node:crypto";
import type { BusinessDomain } from "../../platform/domain";
import type {
  Entity,
  EntitySourceReference,
  KnowledgeGraph,
  Relationship,
} from "./types";

export type EntityCandidatePayload = Pick<
  Entity,
  "id" | "domain" | "type" | "canonicalName" | "aliases"
>;

export type RelationshipCandidatePayload = Pick<
  Relationship,
  "domain" | "fromEntityId" | "toEntityId" | "type"
>;

export type GraphCandidateDraft = {
  domain: BusinessDomain;
  kind: "entity" | "relationship";
  candidateKey: string;
  fingerprint: string;
  payload: EntityCandidatePayload | RelationshipCandidatePayload;
  sources: EntitySourceReference[];
};

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right, "en"))
        .map(([key, entry]) => [key, stableValue(entry)])
    );
  }
  return value;
}

export function graphDigest(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(stableValue(value)))
    .digest("hex");
}

function sortSources(sources: EntitySourceReference[]) {
  return [...sources].sort((left, right) =>
    `${left.file}\0${left.locale}`.localeCompare(`${right.file}\0${right.locale}`, "en")
  );
}

function relationKey(relationship: RelationshipCandidatePayload) {
  return [
    relationship.domain,
    relationship.type,
    relationship.fromEntityId,
    relationship.toEntityId,
  ].join(":");
}

export function createGraphCandidateDrafts(graph: KnowledgeGraph): GraphCandidateDraft[] {
  const drafts: GraphCandidateDraft[] = [];

  for (const entity of [...graph.entities.values()].sort((left, right) => left.id.localeCompare(right.id, "en"))) {
    const payload: EntityCandidatePayload = {
      id: entity.id,
      domain: entity.domain,
      type: entity.type,
      canonicalName: entity.canonicalName,
      aliases: [...entity.aliases].sort((left, right) =>
        `${left.locale}\0${left.name}`.localeCompare(`${right.locale}\0${right.name}`, "en")
      ),
    };
    const sources = sortSources(entity.sources);
    const candidateKey = `${entity.domain}:entity:${entity.id}`;
    drafts.push({
      domain: entity.domain,
      kind: "entity",
      candidateKey,
      fingerprint: graphDigest({ candidateKey, payload, sources }),
      payload,
      sources,
    });
  }

  const relationships = new Map<string, {
    payload: RelationshipCandidatePayload;
    sources: EntitySourceReference[];
  }>();
  for (const relationship of graph.relationships) {
    const payload: RelationshipCandidatePayload = {
      domain: relationship.domain,
      fromEntityId: relationship.fromEntityId,
      toEntityId: relationship.toEntityId,
      type: relationship.type,
    };
    const key = relationKey(payload);
    const existing = relationships.get(key);
    if (existing) {
      if (!existing.sources.some((source) =>
        source.file === relationship.source.file && source.locale === relationship.source.locale
      )) existing.sources.push(relationship.source);
    } else {
      relationships.set(key, { payload, sources: [relationship.source] });
    }
  }

  for (const [candidateKey, relationship] of [...relationships.entries()].sort(([left], [right]) => left.localeCompare(right, "en"))) {
    const sources = sortSources(relationship.sources);
    drafts.push({
      domain: relationship.payload.domain,
      kind: "relationship",
      candidateKey,
      fingerprint: graphDigest({ candidateKey, payload: relationship.payload, sources }),
      payload: relationship.payload,
      sources,
    });
  }

  return drafts;
}

export function graphContentDigest(drafts: GraphCandidateDraft[]): string {
  return graphDigest(drafts.map(({ candidateKey, fingerprint }) => ({ candidateKey, fingerprint })));
}
