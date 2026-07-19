import type {
  BasicValidationDecision,
  HarmCase,
  HarmCaseStatus,
  StructuredHearing,
  EvidenceQualityAssessment,
  ScientificReview,
  RepairPlan,
} from "./types";

const allowedTransitions: Readonly<Record<HarmCaseStatus, readonly HarmCaseStatus[]>> = {
  registered: ["evidence-collection"],
  "evidence-collection": ["validation-pending"],
  "validation-pending": ["information-requested", "hearing-ready", "closed"],
  "information-requested": ["evidence-collection"],
  "hearing-ready": ["hearing-documented"],
  "hearing-documented": ["scientific-review-pending"],
  "scientific-review-pending": ["repair-planning", "closed"],
  "repair-planning": ["closed"],
  closed: [],
};

export function transitionHarmCase(harmCase: HarmCase, next: HarmCaseStatus): HarmCase {
  if (!allowedTransitions[harmCase.status].includes(next)) {
    throw new Error(`invalid_harm_case_transition:${harmCase.status}:${next}`);
  }
  return { ...harmCase, status: next };
}

export function verifyEvidenceAssessment(assessment: EvidenceQualityAssessment): EvidenceQualityAssessment {
  if (!assessment.reviewerPersonId || !assessment.reviewedAt) {
    throw new Error("human_evidence_review_required");
  }
  if (assessment.satisfiedCriteria.length === 0) {
    throw new Error("evidence_criteria_required");
  }
  return assessment;
}

export function applyScientificReview(harmCase: HarmCase, review: ScientificReview): HarmCase {
  if (harmCase.status !== "scientific-review-pending" || review.caseId !== harmCase.id) {
    throw new Error("scientific_review_not_applicable");
  }
  if (review.reviewerPersonIds.length === 0 || !review.conflictDeclarationsComplete) {
    throw new Error("reviewers_and_conflict_declarations_required");
  }
  if (review.output === "accepted" || review.output === "accepted-with-minor-revisions") {
    return transitionHarmCase(harmCase, "repair-planning");
  }
  if (review.output === "rejected-for-scientific-reasons") {
    return transitionHarmCase(harmCase, "closed");
  }
  return harmCase;
}

export function createRepairPlan(harmCase: HarmCase, plan: RepairPlan): RepairPlan {
  if (harmCase.status !== "repair-planning" || plan.caseId !== harmCase.id) {
    throw new Error("validated_harm_required");
  }
  const requiredCollections = [
    plan.objectives, plan.expectedOutcomes, plan.responsibleActors, plan.requiredResources,
    plan.successIndicators, plan.monitoringMethods,
  ];
  if (!plan.createdByPersonId || !plan.approvedScientificReviewId || requiredCollections.some((v) => v.length === 0)) {
    throw new Error("complete_human_authored_repair_plan_required");
  }
  return plan;
}

export function applyBasicValidation(
  harmCase: HarmCase,
  decision: BasicValidationDecision,
): HarmCase {
  if (harmCase.status !== "validation-pending" || decision.caseId !== harmCase.id) {
    throw new Error("validation_not_applicable");
  }
  if (!decision.reviewerPersonId || !decision.decidedAt) {
    throw new Error("human_validation_decision_required");
  }
  if (decision.status === "duplicate" && !decision.duplicateOfCaseId) {
    throw new Error("duplicate_case_reference_required");
  }
  if (decision.status === "incomplete") {
    if (decision.missingInformation.length === 0) {
      throw new Error("missing_information_required");
    }
    return transitionHarmCase(harmCase, "information-requested");
  }
  if (decision.status === "valid" || decision.status === "valid-with-minor-issues") {
    return transitionHarmCase(harmCase, "hearing-ready");
  }
  return transitionHarmCase(harmCase, "closed");
}

export function documentStructuredHearing(
  harmCase: HarmCase,
  hearing: StructuredHearing,
): HarmCase {
  if (harmCase.status !== "hearing-ready" || hearing.caseId !== harmCase.id) {
    throw new Error("hearing_not_applicable");
  }
  if (!hearing.moderatorPersonId || !hearing.participantConsentConfirmedAt) {
    throw new Error("moderator_and_current_consent_required");
  }
  if (!hearing.documentedAt || !hearing.reportReference) {
    throw new Error("hearing_documentation_required");
  }
  return transitionHarmCase(harmCase, "hearing-documented");
}
