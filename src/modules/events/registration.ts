import { createId } from "../../domain/shared";
import { appendEntry } from "../../domain/audit-log";
import { createNotification, type Notification } from "../../domain/notification";
import type { Event, Registration, WaitlistEntry } from "./types";

/** Registration / Waitlist / Capacity Check — real integration with `domain/audit-log` and `domain/notification`. */
export function registerForEvent(
  event: Event,
  personId: string,
  currentRegistrations: readonly Registration[]
): { registration: Registration; waitlistEntry: WaitlistEntry | null } {
  const confirmedCount = currentRegistrations.filter((r) => r.eventId === event.id && r.status === "confirmed").length;
  const isFull = confirmedCount >= event.capacity;

  const registration: Registration = {
    id: createId(),
    eventId: event.id,
    personId,
    status: isFull ? "waitlisted" : "confirmed",
    registeredAt: new Date(),
  };
  appendEntry({ actorPersonId: personId, action: "events.registration", target: event.id });

  if (!isFull) {
    return { registration, waitlistEntry: null };
  }

  const waitlistCount = currentRegistrations.filter((r) => r.eventId === event.id && r.status === "waitlisted").length;
  const waitlistEntry: WaitlistEntry = {
    id: createId(),
    eventId: event.id,
    registrationId: registration.id,
    position: waitlistCount + 1,
  };
  return { registration, waitlistEntry };
}

export function remainingCapacity(event: Event, currentRegistrations: readonly Registration[]): number {
  const confirmedCount = currentRegistrations.filter((r) => r.eventId === event.id && r.status === "confirmed").length;
  return Math.max(0, event.capacity - confirmedCount);
}

export function promoteFromWaitlist(
  event: Event,
  waitlist: readonly WaitlistEntry[],
  registrations: readonly Registration[]
): { promoted: Registration; notification: Notification } | null {
  const eventWaitlist = waitlist.filter((w) => w.eventId === event.id).sort((a, b) => a.position - b.position);
  if (eventWaitlist.length === 0) return null;

  const next = eventWaitlist[0];
  const registration = registrations.find((r) => r.id === next.registrationId);
  if (!registration) return null;

  const promoted: Registration = { ...registration, status: "confirmed" };
  const notification = createNotification({
    recipientPersonId: registration.personId,
    channel: "email",
    template: "waitlist-promoted",
  });
  return { promoted, notification };
}
