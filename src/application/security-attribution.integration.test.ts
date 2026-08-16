import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterEach, describe, expect, it } from "vitest";
import type { AuthenticatedActor } from "../auth/types";
import type { Database } from "../persistence";
import * as coreSchema from "../persistence/schema";
import { eq } from "drizzle-orm";
import { auditLog, authorizationGrants, people } from "../persistence/schema";
import * as moduleSchema from "../persistence/module-schema";
import {
  securityAttributionClaims,
  securityIncidentCorrelations,
  securityIncidents,
  securityObservations,
} from "../persistence/module-schema";
import {
  createSecurityAttributionClaim,
  createSecurityIncidentCorrelation,
  createSecurityIncident,
  getSecurityOperationsOverview,
} from "./security-attribution";

const directories: string[] = [];
afterEach(async () =>
  Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true })
    )
  )
);

async function database() {
  const directory = await mkdtemp(join(tmpdir(), "res-publica-attribution-"));
  directories.push(directory);
  const client = new PGlite(directory);
  const db = drizzle({ client, schema: { ...coreSchema, ...moduleSchema } });
  await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
  await db.insert(people).values([
    {
      id: "triage-operator",
      name: "Synthetic Triage Operator",
      contact: { email: "triage@example.invalid" },
      locale: "en",
      rtlPreference: false,
      createdAt: new Date(),
    },
    {
      id: "attribution-reviewer",
      name: "Synthetic Attribution Reviewer",
      contact: { email: "reviewer@example.invalid" },
      locale: "en",
      rtlPreference: false,
      createdAt: new Date(),
    },
  ]);
  await db.insert(authorizationGrants).values([
    grant("triage-grant", "triage-operator", "security.incident.record", "security-operations"),
    grant("review-grant", "attribution-reviewer", "security.attribution.record", "incident-1"),
    grant("correlation-grant", "attribution-reviewer", "security.attribution.correlate", "incident-1"),
    grant("read-grant", "attribution-reviewer", "security.operations.read", "security-operations"),
  ]);
  return { client, db, serviceDb: db as unknown as Database };
}

function grant(id: string, personId: string, capability: string, target: string) {
  return {
    id,
    personId,
    domain: "governance" as const,
    capability,
    target,
    assuranceRequired: "mfa" as const,
    validFrom: new Date(0),
    validUntil: null,
    grantedByPersonId: "triage-operator",
    revokedAt: null,
  };
}

function actor(personId: string, capability: string, target: string, authenticatedAt = new Date()): AuthenticatedActor {
  return {
    personId,
    sessionId: `${personId}-session`,
    assurance: "recent-mfa",
    authenticatedAt,
    grants: [grant(`${personId}-grant`, personId, capability, target)],
  };
}

