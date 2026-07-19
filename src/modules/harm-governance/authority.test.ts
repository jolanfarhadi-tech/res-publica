import { describe, expect, it } from "vitest";
import { assertOperationalDelegation, governanceCapability, requireInstitutionAdmin } from "./authority";
import type { AuthenticatedActor } from "../../auth/types";

const actor: AuthenticatedActor = {
  personId: "admin-1", sessionId: "session-1", authenticatedAt: new Date(), assurance: "mfa",
  grants: [{ id: "grant-admin", personId: "admin-1", domain: "governance",
    capability: governanceCapability("institution-admin"), target: "institution-1",
    assuranceRequired: "mfa", validFrom: new Date(0), validUntil: null, revokedAt: null }],
};

describe("ADR-033 authority policy", () => {
  it("requires an MFA institution-scoped admin grant", () => {
    expect(() => requireInstitutionAdmin(actor, "institution-1")).not.toThrow();
    expect(() => requireInstitutionAdmin({ ...actor, assurance: "verified" }, "institution-1")).toThrow();
    expect(() => requireInstitutionAdmin(actor, "institution-2")).toThrow();
  });
  it("forbids self-grant and institution-admin delegation", () => {
    expect(() => assertOperationalDelegation({ actorPersonId: "p1", granteePersonId: "p1", role: "evidence-reviewer", institutionId: "i1" })).toThrow("self_grant_forbidden");
    expect(() => assertOperationalDelegation({ actorPersonId: "p1", granteePersonId: "p2", role: "institution-admin", institutionId: "i1" })).toThrow("admin_grant_founder_only");
  });
});
