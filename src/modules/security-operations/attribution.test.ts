import { describe, expect, it } from "vitest";
import {
  buildTechnicalObservation,
  correlateIncidentSignals,
  validateAttributionClaim,
} from "./attribution";

const secret = "synthetic-correlation-secret-with-at-least-32-bytes";

describe("privacy-bounded technical attribution", () => {
  it("pseudonymizes source, account, session and API credential identifiers before persistence", () => {
    const observation = buildTechnicalObservation({
      incidentId: "incident-a",
      correlationScope: "incident-a",
      correlationSecret: secret,
      observedAt: new Date("2026-08-16T10:05:31.000Z"),
      source: "application-request",
      sourceAddress: "203.0.113.24",
      sourcePort: 44321,
      authenticationSubject: "auth0|synthetic-person",
      sessionId: "synthetic-session-secret",
      apiCredentialId: "synthetic-api-key-id",
      routes: [
        "https://respublica-ev.de/api/auth/login?email=private@example.org",
        "/api/operations/security?token=secret",
        "/api/members/private@example.org",
      ],
      userAgent: "Mozilla/5.0 Firefox/141.0 synthetic-detail",
      protocol: "HTTP/2",
      tlsVersion: "TLSv1.3",
      techniques: ["credential-access", "route-enumeration"],
      affectedAssets: ["authentication", "security-operations"],
    });

    const serialized = JSON.stringify(observation);
    expect(serialized).not.toContain("203.0.113.24");
    expect(serialized).not.toContain("auth0|synthetic-person");
    expect(serialized).not.toContain("synthetic-session-secret");
    expect(serialized).not.toContain("synthetic-api-key-id");
    expect(serialized).not.toContain("private@example.org");
    expect(serialized).not.toContain("token=secret");
    expect(serialized).not.toContain("synthetic-detail");
    expect(observation.routeSequence).toEqual([
      "/api/auth/login",
      "/api/operations/security",
      "/api/members/:id",
    ]);
    expect(observation.userAgentFamily).toBe("firefox");
    expect(observation.sourceHandle).toMatch(/^src_[a-f0-9]{32}$/);
    expect(observation.actorHandle).toMatch(/^act_[a-f0-9]{32}$/);
    expect(observation.sessionHandle).toMatch(/^ses_[a-f0-9]{32}$/);
    expect(observation.apiCredentialHandle).toMatch(/^api_[a-f0-9]{32}$/);
    expect(() => buildTechnicalObservation({
      ...{
        incidentId: "incident-a",
        correlationScope: "incident-a",
        correlationSecret: secret,
        observedAt: new Date(),
        source: "application-request" as const,
        routes: ["/api/auth/login"],
        techniques: ["route-enumeration" as const],
        affectedAssets: ["authentication" as const],
      },
      protocol: "HTTP/2 private@example.org",
    })).toThrow("invalid_protocol");
  });

  it("requires a complete evidence-bounded claim and forbids automated real-world identity", () => {
    const valid = validateAttributionClaim({
      level: "C",
      claim: "The incidents form a behavioral cluster.",
      observedEvidence: ["observation-1", "observation-2"],
      inferences: ["The route order and technique sequence are similar."],
      contradictoryEvidence: ["The source-network handles differ."],
      alternativeExplanations: ["A shared tool could produce the same sequence."],
      confidence: "MODERATE",
      source: "human-security-review",
      timestamp: new Date("2026-08-16T10:10:00.000Z"),
    });
    expect(valid.level).toBe("C");

    expect(() =>
      validateAttributionClaim({
        ...valid,
        level: "E",
        claim: "The account owner is the attacker.",
      })
    ).toThrow("real_world_identity_not_supported");

    expect(() =>
      validateAttributionClaim({
        ...valid,
        alternativeExplanations: [],
      })
    ).toThrow("alternative_explanation_required");

    for (const sensitive of [
      "Observed 203.0.113.24",
      "Contact private@example.org",
      "Account auth0|person",
      "Bearer synthetic-token-material",
    ]) {
      expect(() => validateAttributionClaim({ ...valid, claim: sensitive }))
        .toThrow("raw_identifier_not_allowed");
    }
  });

  it("uses multiple independent signals and never upgrades correlation to identity", () => {
    expect(
      correlateIncidentSignals({
        leftIncidentId: "incident-a",
        rightIncidentId: "incident-b",
        matchingSignals: ["source-infrastructure"],
        contradictorySignals: [],
        reviewedAt: new Date("2026-08-16T10:15:00.000Z"),
      }).relation
    ).toBe("INSUFFICIENT EVIDENCE");

    expect(
      correlateIncidentSignals({
        leftIncidentId: "incident-a",
        rightIncidentId: "incident-b",
        matchingSignals: ["route-order", "technique-sequence"],
        contradictorySignals: [],
        reviewedAt: new Date("2026-08-16T10:15:00.000Z"),
      }).relation
    ).toBe("POSSIBLY RELATED");

    const likely = correlateIncidentSignals({
      leftIncidentId: "incident-a",
      rightIncidentId: "incident-b",
      matchingSignals: [
        "route-order",
        "technique-sequence",
        "protocol-characteristics",
      ],
      contradictorySignals: [],
      reviewedAt: new Date("2026-08-16T10:15:00.000Z"),
    });
    expect(likely.relation).toBe("LIKELY RELATED");
    expect(JSON.stringify(likely)).not.toMatch(/same person/i);

    expect(
      correlateIncidentSignals({
        leftIncidentId: "incident-a",
        rightIncidentId: "incident-b",
        matchingSignals: ["route-order", "technique-sequence"],
        contradictorySignals: ["mutually-exclusive-session-timing"],
        reviewedAt: new Date("2026-08-16T10:15:00.000Z"),
      }).relation
    ).toBe("NOT RELATED");
  });
});
