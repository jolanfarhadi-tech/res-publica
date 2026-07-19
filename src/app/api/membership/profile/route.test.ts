import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runtime: null as null | { db: object },
  actor: null as null | { personId: string },
  profile: { enrolled: false } as object,
}));

vi.mock("../../../../auth/runtime", () => ({
  getAuthRuntime: () => mocks.runtime,
}));

vi.mock("../../../../auth/actor-resolver", () => ({
  createActorResolver: () => ({ resolve: async () => mocks.actor }),
}));

vi.mock("../../../../application/member-profile", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../../../application/member-profile")>();
  return {
    ...original,
    getSelfMemberProfile: async (_db: object, actor: unknown) => {
      if (!actor) throw new original.MemberProfileAuthenticationError();
      return mocks.profile;
    },
  };
});

import { GET } from "./route";

describe("GET /api/membership/profile", () => {
  beforeEach(() => {
    mocks.runtime = { db: {} };
    mocks.actor = { personId: "person-owner" };
    mocks.profile = { enrolled: false };
  });

  it("fails closed when protected dependencies are unavailable", async () => {
    mocks.runtime = null;
    const response = await GET(new Request("https://res-publica-ev.de/api/membership/profile"));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "service_not_configured" });
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("rejects requests whose session cannot resolve to an actor", async () => {
    mocks.actor = null;
    const response = await GET(new Request("https://res-publica-ev.de/api/membership/profile"));
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "authentication_required" });
  });

  it("returns the private allowlisted self-service projection", async () => {
    mocks.profile = {
      enrolled: true,
      membership: { memberId: "member-owner", currentStatus: "active" },
    };
    const response = await GET(
      new Request("https://res-publica-ev.de/api/membership/profile?personId=person-other")
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(mocks.profile);
    expect(response.headers.get("cache-control")).toBe("private, no-store, max-age=0");
    expect(response.headers.get("vary")).toBe("Cookie");
  });
});
