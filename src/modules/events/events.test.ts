import { describe, it, expect } from "vitest";
import {
  cancelEventRegistration,
  registerForEvent,
  remainingCapacity,
  promoteFromWaitlist,
} from "./registration";
import { askEventQuestion } from "./qa";
import { publishOutcome } from "./outcomes";
import { createLedger } from "../ai-layer/cost-governance";
import type { Event, Registration } from "./types";
import type { KnowledgeGraph } from "../knowledge-graph/types";

function makeEvent(id: string, capacity: number): Event {
  return { id, title: `Event ${id}`, location: "Frankfurt", startTime: new Date(), endTime: new Date(), capacity };
}

describe("Registration / Waitlist / Capacity", () => {
  it("confirms a registration when capacity remains", () => {
    const event = makeEvent("evt-1", 2);
    const { registration, waitlistEntry } = registerForEvent(event, "person-1", []);
    expect(registration.status).toBe("confirmed");
    expect(waitlistEntry).toBeNull();
  });

  it("waitlists a registration once capacity is full", () => {
    const event = makeEvent("evt-1", 1);
    const first = registerForEvent(event, "person-1", []).registration;
    const { registration, waitlistEntry } = registerForEvent(event, "person-2", [first]);
    expect(registration.status).toBe("waitlisted");
    expect(waitlistEntry?.position).toBe(1);
  });

  it("reports remaining capacity accurately", () => {
    const event = makeEvent("evt-1", 3);
    const first = registerForEvent(event, "person-1", []).registration;
    expect(remainingCapacity(event, [first])).toBe(2);
  });

  it("promotes the earliest waitlisted registration when a spot opens", () => {
    const event = makeEvent("evt-1", 1);
    const first = registerForEvent(event, "person-1", []).registration;
    const second = registerForEvent(event, "person-2", [first]);
    const promotion = promoteFromWaitlist(event, [second.waitlistEntry!], [first, second.registration]);
    expect(promotion?.promoted.status).toBe("confirmed");
    expect(promotion?.promoted.personId).toBe("person-2");
    expect(promotion?.notification.template).toBe("waitlist-promoted");
  });

  it("cancels only the actor's own active registration with audit evidence", () => {
    const event = makeEvent("evt-1", 1);
    const registration = registerForEvent(event, "person-1", []).registration;

    const cancellation = cancelEventRegistration(registration, "person-1");

    expect(cancellation.registration).toMatchObject({
      id: registration.id,
      personId: "person-1",
      status: "cancelled",
    });
    expect(cancellation.auditEntry).toMatchObject({
      actorPersonId: "person-1",
      action: "events.registration.cancelled",
      target: "evt-1",
    });
  });

  it("does not promote a cancelled waitlist registration", () => {
    const event = makeEvent("evt-1", 1);
    const confirmed = registerForEvent(event, "person-1", []).registration;
    const waitlisted = registerForEvent(event, "person-2", [confirmed]);
    const cancelled = { ...waitlisted.registration, status: "cancelled" as const };

    expect(
      promoteFromWaitlist(
        event,
        [waitlisted.waitlistEntry!],
        [confirmed, cancelled]
      )
    ).toBeNull();
  });
});

describe("Event Q&A — cross-event isolation guardrail", () => {
  function graphWithTwoEvents(): KnowledgeGraph {
    return {
      entities: new Map([
        [
          "loc-a",
          {
            id: "loc-a",
            domain: "civic",
            type: "topic",
            canonicalName: "Berlin Conference Hall",
            aliases: [],
            sources: [{ file: "src/content/de/pages/evt-a-details.mdx", locale: "de", canonicalSource: "test-source", publicEligible: true }],
          },
        ],
        [
          "loc-b",
          {
            id: "loc-b",
            domain: "civic",
            type: "topic",
            canonicalName: "Munich Town Hall",
            aliases: [],
            sources: [{ file: "src/content/de/pages/evt-b-details.mdx", locale: "de", canonicalSource: "test-source", publicEligible: true }],
          },
        ],
      ]),
      relationships: [],
    };
  }

  it("answers a question about its own event using only that event's data", () => {
    const eventA = makeEvent("evt-a", 10);
    const graph = graphWithTwoEvents();
    const { logEntry } = askEventQuestion(eventA, "conference hall", graph, createLedger(100));
    expect(logEntry.answer).toContain("Berlin Conference Hall");
  });

  it("never answers Event A's question with Event B's data, even when both exist in the shared graph", () => {
    const eventA = makeEvent("evt-a", 10);
    const graph = graphWithTwoEvents();
    // Asking about "town hall" (Event B's location) while scoped to Event A
    // must find nothing — Event B's entity is structurally absent from
    // Event A's scoped graph, not merely deprioritized.
    const { logEntry } = askEventQuestion(eventA, "town hall", graph, createLedger(100));
    expect(logEntry.answer).not.toContain("Munich Town Hall");
    expect(logEntry.citations).toEqual([]);
  });
});

describe("Outcome Publishing", () => {
  it("notifies every confirmed registrant, and only confirmed registrants", () => {
    const event = makeEvent("evt-1", 5);
    const registrations: Registration[] = [
      { id: "r1", eventId: "evt-1", personId: "p1", status: "confirmed", registeredAt: new Date() },
      { id: "r2", eventId: "evt-1", personId: "p2", status: "waitlisted", registeredAt: new Date() },
    ];
    const { outcome, notifications } = publishOutcome(event, "Great turnout!", registrations);
    expect(outcome.summary).toBe("Great turnout!");
    expect(notifications).toHaveLength(1);
    expect(notifications[0].recipientPersonId).toBe("p1");
  });
});
