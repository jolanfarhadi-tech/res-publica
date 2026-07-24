import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ runtime: null as null | { db: object }, actor: null as null | { personId: string }, calls: [] as unknown[] }));
vi.mock("../../../../auth/runtime", () => ({ getAuthRuntime: () => mocks.runtime }));
vi.mock("../../../../auth/actor-resolver", () => ({ createActorResolver: () => ({ resolve: async () => mocks.actor }) }));
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
  beforeEach(() => { mocks.runtime = { db: {} }; mocks.actor = { personId: "session-editor" }; mocks.calls = []; });

  it("rejects untrusted writes before resolving protected dependencies", async () => {
    const response = await POST(request({ action: "create-submission" }, false));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "untrusted_origin" });
  });

  it("fails closed when the backend is not configured", async () => {
    mocks.runtime = null;
    const response = await POST(request({ action: "create-submission" }));
    expect(response.status).toBe(503);
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
