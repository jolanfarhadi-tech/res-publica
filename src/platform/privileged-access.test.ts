import { describe, expect, it } from "vitest";
import type { AuthenticatedActor } from "../auth/types";
import { governanceCapability, requireInstitutionAdmin } from "../modules/harm-governance/authority";
import { editorialCapability, requireEditorialRole } from "../modules/publishing/authority";
import { assertPrivilegedActionContext, PrivilegedAccessContextError } from "./privileged-access";

function actor(domain: "civic" | "governance", capability: string): AuthenticatedActor {
  return {
    personId: "operator",
    sessionId: "operator-session",
    authenticatedAt: new Date(),
    assurance: "recent-mfa",
    grants: [{
      id: "operator-grant",
      personId: "operator",
      domain,
      capability,
      target: "scope-1",
      assuranceRequired: "mfa",
      validFrom: new Date(0),
      validUntil: null,
      revokedAt: null,
    }],
  };
}

describe("zero-trust privileged access", () => {
  it("does not allow one domain administrator to cross into another domain", () => {
    const governanceAdmin = actor("governance", governanceCapability("institution-admin"));
    const publisher = actor("civic", editorialCapability("publisher"));
    expect(() => requireEditorialRole(governanceAdmin, "publisher", "scope-1", "recent-mfa"))
      .toThrow("Authorization denied");
    expect(() => requireInstitutionAdmin(publisher, "scope-1", "recent-mfa"))
      .toThrow("Authorization denied");
  });

  it("accepts only bounded reason codes and UUID request correlation", () => {
    expect(() => assertPrivilegedActionContext({
      reasonCode: "scheduled-access-review",
      requestId: "40000000-0000-4000-8000-000000000001",
    })).not.toThrow();
    expect(() => assertPrivilegedActionContext({
      reasonCode: "scheduled-access-review",
      requestId: "attacker-controlled-correlation",
    })).toThrow(PrivilegedAccessContextError);
  });
});
