import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runtime: { db: {} } as null | { db: object },
  actor: { personId: "board-1" } as null | { personId: string },
  calls: [] as unknown[],
  error: null as Error | null,
  rateLimitResponse: null as Response | null,
}));

vi.mock("../../../auth/runtime", () => ({
  getAuthRuntime: () => mocks.runtime,
}));
vi.mock("../../../auth/actor-resolver", () => ({
  createActorResolver: () => ({ resolve: async () => mocks.actor }),
}));
vi.mock("../../../platform/rate-limit", () => ({
  OPERATIONS_READ_RATE_LIMIT: { scope: "operations.read", limit: 60, windowMs: 900_000 },
  rejectRateLimitedRequest: async () => mocks.rateLimitResponse,
}));
vi.mock("../../../application/operations-console", async (importOriginal) => {
  const original = await importOriginal<
    typeof import("../../../application/operations-console")
  >();
  return {
    ...original,
    getOperationsOverview: async (...args: unknown[]) => {
      mocks.calls.push(args);
      if (mocks.error) throw mocks.error;
      return {
        operationalAreas: [],
        membershipApplications: [],
        publishingScopes: [],
      };
    },
  };
});

import {
  OperationsAuthenticationError,
  OperationsAuthorizationError,
  OperationsMfaRequiredError,
} from "../../../application/operations-console";
import { GET } from "./route";

describe("GET /api/operations", () => {
  beforeEach(() => {
    mocks.runtime = { db: {} };
    mocks.actor = { personId: "board-1" };
    mocks.calls = [];
    mocks.error = null;
    mocks.rateLimitResponse = null;
  });

  it("uses only the session actor and returns private correlated data", async () => {
    const response = await GET(
      new Request("https://respublica-ev.de/api/operations?limit=25&personId=other")
    );

    expect(response.status).toBe(200);
    expect(mocks.calls).toEqual([[{}, mocks.actor, undefined, 25]]);
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0"
    );
    expect(response.headers.get("vary")).toBe("Cookie");
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("rejects invalid limits before protected data resolution", async () => {
    const response = await GET(
      new Request("https://respublica-ev.de/api/operations?limit=101")
    );
    expect(response.status).toBe(400);
    expect(mocks.calls).toEqual([]);
  });

  it.each([
    [new OperationsAuthenticationError(), 401, "authentication_required"],
    [new OperationsMfaRequiredError(), 403, "mfa_required"],
    [new OperationsAuthorizationError(), 403, "forbidden"],
  ])("maps protected failures without leaking details", async (error, status, code) => {
    mocks.error = error;
    const response = await GET(
      new Request("https://respublica-ev.de/api/operations")
    );
    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toMatchObject({ error: code });
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
});