describe("security attribution persistence", () => {
  it("persists pseudonymized evidence and canonical audit atomically", async () => {
    const { client, db, serviceDb } = await database();
    try {
      const incident = await createSecurityIncident(
        serviceDb,
        actor("triage-operator", "security.incident.record", "security-operations"),
        {
          id: "incident-1",
          title: "Synthetic authentication probing",
          severity: "high",
          affectedAssets: ["authentication"],
          requestId: "40000000-0000-4000-8000-000000000001",
          correlationSecret: "synthetic-correlation-secret-with-at-least-32-bytes",
          observation: {
            observedAt: new Date("2026-08-16T10:05:31.000Z"),
            source: "application-request",
            sourceAddress: "203.0.113.24",
            authenticationSubject: "auth0|synthetic-person",
            sessionId: "synthetic-session-secret",
            routes: ["/api/auth/login?email=private@example.org"],
            userAgent: "Mozilla/5.0 Firefox/141.0 synthetic-detail",
            protocol: "HTTP/2",
            tlsVersion: "TLSv1.3",
            techniques: ["credential-access"],
            affectedAssets: ["authentication"],
          },
        }
      );
      expect(incident.id).toBe("incident-1");

      await createSecurityAttributionClaim(
        serviceDb,
        actor("attribution-reviewer", "security.attribution.record", "incident-1"),
        {
          incidentId: "incident-1",
          level: "B",
          claim: "The activity belongs to one bounded digital session cluster.",
          observedEvidence: [incident.observationId],
          inferences: ["The route and protocol sequence are internally consistent."],
          contradictoryEvidence: ["No provider-level source enrichment is available."],
          alternativeExplanations: ["A shared automation tool could reproduce the sequence."],
          confidence: "LOW",
          source: "human-security-review",
          requestId: "40000000-0000-4000-8000-000000000002",
          timestamp: new Date("2026-08-16T10:10:00.000Z"),
        }
      );

      expect(await db.select().from(securityIncidents)).toHaveLength(1);
      expect(await db.select().from(securityObservations)).toHaveLength(1);
      expect(await db.select().from(securityAttributionClaims)).toHaveLength(1);
      expect(await db.select().from(auditLog)).toEqual([
        expect.objectContaining({
          action: "security.incident-recorded",
          requestId: "40000000-0000-4000-8000-000000000001",
          capability: "security.incident.record",
        }),
        expect.objectContaining({
          action: "security.attribution-claim-recorded",
          requestId: "40000000-0000-4000-8000-000000000002",
          capability: "security.attribution.record",
        }),
      ]);

      const serialized = JSON.stringify(await db.select().from(securityObservations));
      expect(serialized).not.toContain("203.0.113.24");
      expect(serialized).not.toContain("auth0|synthetic-person");
      expect(serialized).not.toContain("synthetic-session-secret");
      expect(serialized).not.toContain("private@example.org");
      expect(serialized).not.toContain("synthetic-detail");
    } finally {
      await client.close();
    }
  }, 30_000);

  it("preserves recent-MFA, exact scope and separation of duties without mutation", async () => {
    const { client, db, serviceDb } = await database();
    try {
      await expect(
        createSecurityIncident(
          serviceDb,
          actor(
            "triage-operator",
            "security.incident.record",
            "security-operations",
            new Date(Date.now() - 6 * 60_000)
          ),
          {
            id: "incident-1",
            title: "Synthetic authentication probing",
            severity: "high",
            affectedAssets: ["authentication"],
            requestId: "40000000-0000-4000-8000-000000000003",
            correlationSecret: "synthetic-correlation-secret-with-at-least-32-bytes",
            observation: {
              observedAt: new Date(),
              source: "application-request",
              routes: ["/api/auth/login"],
              techniques: ["route-enumeration"],
              affectedAssets: ["authentication"],
            },
          }
        )
      ).rejects.toThrow("Authorization denied");

      const incident = await createSecurityIncident(
        serviceDb,
        actor("triage-operator", "security.incident.record", "security-operations"),
        {
          id: "incident-1",
          title: "Synthetic authentication probing",
          severity: "high",
          affectedAssets: ["authentication"],
          requestId: "40000000-0000-4000-8000-000000000004",
          correlationSecret: "synthetic-correlation-secret-with-at-least-32-bytes",
          observation: {
            observedAt: new Date(),
            source: "application-request",
            routes: ["/api/auth/login"],
            techniques: ["route-enumeration"],
            affectedAssets: ["authentication"],
          },
        }
      );

      await expect(
        createSecurityAttributionClaim(
          serviceDb,
          actor("triage-operator", "security.attribution.record", "incident-1"),
          {
            incidentId: "incident-1",
            level: "B",
            claim: "Unsupported self-reviewed claim.",
            observedEvidence: [incident.observationId],
            inferences: ["Synthetic inference."],
            contradictoryEvidence: ["Synthetic contradiction."],
            alternativeExplanations: ["Synthetic alternative."],
            confidence: "LOW",
            source: "human-security-review",
            requestId: "40000000-0000-4000-8000-000000000005",
            timestamp: new Date(),
          }
        )
      ).rejects.toThrow("separation_of_duties_required");

      expect(await db.select().from(securityAttributionClaims)).toHaveLength(0);
      expect(await db.select().from(auditLog)).toHaveLength(1);
    } finally {
      await client.close();
    }
  }, 30_000);

  it("keeps technical observations and attribution claims append-only", async () => {
    const { client, db, serviceDb } = await database();
    try {
      const incident = await createSecurityIncident(
        serviceDb,
        actor("triage-operator", "security.incident.record", "security-operations"),
        {
          id: "incident-1",
          title: "Synthetic immutable evidence",
          severity: "moderate",
          affectedAssets: ["authentication"],
          requestId: "40000000-0000-4000-8000-000000000006",
          correlationSecret: "synthetic-correlation-secret-with-at-least-32-bytes",
          observation: {
            observedAt: new Date(),
            source: "application-request",
            routes: ["/api/auth/login"],
            techniques: ["route-enumeration"],
            affectedAssets: ["authentication"],
          },
        }
      );
      const claim = await createSecurityAttributionClaim(
        serviceDb,
        actor("attribution-reviewer", "security.attribution.record", "incident-1"),
        {
          incidentId: "incident-1",
          level: "A",
          claim: "A bounded technical source was observed.",
          observedEvidence: [incident.observationId],
          inferences: ["No identity inference is made."],
          contradictoryEvidence: ["Provider enrichment is unavailable."],
          alternativeExplanations: ["The endpoint may be shared."],
          confidence: "LOW",
          source: "human-security-review",
          requestId: "40000000-0000-4000-8000-000000000007",
          timestamp: new Date(),
        }
      );

      const observationUpdateError = await db.update(securityObservations)
        .set({ sourceHandle: "src_00000000000000000000000000000000" })
        .where(eq(securityObservations.id, incident.observationId))
        .then(() => null, (error: unknown) => error);
      const claimUpdateError = await db.update(securityAttributionClaims)
        .set({ confidence: "HIGH" })
        .where(eq(securityAttributionClaims.id, claim.id))
        .then(() => null, (error: unknown) => error);
      expect(errorChain(observationUpdateError)).toContain("security evidence is append-only");
      expect(errorChain(claimUpdateError)).toContain("security evidence is append-only");
    } finally {
      await client.close();
    }
  }, 30_000);

  it("persists bounded temporal correlation and exposes only a protected minimized overview", async () => {
    const { client, db, serviceDb } = await database();
    try {
      const triage = actor("triage-operator", "security.incident.record", "security-operations");
      for (const [id, requestId] of [
        ["incident-1", "40000000-0000-4000-8000-000000000008"],
        ["incident-2", "40000000-0000-4000-8000-000000000009"],
      ] as const) {
        await createSecurityIncident(serviceDb, triage, {
          id,
          title: `Synthetic correlation ${id}`,
          severity: "moderate",
          affectedAssets: ["public-api"],
          requestId,
          correlationSecret: "synthetic-correlation-secret-with-at-least-32-bytes",
          observation: {
            observedAt: new Date(),
            source: "application-request",
            sourceAddress: "198.51.100.18",
            routes: ["/api/public/v1", "/api/auth/login"],
            protocol: "HTTP/2",
            techniques: ["route-enumeration"],
            affectedAssets: ["public-api"],
          },
        });
      }

      const correlation = await createSecurityIncidentCorrelation(
        serviceDb,
        actor("attribution-reviewer", "security.attribution.correlate", "incident-1"),
        {
          leftIncidentId: "incident-1",
          rightIncidentId: "incident-2",
          matchingSignals: ["source-infrastructure"],
          contradictorySignals: [],
          requestId: "40000000-0000-4000-8000-000000000010",
          reviewedAt: new Date(),
        }
      );
      expect(correlation.relation).toBe("INSUFFICIENT EVIDENCE");
      expect(await db.select().from(securityIncidentCorrelations)).toHaveLength(1);

      const overview = await getSecurityOperationsOverview(
        serviceDb,
        actor("attribution-reviewer", "security.operations.read", "security-operations")
      );
      expect(overview.incidents).toHaveLength(2);
      expect(overview.correlations).toEqual([
        expect.objectContaining({ relation: "INSUFFICIENT EVIDENCE" }),
      ]);
      const serialized = JSON.stringify(overview);
      expect(serialized).not.toContain("198.51.100.18");
      expect(serialized).not.toMatch(/same person/i);
    } finally {
      await client.close();
    }
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
