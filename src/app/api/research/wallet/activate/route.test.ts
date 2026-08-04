import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runtime: { db: {} },
  enabled: true,
  activations: [] as unknown[],
}));

vi.mock("../../../../../auth/runtime", () => ({ getAuthRuntime: () => mocks.runtime }));
vi.mock("../../../../../auth/actor-resolver", () => ({
  createActorResolver: () => ({ resolve: async () => ({ personId: "person-wallet" }) }),
}));
vi.mock("../../../../../application/research-wallet-gate", () => ({
  readResearchWalletFeatureGate: () => ({ enabled: mocks.enabled }),
}));
vi.mock("../../../../../platform/rate-limit", () => ({
  RESEARCH_WALLET_ACTIVATION_RATE_LIMIT: { scope: "research.wallet.activate", limit: 10, windowMs: 1 },
  rejectRateLimitedRequest: async () => null,
}));
vi.mock("../../../../../application/research-wallet", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../../../../application/research-wallet")>();
  return {
    ...original,
    activateResearchWallet: async (...args: unknown[]) => {
      mocks.activations.push(args);
      return { id: "11111111-1111-4111-8111-111111111111", status: "active" };
    },
  };
});

import { POST } from "./route";

const valid = {
  walletId: "11111111-1111-4111-8111-111111111111",
  holderKeyThumbprint: "a".repeat(43),
  holderPublicKey: {
    kty: "EC",
    crv: "P-256",
    x: "x-coordinate",
    y: "y-coordinate",
  },
  recoveryPublicKey: {
    kty: "EC", crv: "P-256", x: "recovery-x", y: "recovery-y",
  },
  activationConsent: { accepted: true, version: "research-wallet-activation-v1" },
};

function request(body: unknown) {
  return new Request("https://respublica-ev.de/api/research/wallet/activate", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://respublica-ev.de" },
    body: JSON.stringify(body),
  });
}

describe("research wallet activation route", () => {
  beforeEach(() => { mocks.enabled = true; mocks.activations = []; });

  it("rejects plaintext private or recovery material", async () => {
    for (const forbidden of [
      { ...valid, privateKey: "secret" },
      { ...valid, recoverySecret: "secret" },
    ]) {
      const response = await POST(request(forbidden));
      expect(response.status).toBe(400);
    }
    expect(mocks.activations).toHaveLength(0);
  });

  it("stays unavailable until every approval gate is enabled", async () => {
    mocks.enabled = false;
    const response = await POST(request(valid));
    expect(response.status).toBe(503);
    expect(mocks.activations).toHaveLength(0);
  });

  it("accepts only the minimal public activation metadata", async () => {
    const response = await POST(request(valid));
    expect(response.status).toBe(200);
    expect(mocks.activations).toHaveLength(1);
  });
});
