import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runtime: { db: {} } as null | { db: object },
  actor: { personId: "candidate" },
  calls: [] as unknown[],
  rateLimitResponse: null as Response | null,
}));

vi.mock("../../../../auth/runtime", () => ({ getAuthRuntime: () => mocks.runtime }));
vi.mock("../../../../auth/actor-resolver", () => ({ createActorResolver: () => ({ resolve: async () => mocks.actor }) }));
vi.mock("../../../../platform/rate-limit", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../../../platform/rate-limit")>();
  return { ...original, rejectRateLimitedRequest: async () => mocks.rateLimitResponse };
});
vi.mock("../../../../application/fellowship", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../../../application/fellowship")>();
  return {
    ...original,
    submitFellowshipApplication: async (...args: unknown[]) => {
      mocks.calls.push(args);
      return { id: "candidacy-1", status: "submitted" };
    },
  };
});

import { POST } from "./route";

function request() {
  return new Request("https://respublica-ev.de/api/fellowship/applications", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://respublica-ev.de" },
    body: JSON.stringify({
      roleScopeId: "11111111-1111-4111-8111-111111111111",
      rationale: "Request human review",
      evidence: [{ kind: "contribution", sourceRef: "synthetic:evidence", description: "Synthetic evidence" }],
    }),
  });
}

describe("Fellowship application activation and rate-limit boundary", () => {
  beforeEach(() => {
    mocks.runtime = { db: {} };
    mocks.calls = [];
    mocks.rateLimitResponse = null;
    delete process.env.FELLOWSHIP_APPLICATIONS_ENABLED;
  });
  afterEach(() => delete process.env.FELLOWSHIP_APPLICATIONS_ENABLED);

  it("rejects real candidacy processing while the explicit gate is closed", async () => {
    const response = await POST(request());
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "feature_not_activated" });
    expect(mocks.calls).toEqual([]);
  });

  it("does not resolve the actor or persist after distributed rate-limit rejection", async () => {
    process.env.FELLOWSHIP_APPLICATIONS_ENABLED = "true";
    mocks.rateLimitResponse = Response.json({ error: "rate_limited" }, { status: 429 });
    const response = await POST(request());
    expect(response.status).toBe(429);
    expect(mocks.calls).toEqual([]);
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("passes only the session-derived actor when the gate is enabled", async () => {
    process.env.FELLOWSHIP_APPLICATIONS_ENABLED = "true";
    const response = await POST(request());
    expect(response.status).toBe(201);
    expect(mocks.calls).toEqual([[
      {},
      mocks.actor,
      {
        roleScopeId: "11111111-1111-4111-8111-111111111111",
        rationale: "Request human review",
        evidence: [{ kind: "contribution", sourceRef: "synthetic:evidence", description: "Synthetic evidence" }],
      },
    ]]);
  });
});
