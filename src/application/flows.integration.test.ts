import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { describe, expect, it } from "vitest";
import type { AuthenticatedActor, AuthorizationGrant } from "../auth/types";
import type { Database } from "../persistence";
import * as coreSchema from "../persistence/schema";
import * as moduleSchema from "../persistence/module-schema";
import { auditLog, consentRecords, notifications, people } from "../persistence/schema";
import { events, members, registrations, waitlistEntries } from "../persistence/module-schema";
import { createMembership, DuplicateMembershipError } from "./membership";
import {
  cancelAuthenticatedActorEventRegistration,
  EventRegistrationNotFoundError,
  getEventCapacity,
  registerAuthenticatedActorForEvent,
} from "./events";

const schema = { ...coreSchema, ...moduleSchema };

function grant(capability: string, target: string | null = null): AuthorizationGrant {
  return {
    id: `grant-${capability}`,
    personId: "person-flow",
    domain: "civic",
    capability,
    target,
    assuranceRequired: "verified",
    validFrom: new Date("2026-07-01T00:00:00.000Z"),
    validUntil: null,
    revokedAt: null,
  };
}

describe("authenticated Membership and Events flows", () => {
  it("persists both flows with accountable audit evidence", async () => {
    const directory = await mkdtemp(join(tmpdir(), "res-publica-m2-"));
    const client = new PGlite(directory);
    const pgliteDb = drizzle({ client, schema });
    await migrate(pgliteDb, { migrationsFolder: join(process.cwd(), "drizzle") });
    const db = pgliteDb as unknown as Database;
    try {
      await db.insert(people).values({
        id: "person-flow", name: "Flow Test", contact: { email: "flow@example.org" },
        locale: "de", rtlPreference: false, createdAt: new Date(),
      });
      await db.insert(events).values({
        id: "event-flow", title: "Flow Event", location: "Frankfurt",
        startTime: new Date("2026-08-01T10:00:00.000Z"),
        endTime: new Date("2026-08-01T12:00:00.000Z"), capacity: 10,
      });
      const actor: AuthenticatedActor = {
        personId: "person-flow", sessionId: "session-flow", authenticatedAt: new Date(),
        assurance: "verified",
        grants: [grant("membership.create"), grant("events.register", "event-flow")],
      };

      const profileConsents = {
        dataProtection: true,
        programmeParticipation: true,
        locale: "de",
      } as const;
      const member = await createMembership(db, actor, "basic", profileConsents);
      await expect(createMembership(db, actor, "supporter", profileConsents)).rejects.toBeInstanceOf(DuplicateMembershipError);
      expect(await getEventCapacity(db, "event-flow")).toMatchObject({ capacity: 10, remaining: 10, waitlistActive: false });
      const registration = await registerAuthenticatedActorForEvent(db, actor, "event-flow");
      expect(await getEventCapacity(db, "event-flow")).toMatchObject({ capacity: 10, remaining: 9, waitlistActive: false });

      expect(member.personId).toBe(actor.personId);
      expect(registration.registration.status).toBe("confirmed");
      expect(await db.select().from(members)).toHaveLength(1);
      expect(await db.select().from(registrations)).toHaveLength(1);
      expect(
        (await db.select().from(consentRecords)).map((record) => ({
          purpose: record.purpose,
          grantedAt: record.grantedAt,
          revokedAt: record.revokedAt,
        }))
      ).toEqual([
        {
          purpose: "profile-data-protection-v1-de",
          grantedAt: expect.any(Date),
          revokedAt: null,
        },
        {
          purpose: "profile-programme-participation-v1-de",
          grantedAt: expect.any(Date),
          revokedAt: null,
        },
      ]);
      expect((await db.select().from(auditLog)).map((entry) => entry.action)).toEqual([
        "membership.created",
        "events.registration",
      ]);
    } finally {
      await client.close();
      await rm(directory, { recursive: true, force: true });
    }
  }, 30_000);

  it("cancels atomically and promotes the earliest valid waitlisted registration", async () => {
    const directory = await mkdtemp(join(tmpdir(), "res-publica-event-cancel-"));
    const client = new PGlite(directory);
    const pgliteDb = drizzle({ client, schema });
    await migrate(pgliteDb, { migrationsFolder: join(process.cwd(), "drizzle") });
    const db = pgliteDb as unknown as Database;
    try {
      await db.insert(people).values([
        {
          id: "person-flow", name: "Confirmed", contact: { email: "confirmed@example.org" },
          locale: "de", rtlPreference: false, createdAt: new Date(),
        },
        {
          id: "person-waiting", name: "Waiting", contact: { email: "waiting@example.org" },
          locale: "de", rtlPreference: false, createdAt: new Date(),
        },
      ]);
      await db.insert(events).values({
        id: "event-cancel", title: "Cancellation Event", location: "Frankfurt",
        startTime: new Date("2026-08-01T10:00:00.000Z"),
        endTime: new Date("2026-08-01T12:00:00.000Z"), capacity: 1,
      });
      const confirmedActor: AuthenticatedActor = {
        personId: "person-flow", sessionId: "session-confirmed", authenticatedAt: new Date(),
        assurance: "verified",
        grants: [grant("events.register", "event-cancel")],
      };
      const waitingActor: AuthenticatedActor = {
        personId: "person-waiting", sessionId: "session-waiting", authenticatedAt: new Date(),
        assurance: "verified",
        grants: [{
          ...grant("events.register", "event-cancel"),
          id: "grant-events-register-waiting",
          personId: "person-waiting",
        }],
      };

      await registerAuthenticatedActorForEvent(db, confirmedActor, "event-cancel");
      await registerAuthenticatedActorForEvent(db, waitingActor, "event-cancel");
      const result = await cancelAuthenticatedActorEventRegistration(
        db,
        confirmedActor,
        "event-cancel"
      );

      expect(result.cancelled.status).toBe("cancelled");
      expect(result.promoted).toMatchObject({
        personId: "person-waiting",
        status: "confirmed",
      });
      expect(await db.select().from(waitlistEntries)).toHaveLength(0);
      expect(await db.select().from(notifications)).toEqual([
        expect.objectContaining({
          recipientPersonId: "person-waiting",
          template: "waitlist-promoted",
          status: "pending",
        }),
      ]);
      expect((await db.select().from(auditLog)).map((entry) => entry.action)).toEqual([
        "events.registration",
        "events.registration",
        "events.registration.cancelled",
      ]);
    } finally {
      await client.close();
      await rm(directory, { recursive: true, force: true });
    }
  }, 30_000);

  it("cannot cancel another person's or an absent registration", async () => {
    const directory = await mkdtemp(join(tmpdir(), "res-publica-event-owner-"));
    const client = new PGlite(directory);
    const pgliteDb = drizzle({ client, schema });
    await migrate(pgliteDb, { migrationsFolder: join(process.cwd(), "drizzle") });
    const db = pgliteDb as unknown as Database;
    try {
      await db.insert(people).values([
        {
          id: "person-flow", name: "Owner", contact: { email: "owner@example.org" },
          locale: "de", rtlPreference: false, createdAt: new Date(),
        },
        {
          id: "person-other", name: "Other", contact: { email: "other@example.org" },
          locale: "de", rtlPreference: false, createdAt: new Date(),
        },
      ]);
      await db.insert(events).values({
        id: "event-owner", title: "Owner Event", location: "Frankfurt",
        startTime: new Date("2026-08-01T10:00:00.000Z"),
        endTime: new Date("2026-08-01T12:00:00.000Z"), capacity: 1,
      });
      const owner: AuthenticatedActor = {
        personId: "person-flow", sessionId: "session-owner", authenticatedAt: new Date(),
        assurance: "verified",
        grants: [grant("events.register", "event-owner")],
      };
      const other: AuthenticatedActor = {
        personId: "person-other", sessionId: "session-other", authenticatedAt: new Date(),
        assurance: "verified",
        grants: [{
          ...grant("events.register", "event-owner"),
          id: "grant-events-register-other",
          personId: "person-other",
        }],
      };
      await registerAuthenticatedActorForEvent(db, owner, "event-owner");

      await expect(
        cancelAuthenticatedActorEventRegistration(db, other, "event-owner")
      ).rejects.toBeInstanceOf(EventRegistrationNotFoundError);
      expect((await db.select().from(registrations))[0].status).toBe("confirmed");
    } finally {
      await client.close();
      await rm(directory, { recursive: true, force: true });
    }
  }, 30_000);
});
