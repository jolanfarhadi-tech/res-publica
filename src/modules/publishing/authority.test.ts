import { describe, expect, it } from "vitest";
import type { AuthenticatedActor } from "../../auth/types";
import { assertEditorialDelegation, editorialCapability, requireEditorialRole } from "./authority";

const publisher: AuthenticatedActor = { personId: "publisher", sessionId: "session", authenticatedAt: new Date(),
  assurance: "mfa", grants: [{ id: "grant", personId: "publisher", domain: "civic",
    capability: editorialCapability("publisher"), target: "website", assuranceRequired: "mfa",
    validFrom: new Date(0), validUntil: null, revokedAt: null }] };

describe("ADR-036 editorial authority", () => {
  it("requires scoped MFA grants and prohibits self or Publisher delegation", () => {
    expect(() => requireEditorialRole(publisher, "publisher", "website")).not.toThrow();
    expect(() => requireEditorialRole({ ...publisher, assurance: "verified" }, "publisher", "website")).toThrow();
    expect(() => requireEditorialRole(publisher, "publisher", "research")).toThrow();
    expect(() => assertEditorialDelegation({ actorPersonId: "publisher", granteePersonId: "publisher", role: "editor", publicationScope: "website" })).toThrow("self_grant_forbidden");
    expect(() => assertEditorialDelegation({ actorPersonId: "publisher", granteePersonId: "other", role: "publisher", publicationScope: "website" })).toThrow("publisher_grant_founder_only");
  });

  it("does not accept a shared-mechanism wildcard grant as editorial publication scope", () => {
    const wildcardActor: AuthenticatedActor = {
      ...publisher,
      grants: publisher.grants.map((grant) => ({ ...grant, target: null })),
    };
    expect(() => requireEditorialRole(wildcardActor, "publisher", "website")).toThrow();
  });
});
