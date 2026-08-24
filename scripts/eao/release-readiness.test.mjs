import { describe, expect, it } from "vitest";
import { parseSecurityLegalGateRegister } from "./dependency-map.mjs";
import { computeProjectHealth } from "./project-health.mjs";
import { computeReleaseReadiness, renderReleaseReadinessMarkdown } from "./release-readiness.mjs";

describe("EAO operational release readiness", () => {
  it("extracts unresolved blocking gates but excludes verified and non-blocking rows", () => {
    const markdown = [
      "| Gate | Current evidence | State | Blocks |",
      "|---|---|---|---|",
      "| Database migration | 23 applied | Verified 2026-08-16 | — |",
      "| Real DPIA | Draft only | Legal approval required | Real-person processing |",
      "| Optional cleanup | Deferred | Owner choice | — |",
    ].join("\n");

    expect(parseSecurityLegalGateRegister(markdown)).toEqual([
      expect.objectContaining({
        gate: "Real DPIA",
        state: "Legal approval required",
        blocks: "Real-person processing",
      }),
    ]);
  });

  it("prevents a full-platform Go recommendation while operational gates remain open", () => {
    const health = computeProjectHealth(process.cwd());
    expect(health.releaseReadinessHealth.operationalActivationGateCount).toBeGreaterThan(0);

    const result = computeReleaseReadiness(process.cwd());
    expect(result.executiveSummary.assessmentScope).toBe("full-platform-production-activation");
    expect(result.gates).toEqual(expect.arrayContaining([
      expect.objectContaining({
        gate: "No unresolved Production activation gates",
        status: "Fail",
        blocking: true,
        evidenceCount: expect.any(Number),
      }),
    ]));
    expect(result.recommendedDecision).toBe("No-Go");
    expect(renderReleaseReadinessMarkdown(result)).toContain(
      "not whether a narrower code-only deployment may proceed"
    );
  }, 15_000);
});
