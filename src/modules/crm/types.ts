/** CRM — Foundation Build Order Step 5, MVP module #8. Staff-facing relationship management. AI Features: None — deliberately. */
export type PartnershipStage = "inquiry" | "disclosure-pending" | "active" | "ended";

export type DonorRecord = {
  id: string;
  organizationId: string;
  givingHistory: { amount: number; date: Date }[];
};

export type InstitutionalPartner = {
  id: string;
  organizationId: string;
  stage: PartnershipStage;
};

export type GrantFunder = {
  id: string;
  organizationId: string;
  fundingTerms: string;
};

export type DisclosureReviewOutcome = "pending" | "approved" | "rejected";

export type ConflictOfInterestDisclosure = {
  id: string;
  partnerId: string;
  disclosureText: string;
  reviewOutcome: DisclosureReviewOutcome;
  reviewerPersonId: string | null;
};

export type FundingSourcePublicationRecord = {
  id: string;
  organizationId: string;
  publishedAt: Date;
};

export type PartnershipStatusLog = {
  id: string;
  partnerId: string;
  fromStage: PartnershipStage;
  toStage: PartnershipStage;
  timestamp: Date;
};
