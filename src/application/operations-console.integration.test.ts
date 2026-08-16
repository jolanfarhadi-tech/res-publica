import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterEach, describe, expect, it } from "vitest";
import type { AuthenticatedActor, AuthorizationGrant } from "../auth/types";
import { editorialCapability } from "../modules/publishing/authority";
import type { Database } from "../persistence";
import * as coreSchema from "../persistence/schema";
import * as moduleSchema from "../persistence/module-schema";
import { auditLog, people } from "../persistence/schema";
import {
  documentAcknowledgements,
  membershipApplications,
  researchParticipationPreferences,
} from "../persistence/module-schema";
import {
  canAccessOperations,
  getMembershipApplicationForOperations,
  getOperationsOverview,
  OperationsAuthenticationError,
  OperationsAuthorizationError,
  OperationsMfaRequiredError,
  OperationsSeparationOfDutiesError,
} from "./operations-console";

const schema = { ...coreSchema, ...moduleSchema };
const directories: string[] = [];
const now = new Date("2026-08-10T12:00:00.000Z");

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true })
    )
  );
});

async function database() {
  const directory = await mkdtemp(join(tmpdir(), "res-publica-operations-"));
  directories.push(directory);
  const client = new PGlite(directory);
  const db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
  return { client, db: db as unknown as Database };
}

function grant(
  personId: string,
  capability: string,
  target: string | null,
  assuranceRequired: "verified" | "mfa" | "recent-mfa" = "mfa"
): AuthorizationGrant {
  return {
    id: `grant-${capability}-${target ?? "none"}`,
    personId,
    domain: "civic",
    capability,
    target,
    assuranceRequired,
    validFrom: new Date("2026-08-10T10:00:00.000Z"),
    validUntil: null,
    revokedAt: null,
  };
}

function actor(
  personId: string,
  assurance: "verified" | "mfa" | "recent-mfa",
  grants: AuthorizationGrant[]
): AuthenticatedActor {
  return {
    personId,
    sessionId: `session-${personId}`,
    authenticatedAt: new Date("2026-08-10T11:00:00.000Z"),
    assurance,
    grants,
  };
}

async function seed(db: Database) {
  await db.insert(people).values([
    {
      id: "applicant-1",
      name: "Ada Lovelace",
      contact: { email: "ada@example.org" },
      locale: "de",
      rtlPreference: false,
      createdAt: now,
    },
    {
      id: "applicant-2",
      name: "Grace Hopper",
      contact: { email: "grace@example.org" },
      locale: "en",
      rtlPreference: false,
      createdAt: now,
    },
    {
      id: "board-1",
      name: "Board Reviewer",
      contact: { email: "board@example.org" },
      locale: "de",
      rtlPreference: false,
      createdAt: now,
    },
  ]);
  await db.insert(membershipApplications).values([
    {
      id: "application-1",
      personId: "applicant-1",
      requestedTier: "basic",
      status: "application_pending",
      givenName: "Ada",
      familyName: "Lovelace",
      email: "ada@example.org",
      address: {
        line1: "Example 1",
        line2: null,
        postalCode: "10115",
        city: "Berlin",
        countryCode: "DE",
      },
      submittedAt: new Date("2026-08-10T09:00:00.000Z"),
      decidedAt: null,
      decidedByPersonId: null,
      decisionAuditId: null,
      decisionAuditTimestamp: null,
    },
    {
      id: "application-2",
      personId: "applicant-2",
      requestedTier: "supporter",
      status: "rejected",
      givenName: "Grace",
      familyName: "Hopper",
      email: "grace@example.org",
      address: {
        line1: "Example 2",
        line2: null,
        postalCode: "60311",
        city: "Frankfurt",
        countryCode: "DE",
      },
      submittedAt: new Date("2026-08-09T09:00:00.000Z"),
      decidedAt: now,
      decidedByPersonId: "board-1",
      decisionAuditId: "audit-decision",
      decisionAuditTimestamp: now,
    },
  ]);
  await db.insert(documentAcknowledgements).values([
    {
      id: "ack-statutes",
      personId: "applicant-1",
      contextType: "membership-application",
      contextId: "application-1",
      documentType: "statutes",
      documentVersion: "statutes-v1",
      acknowledgedAt: new Date("2026-08-10T09:00:00.000Z"),
    },
    {
      id: "ack-privacy",
      personId: "applicant-1",
      contextType: "membership-application",
      contextId: "application-1",
      documentType: "privacy-notice",
      documentVersion: "privacy-v1",
      acknowledgedAt: new Date("2026-08-10T09:00:00.000Z"),
    },
  ]);
  await db.insert(auditLog).values({
    id: "audit-decision",
    actorPersonId: "board-1",
    action: "membership.application.rejected",
    target: "application-2",
    timestamp: now,
    pseudonymized: false,
  });
  await db.insert(researchParticipationPreferences).values({
    id: "research-preference",
    personId: "applicant-1",
    status: "willing",
    statementVersion: "research-readiness-v1",
    recordedAt: now,
    withdrawnAt: null,
  });
}

