import { describe, expect, it } from "vitest";
import { AuthorizationDeniedError, isAuthorized, requireAuthorization } from "./authorize";
import type { AuthenticatedActor, AuthorizationGrant } from "./types";

const now = new Date("2026-07-19T12:00:00.000Z");

function grant(overrides: Partial<AuthorizationGrant> = {}): AuthorizationGrant {
  return {
    id: "grant-1",
    personId: "person-1",
    domain: "civic",
    capability: "membership.create",
    target: null,
    assuranceRequired: "verified",
    validFrom: new Date("2026-07-01T00:00:00.000Z"),
    validUntil: null,
    revokedAt: null,
    ...overrides,
  };
}

function actor(overrides: Partial<AuthenticatedActor> = {}): AuthenticatedActor {
  return {
    personId: "person-1",
    sessionId: "session-1",
    authenticatedAt: now,
    assurance: "verified",
    grants: [grant()],
    ...overrides,
  };
}

describe("deny-by-default authorization", () => {
  it("denies anonymous actors and missing grants", () => {
    expect(isAuthorized(null, { domain: "civic", capability: "membership.create", now })).toBe(false);
    expect(isAuthorized(actor({ grants: [] }), { domain: "civic", capability: "membership.create", now })).toBe(false);
  });

  it("keeps Civic and Governance grants separate", () => {
    expect(isAuthorized(actor(), { domain: "governance", capability: "membership.create", now })).toBe(false);
  });

  it("enforces target, validity, revocation, and assurance", () => {
    expect(isAuthorized(actor({ grants: [grant({ target: "member-1" })] }), {
      domain: "civic", capability: "membership.create", target: "member-2", now,
    })).toBe(false);
    expect(isAuthorized(actor({ grants: [grant({ revokedAt: now })] }), {
      domain: "civic", capability: "membership.create", now,
    })).toBe(false);
    expect(isAuthorized(actor({ grants: [grant({ validUntil: now })] }), {
      domain: "civic", capability: "membership.create", now,
    })).toBe(false);
    expect(isAuthorized(actor({ grants: [grant({ assuranceRequired: "mfa" })] }), {
      domain: "civic", capability: "membership.create", now,
    })).toBe(false);
  });

  it("permits an active explicit grant and supports MFA", () => {
    expect(isAuthorized(actor(), { domain: "civic", capability: "membership.create", now })).toBe(true);
    expect(isAuthorized(actor({ assurance: "mfa", grants: [grant({ assuranceRequired: "mfa" })] }), {
      domain: "civic", capability: "membership.create", minimumAssurance: "mfa", now,
    })).toBe(true);
  });

  it("throws a typed error when authorization is required", () => {
    expect(() => requireAuthorization(null, {
      domain: "civic", capability: "membership.create", now,
    })).toThrow(AuthorizationDeniedError);
  });
});
