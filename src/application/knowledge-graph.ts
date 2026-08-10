import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { requireAuthorization } from "../auth/authorize";
import type { AuthenticatedActor } from "../auth/types";
import { createId } from "../domain/shared";
import type { Database } from "../persistence";
import {
  kgCandidates,
  kgEntities,
  kgGraphBuilds,
  kgProvenance,
  kgRelationships,
} from "../persistence/module-schema";
import { auditLog } from "../persistence/schema";
import {
  createGraphCandidateDrafts,
  graphContentDigest,
  graphDigest,
} from "../modules/knowledge-graph/candidates";
import { ownsGraphType } from "../modules/knowledge-graph/schema-registry";
import type { KnowledgeGraph } from "../modules/knowledge-graph/types";
import type { BusinessDomain } from "../platform/domain";

const sourceSchema = z.object({
  file: z.string().min(1).max(1_000),
  locale: z.string().min(1).max(20),
  canonicalSource: z.string().min(1).max(1_000).nullable(),
  publicEligible: z.boolean(),
});

const entityPayloadSchema = z.object({
  id: z.string().min(1).max(300),
  domain: z.enum(["civic", "governance"]),
  type: z.enum(["person", "organization", "topic", "legislation", "dialogue", "finding"]),
  canonicalName: z.string().min(1).max(500),
  aliases: z.array(z.object({ locale: z.string().min(1).max(20), name: z.string().min(1).max(500) })).max(100),
});

const relationshipPayloadSchema = z.object({
  domain: z.enum(["civic", "governance"]),
  fromEntityId: z.string().min(1).max(300),
  toEntityId: z.string().min(1).max(300),
  type: z.enum(["co-occurs"]),
});

function requireGraphStaff(
  actor: AuthenticatedActor | null,
  capability: string,
  target: string
): asserts actor is AuthenticatedActor {
  requireAuthorization(actor, {
    domain: "civic",
    capability,
    target,
    requireExactTarget: true,
    minimumAssurance: "mfa",
  });
}

function cleanReason(reason: string) {
  const cleaned = reason.trim();
  if (!cleaned) throw new KnowledgeGraphValidationError("decision_reason_required");
  return cleaned.slice(0, 10_000);
}

function validateRepositoryVersion(value: string) {
  const cleaned = value.trim();
  if (!/^(?:[a-f0-9]{7,64}|local-development)$/.test(cleaned)) {
    throw new KnowledgeGraphValidationError("invalid_repository_version");
  }
  return cleaned;
}

export async function createKnowledgeGraphBuild(
  db: Database,
  actor: AuthenticatedActor | null,
  input: {
    graph: KnowledgeGraph;
    domain: BusinessDomain;
    commitSha: string;
    extractorName: string;
  },
  now = new Date()
) {
  requireGraphStaff(actor, "knowledge-graph.rebuild", input.domain);
  const commitSha = validateRepositoryVersion(input.commitSha);
  const extractorName = input.extractorName.trim();
  if (!extractorName || extractorName.length > 200) {
    throw new KnowledgeGraphValidationError("invalid_extractor");
  }

  const drafts = createGraphCandidateDrafts(input.graph).filter(
    (candidate) => candidate.domain === input.domain
  );
  for (const candidate of drafts) {
    const type = candidate.kind === "entity"
      ? entityPayloadSchema.parse(candidate.payload).type
      : relationshipPayloadSchema.parse(candidate.payload).type;
    if (!ownsGraphType(candidate.domain, candidate.kind, type)) {
      throw new KnowledgeGraphBoundaryError("unregistered_domain_schema");
    }
  }
  const contentDigest = graphContentDigest(drafts);

  return db.transaction(async (transaction) => {
    const [existing] = await transaction
      .select()
      .from(kgGraphBuilds)
      .where(and(
        eq(kgGraphBuilds.domain, input.domain),
        eq(kgGraphBuilds.commitSha, commitSha),
        eq(kgGraphBuilds.extractorName, extractorName),
        eq(kgGraphBuilds.contentDigest, contentDigest)
      ))
      .limit(1);
    if (existing) {
      const candidates = await transaction.select().from(kgCandidates)
        .where(eq(kgCandidates.buildId, existing.id));
      return { build: existing, candidates, idempotent: true };
    }

    const build = {
      id: createId(),
      domain: input.domain,
      commitSha,
      extractorName,
      contentDigest,
      status: "completed" as const,
      candidateCount: drafts.length,
      initiatedByPersonId: actor.personId,
      createdAt: now,
      completedAt: now,
    };
    const candidates = drafts.map((candidate) => ({
      id: createId(),
      buildId: build.id,
      domain: candidate.domain,
      kind: candidate.kind,
      candidateKey: candidate.candidateKey,
      fingerprint: candidate.fingerprint,
      payload: candidate.payload as unknown as Record<string, unknown>,
      sources: candidate.sources,
      status: "pending" as const,
      createdAt: now,
      decidedAt: null,
      decidedByPersonId: null,
      decisionReason: null,
    }));

    await transaction.insert(kgGraphBuilds).values(build);
    if (candidates.length) await transaction.insert(kgCandidates).values(candidates);
    await transaction.insert(auditLog).values({
      id: createId(),
      actorPersonId: actor.personId,
      action: "knowledge-graph.build.completed",
      target: build.id,
      timestamp: now,
      pseudonymized: false,
    });
    return { build, candidates, idempotent: false };
  });
}