describe("bounded Operations Console projection", () => {
  it("lists only exact-target Membership work and authorized Publishing scopes", async () => {
    const { client, db } = await database();
    try {
      await seed(db);
      const reviewer = actor("board-1", "mfa", [
        grant("board-1", "membership.application.decide", "application-1"),
        {
          ...grant(
            "board-1",
            "membership.application.decide",
            "application-1",
            "recent-mfa"
          ),
          id: "grant-recent-mfa",
          validFrom: new Date("2026-08-10T11:30:00.000Z"),
        },
        grant("board-1", editorialCapability("reviewer"), "website"),
        grant("board-1", editorialCapability("translator"), "website"),
        grant("board-1", editorialCapability("editor"), null),
      ]);

      const overview = await getOperationsOverview(db, reviewer, now);

      expect(overview.membershipApplications).toEqual([
        expect.objectContaining({
          id: "application-1",
          givenName: "Ada",
          familyName: "Lovelace",
          status: "application_pending",
          authority: expect.objectContaining({
            capability: "membership.application.decide",
            assuranceRequired: "mfa",
            assignedAt: new Date("2026-08-10T10:00:00.000Z"),
          }),
        }),
      ]);
      expect(overview.publishingScopes).toEqual([
        { scope: "website", roles: ["reviewer", "translator"] },
      ]);
      expect(overview.operationalAreas).toEqual(["membership", "publishing"]);
      expect(JSON.stringify(overview)).not.toContain("application-2");
      expect(JSON.stringify(overview)).not.toContain("research-preference");
      expect(JSON.stringify(overview)).not.toContain("ada@example.org");
    } finally {
      await client.close();
    }
  }, 30_000);

  it("exposes an operations entry point only when the current assurance satisfies an exact grant", () => {
    const exactGrant = grant(
      "board-1",
      "membership.application.decide",
      "application-1"
    );
    expect(canAccessOperations(actor("board-1", "mfa", [exactGrant]), now)).toBe(true);
    expect(canAccessOperations(actor("board-1", "verified", [exactGrant]), now)).toBe(false);
    expect(
      canAccessOperations(
        actor("board-1", "mfa", [{ ...exactGrant, target: null }]),
        now
      )
    ).toBe(false);
    expect(
      canAccessOperations(
        actor("academy-operator", "mfa", [
          grant("academy-operator", "academy.operations.read", "academy"),
        ]),
        now
      )
    ).toBe(true);
    expect(
      canAccessOperations(
        actor("academy-editor", "mfa", [
          grant("academy-editor", "academy.course.edit", "course-1"),
        ]),
        now
      )
    ).toBe(false);
  });

  it("exposes only explicitly authorized integrated operational areas", async () => {
    const { client, db } = await database();
    try {
      const operator = actor("operator", "mfa", [
        grant("operator", "academy.operations.read", "academy"),
        grant("operator", "fellowship.operations.read", "fellowship"),
        grant("operator", "knowledge-graph.operations.read", "civic"),
        grant("operator", "knowledge-graph.operations.read", "governance"),
        grant("operator", "security.operations.read", "security-operations"),
      ]);

      const overview = await getOperationsOverview(db, operator, now);

      expect(overview.operationalAreas).toEqual([
        "academy",
        "fellowship",
        "knowledge-graph",
        "security",
      ]);
      expect(overview.membershipApplications).toEqual([]);
      expect(overview.publishingScopes).toEqual([]);
    } finally {
      await client.close();
    }
  }, 30_000);

  it("reveals applicant details, versioned acknowledgements and decision evidence only after exact MFA authority", async () => {
    const { client, db } = await database();
    try {
      await seed(db);
      const reviewer = actor("board-1", "mfa", [
        grant("board-1", "membership.application.decide", "application-1"),
      ]);

      const detail = await getMembershipApplicationForOperations(
        db,
        reviewer,
        "application-1",
        now
      );

      expect(detail.application).toMatchObject({
        id: "application-1",
        email: "ada@example.org",
        address: { city: "Berlin" },
        decisionAuditId: null,
      });
      expect(detail.acknowledgements).toEqual([
        expect.objectContaining({
          documentType: "privacy-notice",
          documentVersion: "privacy-v1",
        }),
        expect.objectContaining({
          documentType: "statutes",
          documentVersion: "statutes-v1",
        }),
      ]);
      expect(detail.decisionHistory).toEqual([]);
      expect(detail.authority).toMatchObject({
        exactTarget: "application-1",
        assuranceRequired: "mfa",
      });
      expect(detail.canDecide).toBe(true);
    } finally {
      await client.close();
    }
  }, 30_000);

  it("fails closed for anonymous, unscoped, non-MFA and self-review access without mutation", async () => {
    const { client, db } = await database();
    try {
      await seed(db);
      const before = {
        applications: await db.select().from(membershipApplications),
        audit: await db.select().from(auditLog),
      };

      await expect(getOperationsOverview(db, null, now)).rejects.toBeInstanceOf(
        OperationsAuthenticationError
      );
      await expect(
        getOperationsOverview(db, actor("board-1", "mfa", []), now)
      ).rejects.toBeInstanceOf(OperationsAuthorizationError);
      await expect(
        getOperationsOverview(
          db,
          actor("board-1", "verified", [
            grant("board-1", "membership.application.decide", "application-1"),
          ]),
          now
        )
      ).rejects.toBeInstanceOf(OperationsMfaRequiredError);
      await expect(
        getMembershipApplicationForOperations(
          db,
          actor("board-1", "mfa", [
            grant("board-1", "membership.application.decide", "application-2"),
          ]),
          "application-1",
          now
        )
      ).rejects.toBeInstanceOf(OperationsAuthorizationError);
      await expect(
        getMembershipApplicationForOperations(
          db,
          actor("applicant-1", "mfa", [
            grant("applicant-1", "membership.application.decide", "application-1"),
          ]),
          "application-1",
          now
        )
      ).rejects.toBeInstanceOf(OperationsSeparationOfDutiesError);

      expect(await db.select().from(membershipApplications)).toEqual(
        before.applications
      );
      expect(await db.select().from(auditLog)).toEqual(before.audit);
    } finally {
      await client.close();
    }
  }, 30_000);
});
