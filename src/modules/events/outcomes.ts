import { createId } from "../../domain/shared";
import { createNotification, type Notification } from "../../domain/notification";
import type { Event, OutcomePublication, Registration } from "./types";

/** Outcome Publishing — notifies every confirmed registrant, via real `domain/notification` records. */
export function publishOutcome(
  event: Event,
  summary: string,
  registrations: readonly Registration[]
): { outcome: OutcomePublication; notifications: Notification[] } {
  const outcome: OutcomePublication = { id: createId(), eventId: event.id, summary, publishedAt: new Date() };
  const notifications = registrations
    .filter((r) => r.eventId === event.id && r.status === "confirmed")
    .map((r) => createNotification({ recipientPersonId: r.personId, channel: "email", template: "event-outcome-published" }));
  return { outcome, notifications };
}
