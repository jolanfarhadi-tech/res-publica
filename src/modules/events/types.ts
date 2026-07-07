/**
 * Events — Foundation Build Order Step 5, MVP module #6.
 *
 * "Converts today's static event pages into a full lifecycle —
 * registration, event-scoped grounded logistics Q&A, capacity/waitlist
 * management, and post-event outcome publishing" (`mvp-module-blueprint.md`).
 *
 * `AttendeeRecord` is not a separate type here — `Registration` already
 * carries the minimal participant identity/status the spec describes for
 * it; a separate entity would duplicate the same record (Composition over
 * Duplication).
 */

export type Event = {
  id: string;
  title: string;
  location: string;
  startTime: Date;
  endTime: Date;
  capacity: number;
};

export type RegistrationStatus = "confirmed" | "waitlisted" | "cancelled";

export type Registration = {
  id: string;
  eventId: string;
  personId: string;
  status: RegistrationStatus;
  registeredAt: Date;
};

export type WaitlistEntry = {
  id: string;
  eventId: string;
  registrationId: string;
  position: number;
};

export type EventQALogEntry = {
  id: string;
  eventId: string;
  question: string;
  answer: string;
  citations: string[];
};

export type OutcomePublication = {
  id: string;
  eventId: string;
  summary: string;
  publishedAt: Date;
};
