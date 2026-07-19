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
import { auditLog, people } from "../persistence/schema";
import { events, members, registrations } from "../persistence/module-schema";
import { createMembership, DuplicateMembershipError } from "./membership";
import { registerAuthenticatedActorForEvent } from "./events";

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

      const member = await createMembership(db, actor, "basic");
      await expect(createMembership(db, actor, "supporter")).rejects.toBeInstanceOf(DuplicateMembershipError);
      const registration = await registerAuthenticatedActorForEvent(db, actor, "event-flow");

      expect(member.personId).toBe(actor.personId);
      expect(registration.registration.status).toBe("confirmed");
      expect(await db.select().from(members)).toHaveLength(1);
      expect(await db.select().from(registrations)).toHaveLength(1);
      expect((await db.select().from(auditLog)).map((entry) => entry.action)).toEqual([
        "membership.created",
        "events.registration",
      ]);
    } finally {
      await client.close();
      await rm(directory, { recursive: true, force: true });
    }
  }, 30_000);
});
