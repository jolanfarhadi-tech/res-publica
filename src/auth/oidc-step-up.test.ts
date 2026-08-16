import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  parameters: null as null | Record<string, unknown>,
}));

vi.mock("openid-client", () => ({
  discovery: async () => ({ issuer: "https://identity.example.org" }),
  randomPKCECodeVerifier: () => "verifier",
  calculatePKCECodeChallenge: async () => "challenge",
  randomState: () => "state",
  randomNonce: () => "nonce",
  buildAuthorizationUrl: (_configuration: unknown, parameters: Record<string, unknown>) => {
    mocks.parameters = parameters;
    return new URL("https://identity.example.org/authorize");
  },
}));

import { beginOidcFlow } from "./oidc";

const environment = {
  OIDC_ISSUER: "https://identity.example.org",
  OIDC_CLIENT_ID: "client",
  OIDC_CLIENT_SECRET: "secret",
  OIDC_REDIRECT_URI: "https://respublica-ev.de/api/auth/callback",
  OIDC_SCOPE: "openid profile email",
};

describe("OIDC recent-MFA step-up", () => {
  beforeEach(() => {
    mocks.parameters = null;
  });

  it("forces fresh provider authentication without claiming MFA locally", async () => {
    await beginOidcFlow(environment, "login", { stepUp: true });
    expect(mocks.parameters).toMatchObject({ prompt: "login", max_age: "0" });
    expect(mocks.parameters).not.toHaveProperty("acr_values");
  });

  it("does not force reauthentication for the ordinary login flow", async () => {
    await beginOidcFlow(environment, "login");
    expect(mocks.parameters).not.toHaveProperty("prompt");
    expect(mocks.parameters).not.toHaveProperty("max_age");
  });
});
