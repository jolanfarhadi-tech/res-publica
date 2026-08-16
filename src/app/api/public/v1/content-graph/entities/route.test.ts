import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runtime: { db: {} } as null | { db: object },
  rateLimitResponse: null as Response | null,
  projectionCalls: 0,
}));

vi.mock("../../../../../../persistence/runtime", () => ({
  getPersistenceRuntime: () => mocks.runtime,
}));

vi.mock("../../../../../../platform/rate-limit", () => ({
  PUBLIC_API_READ_RATE_LIMIT: {
    scope: "public-api.read",
    limit: 120,
    windowMs: 900_000,
  },
  rejectRateLimitedRequest: async () => mocks.rateLimitResponse,
}));

vi.mock("../../../../../../application/knowledge-graph", () => ({
  getPublicKnowledgeGraph: async () => {
    mocks.projectionCalls += 1;
    return {
      entities: [
        {
          id: "harm",
          domain: "civic",
          type: "topic",
          canonicalName: "HARM",
          aliases: [{ locale: "fa", name: "پژوهش هارم" }],
          sources: [
            {
              file: "src/content/fa/projects/harm-research.mdx",
              locale: "fa",
              canonicalSource: "docs/source/harm.md",
              publicEligible: true,
            },
          ],
        },
      ],
      relationships: [],
    };
  },
}));

import { GET } from "./route";

function request(query = "locale=fa") {
  return new Request(
    `https://respublica-ev.de/api/public/v1/content-graph/entities?${query}`
  );
}

describe("GET /api/public/v1/content-graph/entities", () => {
  beforeEach(() => {
    mocks.runtime = { db: {} };
    mocks.rateLimitResponse = null;
    mocks.projectionCalls = 0;
  });

  it("returns a correlated, cacheable allowlisted Persian projection", async () => {
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    expect(response.headers.get("etag")).toBeTruthy();
    const body = await response.json();
    expect(body.data).toEqual([
      expect.objectContaining({
        id: "harm",
        name: "پژوهش هارم",
        sources: [{ locale: "fa", url: "/fa/projects/harm-research" }],
      }),
    ]);
    expect(JSON.stringify(body)).not.toContain("canonicalSource");
  });

  it("returns 429 before reading the graph projection", async () => {
    mocks.rateLimitResponse = Response.json(
      { error: "rate_limited" },
      { status: 429, headers: { "retry-after": "60" } }
    );
    const response = await GET(request());
    expect(response.status).toBe(429);
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    expect(mocks.projectionCalls).toBe(0);
  });

  it("rejects invalid pagination without projecting internal data", async () => {
    const response = await GET(request("limit=101"));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: { code: "invalid_query" },
    });
  });
});
