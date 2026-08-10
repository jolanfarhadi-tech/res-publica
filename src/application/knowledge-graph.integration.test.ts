import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { AuthorizationDeniedError } from "../auth/authorize";
import type { AuthenticatedActor } from "../auth/types";
import type { Database } from "../persistence";
import * as coreSchema from "../persistence/schema";
import * as moduleSchema from "../persistence/module-schema";
import {
  kgCandidates,
  kgEntities,
  kgGraphBuilds,
  kgProvenance,
  kgRelationships,
} from "../persistence/module-schema";
import { auditLog, people } from "../persistence/schema";
import type { KnowledgeGraph } from "../modules/knowledge-graph/types";
import {
  KnowledgeGraphSeparationOfDutiesError,
  KnowledgeGraphStateError,
  createKnowledgeGraphBuild,
  getPublicKnowledgeGraph,
  reviewKnowledgeGraphCandidate,
} from "./knowledge-graph";

const schema = { ...coreSchema, ...moduleSchema };
const now = new Date("2026-08-10T18:00:00.000Z");

function actor(
  personId: string,
  capability: string,
  target: string,
  assurance: "verified" | "mfa" = "mfa"
): AuthenticatedActor {
  return {
    personId,
    sessionId: `session-${personId}`,
    authenticatedAt: now,
    assurance,
    grants: [{
      id: `grant-${personId}-${capability}-${target}`,
      personId,
      domain: "civic",
      capability,
      target,
      assuranceRequired: "mfa",
      validFrom: new Date("2020-01-01T00:00:00.000Z"),
      validUntil: null,
      revokedAt: null,
    }],
  };
}

async function database() {
  const directory = await mkdtemp(join(tmpdir(), "res-publica-knowledge-graph-"));
  const client = new PGlite(directory);
  const pgliteDb = drizzle({ client, schema });
  await migrate(pgliteDb, { migrationsFolder: join(process.cwd(), "drizzle") });
  return { directory, client, db: pgliteDb as unknown as Database };
}

async function seedPeople(db: Database) {
  await db.insert(people).values(["builder", "reviewer"].map((id) => ({
    id,
    name: id,
    contact: { email: `${id}@example.org` },
    locale: "de" as const,
    rtlPreference: false,
    createdAt: now,
  })));
}

function source(file: string, locale: string, publicEligible = true) {
  return {
    file,
    locale,
    canonicalSource: "docs/source/foundation/01_HARM_OPERATING_SYSTEM.md",
    publicEligible,
  };
}

function graph(publicEligible = true): KnowledgeGraph {
  return {
    entities: new Map([
      ["topic:harm", {
        id: "topic:harm", domain: "civic", type: "topic", canonicalName: "HARM",
        aliases: [{ locale: "de", name: "HARM" }],
        sources: [source("src/content/de/projects/harm.mdx", "de", publicEligible)],
      }],
      ["organization:res-publica", {
        id: "organization:res-publica", domain: "civic", type: "organization",
        canonicalName: "Res Publica e.V.", aliases: [{ locale: "de", name: "Res Publica e.V." }],
        sources: [source("src/content/de/projects/harm.mdx", "de", publicEligible)],
      }],
    ]),
    relationships: [{
      domain: "civic", fromEntityId: "organization:res-publica", toEntityId: "topic:harm",
      type: "co-occurs", source: source("src/content/de/projects/harm.mdx", "de", publicEligible),
    }],
  };
}

async function build(db: Database, value = graph()) {
  return createKnowledgeGraphBuild(db, actor("builder", "knowledge-graph.rebuild", "civic"), {
    graph: value,
    domain: "civic",
    commitSha: "abcdef1234567890",
    extractorName: "frontmatter-v1",
  }, now);
}

