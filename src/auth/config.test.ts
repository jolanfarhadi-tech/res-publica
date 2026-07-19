import { describe, expect, it } from "vitest";
import { readOidcEnvironment } from "./config";
import { createSessionToken, hashSecret } from "./crypto";

describe("OIDC configuration and session secrets", () => {
  it("fails closed when required OIDC configuration is absent", () => {
    expect(readOidcEnvironment({})).toBeNull();
  });

  it("accepts a complete provider-neutral configuration", () => {
    expect(readOidcEnvironment({
      OIDC_ISSUER: "https://identity.example.org",
      OIDC_CLIENT_ID: "res-publica",
      OIDC_REDIRECT_URI: "https://res-publica.org/api/auth/callback",
    })).toMatchObject({ OIDC_SCOPE: "openid profile email" });
  });

  it("creates opaque session tokens and only persists their hash", () => {
    const first = createSessionToken();
    const second = createSessionToken();
    expect(first).not.toBe(second);
    expect(hashSecret(first)).toHaveLength(64);
    expect(hashSecret(first)).not.toBe(first);
  });
});
