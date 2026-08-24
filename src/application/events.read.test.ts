import { describe, expect, it } from "vitest";
import type { AuthenticatedActor } from "../auth/types";
import type { Database } from "../persistence";
import {
  EventRegistrationNotFoundError,
  getAuthenticatedActorEventRegistration,
} from "./events";

const actor: AuthenticatedActor = {
  personId: "person-owner",
  sessionId: "session-owner",
  authenticatedAt: new Date("2026-08-24T08:00:00.000Z"),
  assurance: "verified",
  grants: [
    {
      id: "grant-event",
      personId: "person-owner",
      domain: "civic",
      capability: "events.register",
      target: "event-one",
      assuranceRequired: "verified",
      validFrom: new Date("2026-08-01T00:00:00.000Z"),
      validUntil: null,
      revokedAt: null,
    },
  ],
};

function readOnlyDatabase(rows: unknown[]): Database {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => rows,
        }),
      }),
    }),
  } as unknown as Database;
}

describe("event registration self-service read", () => {
  it("returns only the active registration owned by the authorized actor", async () => {
    const db = readOnlyDatabase([
      { id: "current", eventId: "event-one", personId: "person-owner", status: "waitlisted" },
    ]);

    await expect(
      getAuthenticatedActorEventRegistration(db, actor, "event-one")
    ).resolves.toMatchObject({ id: "current", status: "waitlisted" });
  });

  it("fails closed when the actor has no active registration", async () => {
    const db = readOnlyDatabase([]);

    await expect(
      getAuthenticatedActorEventRegistration(db, actor, "event-one")
    ).rejects.toBeInstanceOf(EventRegistrationNotFoundError);
  });
});
