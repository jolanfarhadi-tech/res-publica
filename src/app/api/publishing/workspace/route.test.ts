import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runtime: { db: {} } as null | { db: object },
  actor: { personId: "publisher" } as null | { personId: string },
  calls: [] as unknown[],
  error: null as Error | null,
}));

vi.mock("../../../../auth/runtime", () => ({
  getAuthRuntime: () => mocks.runtime,
}));
vi.mock("../../../../auth/actor-resolver", () => ({
  createActorResolver: () => ({ resolve: async () => mocks.actor }),
}));
vi.mock("../../../../application/publishing-workspace", () => ({
  getPublishingWorkspace: async (
    _db: object,
    actor: unknown,
    scope: string,
    _now: Date | undefined,
    limit: number
  ) => {
    mocks.calls.push({ actor, scope, limit });
    if (mocks.error) throw mocks.error;
    return { scope, roles: ["publisher"], submissions: [] };
  },
}));

import { AuthorizationDeniedError } from "../../../../auth/authorize";
import { GET } from "./route";

describe("GET /api/publishing/workspace", () => {
  beforeEach(() => {
    mocks.runtime = { db: {} };
    mocks.actor = { personId: "publisher" };
    mocks.calls = [];
    mocks.error = null;
  });

  it("uses the session actor and exact requested publication scope", async () => {
    const response = await GET(
      new Request(
        "https://respublica-ev.de/api/publishing/workspace?scope=website&personId=other"
      )
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0"
    );
    expect(response.headers.get("vary")).toBe("Cookie");
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    expect(mocks.calls).toEqual([
      { actor: { personId: "publisher" }, scope: "website", limit: 50 },
    ]);
  });

  it("rejects missing scope before resolving protected data", async () => {
    const response = await GET(
      new Request("https://respublica-ev.de/api/publishing/workspace")
    );

    expect(response.status).toBe(400);
    expect(mocks.calls).toEqual([]);
  });

  it("rejects an unbounded or malformed result limit", async () => {
    const response = await GET(
      new Request(
        "https://respublica-ev.de/api/publishing/workspace?scope=website&limit=500"
      )
    );

    expect(response.status).toBe(400);
    expect(mocks.calls).toEqual([]);
  });

  it("returns correlated private 403 and 503 failures", async () => {
    mocks.error = new AuthorizationDeniedError(
      "civic",
      "publishing.workspace"
    );
    const forbidden = await GET(
      new Request(
        "https://respublica-ev.de/api/publishing/workspace?scope=website"
      )
    );
    expect(forbidden.status).toBe(403);
    expect(forbidden.headers.get("cache-control")).toContain("no-store");
    expect(forbidden.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);

    mocks.runtime = null;
    mocks.error = null;
    const unavailable = await GET(
      new Request(
        "https://respublica-ev.de/api/publishing/workspace?scope=website"
      )
    );
    expect(unavailable.status).toBe(503);
    expect(mocks.calls).toHaveLength(1);
  });
});
