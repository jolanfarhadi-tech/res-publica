import { describe, expect, it } from "vitest";
import {
  isCapabilityQuarantined,
  isResearchForcedClosed,
  isWriteScopeQuarantined,
  readCapabilityQuarantine,
} from "./capability-quarantine";

describe("zero-day capability quarantine", () => {
  it("defaults to no emergency quarantine when configuration is absent", () => {
    expect(readCapabilityQuarantine({})).toEqual({
      capabilityKeys: [],
      frozenWriteScopes: [],
      forceResearchClosed: false,
      valid: true,
    });
  });

  it("narrows exact capabilities and write scopes without identity keys", () => {
    const environment = {
      SECURITY_QUARANTINED_CAPABILITIES:
        "civic:ai.rag.query,governance:governance.role.admin",
      SECURITY_FROZEN_WRITE_SCOPES:
        "publishing.privileged-write,knowledge-graph.privileged-write",
      SECURITY_FORCE_RESEARCH_FAIL_CLOSED: "true",
    };

    expect(isCapabilityQuarantined("civic", "ai.rag.query", environment)).toBe(true);
    expect(isCapabilityQuarantined("civic", "membership.application.decide", environment)).toBe(false);
    expect(isWriteScopeQuarantined("publishing.privileged-write", environment)).toBe(true);
    expect(isWriteScopeQuarantined("governance.privileged-write", environment)).toBe(false);
    expect(isResearchForcedClosed(environment)).toBe(true);
  });

  it("fails closed when a configured emergency control is malformed", () => {
    expect(isCapabilityQuarantined("civic", "membership.application.decide", {
      SECURITY_QUARANTINED_CAPABILITIES: "person@example.org",
    })).toBe(true);
    expect(isWriteScopeQuarantined("publishing.privileged-write", {
      SECURITY_FROZEN_WRITE_SCOPES: "*",
    })).toBe(true);
    expect(isResearchForcedClosed({
      SECURITY_FORCE_RESEARCH_FAIL_CLOSED: "maybe",
    })).toBe(true);
  });
});

