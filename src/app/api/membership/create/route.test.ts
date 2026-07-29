import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runtime: { db: {} } as null | { db: object },
  actor: { personId: "synthetic-member" } as null | { personId: string },
  createdTiers: [] as string[],
}));

vi.mock("../../../../auth/runtime", () => ({
  getAuthRuntime: () => mocks.runtime,
}));

vi.mock("../../../../auth/actor-resolver", () => ({
  createActorResolver: () => ({ resolve: async () => mocks.actor }),
}));

vi.mock("../../../../application/membership", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../../../application/membership")>();
  return {
    ...original,
    createMembership: async (_db: object, _actor: object, tier: string) => {
      mocks.createdTiers.push(tier);
      return { id: `synthetic-${tier}`, tier };
    },
  };
});

import { POST } from "./route";

const membershipTiers = [
  "basic",
  "supporter",
  "volunteer",
  "research",
  "institutional",
] as const;

function request(tier: string) {
  return new Request("https://respublica-ev.de/api/membership/create", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://respublica-ev.de",
    },
    body: JSON.stringify({ tier }),
  });
}

describe("POST /api/membership/create", () => {
  beforeEach(() => {
    mocks.runtime = { db: {} };
    mocks.actor = { personId: "synthetic-member" };
    mocks.createdTiers = [];
  });

  it.each(membershipTiers)("accepts the approved %s membership type", async (tier) => {
    const response = await POST(request(tier));
    expect(response.status).toBe(201);
    expect(mocks.createdTiers).toEqual([tier]);
  });

  it("rejects an unknown membership type before persistence", async () => {
    const response = await POST(request("invented-tier"));
    expect(response.status).toBe(400);
    expect(mocks.createdTiers).toEqual([]);
  });
});