describe("governed Knowledge Graph persistence", () => {
  it("persists a deterministic build idempotently without duplicate audit", async () => {
    const fixture = await database();
    try {
      await seedPeople(fixture.db);
      const first = await build(fixture.db);
      const second = await build(fixture.db);
      expect(first.candidates).toHaveLength(3);
      expect(second.idempotent).toBe(true);
      expect(await fixture.db.select().from(kgGraphBuilds)).toHaveLength(1);
      expect(await fixture.db.select().from(kgCandidates)).toHaveLength(3);
      expect((await fixture.db.select().from(auditLog)).filter((entry) => entry.action === "knowledge-graph.build.completed")).toHaveLength(1);
    } finally {
      await fixture.client.close();
      await rm(fixture.directory, { recursive: true, force: true });
    }
  }, 60_000);

  it("preserves exact scope, MFA and rebuild/review separation without mutation", async () => {
    const fixture = await database();
    try {
      await seedPeople(fixture.db);
      const result = await build(fixture.db);
      const candidate = result.candidates[0];
      const before = (await fixture.db.select().from(auditLog)).length;
      await expect(reviewKnowledgeGraphCandidate(fixture.db, actor("reviewer", "knowledge-graph.candidate.review", "wrong"), {
        candidateId: candidate.id, decision: "approve", reason: "Wrong target",
      }, now)).rejects.toBeInstanceOf(AuthorizationDeniedError);
      await expect(reviewKnowledgeGraphCandidate(fixture.db, actor("reviewer", "knowledge-graph.candidate.review", candidate.id, "verified"), {
        candidateId: candidate.id, decision: "approve", reason: "Insufficient assurance",
      }, now)).rejects.toBeInstanceOf(AuthorizationDeniedError);
      await expect(reviewKnowledgeGraphCandidate(fixture.db, actor("builder", "knowledge-graph.candidate.review", candidate.id), {
        candidateId: candidate.id, decision: "approve", reason: "Self review",
      }, now)).rejects.toBeInstanceOf(KnowledgeGraphSeparationOfDutiesError);
      expect(await fixture.db.select().from(kgEntities)).toHaveLength(0);
      expect(await fixture.db.select().from(kgProvenance)).toHaveLength(0);
      expect(await fixture.db.select().from(auditLog)).toHaveLength(before);
    } finally {
      await fixture.client.close();
      await rm(fixture.directory, { recursive: true, force: true });
    }
  }, 60_000);

  it("publishes only human-approved entities and relationships with canonical provenance", async () => {
    const fixture = await database();
    try {
      await seedPeople(fixture.db);
      const result = await build(fixture.db);
      const entities = result.candidates.filter((candidate) => candidate.kind === "entity");
      const relationship = result.candidates.find((candidate) => candidate.kind === "relationship")!;
      for (const candidate of entities) {
        await reviewKnowledgeGraphCandidate(fixture.db, actor("reviewer", "knowledge-graph.candidate.review", candidate.id), {
          candidateId: candidate.id, decision: "approve", reason: "Verified against the declared source.",
        }, now);
      }
      await reviewKnowledgeGraphCandidate(fixture.db, actor("reviewer", "knowledge-graph.candidate.review", relationship.id), {
        candidateId: relationship.id, decision: "approve", reason: "Verified deterministic co-occurrence.",
      }, now);
      expect(await fixture.db.select().from(kgEntities)).toHaveLength(2);
      expect(await fixture.db.select().from(kgRelationships)).toHaveLength(1);
      expect(await fixture.db.select().from(kgProvenance)).toHaveLength(3);
      await fixture.db.update(kgEntities).set({
        aliases: [
          { locale: "de", name: "HARM" },
          { locale: "fa", name: "Internal-only alias" },
        ],
        sources: [
          source("src/content/de/projects/harm.mdx", "de", true),
          source("src/content/fa/internal/harm.mdx", "fa", false),
        ],
      }).where(eq(kgEntities.id, "topic:harm"));
      const projection = await getPublicKnowledgeGraph(fixture.db);
      expect(projection.entities).toHaveLength(2);
      expect(projection.relationships).toHaveLength(1);
      const harm = projection.entities.find((entity) => entity.id === "topic:harm")!;
      expect(harm.aliases).toEqual([{ locale: "de", name: "HARM" }]);
      expect(harm.sources.every((item) => item.publicEligible)).toBe(true);
    } finally {
      await fixture.client.close();
      await rm(fixture.directory, { recursive: true, force: true });
    }
  }, 60_000);

  it("fails atomically when a relationship endpoint is not verified", async () => {
    const fixture = await database();
    try {
      await seedPeople(fixture.db);
      const result = await build(fixture.db);
      const relationship = result.candidates.find((candidate) => candidate.kind === "relationship")!;
      const before = (await fixture.db.select().from(auditLog)).length;
      await expect(reviewKnowledgeGraphCandidate(fixture.db, actor("reviewer", "knowledge-graph.candidate.review", relationship.id), {
        candidateId: relationship.id, decision: "approve", reason: "Must fail.",
      }, now)).rejects.toBeInstanceOf(KnowledgeGraphStateError);
      expect(await fixture.db.select().from(kgRelationships)).toHaveLength(0);
      expect(await fixture.db.select().from(kgProvenance)).toHaveLength(0);
      expect(await fixture.db.select().from(auditLog)).toHaveLength(before);
      expect((await fixture.db.select().from(kgCandidates)).find((candidate) => candidate.id === relationship.id)?.status).toBe("pending");
    } finally {
      await fixture.client.close();
      await rm(fixture.directory, { recursive: true, force: true });
    }
  }, 60_000);

  it("keeps approved but unreviewed-source content out of the public projection", async () => {
    const fixture = await database();
    try {
      await seedPeople(fixture.db);
      const result = await build(fixture.db, graph(false));
      for (const candidate of result.candidates.filter((item) => item.kind === "entity")) {
        await reviewKnowledgeGraphCandidate(fixture.db, actor("reviewer", "knowledge-graph.candidate.review", candidate.id), {
          candidateId: candidate.id, decision: "approve", reason: "Internal graph use only.",
        }, now);
      }
      expect((await getPublicKnowledgeGraph(fixture.db)).entities).toHaveLength(0);
    } finally {
      await fixture.client.close();
      await rm(fixture.directory, { recursive: true, force: true });
    }
  }, 60_000);

  it("prevents a Civic candidate from mutating a peer-domain entity", async () => {
    const fixture = await database();
    try {
      await seedPeople(fixture.db);
      await fixture.db.insert(kgEntities).values({
        id: "topic:harm",
        domain: "governance",
        type: "topic",
        canonicalName: "Governance-owned record",
        aliases: [],
        sources: [source("internal/governance.mdx", "de", false)],
      });
      const result = await build(fixture.db);
      const candidate = result.candidates.find((item) =>
        item.kind === "entity" && item.candidateKey.endsWith("topic:harm")
      )!;
      const auditBefore = (await fixture.db.select().from(auditLog)).length;
      await expect(reviewKnowledgeGraphCandidate(fixture.db, actor("reviewer", "knowledge-graph.candidate.review", candidate.id), {
        candidateId: candidate.id,
        decision: "approve",
        reason: "Must not cross the domain boundary.",
      }, now)).rejects.toMatchObject({ code: "cross_domain_entity_mutation" });
      expect((await fixture.db.select().from(kgEntities))[0]).toMatchObject({
        domain: "governance",
        canonicalName: "Governance-owned record",
      });
      expect(await fixture.db.select().from(auditLog)).toHaveLength(auditBefore);
    } finally {
      await fixture.client.close();
      await rm(fixture.directory, { recursive: true, force: true });
    }
  }, 60_000);
});
