import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runtime: { db: {} } as null | { db: object },
  actor: { personId: "person-self" } as null | { personId: string },
  calls: [] as unknown[],
}));

vi.mock("../../../auth/runtime", () => ({
  getAuthRuntime: () => mocks.runtime,
}));

vi.mock("../../../auth/actor-resolver", () => ({
  createActorResolver: () => ({
    resolve: async () => mocks.actor,
  }),
}));

vi.mock("../../../application/dashboard", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../../../application/dashboard")>();
  return {
    ...original,
    getSelfDashboard: async (_db: object, actor: unknown) => {
      mocks.calls.push(actor);
      if (!actor) throw new original.DashboardAuthenticationError();
      return {
        account: { status: "authenticated" },
        membership: { enrolled: false },
        consents: [],
        eventRegistrations: [],
        notifications: [],
        permittedActions: { viewProfile: true },
      };
    },
  };
});

import { GET } from "./route";

describe("GET /api/dashboard", () => {
  beforeEach(() => {
    mocks.runtime = { db: {} };
    mocks.actor = { personId: "person-self" };
    mocks.calls = [];
  });

  it("returns only the session-derived actor's private projection", async () => {
    const response = await GET(
      new Request(
        "https://respublica-ev.de/api/dashboard?personId=person-other"
      )
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0"
    );
    expect(response.headers.get("vary")).toBe("Cookie");
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    expect(mocks.calls).toEqual([{ personId: "person-self" }]);
  });

  it("returns a private correlated 401 for an anonymous request", async () => {
    mocks.actor = null;

    const response = await GET(
      new Request("https://respublica-ev.de/api/dashboard")
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    await expect(response.json()).resolves.toEqual({
      error: "authentication_required",
    });
  });

  it("fails closed when the protected runtime is unavailable", async () => {
    mocks.runtime = null;

    const response = await GET(
      new Request("https://respublica-ev.de/api/dashboard")
    );

    expect(response.status).toBe(503);
    expect(mocks.calls).toEqual([]);
  });
});
