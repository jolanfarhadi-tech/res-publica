import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runtime: { db: {} } as { db: object } | null,
  actor: { personId: "security-operator" } as { personId: string } | null,
  overviewCalls: [] as unknown[][],
  incidentCalls: [] as unknown[][],
  overviewError: null as Error | null,
  rateLimitResponse: null as Response | null,
}));

vi.mock("../../../../auth/runtime", () => ({ getAuthRuntime: () => mocks.runtime }));
vi.mock("../../../../auth/actor-resolver", () => ({
  createActorResolver: () => ({ resolve: async () => mocks.actor }),
}));
vi.mock("../../../../platform/rate-limit", () => ({
  SECURITY_OPERATIONS_READ_RATE_LIMIT: { scope: "security.operations-read" },
  SECURITY_OPERATIONS_WRITE_RATE_LIMIT: { scope: "security.operations-write" },
  rejectRateLimitedRequest: async () => mocks.rateLimitResponse,
}));
vi.mock("../../../../platform/privileged-write", () => ({
  executePrivilegedWrite: async (
    request: Request,
    _policy: unknown,
    operation: (runtime: { db: object }, context: { requestId: string }) => Promise<Response>
  ) => operation(mocks.runtime!, { requestId: "50000000-0000-4000-8000-000000000001" }),
}));
vi.mock("../../../../application/security-attribution", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../../../application/security-attribution")>();
  return {
    ...original,
    getSecurityOperationsOverview: async (...args: unknown[]) => {
      mocks.overviewCalls.push(args);
      if (mocks.overviewError) throw mocks.overviewError;
      return { incidents: [], observations: [], claims: [], correlations: [] };
    },
    createSecurityIncident: async (...args: unknown[]) => {
      mocks.incidentCalls.push(args);
      return { id: "incident-1", observationId: "observation-1" };
    },
  };
});

import { AuthorizationDeniedError } from "../../../../auth/authorize";
import { GET, POST } from "./route";

describe("Security Operations API boundary", () => {
  beforeEach(() => {
    mocks.runtime = { db: {} };
    mocks.actor = { personId: "security-operator" };
    mocks.overviewCalls = [];
    mocks.incidentCalls = [];
    mocks.overviewError = null;
    mocks.rateLimitResponse = null;
    vi.unstubAllEnvs();
  });

  it("returns only the protected read projection with private cache and correlation ID", async () => {
    const response = await GET(new Request("https://respublica-ev.de/api/operations/security?limit=25"));
    expect(response.status).toBe(200);
    expect(mocks.overviewCalls).toEqual([[{}, mocks.actor, 25]]);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("fails closed for anonymous and unauthorized operators", async () => {
    mocks.actor = null;
    mocks.overviewError = new AuthorizationDeniedError("governance", "security.operations.read");
    const anonymous = await GET(new Request("https://respublica-ev.de/api/operations/security"));
    expect(anonymous.status).toBe(401);

    mocks.actor = { personId: "ordinary-member" };
    const forbidden = await GET(new Request("https://respublica-ev.de/api/operations/security"));
    expect(forbidden.status).toBe(403);
  });

  it("does not accept raw technical intake without the server correlation secret", async () => {
    const response = await POST(incidentRequest());
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "security_attribution_not_configured" });
    expect(mocks.incidentCalls).toEqual([]);
  });

  it("passes raw identifiers only to the pseudonymizing application boundary and never echoes them", async () => {
    vi.stubEnv("SECURITY_ATTRIBUTION_CORRELATION_SECRET", "s".repeat(48));
    const response = await POST(incidentRequest());
    expect(response.status).toBe(201);
    expect(mocks.incidentCalls).toHaveLength(1);
    expect(JSON.stringify(await response.json())).not.toContain("203.0.113.24");
    expect(mocks.incidentCalls[0][2]).toEqual(expect.objectContaining({
      correlationSecret: "s".repeat(48),
      requestId: "50000000-0000-4000-8000-000000000001",
    }));
  });
});

function incidentRequest() {
  return new Request("https://respublica-ev.de/api/operations/security", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: "incident-1",
      title: "Synthetic route probing",
      severity: "moderate",
      affectedAssets: ["public-api"],
      observation: {
        observedAt: "2026-08-16T10:00:00.000Z",
        source: "application-request",
        sourceAddress: "203.0.113.24",
        routes: ["/api/public/v1"],
        techniques: ["route-enumeration"],
        affectedAssets: ["public-api"],
      },
    }),
  });
}
