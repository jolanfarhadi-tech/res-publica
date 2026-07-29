import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runtime: null as null | { db: object },
  actor: null as null | { personId: string },
  calls: [] as unknown[],
  rateLimitResponse: null as Response | null,
}));
vi.mock("../../../../auth/runtime", () => ({ getAuthRuntime: () => mocks.runtime }));
vi.mock("../../../../auth/actor-resolver", () => ({ createActorResolver: () => ({ resolve: async () => mocks.actor }) }));
vi.mock("../../../../platform/rate-limit", () => ({
  PUBLISHING_PRIVILEGED_WRITE_RATE_LIMIT: {
    scope: "publishing.privileged-write",
    limit: 60,
    windowMs: 900_000,
  },
  rejectRateLimitedRequest: async () => mocks.rateLimitResponse,
}));
vi.mock("../../../../application/publishing", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../../../application/publishing")>();
  return { ...original, createSubmission: async (_db: object, actor: unknown, input: unknown) => {
    mocks.calls.push({ actor, input }); return { submission: { id: "submission-1" }, moderation: { id: "moderation-1" } };
  } };
});

import { POST } from "./route";

function request(body: object, trusted = true) {
  return new Request("https://respublica-ev.de/api/publishing/workflow", {
    method: "POST", headers: { "content-type": "application/json", ...(trusted ? { origin: "https://respublica-ev.de" } : {}) },
    body: JSON.stringify(body),
  });
}

describe("POST /api/publishing/workflow", () => {
  beforeEach(() => {
    mocks.runtime = { db: {} };
    mocks.actor = { personId: "session-editor" };
    mocks.calls = [];
    mocks.rateLimitResponse = null;
  });

  it("rejects untrusted writes before resolving protected dependencies", async () => {
    const response = await POST(request({ action: "create-submission" }, false));
    expect(response.status).toBe(403);
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    await expect(response.json()).resolves.toEqual({ error: "untrusted_origin" });
  });

  it("fails closed when the backend is not configured", async () => {
    mocks.runtime = null;
    const response = await POST(request({ action: "create-submission" }));
    expect(response.status).toBe(503);
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("rejects an exceeded limit before actor resolution or persistence", async () => {
    mocks.rateLimitResponse = Response.json(
      { error: "rate_limited" },
      { status: 429, headers: { "retry-after": "60" } }
    );

    const response = await POST(
      request({
        action: "create-submission",
        publicationScope: "website",
        title: "Title",
        rawContent: "Content",
      })
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    expect(mocks.calls).toEqual([]);
  });

  it("passes only the resolved session actor to a valid workflow command", async () => {
    const response = await POST(request({ action: "create-submission", publicationScope: "website",
      title: "Title", rawContent: "Content", actorPersonId: "forged-person" }));
    expect(response.status).toBe(201);
    expect(mocks.calls).toEqual([{ actor: { personId: "session-editor" }, input: {
      action: "create-submission", publicationScope: "website", title: "Title", rawContent: "Content",
    } }]);
  });

  it("rejects translation finalization without human-finalized content", async () => {
    const response = await POST(request({ action: "finalize-translation", handoffId: "handoff-1" }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_request" });
  });
});
