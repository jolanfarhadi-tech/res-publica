import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runtime: { db: {} } as null | { db: object },
  actor: { personId: "board-1" } as null | { personId: string },
  calls: [] as unknown[],
  error: null as Error | null,
}));

vi.mock("../../../../../auth/runtime", () => ({
  getAuthRuntime: () => mocks.runtime,
}));
vi.mock("../../../../../auth/actor-resolver", () => ({
  createActorResolver: () => ({ resolve: async () => mocks.actor }),
}));
vi.mock("../../../../../application/operations-console", async (importOriginal) => {
  const original = await importOriginal<
    typeof import("../../../../../application/operations-console")
  >();
  return {
    ...original,
    getMembershipApplicationForOperations: async (...args: unknown[]) => {
      mocks.calls.push(args);
      if (mocks.error) throw mocks.error;
      return { application: { id: "application-1" }, acknowledgements: [] };
    },
  };
});

import {
  OperationsApplicationNotFoundError,
  OperationsAuthorizationError,
  OperationsMfaRequiredError,
  OperationsSeparationOfDutiesError,
} from "../../../../../application/operations-console";
import { GET } from "./route";

const request = new Request(
  "https://respublica-ev.de/api/operations/membership/application-1"
);
const context = { params: Promise.resolve({ applicationId: "application-1" }) };

describe("GET /api/operations/membership/:applicationId", () => {
  beforeEach(() => {
    mocks.runtime = { db: {} };
    mocks.actor = { personId: "board-1" };
    mocks.calls = [];
    mocks.error = null;
  });

  it("passes the exact path target and session actor to the protected projection", async () => {
    const response = await GET(request, context);
    expect(response.status).toBe(200);
    expect(mocks.calls).toEqual([[{}, mocks.actor, "application-1"]]);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("rejects malformed targets before loading operational data", async () => {
    const response = await GET(request, {
      params: Promise.resolve({ applicationId: "../../other" }),
    });
    expect(response.status).toBe(400);
    expect(mocks.calls).toEqual([]);
  });

  it.each([
    [new OperationsMfaRequiredError(), 403, "mfa_required"],
    [new OperationsAuthorizationError(), 403, "forbidden"],
    [new OperationsSeparationOfDutiesError(), 403, "forbidden"],
    [new OperationsApplicationNotFoundError(), 404, "application_not_found"],
  ])("maps protected failures consistently", async (error, status, code) => {
    mocks.error = error;
    const response = await GET(request, context);
    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toMatchObject({ error: code });
  });
});
