import { describe, expect, it } from "vitest";
import { applyBasicValidation, documentStructuredHearing, transitionHarmCase } from "./workflow";
import type { BasicValidationDecision, HarmCase } from "./types";

const baseCase: HarmCase = {
  id: "case-1",
  reportedAt: new Date("2026-07-19T09:00:00Z"),
  location: "Berlin",
  harmCategory: "governance-failure",
  description: "A documented account",
  affectedGroups: ["residents"],
  allegedResponsibleActors: [],
  sourceType: "citizen",
  reporterPersonId: "person-1",
  confidentialityLevel: "restricted",
  status: "validation-pending",
};

function decision(status: BasicValidationDecision["status"]): BasicValidationDecision {
  return {
    id: "validation-1",
    caseId: baseCase.id,
    status,
    reviewerPersonId: "reviewer-1",
    missingInformation: [],
    duplicateOfCaseId: null,
    notes: "Human-reviewed completeness decision",
    decidedAt: new Date("2026-07-19T10:00:00Z"),
  };
}

describe("HARM governance workflow", () => {
  it("moves a human-validated case to the hearing queue", () => {
    expect(applyBasicValidation(baseCase, decision("valid")).status).toBe("hearing-ready");
  });

  it("requires concrete missing information for an incomplete decision", () => {
    expect(() => applyBasicValidation(baseCase, decision("incomplete"))).toThrow(
      "missing_information_required",
    );
  });

  it("does not confuse hearing documentation with scientific validation", () => {
    const ready = applyBasicValidation(baseCase, decision("valid"));
    const documented = documentStructuredHearing(ready, {
      id: "hearing-1",
      caseId: ready.id,
      moderatorPersonId: "moderator-1",
      participantConsentConfirmedAt: new Date("2026-07-19T11:00:00Z"),
      documentedAt: new Date("2026-07-19T12:00:00Z"),
      reportReference: "restricted://hearing-1/report",
    });
    expect(documented.status).toBe("hearing-documented");
    expect(transitionHarmCase(documented, "scientific-review-pending").status).toBe(
      "scientific-review-pending",
    );
  });

  it("rejects lifecycle shortcuts", () => {
    expect(() => transitionHarmCase(baseCase, "repair-planning")).toThrow(
      "invalid_harm_case_transition",
    );
  });
});
