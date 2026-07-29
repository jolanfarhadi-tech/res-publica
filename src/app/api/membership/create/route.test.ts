import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runtime: { db: {} } as null | { db: object },
  actor: { personId: "synthetic-member" } as null | { personId: string },
  createdTiers: [] as string[],
  createdConsents: [] as unknown[],
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
    createMembership: async (
      _db: object,
      _actor: object,
      tier: string,
      consents: unknown
    ) => {
      mocks.createdTiers.push(tier);
      mocks.createdConsents.push(consents);
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

const approvedProfileConsents = {
  dataProtection: true,
  programmeParticipation: true,
  locale: "de",
} as const;

function request(
  tier: string,
  profileConsents: unknown = approvedProfileConsents
) {
  return new Request("https://respublica-ev.de/api/membership/create", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://respublica-ev.de",
    },
    body: JSON.stringify({ tier, profileConsents }),
  });
}

describe("POST /api/membership/create", () => {
  beforeEach(() => {
    mocks.runtime = { db: {} };
    mocks.actor = { personId: "synthetic-member" };
    mocks.createdTiers = [];
    mocks.createdConsents = [];
  });

  it.each(membershipTiers)("accepts the approved %s membership type", async (tier) => {
    const response = await POST(request(tier));
    expect(response.status).toBe(201);
    expect(mocks.createdTiers).toEqual([tier]);
    expect(mocks.createdConsents).toEqual([approvedProfileConsents]);
  });

  it("rejects an unknown membership type before persistence", async () => {
    const response = await POST(request("invented-tier"));
    expect(response.status).toBe(400);
    expect(mocks.createdTiers).toEqual([]);
    expect(mocks.createdConsents).toEqual([]);
  });

  it.each([
    ["both confirmations are absent", undefined],
    [
      "data protection is not confirmed",
      { ...approvedProfileConsents, dataProtection: false },
    ],
    [
      "programme participation is not confirmed",
      { ...approvedProfileConsents, programmeParticipation: false },
    ],
  ])("rejects profile creation when %s", async (_case, profileConsents) => {
    const response = await POST(
      new Request("https://respublica-ev.de/api/membership/create", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://respublica-ev.de",
        },
        body: JSON.stringify({
          tier: "basic",
          ...(profileConsents === undefined ? {} : { profileConsents }),
        }),
      })
    );

    expect(response.status).toBe(400);
    expect(mocks.createdTiers).toEqual([]);
    expect(mocks.createdConsents).toEqual([]);
  });
});
