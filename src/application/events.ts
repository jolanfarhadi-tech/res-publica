import { eq } from "drizzle-orm";
import { requireAuthorization } from "../auth/authorize";
import type { AuthenticatedActor } from "../auth/types";
import { registerForEvent } from "../modules/events/registration";
import type { Database } from "../persistence";
import { auditLog } from "../persistence/schema";
import { events, registrations, waitlistEntries } from "../persistence/module-schema";

export async function registerAuthenticatedActorForEvent(
  db: Database,
  actor: AuthenticatedActor | null,
  eventId: string
) {
  requireAuthorization(actor, { domain: "civic", capability: "events.register", target: eventId });
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!event) throw new EventNotFoundError(eventId);
  const existing = await db.select().from(registrations).where(eq(registrations.eventId, eventId));
  if (existing.some((registration) => registration.personId === actor.personId && registration.status !== "cancelled")) {
    throw new DuplicateEventRegistrationError(eventId);
  }
  const result = registerForEvent(event, actor.personId, existing);
  await db.transaction(async (transaction) => {
    await transaction.insert(registrations).values(result.registration);
    if (result.waitlistEntry) await transaction.insert(waitlistEntries).values(result.waitlistEntry);
    await transaction.insert(auditLog).values(result.auditEntry);
  });
  return result;
}

export class EventNotFoundError extends Error {}
export class DuplicateEventRegistrationError extends Error {}
