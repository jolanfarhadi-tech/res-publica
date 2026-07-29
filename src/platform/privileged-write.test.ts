import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runtime: { db: { kind: "database" } } as null | { db: object },
  originResponse: null as Response | null,
  rateLimitResponse: null as Response | null,
  rateLimitCalls: 0,
  runtimeCalls: 0,
}));

vi.mock("../auth/runtime", () => ({
  getAuthRuntime: () => {
    mocks.runtimeCalls += 1;
    return mocks.runtime;
  },
}));

vi.mock("../auth/request-security", () => ({
  rejectUntrustedWriteRequest: () => mocks.originResponse,
}));

vi.mock("./rate-limit", () => ({
  rejectRateLimitedRequest: async () => {
    mocks.rateLimitCalls += 1;
    return mocks.rateLimitResponse;
  },
}));

import { executePrivilegedWrite } from "./privileged-write";

const policy = {
  scope: "governance.privileged-write",
  limit: 60,
  windowMs: 900_000,
};

function request() {
  return new Request("https://respublica-ev.de/api/governance/cases", {
    method: "POST",
    headers: { origin: "https://respublica-ev.de" },
  });
}

describe("privileged write boundary", () => {
  beforeEach(() => {
    mocks.runtime = { db: { kind: "database" } };
    mocks.originResponse = null;
    mocks.rateLimitResponse = null;
    mocks.rateLimitCalls = 0;
    mocks.runtimeCalls = 0;
    vi.stubEnv("HARM_OPERATIONS_ENABLED", "true");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows the existing protected operation after request protection", async () => {
    const operation = vi.fn(async () =>
      Response.json({ status: "persisted" }, { status: 201 })
    );

    const response = await executePrivilegedWrite(
      request(),
      policy,
      operation
    );

    expect(response.status).toBe(201);
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    expect(mocks.rateLimitCalls).toBe(1);
    expect(operation).toHaveBeenCalledWith(mocks.runtime);
  });

  it("returns a correlated 429 before persistence or audit mutation", async () => {
    const persisted: string[] = [];
    const audit: string[] = [];
    mocks.rateLimitResponse = Response.json(
      { error: "rate_limited" },
      { status: 429, headers: { "retry-after": "60" } }
    );

    const response = await executePrivilegedWrite(
      request(),
      policy,
      async () => {
        persisted.push("record");
        audit.push("entry");
        return Response.json({ status: "persisted" });
      }
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    expect(persisted).toEqual([]);
    expect(audit).toEqual([]);
  });

  it("preserves MFA, capability, and separation-of-duties denials", async () => {
    const forbidden = await executePrivilegedWrite(
      request(),
      policy,
      async () => Response.json({ error: "forbidden" }, { status: 403 })
    );
    const conflict = await executePrivilegedWrite(
      request(),
      policy,
      async () =>
        Response.json(
          { error: "separation_of_duties_violation" },
          { status: 409 }
        )
    );

    expect(forbidden.status).toBe(403);
    await expect(forbidden.json()).resolves.toEqual({ error: "forbidden" });
    expect(conflict.status).toBe(409);
    await expect(conflict.json()).resolves.toEqual({
      error: "separation_of_duties_violation",
    });
  });

  it("rejects an untrusted origin before consuming the shared limiter", async () => {
    mocks.originResponse = Response.json(
      { error: "untrusted_origin" },
      { status: 403 }
    );
    const operation = vi.fn();

    const response = await executePrivilegedWrite(
      request(),
      policy,
      operation
    );

    expect(response.status).toBe(403);
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    expect(mocks.rateLimitCalls).toBe(0);
    expect(operation).not.toHaveBeenCalled();
  });

  it("keeps Governance operations server-disabled before runtime or persistence", async () => {
    vi.stubEnv("HARM_OPERATIONS_ENABLED", "false");
    const persisted: string[] = [];
    const audit: string[] = [];

    const response = await executePrivilegedWrite(
      request(),
      policy,
      async () => {
        persisted.push("record");
        audit.push("entry");
        return Response.json({ status: "persisted" });
      }
    );

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0"
    );
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    await expect(response.json()).resolves.toEqual({
      error: "feature_not_activated",
    });
    expect(mocks.runtimeCalls).toBe(0);
    expect(mocks.rateLimitCalls).toBe(0);
    expect(persisted).toEqual([]);
    expect(audit).toEqual([]);
  });

  it("does not apply the HARM gate to Publishing operations", async () => {
    vi.stubEnv("HARM_OPERATIONS_ENABLED", "false");
    const publishingPolicy = {
      scope: "publishing.privileged-write",
      limit: 60,
      windowMs: 900_000,
    };

    const response = await executePrivilegedWrite(
      new Request("https://respublica-ev.de/api/publishing/workflow", {
        method: "POST",
        headers: { origin: "https://respublica-ev.de" },
      }),
      publishingPolicy,
      async () => Response.json({ status: "persisted" })
    );

    expect(response.status).toBe(200);
    expect(mocks.runtimeCalls).toBe(1);
    expect(mocks.rateLimitCalls).toBe(1);
  });
});
