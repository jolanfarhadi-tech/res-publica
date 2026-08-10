import { describe, expect, it, vi } from "vitest";
import {
  checkMembershipProductionE2e,
  validateSignupRedirect,
} from "./check-membership-production-e2e.mjs";

const REQUEST_ID = "123e4567-e89b-42d3-a456-426614174000";

function json(status, body) {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "private, no-store, max-age=0",
      "x-request-id": REQUEST_ID,
    },
  });
}

function signupRedirect() {
  const location = new URL("https://identity.example.org/authorize");
  location.searchParams.set("response_type", "code");
  location.searchParams.set("redirect_uri", "https://respublica-ev.de/api/auth/callback");
  location.searchParams.set("code_challenge_method", "S256");
  location.searchParams.set("screen_hint", "signup");
  location.searchParams.set("client_id", "client");
  location.searchParams.set("code_challenge", "challenge");
  location.searchParams.set("state", "state");
  location.searchParams.set("nonce", "nonce");
  return new Response(null, {
    status: 302,
    headers: {
      location: location.href,
      "cache-control": "private, no-store, max-age=0",
      "x-request-id": REQUEST_ID,
    },
  });
}

describe("controlled membership Production E2E", () => {
  it("validates the approved issuer, callback, PKCE, state, and nonce", () => {
    expect(
      validateSignupRedirect(
        signupRedirect().headers.get("location"),
        "https://respublica-ev.de",
        "https://identity.example.org"
      )
    ).toMatchObject({
      authorizationOrigin: "https://identity.example.org",
      callback: "https://respublica-ev.de/api/auth/callback",
      pkce: true,
      state: true,
      nonce: true,
    });
  });

  it("stops safely at the genuine Auth0 boundary without a controlled session", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(json(200, { authenticated: false, available: true }))
      .mockResolvedValueOnce(signupRedirect());

    await expect(
      checkMembershipProductionE2e({
        baseUrl: "https://respublica-ev.de",
        issuerUrl: "https://identity.example.org",
        fetchImpl,
      })
    ).resolves.toMatchObject({
      anonymousBoundary: "verified",
      authenticatedBoundary: "controlled_auth0_session_required",
      membershipApplication: "not_mutated",
      boardDecision: "not_mutated_mfa_boundary_not_entered",
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("verifies authenticated private reads without mutating membership", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(json(200, { authenticated: false, available: true }))
      .mockResolvedValueOnce(signupRedirect())
      .mockResolvedValueOnce(json(200, { authenticated: true, available: true, assurance: "recent-mfa" }))
      .mockResolvedValueOnce(json(200, { application: null }))
      .mockResolvedValueOnce(json(200, { account: {}, membership: null }))
      .mockResolvedValueOnce(json(200, { enrolled: false }));

    await expect(
      checkMembershipProductionE2e({
        baseUrl: "https://respublica-ev.de",
        issuerUrl: "https://identity.example.org",
        sessionCookie: "session=secret-not-logged",
        requireMfa: true,
        fetchImpl,
      })
    ).resolves.toMatchObject({
      authenticatedBoundary: "verified",
      assurance: "recent-mfa",
      mfa: true,
      membershipApplication: "not_mutated",
      boardDecision: "not_mutated",
    });
    expect(fetchImpl.mock.calls.slice(2).every(([, init]) =>
      init.headers.cookie === "session=secret-not-logged"
    )).toBe(true);
  });

  it("never treats a verified-only session as board MFA", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(json(200, { authenticated: false, available: true }))
      .mockResolvedValueOnce(signupRedirect())
      .mockResolvedValueOnce(json(200, { authenticated: true, available: true, assurance: "verified" }));

    await expect(
      checkMembershipProductionE2e({
        baseUrl: "https://respublica-ev.de",
        issuerUrl: "https://identity.example.org",
        sessionCookie: "session=controlled",
        requireMfa: true,
        fetchImpl,
      })
    ).rejects.toThrow("genuine MFA session");
  });
});
