import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runtime: { db: {} } as null | { db: object },
  actor: { personId: "person-board" } as null | { personId: string },
  decisions: [] as unknown[],
  rateLimitResponse: null as Response | null,
}));

vi.mock("../../../../../../auth/runtime", () => ({ getAuthRuntime: () => mocks.runtime }));
vi.mock("../../../../../../auth/actor-resolver", () => ({
  createActorResolver: () => ({ resolve: async () => mocks.actor }),
}));
vi.mock("../../../../../../platform/rate-limit", () => ({
  MEMBERSHIP_DECISION_RATE_LIMIT: {
    scope: "membership.application.decide", limit: 30, windowMs: 900_000,
  },
  rejectRateLimitedRequest: async () => mocks.rateLimitResponse,
}));
vi.mock("../../../../../../application/membership-applications", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../../../../../application/membership-applications")>();
  return {
    ...original,
    decideMembershipApplication: async (...args: unknown[]) => {
      mocks.decisions.push(args);
      return { application: { id: "application-1", status: "approved" }, member: { id: "member-1" } };
    },
  };
});

import { POST } from "./route";

function request(decision: unknown = "approved") {
  return new Request("https://respublica-ev.de/api/membership/applications/application-1/decision", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://respublica-ev.de" },
    body: JSON.stringify({ decision }),
  });
}

const context = { params: Promise.resolve({ applicationId: "application-1" }) };

describe("POST membership application decision", () => {
  beforeEach(() => {
    mocks.runtime = { db: {} };
    mocks.actor = { personId: "person-board" };
    mocks.decisions = [];
    mocks.rateLimitResponse = null;
  });

  it("passes the exact path application to the protected decision service", async () => {
    const response = await POST(request(), context);
    expect(response.status).toBe(200);
    expect(mocks.decisions[0]).toEqual([{}, mocks.actor, "application-1", "approved"]);
  });

  it("rejects invalid decisions before persistence", async () => {
    const response = await POST(request("auto-approved"), context);
    expect(response.status).toBe(400);
    expect(mocks.decisions).toHaveLength(0);
  });

  it("rate limits before actor resolution or decision persistence", async () => {
    mocks.rateLimitResponse = Response.json({ error: "rate_limited" }, { status: 429 });
    const response = await POST(request(), context);
    expect(response.status).toBe(429);
    expect(mocks.decisions).toHaveLength(0);
  });
});
