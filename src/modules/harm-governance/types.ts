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
