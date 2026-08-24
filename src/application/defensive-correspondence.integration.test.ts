import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";
import type { AuthenticatedActor } from "../auth/types";
import type { DefensiveSignal } from "../modules/security-operations/defensive-correspondence";
import type { Database } from "../persistence";
import * as coreSchema from "../persistence/schema";
import { auditLog, people } from "../persistence/schema";
import * as moduleSchema from "../persistence/module-schema";
import {
  securityDefensiveActionEvents,
  securityDefensiveActions,
  securityDefensiveSignals,
  securityAttributionClaims,
  securityIncidents,
  securityObservations,
} from "../persistence/module-schema";
import {
  recordDefensiveSequence,
  reviewDefensiveAction,
  rollbackDefensiveAction,
} from "./defensive-correspondence";

const directories: string[] = [];
afterEach(async () => Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true }))));

function actor(personId: string, capability: string, target: string, ageMs = 0): AuthenticatedActor {
  const authenticatedAt = new Date(Date.now() - ageMs);
  return {
    personId,
    sessionId: `${personId}-session`,
    assurance: "recent-mfa",
    authenticatedAt,
    grants: [{
      id: `${personId}-${capability}`,
      personId,
      domain: "governance",
      capability,
      target,
      assuranceRequired: "mfa",
      validFrom: new Date(0),
      validUntil: null,
      revokedAt: null,
    }],
  };
}

async function database() {
  const path = await mkdtemp(join(tmpdir(), "res-publica-aa-"));
  directories.push(path);
  const client = new PGlite(path);
  const db = drizzle({ client, schema: { ...coreSchema, ...moduleSchema } });
  await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
  await db.insert(people).values(["opener", "evaluator", "corroborator", "reviewer"].map((id) => ({
    id,
    name: `Synthetic ${id}`,
    contact: { email: `${id}@example.invalid` },
    locale: "en" as const,
    rtlPreference: false,
    createdAt: new Date(),
  })));
  await db.insert(securityIncidents).values({
    id: "incident-1",
    title: "Synthetic incident",
    severity: "high",
    status: "open",
    affectedAssets: ["research-zk"],
    openedByPersonId: "opener",
    openedAt: new Date("2026-08-16T12:00:00.000Z"),
  });
  await db.insert(securityObservations).values(Array.from({ length: 7 }, (_, index) => ({
    id: `observation-${index + 1}`,
    incidentId: "incident-1",
    observedAt: new Date(`2026-08-16T12:0${index}:00.000Z`),
    source: "canonical-audit" as const,
    sourceHandle: null,
    sourcePort: null,
    actorHandle: null,
    sessionHandle: null,
    apiCredentialHandle: null,
    routeSequence: ["/api/research/:id"],
    userAgentFamily: null,
    protocol: "h2",
    tlsVersion: "1.3",
    techniques: ["reconnaissance"],
    affectedAssets: ["research-verifier"],
    evidenceHash: `hash-${index + 1}`,
    recordedByPersonId: "opener",
    recordedAt: new Date(),
  })));
  return { client, db, serviceDb: db as unknown as Database };
}

async function addHighConfidenceClaim(
  db: ReturnType<typeof drizzle<typeof moduleSchema & typeof coreSchema>>,
  input: {
    id?: string;
    incidentId?: string;
    authoredByPersonId?: string;
  } = {}
) {
  await db.insert(securityAttributionClaims).values({
    id: input.id ?? "claim-independent-high",
    incidentId: input.incidentId ?? "incident-1",
    level: "D",
    claim: "Independent synthetic evidence supports the bounded incident hypothesis.",
    observedEvidence: ["observation-1", "observation-2", "observation-3"],
    inferences: ["The ordered evidence is consistent with the bounded hypothesis."],
    contradictoryEvidence: ["Provider-level enrichment remains unavailable."],
    alternativeExplanations: ["A shared automation tool could produce similar behavior."],
    confidence: "HIGH",
    source: "human-security-review",
    authoredByPersonId: input.authoredByPersonId ?? "corroborator",
    timestamp: new Date("2026-08-16T12:09:00.000Z"),
  });
}

function fiveLoopSequence(): DefensiveSignal[] {
  return [1, 2, 3, 4, 5].map((loop) => ({
    id: `event-${loop}`,
    incidentId: "incident-1",
    sequence: loop,
    loop: loop as 1 | 2 | 3 | 4 | 5,
    kind: ([
      "INITIAL_DECOY_SIGNAL", "HONEYPOT_ENGAGEMENT", "HIGH_VALUE_CONFIRMATION",
      "ADAPTIVE_ATTRIBUTION", "DEFENSIVE_SHADOW_CONFIRMATION",
    ] as const)[loop - 1],
    evidenceIds: loop === 5 ? ["observation-5", "observation-6", "observation-7"] : [`observation-${loop}`],
    targetAsset: "research-zk",
    targetScope: "research.verifier",
    observedAt: new Date(`2026-08-16T12:1${loop}:00.000Z`),
    compromiseConfirmed: loop === 5,
  }));
}