export async function reviewKnowledgeGraphCandidate(
  db: Database,
  actor: AuthenticatedActor | null,
  input: { candidateId: string; decision: "approve" | "reject"; reason: string },
  now = new Date()
) {
  return db.transaction(async (transaction) => {
    const [candidate] = await transaction.select().from(kgCandidates)
      .where(eq(kgCandidates.id, input.candidateId)).limit(1);
    if (!candidate) throw new KnowledgeGraphNotFoundError("candidate_not_found");
    requireGraphStaff(actor, "knowledge-graph.candidate.review", candidate.id);
    if (candidate.status !== "pending") throw new KnowledgeGraphStateError("candidate_already_decided");
    const [build] = await transaction.select().from(kgGraphBuilds)
      .where(eq(kgGraphBuilds.id, candidate.buildId)).limit(1);
    if (!build) throw new KnowledgeGraphStateError("candidate_build_missing");
    if (build.initiatedByPersonId === actor.personId) {
      throw new KnowledgeGraphSeparationOfDutiesError();
    }
    const reason = cleanReason(input.reason);

    if (input.decision === "approve") {
      if (candidate.kind === "entity") {
        const payload = entityPayloadSchema.parse(candidate.payload);
        if (payload.domain !== candidate.domain || !ownsGraphType(payload.domain, "entity", payload.type)) {
          throw new KnowledgeGraphBoundaryError("candidate_domain_mismatch");
        }
        const [existingEntity] = await transaction.select().from(kgEntities)
          .where(eq(kgEntities.id, payload.id)).limit(1);
        if (existingEntity && existingEntity.domain !== payload.domain) {
          throw new KnowledgeGraphBoundaryError("cross_domain_entity_mutation");
        }
        await transaction.insert(kgEntities).values({
          ...payload,
          sources: z.array(sourceSchema).parse(candidate.sources),
        }).onConflictDoUpdate({
          target: kgEntities.id,
          set: {
            domain: payload.domain,
            type: payload.type,
            canonicalName: payload.canonicalName,
            aliases: payload.aliases,
            sources: z.array(sourceSchema).parse(candidate.sources),
          },
        });
      } else {
        const payload = relationshipPayloadSchema.parse(candidate.payload);
        if (payload.domain !== candidate.domain || !ownsGraphType(payload.domain, "relationship", payload.type)) {
          throw new KnowledgeGraphBoundaryError("candidate_domain_mismatch");
        }
        const endpoints = await transaction.select().from(kgEntities)
          .where(inArray(kgEntities.id, [payload.fromEntityId, payload.toEntityId]));
        if (endpoints.length !== 2 || endpoints.some((endpoint) => endpoint.domain !== payload.domain)) {
          throw new KnowledgeGraphStateError("relationship_endpoint_unverified");
        }
        const [existingRelationship] = await transaction.select().from(kgRelationships)
          .where(and(
            eq(kgRelationships.fromEntityId, payload.fromEntityId),
            eq(kgRelationships.toEntityId, payload.toEntityId),
            eq(kgRelationships.type, payload.type)
          )).limit(1);
        if (existingRelationship && existingRelationship.domain !== payload.domain) {
          throw new KnowledgeGraphBoundaryError("cross_domain_relationship_mutation");
        }
        const [source] = z.array(sourceSchema).min(1).parse(candidate.sources);
        await transaction.insert(kgRelationships).values({ ...payload, source })
          .onConflictDoUpdate({
            target: [kgRelationships.fromEntityId, kgRelationships.toEntityId, kgRelationships.type],
            set: { domain: payload.domain, source },
          });
      }

      const sources = z.array(sourceSchema).min(1).parse(candidate.sources);
      await transaction.insert(kgProvenance).values(sources.map((source) => ({
        id: createId(),
        candidateId: candidate.id,
        domain: candidate.domain,
        targetKind: candidate.kind,
        targetKey: candidate.candidateKey,
        sourceFile: source.file,
        sourceLocale: source.locale,
        canonicalSource: source.canonicalSource,
        sourceDigest: graphDigest(source),
        publicEligible: source.publicEligible,
        commitSha: build.commitSha,
        extractorName: build.extractorName,
        approvedByPersonId: actor.personId,
        approvedAt: now,
      })));
    }

    await transaction.update(kgCandidates).set({
      status: input.decision === "approve" ? "approved" : "rejected",
      decidedAt: now,
      decidedByPersonId: actor.personId,
      decisionReason: reason,
    }).where(eq(kgCandidates.id, candidate.id));
    await transaction.insert(auditLog).values({
      id: createId(),
      actorPersonId: actor.personId,
      action: `knowledge-graph.candidate.${input.decision === "approve" ? "approved" : "rejected"}`,
      target: candidate.id,
      timestamp: now,
      pseudonymized: false,
    });
    return { ...candidate, status: input.decision === "approve" ? "approved" as const : "rejected" as const, decidedAt: now, decidedByPersonId: actor.personId, decisionReason: reason };
  });
}

