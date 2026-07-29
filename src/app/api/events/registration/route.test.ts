import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runtime: { db: {} } as null | { db: object },
  actor: { personId: "event-participant" } as null | {
    personId: string;
  },
  rateLimitResponse: null as Response | null,
  registrations: [] as string[],
}));

vi.mock("../../../../auth/runtime", () => ({
  getAuthRuntime: () => mocks.runtime,
}));

vi.mock("../../../../auth/actor-resolver", () => ({
  createActorResolver: () => ({ resolve: async () => mocks.actor }),
}));

vi.mock("../../../../platform/rate-limit", () => ({
  EVENT_REGISTRATION_RATE_LIMIT: {
    scope: "events.registration",
    limit: 20,
    windowMs: 900_000,
  },
  rejectRateLimitedRequest: async () => mocks.rateLimitResponse,
}));

vi.mock("../../../../application/events", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../../../../application/events")>();
  return {
    ...original,
    registerAuthenticatedActorForEvent: async (
      _db: object,
      _actor: object,
      eventId: string
    ) => {
      mocks.registrations.push(eventId);
      return { status: "registered", eventId };
    },
  };
});

import { POST } from "./route";

function request(eventId = "civic-dialogue-2026") {
  return new Request("https://respublica-ev.de/api/events/registration", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://respublica-ev.de",
    },
    body: JSON.stringify({ eventId }),
  });
}

describe("POST /api/events/registration", () => {
  beforeEach(() => {
    mocks.runtime = { db: {} };
    mocks.actor = { personId: "event-participant" };
    mocks.rateLimitResponse = null;
    mocks.registrations = [];
  });

  it("registers the session-derived actor through the existing application service", async () => {
    const response = await POST(request());

    expect(response.status).toBe(201);
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    expect(mocks.registrations).toEqual(["civic-dialogue-2026"]);
  });

  it("stops before actor resolution and persistence when rate limited", async () => {
    mocks.rateLimitResponse = Response.json(
      { error: "rate_limited" },
      { status: 429 }
    );

    const response = await POST(request());

    expect(response.status).toBe(429);
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    expect(mocks.registrations).toEqual([]);
  });
});
