import { createId } from "../../domain/shared";
import { appendEntry } from "../../domain/audit-log";
import type { AuditLogEntry } from "../../domain/audit-log";
import { createNotification, type Notification } from "../../domain/notification";
import type { Event, Registration, WaitlistEntry } from "./types";

/** Registration / Waitlist / Capacity Check — real integration with `domain/audit-log` and `domain/notification`. */
export function registerForEvent(
  event: Event,
  personId: string,
  currentRegistrations: readonly Registration[]
): { registration: Registration; waitlistEntry: WaitlistEntry | null; auditEntry: AuditLogEntry } {
  const confirmedCount = currentRegistrations.filter((r) => r.eventId === event.id && r.status === "confirmed").length;
  const isFull = confirmedCount >= event.capacity;

  const registration: Registration = {
    id: createId(),
    eventId: event.id,
    personId,
    status: isFull ? "waitlisted" : "confirmed",
    registeredAt: new Date(),
  };
  const auditEntry = appendEntry({ actorPersonId: personId, action: "events.registration", target: event.id });

  if (!isFull) {
    return { registration, waitlistEntry: null, auditEntry };
  }

  const waitlistCount = currentRegistrations.filter((r) => r.eventId === event.id && r.status === "waitlisted").length;
  const waitlistEntry: WaitlistEntry = {
    id: createId(),
    eventId: event.id,
    registrationId: registration.id,
    position: waitlistCount + 1,
  };
  return { registration, waitlistEntry, auditEntry };
}

export function remainingCapacity(event: Event, currentRegistrations: readonly Registration[]): number {
  const confirmedCount = currentRegistrations.filter((r) => r.eventId === event.id && r.status === "confirmed").length;
  return Math.max(0, event.capacity - confirmedCount);
}

export function cancelEventRegistration(
  registration: Registration,
  actorPersonId: string
): { registration: Registration; auditEntry: AuditLogEntry } {
  if (
    registration.personId !== actorPersonId ||
    registration.status === "cancelled"
  ) {
    throw new Error("Only an active registration owner can cancel");
  }

  return {
    registration: { ...registration, status: "cancelled" },
    auditEntry: appendEntry({
      actorPersonId,
      action: "events.registration.cancelled",
      target: registration.eventId,
    }),
  };
}

export function promoteFromWaitlist(
  event: Event,
  waitlist: readonly WaitlistEntry[],
  registrations: readonly Registration[]
): { promoted: Registration; notification: Notification } | null {
  const eventWaitlist = waitlist.filter((w) => w.eventId === event.id).sort((a, b) => a.position - b.position);
  if (eventWaitlist.length === 0) return null;

  const next = eventWaitlist.find((entry) =>
    registrations.some(
      (registration) =>
        registration.id === entry.registrationId &&
        registration.status === "waitlisted"
    )
  );
  if (!next) return null;
  const registration = registrations.find(
    (candidate) =>
      candidate.id === next.registrationId &&
      candidate.status === "waitlisted"
  );
  if (!registration) return null;

  const promoted: Registration = { ...registration, status: "confirmed" };
  const notification = createNotification({
    recipientPersonId: registration.personId,
    channel: "email",
    template: "waitlist-promoted",
  });
  return { promoted, notification };
}