export async function getKnowledgeGraphOperations(
  db: Database,
  actor: AuthenticatedActor | null,
  domain: BusinessDomain
) {
  requireGraphStaff(actor, "knowledge-graph.operations.read", domain);
  const [builds, candidates] = await Promise.all([
    db.select().from(kgGraphBuilds).where(eq(kgGraphBuilds.domain, domain))
      .orderBy(desc(kgGraphBuilds.createdAt)).limit(25),
    db.select().from(kgCandidates).where(eq(kgCandidates.domain, domain))
      .orderBy(desc(kgCandidates.createdAt)).limit(200),
  ]);
  return { builds, candidates };
}

export async function getPublicKnowledgeGraph(db: Database) {
  const [entities, relationships, provenance] = await Promise.all([
    db.select().from(kgEntities),
    db.select().from(kgRelationships),
    db.select().from(kgProvenance).where(eq(kgProvenance.publicEligible, true)),
  ]);
  const publicEntityKeys = new Set(
    provenance.filter((item) => item.targetKind === "entity").map((item) => item.targetKey)
  );
  const publicRelationshipKeys = new Set(
    provenance.filter((item) => item.targetKind === "relationship").map((item) => item.targetKey)
  );
  const publicEntities = entities
    .filter((entity) =>
      publicEntityKeys.has(`${entity.domain}:entity:${entity.id}`) &&
      entity.sources.some((source) => source.publicEligible)
    )
    .map((entity) => {
      const publicSources = entity.sources.filter((source) => source.publicEligible);
      const publicLocales = new Set(publicSources.map((source) => source.locale));
      const aliases = entity.aliases.filter((alias) => publicLocales.has(alias.locale));
      return {
        ...entity,
        canonicalName: aliases[0]?.name ?? entity.canonicalName,
        aliases,
        sources: publicSources,
      };
    });
  const entityIds = new Set(publicEntities.map((entity) => entity.id));
  const publicRelationships = relationships.filter((relationship) => {
    const key = [relationship.domain, relationship.type, relationship.fromEntityId, relationship.toEntityId].join(":");
    return publicRelationshipKeys.has(key) && relationship.source.publicEligible &&
      entityIds.has(relationship.fromEntityId) && entityIds.has(relationship.toEntityId);
  });
  return { entities: publicEntities, relationships: publicRelationships };
}

export class KnowledgeGraphValidationError extends Error {
  readonly code: string;
  constructor(code: string) { super(code); this.name = "KnowledgeGraphValidationError"; this.code = code; }
}
export class KnowledgeGraphNotFoundError extends Error {
  readonly code: string;
  constructor(code: string) { super(code); this.name = "KnowledgeGraphNotFoundError"; this.code = code; }
}
export class KnowledgeGraphStateError extends Error {
  readonly code: string;
  constructor(code: string) { super(code); this.name = "KnowledgeGraphStateError"; this.code = code; }
}
export class KnowledgeGraphBoundaryError extends Error {
  readonly code: string;
  constructor(code: string) { super(code); this.name = "KnowledgeGraphBoundaryError"; this.code = code; }
}
export class KnowledgeGraphSeparationOfDutiesError extends Error {
  readonly code = "separation_of_duties";
  constructor() { super("Knowledge Graph rebuild initiator cannot review its candidates"); this.name = "KnowledgeGraphSeparationOfDutiesError"; }
}
