import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runtime: { db: {} } as null | { db: object },
  actor: { personId: "learner" },
  calls: [] as unknown[],
  rateLimitResponse: null as Response | null,
}));

vi.mock("../../../../auth/runtime", () => ({ getAuthRuntime: () => mocks.runtime }));
vi.mock("../../../../auth/actor-resolver", () => ({ createActorResolver: () => ({ resolve: async () => mocks.actor }) }));
vi.mock("../../../../platform/rate-limit", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../../../platform/rate-limit")>();
  return { ...original, rejectRateLimitedRequest: async () => mocks.rateLimitResponse };
});
vi.mock("../../../../application/academy", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../../../application/academy")>();
  return {
    ...original,
    enrollInAcademyCourse: async (...args: unknown[]) => {
      mocks.calls.push(args);
      return { kind: "enrollment", enrollment: { id: "enrollment-1" } };
    },
  };
});

import { POST } from "./route";

function request() {
  return new Request("https://respublica-ev.de/api/academy/enrollments", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://respublica-ev.de" },
    body: JSON.stringify({
      courseId: "11111111-1111-4111-8111-111111111111",
      cohortId: "22222222-2222-4222-8222-222222222222",
    }),
  });
}

describe("Academy enrollment activation and rate-limit boundary", () => {
  beforeEach(() => {
    mocks.runtime = { db: {} };
    mocks.calls = [];
    mocks.rateLimitResponse = null;
    delete process.env.ACADEMY_ENROLLMENT_ENABLED;
  });
  afterEach(() => delete process.env.ACADEMY_ENROLLMENT_ENABLED);

  it("rejects real learner processing while the explicit gate is closed", async () => {
    const response = await POST(request());
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "feature_not_activated" });
    expect(mocks.calls).toEqual([]);
  });

  it("does not authorize or persist after a distributed rate-limit rejection", async () => {
    process.env.ACADEMY_ENROLLMENT_ENABLED = "true";
    mocks.rateLimitResponse = Response.json({ error: "rate_limited" }, { status: 429 });
    const response = await POST(request());
    expect(response.status).toBe(429);
    expect(mocks.calls).toEqual([]);
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("passes only the session actor to the application service when enabled", async () => {
    process.env.ACADEMY_ENROLLMENT_ENABLED = "true";
    const response = await POST(request());
    expect(response.status).toBe(201);
    expect(mocks.calls).toEqual([[
      {},
      mocks.actor,
      {
        courseId: "11111111-1111-4111-8111-111111111111",
        cohortId: "22222222-2222-4222-8222-222222222222",
      },
    ]]);
  });
});
