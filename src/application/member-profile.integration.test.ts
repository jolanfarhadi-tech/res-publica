import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { describe, expect, it } from "vitest";
import type { AuthenticatedActor } from "../auth/types";
import type { Database } from "../persistence";
import * as coreSchema from "../persistence/schema";
import * as moduleSchema from "../persistence/module-schema";
import { auditLog, people } from "../persistence/schema";
import {
  members,
  membershipApplications,
  membershipStatusChanges,
} from "../persistence/module-schema";
import { getSelfMemberProfile, MemberProfileAuthenticationError } from "./member-profile";

const schema = { ...coreSchema, ...moduleSchema };

function actor(personId: string): AuthenticatedActor {
  return {
    personId,
    sessionId: `session-${personId}`,
    authenticatedAt: new Date("2026-07-19T10:00:00.000Z"),
    assurance: "verified",
    grants: [],
  };
}

describe("Member Profile self-service boundary", () => {
  it("returns only the session actor's allowlisted Membership projection", async () => {
    const directory = await mkdtemp(join(tmpdir(), "res-publica-profile-"));
    const client = new PGlite(directory);
    const pgliteDb = drizzle({ client, schema });
    await migrate(pgliteDb, { migrationsFolder: join(process.cwd(), "drizzle") });
    const db = pgliteDb as unknown as Database;

    try {
      await db.insert(people).values([
        {
          id: "person-owner",
          name: "Owner Secret Name",
          contact: { email: "owner-secret@example.org" },
          locale: "de",
          rtlPreference: false,
          createdAt: new Date("2026-07-01T00:00:00.000Z"),
        },
        {
          id: "person-other",
          name: "Other Secret Name",
          contact: { email: "other-secret@example.org" },
          locale: "en",
          rtlPreference: false,
          createdAt: new Date("2026-07-02T00:00:00.000Z"),
        },
      ]);
      await db.insert(members).values([
        {
          id: "member-owner",
          personId: "person-owner",
          tier: "volunteer",
          status: "active",
          createdAt: new Date("2026-07-03T00:00:00.000Z"),
        },
        {
          id: "member-other",
          personId: "person-other",
          tier: "supporter",
          status: "suspended",
          createdAt: new Date("2026-07-04T00:00:00.000Z"),
        },
      ]);
      await db.insert(membershipStatusChanges).values({
        id: "change-owner",
        memberId: "member-owner",
        previousStatus: "verified",
        currentStatus: "active",
        triggeringActivity: "membership-activation-confirmed",
        timestamp: new Date("2026-07-05T00:00:00.000Z"),
      });
      await db.insert(membershipApplications).values({
        id: "application-owner",
        personId: "person-owner",
        requestedTier: "volunteer",
        status: "approved",
        givenName: "Owner",
        familyName: "Secret",
        email: "owner-secret@example.org",
        address: {
          line1: "Private address 1",
          line2: null,
          postalCode: "12345",
          city: "Frankfurt",
          countryCode: "DE",
        },
        submittedAt: new Date("2026-07-02T08:00:00.000Z"),
        decidedAt: new Date("2026-07-03T08:00:00.000Z"),
        decidedByPersonId: "person-other",
        decisionAuditId: "audit-private-decision",
        decisionAuditTimestamp: new Date("2026-07-03T08:00:00.000Z"),
      });
      await db.insert(auditLog).values({
        id: "audit-sensitive",
        actorPersonId: "person-owner",
        action: "governance.internal-reviewer-note",
        target: "risk-flag-secret",
        timestamp: new Date("2026-07-06T00:00:00.000Z"),
        pseudonymized: false,
      });

      const profile = await getSelfMemberProfile(db, actor("person-owner"));
      expect(profile).toEqual({
        enrolled: true,
        membershipApplication: {
          id: "application-owner",
          requestedTier: "volunteer",
          status: "approved",
          submittedAt: new Date("2026-07-02T08:00:00.000Z"),
          decidedAt: new Date("2026-07-03T08:00:00.000Z"),
        },
        membership: {
          memberId: "member-owner",
          tier: "volunteer",
          currentStatus: "active",
          registeredAt: new Date("2026-07-03T00:00:00.000Z"),
          previousStatus: "verified",
          statusChangeDate: new Date("2026-07-05T00:00:00.000Z"),
          triggeringActivity: "membership-status-change-confirmed",
          nextAvailableStatuses: [
            "inactive",
            "paused",
            "self-isolated",
            "withdrawn",
            "retired",
            "suspended",
          ],
        },
      });
      const serialized = JSON.stringify(profile);
      expect(serialized).not.toContain("person-other");
      expect(serialized).not.toContain("Other Secret Name");
      expect(serialized).not.toContain("owner-secret@example.org");
      expect(serialized).not.toContain("Private address");
      expect(serialized).not.toContain("audit-private-decision");
      expect(serialized).not.toContain("risk-flag-secret");
      expect(serialized).not.toMatch(/reviewer|governance|audit/i);
    } finally {
      await client.close();
      await rm(directory, { recursive: true, force: true });
    }
  }, 30_000);

  it("returns a stable not-enrolled result without accepting a target identifier", async () => {
    const directory = await mkdtemp(join(tmpdir(), "res-publica-profile-empty-"));
    const client = new PGlite(directory);
    const pgliteDb = drizzle({ client, schema });
    await migrate(pgliteDb, { migrationsFolder: join(process.cwd(), "drizzle") });
    const db = pgliteDb as unknown as Database;
    try {
      await db.insert(people).values({
        id: "person-without-membership",
        name: "Applicant Secret Name",
        contact: { email: "applicant-secret@example.org" },
        locale: "en",
        rtlPreference: false,
        createdAt: new Date("2026-07-07T00:00:00.000Z"),
      });
      await db.insert(membershipApplications).values({
        id: "application-pending",
        personId: "person-without-membership",
        requestedTier: "basic",
        status: "application_pending",
        givenName: "Applicant",
        familyName: "Secret",
        email: "applicant-secret@example.org",
        address: {
          line1: "Hidden street 2",
          line2: null,
          postalCode: "54321",
          city: "Berlin",
          countryCode: "DE",
        },
        submittedAt: new Date("2026-07-08T00:00:00.000Z"),
        decidedAt: null,
        decidedByPersonId: null,
        decisionAuditId: null,
        decisionAuditTimestamp: null,
      });
      await expect(getSelfMemberProfile(db, actor("person-without-membership"))).resolves.toEqual({
        enrolled: false,
        membershipApplication: {
          id: "application-pending",
          requestedTier: "basic",
          status: "application_pending",
          submittedAt: new Date("2026-07-08T00:00:00.000Z"),
          decidedAt: null,
        },
      });
      await expect(getSelfMemberProfile(db, null)).rejects.toBeInstanceOf(
        MemberProfileAuthenticationError
      );
      expect(getSelfMemberProfile).toHaveLength(2);
    } finally {
      await client.close();
      await rm(directory, { recursive: true, force: true });
    }
  }, 30_000);
});
