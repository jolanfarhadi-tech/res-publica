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
import {
  consentRecords,
  notifications,
  payments,
  people,
} from "../persistence/schema";
import {
  events,
  members,
  registrations,
} from "../persistence/module-schema";
import {
  DashboardAuthenticationError,
  getSelfDashboard,
} from "./dashboard";

const schema = { ...coreSchema, ...moduleSchema };

describe("self-facing Dashboard projection", () => {
  it("composes only the session actor's membership, consent, payments, events and notifications", async () => {
    const directory = await mkdtemp(join(tmpdir(), "res-publica-dashboard-"));
    const client = new PGlite(directory);
    const pgliteDb = drizzle({ client, schema });
    await migrate(pgliteDb, { migrationsFolder: join(process.cwd(), "drizzle") });
    const db = pgliteDb as unknown as Database;
    const now = new Date("2026-07-29T12:00:00.000Z");
    try {
      await db.insert(people).values([
        {
          id: "person-self", name: "Self", contact: { email: "self@example.org" },
          locale: "de", rtlPreference: false, createdAt: now,
        },
        {
          id: "person-other", name: "Other", contact: { email: "other@example.org" },
          locale: "en", rtlPreference: false, createdAt: now,
        },
      ]);
      await db.insert(members).values({
        id: "member-self", personId: "person-self", tier: "basic",
        status: "active", createdAt: now,
      });
      await db.insert(consentRecords).values([
        {
          id: "consent-self", personId: "person-self",
          purpose: "profile-data-protection-v1-de", grantedAt: now, revokedAt: null,
        },
        {
          id: "consent-other", personId: "person-other",
          purpose: "profile-data-protection-v1-en", grantedAt: now, revokedAt: null,
        },
      ]);
      await db.insert(payments).values([
        {
          id: "payment-self", payerId: "person-self", amount: 25,
          currency: "EUR", purpose: "membership", providerReference: "private-self-ref",
          status: "settled", createdAt: now, settledAt: now,
        },
        {
          id: "payment-other", payerId: "person-other", amount: 50,
          currency: "EUR", purpose: "donation", providerReference: "private-other-ref",
          status: "settled", createdAt: now, settledAt: now,
        },
      ]);
      await db.insert(events).values([
        {
          id: "event-self", title: "Self Event", location: "Frankfurt",
          startTime: now, endTime: new Date(now.getTime() + 3_600_000), capacity: 10,
        },
        {
          id: "event-other", title: "Other Event", location: "Berlin",
          startTime: now, endTime: new Date(now.getTime() + 3_600_000), capacity: 10,
        },
      ]);
      await db.insert(registrations).values([
        {
          id: "registration-self", eventId: "event-self", personId: "person-self",
          status: "confirmed", registeredAt: now,
        },
        {
          id: "registration-other", eventId: "event-other", personId: "person-other",
          status: "confirmed", registeredAt: now,
        },
      ]);
      await db.insert(notifications).values([
        {
          id: "notification-self", recipientPersonId: "person-self",
          channel: "in-app", template: "waitlist-promoted", status: "pending",
          createdAt: now, sentAt: null,
        },
        {
          id: "notification-other", recipientPersonId: "person-other",
          channel: "email", template: "event-outcome-published", status: "sent",
          createdAt: now, sentAt: now,
        },
      ]);
      const actor: AuthenticatedActor = {
        personId: "person-self",
        sessionId: "session-self",
        authenticatedAt: now,
        assurance: "verified",
        grants: [{
          id: "event-grant",
          personId: "person-self",
          domain: "civic",
          capability: "events.register",
          target: "event-self",
          assuranceRequired: "verified",
          validFrom: new Date(now.getTime() - 1_000),
          validUntil: null,
          revokedAt: null,
        }],
      };

      const dashboard = await getSelfDashboard(db, actor, now);

      expect(dashboard.account).toEqual({
        status: "authenticated",
        assurance: "verified",
        authenticatedAt: now,
      });
      expect(dashboard.membership).toMatchObject({
        enrolled: true,
        membership: { memberId: "member-self", currentStatus: "active" },
      });
      expect(dashboard.consents).toEqual([
        expect.objectContaining({ id: "consent-self" }),
      ]);
      expect(dashboard.payments).toEqual([
        {
          id: "payment-self",
          amount: 25,
          currency: "EUR",
          purpose: "membership",
          status: "settled",
          createdAt: now,
          settledAt: now,
        },
      ]);
      expect(dashboard.eventRegistrations).toEqual([
        expect.objectContaining({
          id: "registration-self",
          eventId: "event-self",
          title: "Self Event",
        }),
      ]);
      expect(dashboard.notifications).toEqual([
        expect.objectContaining({ id: "notification-self" }),
      ]);
      expect(dashboard.permittedActions).toEqual({
        viewProfile: true,
        applyForMembership: false,
        registerForEvents: true,
        manageConsent: false,
      });
      expect(JSON.stringify(dashboard)).not.toContain("person-other");
      expect(JSON.stringify(dashboard)).not.toContain("Other Event");
      expect(JSON.stringify(dashboard)).not.toContain("providerReference");
      expect(JSON.stringify(dashboard)).not.toContain("private-self-ref");
      expect(JSON.stringify(dashboard)).not.toContain("private-other-ref");
    } finally {
      await client.close();
      await rm(directory, { recursive: true, force: true });
    }
  }, 30_000);

  it("requires a session-derived actor", async () => {
    await expect(
      getSelfDashboard({} as Database, null)
    ).rejects.toBeInstanceOf(DashboardAuthenticationError);
  });
});
