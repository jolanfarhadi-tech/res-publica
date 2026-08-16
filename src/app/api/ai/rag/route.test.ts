import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runtime: { db: {} } as null | { db: object },
  actor: { personId: "member" } as null | { personId: string },
  rateLimitResponse: null as Response | null,
  actorResolutionCalls: 0,
  applicationCalls: [] as Array<{
    actor: unknown;
    input: { query: string; requestId: string };
  }>,
}));

vi.mock("../../../../auth/runtime", () => ({
  getAuthRuntime: () => mocks.runtime,
}));

vi.mock("../../../../auth/actor-resolver", () => ({
  createActorResolver: () => ({
    resolve: async () => {
      mocks.actorResolutionCalls += 1;
      return mocks.actor;
    },
  }),
}));

vi.mock("../../../../platform/rate-limit", () => ({
  AI_RAG_QUERY_RATE_LIMIT: {
    scope: "ai.rag.query",
    limit: 30,
    windowMs: 900_000,
  },
  rejectRateLimitedRequest: async () => mocks.rateLimitResponse,
}));

vi.mock("../../../../application/knowledge-graph", () => ({
  getPublicKnowledgeGraph: vi.fn(async () => ({
    entities: [],
    relationships: [],
  })),
}));

vi.mock("../../../../application/governed-ai", () => {
  class AIRuntimeNotConfiguredError extends Error {
    readonly code = "ai_runtime_not_configured";
  }
  return {
    AIRuntimeNotConfiguredError,
    runGroundedCivicQuery: async (
      _db: object,
      actor: unknown,
      input: { query: string; requestId: string }
    ) => {
      mocks.applicationCalls.push({ actor, input });
      return {
        answer: "Grounded answer",
        citations: ["/de/research"],
        refused: false,
        policyId: "civic.grounded-search.v1",
        providerMode: "local",
      };
    },
  };
});

import { POST } from "./route";

function request(query = "HARM") {
  return new Request("https://respublica-ev.de/api/ai/rag", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://respublica-ev.de",
    },
    body: JSON.stringify({ query }),
  });
}

describe("POST /api/ai/rag", () => {
  beforeEach(() => {
    mocks.runtime = { db: {} };
    mocks.actor = { personId: "member" };
    mocks.rateLimitResponse = null;
    mocks.actorResolutionCalls = 0;
    mocks.applicationCalls = [];
  });

  it("passes the session actor and correlated request ID to the governed boundary", async () => {
    const response = await POST(request());

    expect(response.status).toBe(200);
    const requestId = response.headers.get("x-request-id");
    expect(requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(mocks.applicationCalls).toEqual([
      {
        actor: { personId: "member" },
        input: { query: "HARM", requestId },
      },
    ]);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("returns a correlated 429 before actor resolution or application work", async () => {
    mocks.rateLimitResponse = Response.json(
      { error: "rate_limited" },
      { status: 429, headers: { "retry-after": "60" } }
    );

    const response = await POST(request());

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    expect(mocks.actorResolutionCalls).toBe(0);
    expect(mocks.applicationCalls).toEqual([]);
  });

  it("rejects malformed input without application work", async () => {
    const response = await POST(request(""));

    expect(response.status).toBe(400);
    expect(mocks.actorResolutionCalls).toBe(0);
    expect(mocks.applicationCalls).toEqual([]);
  });
});
