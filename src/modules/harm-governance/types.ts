export type HarmCaseStatus =
  | "registered"
  | "evidence-collection"
  | "validation-pending"
  | "information-requested"
  | "hearing-ready"
  | "hearing-documented"
  | "scientific-review-pending"
  | "repair-planning"
  | "closed";

export type ConfidentialityLevel = "public" | "restricted" | "confidential";

export type HarmCase = {
  id: string;
  institutionId: string;
  reportedAt: Date;
  location: string;
  harmCategory: string;
  description: string;
  affectedGroups: string[];
  allegedResponsibleActors: string[];
  sourceType: string;
  reporterPersonId: string | null;
  confidentialityLevel: ConfidentialityLevel;
  status: HarmCaseStatus;
};

export type EvidenceItem = {
  id: string;
  caseId: string;
  description: string;
  source: string;
  mediaType: string;
  storageReference: string;
  collectedAt: Date;
};

export type BasicValidationStatus =
  | "valid"
  | "valid-with-minor-issues"
  | "incomplete"
  | "duplicate"
  | "invalid-submission";

export type BasicValidationDecision = {
  id: string;
  caseId: string;
  status: BasicValidationStatus;
  reviewerPersonId: string;
  missingInformation: string[];
  duplicateOfCaseId: string | null;
  notes: string;
  decidedAt: Date;
};

export type StructuredHearing = {
  id: string;
  caseId: string;
  moderatorPersonId: string;
  participantConsentConfirmedAt: Date;
  documentedAt: Date | null;
  reportReference: string | null;
};

export const EVIDENCE_QUALITY_CRITERIA = [
  "authenticity", "reliability", "relevance", "completeness", "consistency",
  "traceability", "timeliness", "contextual-integrity", "corroboration",
] as const;
export type EvidenceQualityCriterion = (typeof EVIDENCE_QUALITY_CRITERIA)[number];
export type EvidenceQualityAssessment = {
  id: string;
  evidenceItemId: string;
  reviewerPersonId: string;
  satisfiedCriteria: EvidenceQualityCriterion[];
  contradictions: string[];
  corroboratingEvidenceItemIds: string[];
  confidence: "very-low" | "low" | "moderate" | "high" | "very-high";
  reviewedAt: Date;
};

export type DocumentationQualityOutcome =
  | "approved" | "approved-with-minor-corrections" | "revision-required"
  | "incomplete-documentation" | "rejected";
export type HearingQualityOutcome =
  | "approved" | "approved-with-recommendations" | "minor-improvements-required"
  | "major-improvements-required" | "re-hearing-recommended";

export type ScientificReviewOutput =
  | "accepted" | "accepted-with-minor-revisions" | "major-revision-required"
  | "insufficient-evidence" | "rejected-for-scientific-reasons";
export type ScientificReview = {
  id: string;
  caseId: string;
  reviewerPersonIds: string[];
  conflictDeclarationsComplete: boolean;
  methodologyAssessment: string;
  evidenceAssessment: string;
  findings: string;
  scientificConfidence: 1 | 2 | 3 | 4 | 5;
  recommendations: string[];
  output: ScientificReviewOutput;
  decidedAt: Date;
};

export type RepairPlan = {
  id: string;
  caseId: string;
  approvedScientificReviewId: string;
  objectives: string[];
  expectedOutcomes: string[];
  responsibleActors: string[];
  requiredResources: string[];
  timeline: string;
  successIndicators: string[];
  monitoringMethods: string[];
  risks: string[];
  dependencies: string[];
  createdByPersonId: string;
  createdAt: Date;
};
