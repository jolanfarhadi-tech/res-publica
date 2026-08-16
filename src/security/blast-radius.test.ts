import { describe, expect, it } from "vitest";
import { isAuthorized } from "../auth/authorize";
import type { AuthenticatedActor, AuthorizationDomain } from "../auth/types";

const now = new Date("2026-08-16T12:00:00.000Z");

function serviceActor(domain: AuthorizationDomain, capability: string): AuthenticatedActor {
  return {
    personId: `synthetic-${capability}`,
    sessionId: `session-${capability}`,
    authenticatedAt: now,
    assurance: "mfa",
    grants: [{
      id: `grant-${capability}`,
      personId: `synthetic-${capability}`,
      domain,
      capability,
      target: "component-scope",
      assuranceRequired: "mfa",
      validFrom: new Date(0),
      validUntil: null,
      revokedAt: null,
    }],
  };
}

function denied(actor: AuthenticatedActor, domain: AuthorizationDomain, capability: string) {
  return isAuthorized(actor, {
    domain,
    capability,
    target: "component-scope",
    requireExactTarget: true,
    minimumAssurance: "mfa",
    now,
  });
}

describe("synthetic zero-day blast-radius scenarios", () => {
  it("does not let an AI capability mutate Membership, roles, or credentials", () => {
    const compromised = serviceActor("civic", "ai.rag.query");
    expect(denied(compromised, "civic", "membership.application.decide")).toBe(false);
    expect(denied(compromised, "governance", "governance.role.admin")).toBe(false);
    expect(denied(compromised, "civic", "research.wallet.credential.issue")).toBe(false);
  });

  it("keeps Academy, Fellowship, Research, and Governance capabilities isolated", () => {
    expect(denied(
      serviceActor("civic", "academy.operations.read"),
      "civic",
      "fellowship.operations.read"
    )).toBe(false);
    expect(denied(
      serviceActor("civic", "fellowship.operations.read"),
      "civic",
      "research.wallet.credential.issue"
    )).toBe(false);
    expect(denied(
      serviceActor("governance", "governance.role.admin"),
      "civic",
      "publishing.role.publisher"
    )).toBe(false);
  });
});