describe("defensive correspondence persistence", () => {
  it("persists an automatic bounded action and effect evidence atomically", async () => {
    const { client, db, serviceDb } = await database();
    try {
      const result = await recordDefensiveSequence(
        serviceDb,
        actor("evaluator", "security.response.evaluate", "incident-1"),
        {
          incidentId: "incident-1",
          requestId: "50000000-0000-4000-8000-000000000001",
          signals: fiveLoopSequence().slice(0, 2),
        }
      );
      expect(result.decision).toMatchObject({ actionClass: 1, disposition: "AUTO_EXECUTE" });
      expect((await db.select().from(securityDefensiveSignals))).toHaveLength(2);
      expect((await db.select().from(securityDefensiveActions))).toHaveLength(1);
      expect((await db.select().from(securityDefensiveActionEvents)).map((event) => event.state))
        .toEqual(["PROPOSED", "EXECUTED", "EFFECT_VERIFIED"]);
      expect((await db.select().from(auditLog))).toHaveLength(1);
      const updateError = await db.update(securityDefensiveActions)
        .set({ rationale: "mutated" })
        .where(eq(securityDefensiveActions.id, result.actionId))
        .then(() => null, (error: unknown) => error);
      const deleteError = await db.delete(securityDefensiveActionEvents)
        .where(eq(securityDefensiveActionEvents.actionId, result.actionId))
        .then(() => null, (error: unknown) => error);
      expect(errorChain(updateError)).toContain("security evidence is append-only");
      expect(errorChain(deleteError)).toContain("security evidence is append-only");
    } finally { await client.close(); }
  }, 30_000);

  it("requires recent MFA, exact scope and separation of duties without mutation", async () => {
    const { client, db, serviceDb } = await database();
    try {
      await expect(recordDefensiveSequence(
        serviceDb,
        actor("opener", "security.response.evaluate", "incident-1"),
        { incidentId: "incident-1", requestId: "50000000-0000-4000-8000-000000000002", signals: fiveLoopSequence() }
      )).rejects.toThrow("separation_of_duties_required");
      await expect(recordDefensiveSequence(
        serviceDb,
        actor("evaluator", "security.response.evaluate", "wrong-target", 6 * 60_000),
        { incidentId: "incident-1", requestId: "50000000-0000-4000-8000-000000000003", signals: fiveLoopSequence() }
      )).rejects.toThrow("Authorization denied");
      expect(await db.select().from(securityDefensiveSignals)).toHaveLength(0);
      expect(await db.select().from(securityDefensiveActions)).toHaveLength(0);
      expect(await db.select().from(auditLog)).toHaveLength(0);

      const contradicted = fiveLoopSequence().slice(0, 2);
      contradicted[1].contradictoryEvidence = ["missing-evidence"];
      await expect(recordDefensiveSequence(
        serviceDb,
        actor("evaluator", "security.response.evaluate", "incident-1"),
        { incidentId: "incident-1", requestId: "50000000-0000-4000-8000-000000000098", signals: contradicted }
      )).rejects.toThrow("defensive_evidence_not_found");
      expect(await db.select().from(securityDefensiveSignals)).toHaveLength(0);
      expect(await db.select().from(auditLog)).toHaveLength(0);
    } finally { await client.close(); }
  }, 30_000);

  it("rejects Class 2 or higher without independent high-confidence evidence and leaves no mutation", async () => {
    const { client, db, serviceDb } = await database();
    try {
      await expect(recordDefensiveSequence(
        serviceDb,
        actor("evaluator", "security.response.evaluate", "incident-1"),
        {
          incidentId: "incident-1",
          requestId: "50000000-0000-4000-8000-000000000097",
          signals: fiveLoopSequence().slice(0, 3),
        }
      )).rejects.toThrow("defensive_independent_confirmation_required");

      expect(await db.select().from(securityDefensiveSignals)).toHaveLength(0);
      expect(await db.select().from(securityDefensiveActions)).toHaveLength(0);
      expect(await db.select().from(securityDefensiveActionEvents)).toHaveLength(0);
      expect(await db.select().from(auditLog)).toHaveLength(0);

      await addHighConfidenceClaim(db, { authoredByPersonId: "evaluator" });
      const selfCorroborated = fiveLoopSequence().slice(0, 3);
      selfCorroborated[2].evidenceIds.push("claim-independent-high");
      await expect(recordDefensiveSequence(
        serviceDb,
        actor("evaluator", "security.response.evaluate", "incident-1"),
        {
          incidentId: "incident-1",
          requestId: "50000000-0000-4000-8000-000000000096",
          signals: selfCorroborated,
        }
      )).rejects.toThrow("defensive_independent_confirmation_required");

      expect(await db.select().from(securityDefensiveSignals)).toHaveLength(0);
      expect(await db.select().from(securityDefensiveActions)).toHaveLength(0);
      expect(await db.select().from(securityDefensiveActionEvents)).toHaveLength(0);
      expect(await db.select().from(auditLog)).toHaveLength(0);
    } finally { await client.close(); }
  }, 30_000);

  it("rejects high-confidence evidence from another incident without mutation", async () => {
    const { client, db, serviceDb } = await database();
    try {
      await db.insert(securityIncidents).values({
        id: "incident-2",
        title: "Separate synthetic incident",
        severity: "high",
        status: "open",
        affectedAssets: ["research-zk"],
        openedByPersonId: "opener",
        openedAt: new Date("2026-08-16T12:00:00.000Z"),
      });
      await addHighConfidenceClaim(db, {
        id: "claim-other-incident",
        incidentId: "incident-2",
      });
      const signals = fiveLoopSequence().slice(0, 3);
      signals[2].evidenceIds.push("claim-other-incident");

      await expect(recordDefensiveSequence(
        serviceDb,
        actor("evaluator", "security.response.evaluate", "incident-1"),
        {
          incidentId: "incident-1",
          requestId: "50000000-0000-4000-8000-000000000095",
          signals,
        }
      )).rejects.toThrow("defensive_evidence_scope_mismatch");

      expect(await db.select().from(securityDefensiveSignals)).toHaveLength(0);
      expect(await db.select().from(securityDefensiveActions)).toHaveLength(0);
      expect(await db.select().from(securityDefensiveActionEvents)).toHaveLength(0);
      expect(await db.select().from(auditLog)).toHaveLength(0);
    } finally { await client.close(); }
  }, 30_000);

  it("keeps high-impact preparation inactive until independent review and supports verified rollback", async () => {
    const { client, db, serviceDb } = await database();
    try {
      await addHighConfidenceClaim(db);
      const signals = fiveLoopSequence();
      signals[4].evidenceIds.push("claim-independent-high");
      const result = await recordDefensiveSequence(
        serviceDb,
        actor("evaluator", "security.response.evaluate", "incident-1"),
        { incidentId: "incident-1", requestId: "50000000-0000-4000-8000-000000000004", signals }
      );
      expect(result.decision).toMatchObject({ actionClass: 3, disposition: "REQUIRES_OPERATOR" });
      expect((await db.select().from(securityDefensiveActionEvents)).map((event) => event.state))
        .toEqual(["PROPOSED"]);

      await expect(reviewDefensiveAction(
        serviceDb,
        actor("evaluator", "security.response.approve", result.actionId),
        { actionId: result.actionId, decision: "approve", requestId: "50000000-0000-4000-8000-000000000099" }
      )).rejects.toThrow("separation_of_duties_required");
      expect((await db.select().from(securityDefensiveActionEvents)).map((event) => event.state))
        .toEqual(["PROPOSED"]);
      expect(await db.select().from(auditLog)).toHaveLength(1);

      await reviewDefensiveAction(
        serviceDb,
        actor("reviewer", "security.response.approve", result.actionId),
        { actionId: result.actionId, decision: "approve", requestId: "50000000-0000-4000-8000-000000000005" }
      );
      expect((await db.select().from(securityDefensiveActionEvents)).map((event) => event.state))
        .toEqual(["PROPOSED", "APPROVED", "EXECUTED", "EFFECT_VERIFIED"]);

      await rollbackDefensiveAction(
        serviceDb,
        actor("reviewer", "security.response.rollback", result.actionId),
        { actionId: result.actionId, requestId: "50000000-0000-4000-8000-000000000006" }
      );
      expect((await db.select().from(securityDefensiveActionEvents)).at(-1)?.state).toBe("ROLLED_BACK");
    } finally { await client.close(); }
  }, 30_000);
});

function errorChain(error: unknown): string {
  const messages: string[] = [];
  let current = error;
  while (current instanceof Error) {
    messages.push(current.message);
    current = current.cause;
  }
  return messages.join("\n");
}
