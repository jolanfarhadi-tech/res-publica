import {
  type AnyPgColumn,
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organizations, payments, people } from "./schema";

export const members = pgTable(
  "members",
  {
    id: text("id").primaryKey(),
    personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    tier: text("tier", {
      enum: ["basic", "supporter", "volunteer", "research", "institutional"],
    }).notNull(),
    status: text("status", {
      enum: [
        "registered", "verified", "active", "inactive", "paused", "self-isolated",
        "withdrawn", "retired", "suspended", "terminated",
      ],
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [uniqueIndex("members_person_uq").on(table.personId)]
);

export const membershipApplications = pgTable(
  "membership_applications",
  {
    id: text("id").primaryKey(),
    personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    requestedTier: text("requested_tier", {
      enum: ["basic", "supporter", "volunteer", "research", "institutional"],
    }).notNull(),
    status: text("status", {
      enum: ["application_pending", "approved", "rejected", "withdrawn"],
    }).notNull(),
    givenName: text("given_name").notNull(),
    familyName: text("family_name").notNull(),
    email: text("email").notNull(),
    address: jsonb("address").$type<{
      line1: string;
      line2: string | null;
      postalCode: string;
      city: string;
      countryCode: string;
    }>().notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "date" }).notNull(),
    decidedAt: timestamp("decided_at", { withTimezone: true, mode: "date" }),
    decidedByPersonId: text("decided_by_person_id").references(() => people.id, { onDelete: "restrict" }),
    decisionAuditId: text("decision_audit_id"),
    decisionAuditTimestamp: timestamp("decision_audit_timestamp", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    uniqueIndex("membership_applications_person_uq").on(table.personId),
    index("membership_applications_status_idx").on(table.status),
  ]
);

export const documentAcknowledgements = pgTable(
  "document_acknowledgements",
  {
    id: text("id").primaryKey(),
    personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    contextType: text("context_type", { enum: ["membership-application"] }).notNull(),
    contextId: text("context_id").notNull().references(() => membershipApplications.id, { onDelete: "restrict" }),
    documentType: text("document_type", {
      enum: ["statutes", "technical-protocol", "privacy-notice"],
    }).notNull(),
    documentVersion: text("document_version").notNull(),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("document_acknowledgements_context_document_uq").on(
      table.contextType,
      table.contextId,
      table.documentType
    ),
    index("document_acknowledgements_person_idx").on(table.personId),
  ]
);

export const researchParticipationPreferences = pgTable(
  "research_participation_preferences",
  {
    id: text("id").primaryKey(),
    personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    status: text("status", { enum: ["willing", "declined", "withdrawn"] }).notNull(),
    statementVersion: text("statement_version").notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true, mode: "date" }).notNull(),
    withdrawnAt: timestamp("withdrawn_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [uniqueIndex("research_participation_preferences_person_uq").on(table.personId)]
);

export const projectResearchConsents = pgTable(
  "project_research_consents",
  {
    id: text("id").primaryKey(),
    personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    projectRef: text("project_ref").notNull(),
    purposeVersion: text("purpose_version").notNull(),
    purpose: text("purpose").notNull(),
    dataCategories: jsonb("data_categories").$type<string[]>().notNull(),
    pseudonymization: text("pseudonymization").notNull(),
    recipients: jsonb("recipients").$type<string[]>().notNull(),
    retentionRule: text("retention_rule").notNull(),
    status: text("status", { enum: ["granted", "withdrawn"] }).notNull(),
    grantedAt: timestamp("granted_at", { withTimezone: true, mode: "date" }).notNull(),
    withdrawnAt: timestamp("withdrawn_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    uniqueIndex("project_research_consents_person_project_purpose_uq").on(
      table.personId,
      table.projectRef,
      table.purposeVersion
    ),
    index("project_research_consents_project_idx").on(table.projectRef),
  ]
);

export const projectEligibilityRecords = pgTable(
  "project_eligibility_records",
  {
    id: text("id").primaryKey(),
    personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    projectRef: text("project_ref").notNull(),
    status: text("status", { enum: ["pending", "eligible", "ineligible", "excluded"] }).notNull(),
    basis: text("basis", {
      enum: [
        "no-consent-required",
        "fully-anonymized",
        "general-research-readiness",
        "project-specific-consent",
        "other-reviewed-lawful-basis",
      ],
    }).notNull(),
    projectConsentId: text("project_consent_id").references(() => projectResearchConsents.id, { onDelete: "restrict" }),
    reasonCode: text("reason_code").notNull(),
    assessedAt: timestamp("assessed_at", { withTimezone: true, mode: "date" }).notNull(),
    assessedByPersonId: text("assessed_by_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  },
  (table) => [
    uniqueIndex("project_eligibility_records_person_project_uq").on(table.personId, table.projectRef),
    index("project_eligibility_records_project_idx").on(table.projectRef),
  ]
);

export const researchWallets = pgTable(
  "research_wallets",
  {
    id: text("id").primaryKey(),
    personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    status: text("status", { enum: ["offered", "active", "suspended", "revoked"] }).notNull(),
    protocolProfile: text("protocol_profile", {
      enum: ["anoncreds-v1-experimental", "w3c-vc-bbs-2023-v1"],
    }).notNull(),
    recoveryPublicKey: jsonb("recovery_public_key").$type<JsonWebKey>(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    activatedAt: timestamp("activated_at", { withTimezone: true, mode: "date" }),
    suspendedAt: timestamp("suspended_at", { withTimezone: true, mode: "date" }),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [uniqueIndex("research_wallets_person_uq").on(table.personId)]
);

export const researchWalletDeviceBindings = pgTable(
  "research_wallet_device_bindings",
  {
    id: text("id").primaryKey(),
    walletId: text("wallet_id").notNull().references(() => researchWallets.id, { onDelete: "restrict" }),
    holderKeyThumbprint: text("holder_key_thumbprint").notNull(),
    holderPublicKey: jsonb("holder_public_key").$type<JsonWebKey>(),
    boundAt: timestamp("bound_at", { withTimezone: true, mode: "date" }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    uniqueIndex("research_wallet_device_bindings_thumbprint_uq").on(table.holderKeyThumbprint),
    index("research_wallet_device_bindings_wallet_idx").on(table.walletId),
  ]
);

export const researchCredentialIssuanceChallenges = pgTable(
  "research_credential_issuance_challenges",
  {
    challengeHash: text("challenge_hash").primaryKey(),
    walletId: text("wallet_id").notNull().references(() => researchWallets.id, { onDelete: "restrict" }),
    deviceBindingId: text("device_binding_id").notNull()
      .references(() => researchWalletDeviceBindings.id, { onDelete: "restrict" }),
    projectRef: text("project_ref").notNull(),
    projectDigest: text("project_digest").notNull(),
    audienceHash: text("audience_hash").notNull(),
    projectPublicKey: jsonb("project_public_key").$type<JsonWebKey>().notNull(),
    consentDigest: text("consent_digest").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [index("research_credential_challenges_expires_idx").on(table.expiresAt)]
);

export const researchWalletRecoveryEvents = pgTable(
  "research_wallet_recovery_events",
  {
    id: text("id").primaryKey(),
    walletId: text("wallet_id").notNull().references(() => researchWallets.id, { onDelete: "restrict" }),
    eventType: text("event_type", {
      enum: ["credential-loss-reported", "device-rotated", "wallet-revoked"],
    }).notNull(),
    previousDeviceBindingId: text("previous_device_binding_id")
      .references(() => researchWalletDeviceBindings.id, { onDelete: "restrict" }),
    newDeviceBindingId: text("new_device_binding_id")
      .references(() => researchWalletDeviceBindings.id, { onDelete: "restrict" }),
    performedByPersonId: text("performed_by_person_id").notNull()
      .references(() => people.id, { onDelete: "restrict" }),
    occurredAt: timestamp("occurred_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [index("research_wallet_recovery_events_wallet_idx").on(table.walletId)]
);

export const researchWalletRecoveryChallenges = pgTable(
  "research_wallet_recovery_challenges",
  {
    challengeHash: text("challenge_hash").primaryKey(),
    walletId: text("wallet_id").notNull().references(() => researchWallets.id, { onDelete: "restrict" }),
    audienceHash: text("audience_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [index("research_wallet_recovery_challenges_expires_idx").on(table.expiresAt)]
);

export const researchWalletActivationRecords = pgTable(
  "research_wallet_activation_records",
  {
    id: text("id").primaryKey(),
    walletId: text("wallet_id").notNull().references(() => researchWallets.id, { onDelete: "restrict" }),
    personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    consentVersion: text("consent_version").notNull(),
    grantedAt: timestamp("granted_at", { withTimezone: true, mode: "date" }).notNull(),
    withdrawnAt: timestamp("withdrawn_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [index("research_wallet_activation_records_wallet_idx").on(table.walletId)]
);

export const membershipStatusChanges = pgTable(
  "status_changes",
  {
    id: text("id").primaryKey(),
    memberId: text("member_id").notNull().references(() => members.id, { onDelete: "restrict" }),
    previousStatus: text("previous_status").notNull(),
    currentStatus: text("current_status").notNull(),
    triggeringActivity: text("triggering_activity").notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [index("status_changes_member_idx").on(table.memberId)]
);

export const recurringPledges = pgTable("recurring_pledges", {
  id: text("id").primaryKey(),
  memberId: text("member_id").notNull().references(() => members.id, { onDelete: "restrict" }),
  paymentId: text("payment_id").references(() => payments.id, { onDelete: "restrict" }),
  amount: numeric("amount", { precision: 14, scale: 2, mode: "number" }).notNull(),
  currency: text("currency").notNull(),
  intervalMonths: integer("interval_months").notNull(),
  active: boolean("active").notNull(),
});

export const institutionalSupporterProfiles = pgTable("institutional_supporter_profiles", {
  id: text("id").primaryKey(),
  memberId: text("member_id").notNull().references(() => members.id, { onDelete: "restrict" }),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
});

export const membershipBenefitGrants = pgTable("membership_benefit_grants", {
  id: text("id").primaryKey(),
  memberId: text("member_id").notNull().references(() => members.id, { onDelete: "restrict" }),
  benefitName: text("benefit_name").notNull(),
  grantedAt: timestamp("granted_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  startTime: timestamp("start_time", { withTimezone: true, mode: "date" }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true, mode: "date" }).notNull(),
  capacity: integer("capacity").notNull(),
});

export const registrations = pgTable(
  "registrations",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id").notNull().references(() => events.id, { onDelete: "restrict" }),
    personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    status: text("status", { enum: ["confirmed", "waitlisted", "cancelled"] }).notNull(),
    registeredAt: timestamp("registered_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [index("registrations_event_person_idx").on(table.eventId, table.personId)]
);

export const waitlistEntries = pgTable("waitlist_entries", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull().references(() => events.id, { onDelete: "restrict" }),
  registrationId: text("registration_id").notNull().references(() => registrations.id, { onDelete: "restrict" }),
  position: integer("position").notNull(),
});

export const eventQaLog = pgTable("event_qa_log", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull().references(() => events.id, { onDelete: "restrict" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  citations: jsonb("citations").$type<string[]>().notNull(),
});

export const outcomePublications = pgTable("outcome_publications", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull().references(() => events.id, { onDelete: "restrict" }),
  summary: text("summary").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const submissions = pgTable("submissions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  rawContent: text("raw_content").notNull(),
  submittedByPersonId: text("submitted_by_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "date" }).notNull(),
  status: text("status", { enum: ["pending", "moderated"] }).notNull(),
  publicationScope: text("publication_scope").notNull().default("website"),
});

export const drafts = pgTable("drafts", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id").notNull().references(() => submissions.id, { onDelete: "restrict" }),
  content: text("content").notNull(),
  citations: jsonb("citations").$type<string[]>().notNull(),
  weakCitationFlags: jsonb("weak_citation_flags").$type<string[]>().notNull(),
  authorType: text("author_type", { enum: ["ai", "human"] }).notNull(),
  version: integer("version").notNull(),
  authoredByPersonId: text("authored_by_person_id").references(() => people.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }),
});

export const moderationQueue = pgTable(
  "moderation_queue",
  {
    id: text("id").primaryKey(),
    submissionId: text("submission_id").notNull().references(() => submissions.id, { onDelete: "restrict" }),
    draftId: text("draft_id").references(() => drafts.id, { onDelete: "restrict" }),
    decision: text("decision", { enum: ["pending", "approved", "rejected"] }).notNull(),
    assignedReviewerPersonId: text("assigned_reviewer_person_id").references(() => people.id, { onDelete: "restrict" }),
    assignedByPersonId: text("assigned_by_person_id").references(() => people.id, { onDelete: "restrict" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true, mode: "date" }),
    decidedAt: timestamp("decided_at", { withTimezone: true, mode: "date" }),
    reason: text("reason"),
  },
  (table) => [uniqueIndex("moderation_queue_draft_uq").on(table.draftId)]
);

export const translationHandoffs = pgTable(
  "translation_handoffs",
  {
    id: text("id").primaryKey(),
    draftId: text("draft_id").notNull().references(() => drafts.id, { onDelete: "restrict" }),
    locale: text("locale").notNull(),
    status: text("status", { enum: ["pending", "ai-draft", "human-finalized"] }).notNull(),
    content: text("content"),
    assigneePersonId: text("assignee_person_id").references(() => people.id, { onDelete: "restrict" }),
    assignedByPersonId: text("assigned_by_person_id").references(() => people.id, { onDelete: "restrict" }),
    finalizedAt: timestamp("finalized_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [uniqueIndex("translation_handoffs_draft_locale_uq").on(table.draftId, table.locale)]
);

export const signOffRecords = pgTable("sign_off_records", {
  id: text("id").primaryKey(),
  draftId: text("draft_id").notNull().references(() => drafts.id, { onDelete: "restrict" }),
  approverPersonId: text("approver_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  timestamp: timestamp("timestamp", { withTimezone: true, mode: "date" }).notNull(),
});

export const publishCommits = pgTable("publish_commits", {
  id: text("id").primaryKey(),
  draftId: text("draft_id").notNull().references(() => drafts.id, { onDelete: "restrict" }),
  status: text("status", { enum: ["pending", "ready", "superseded", "committed"] }).notNull(),
  commitHash: text("commit_hash"),
  supersedesPublishCommitId: text("supersedes_publish_commit_id")
    .references((): AnyPgColumn => publishCommits.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }),
});

export const communityMembers = pgTable(
  "community_members",
  {
    id: text("id").primaryKey(),
    personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    currentStage: text("current_stage", {
      enum: ["anonymous", "identified-interest", "first-touch", "contributing-participant", "recurring-supporter"],
    }).notNull(),
  },
  (table) => [index("community_members_person_idx").on(table.personId)]
);

export const ladderStageTransitions = pgTable("ladder_stage_transitions", {
  id: text("id").primaryKey(),
  communityMemberId: text("community_member_id").notNull().references(() => communityMembers.id, { onDelete: "restrict" }),
  fromStage: text("from_stage").notNull(),
  toStage: text("to_stage").notNull(),
  triggeringTouchpoint: text("triggering_touchpoint", {
    enum: ["content-view", "event-attendance", "dialogue-participation", "donation"],
  }).notNull(),
  relatedEntityId: text("related_entity_id"),
  timestamp: timestamp("timestamp", { withTimezone: true, mode: "date" }).notNull(),
});

export const evangelismInvitations = pgTable("evangelism_invitations", {
  id: text("id").primaryKey(),
  communityMemberId: text("community_member_id").notNull().references(() => communityMembers.id, { onDelete: "restrict" }),
  mechanic: text("mechanic", {
    enum: [
      "co-signed-institutional-invitation",
      "comparative-outside-observer-invitation",
      "trust-and-independence-first-invitation",
    ],
  }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const kgEntities = pgTable("kg_entities", {
  id: text("id").primaryKey(),
  domain: text("domain", { enum: ["civic", "governance"] }).notNull(),
  type: text("type", { enum: ["person", "organization", "topic", "legislation", "dialogue", "finding"] }).notNull(),
  canonicalName: text("canonical_name").notNull(),
  aliases: jsonb("aliases").$type<Array<{ locale: string; name: string }>>().notNull(),
  sources: jsonb("sources").$type<Array<{
    file: string;
    locale: string;
    canonicalSource: string | null;
    publicEligible: boolean;
  }>>().notNull(),
});

export const kgRelationships = pgTable(
  "kg_relationships",
  {
    domain: text("domain", { enum: ["civic", "governance"] }).notNull(),
    fromEntityId: text("from_entity_id").notNull().references(() => kgEntities.id, { onDelete: "restrict" }),
    toEntityId: text("to_entity_id").notNull().references(() => kgEntities.id, { onDelete: "restrict" }),
    type: text("type", { enum: ["co-occurs"] }).notNull(),
    source: jsonb("source").$type<{
      file: string;
      locale: string;
      canonicalSource: string | null;
      publicEligible: boolean;
    }>().notNull(),
  },
  (table) => [primaryKey({ columns: [table.fromEntityId, table.toEntityId, table.type] })]
);

export const aiQueryLog = pgTable(
  "ai_query_log",
  {
    timestamp: timestamp("timestamp", { withTimezone: true, mode: "date" }).notNull(),
    prompt: text("prompt").notNull(),
    providerName: text("provider_name").notNull(),
    domain: text("domain", { enum: ["civic", "governance"] }).notNull(),
    useCaseId: text("use_case_id").notNull(),
    cost: numeric("cost", { precision: 14, scale: 6, mode: "number" }).notNull(),
    refused: boolean("refused").notNull(),
  },
  (table) => [primaryKey({ columns: [table.timestamp, table.providerName, table.prompt] })]
);

export const aiCostLedger = pgTable("ai_cost_ledger", {
  id: text("id").primaryKey(),
  monthlySpendCeiling: numeric("monthly_spend_ceiling", { precision: 14, scale: 2, mode: "number" }).notNull(),
});

export const harmCases = pgTable(
  "harm_cases",
  {
    id: text("id").primaryKey(),
    institutionId: text("institution_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
    reportedAt: timestamp("reported_at", { withTimezone: true, mode: "date" }).notNull(),
    location: text("location").notNull(),
    harmCategory: text("harm_category").notNull(),
    description: text("description").notNull(),
    affectedGroups: jsonb("affected_groups").$type<string[]>().notNull(),
    allegedResponsibleActors: jsonb("alleged_responsible_actors").$type<string[]>().notNull(),
    sourceType: text("source_type").notNull(),
    reporterPersonId: text("reporter_person_id").references(() => people.id, { onDelete: "restrict" }),
    confidentialityLevel: text("confidentiality_level", {
      enum: ["public", "restricted", "confidential"],
    }).notNull(),
    status: text("status", {
      enum: [
        "registered", "evidence-collection", "validation-pending", "information-requested",
        "hearing-ready", "hearing-documented", "scientific-review-pending", "repair-planning", "closed",
      ],
    }).notNull(),
  },
  (table) => [index("harm_cases_status_idx").on(table.status)]
);

export const harmEvidenceItems = pgTable(
  "harm_evidence_items",
  {
    id: text("id").primaryKey(),
    caseId: text("case_id").notNull().references(() => harmCases.id, { onDelete: "restrict" }),
    description: text("description").notNull(),
    source: text("source").notNull(),
    mediaType: text("media_type").notNull(),
    storageReference: text("storage_reference").notNull(),
    collectedAt: timestamp("collected_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [index("harm_evidence_items_case_idx").on(table.caseId)]
);

export const basicValidationDecisions = pgTable(
  "basic_validation_decisions",
  {
    id: text("id").primaryKey(),
    caseId: text("case_id").notNull().references(() => harmCases.id, { onDelete: "restrict" }),
    status: text("status", {
      enum: ["valid", "valid-with-minor-issues", "incomplete", "duplicate", "invalid-submission"],
    }).notNull(),
    reviewerPersonId: text("reviewer_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    missingInformation: jsonb("missing_information").$type<string[]>().notNull(),
    duplicateOfCaseId: text("duplicate_of_case_id").references(() => harmCases.id, { onDelete: "restrict" }),
    notes: text("notes").notNull(),
    decidedAt: timestamp("decided_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [index("basic_validation_case_idx").on(table.caseId)]
);

export const structuredHearings = pgTable(
  "structured_hearings",
  {
    id: text("id").primaryKey(),
    caseId: text("case_id").notNull().references(() => harmCases.id, { onDelete: "restrict" }),
    moderatorPersonId: text("moderator_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    participantConsentConfirmedAt: timestamp("participant_consent_confirmed_at", { withTimezone: true, mode: "date" }).notNull(),
    documentedAt: timestamp("documented_at", { withTimezone: true, mode: "date" }),
    reportReference: text("report_reference"),
  },
  (table) => [uniqueIndex("structured_hearings_case_uq").on(table.caseId)]
);

export const evidenceQualityAssessments = pgTable("evidence_quality_assessments", {
  id: text("id").primaryKey(),
  evidenceItemId: text("evidence_item_id").notNull().references(() => harmEvidenceItems.id, { onDelete: "restrict" }),
  reviewerPersonId: text("reviewer_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  satisfiedCriteria: jsonb("satisfied_criteria").$type<string[]>().notNull(),
  contradictions: jsonb("contradictions").$type<string[]>().notNull(),
  corroboratingEvidenceItemIds: jsonb("corroborating_evidence_item_ids").$type<string[]>().notNull(),
  confidence: text("confidence", { enum: ["very-low", "low", "moderate", "high", "very-high"] }).notNull(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const documentationQualityReviews = pgTable("documentation_quality_reviews", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull().references(() => harmCases.id, { onDelete: "restrict" }),
  artifactReference: text("artifact_reference").notNull(),
  reviewerPersonId: text("reviewer_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  outcome: text("outcome", { enum: ["approved", "approved-with-minor-corrections", "revision-required", "incomplete-documentation", "rejected"] }).notNull(),
  findings: jsonb("findings").$type<string[]>().notNull(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const hearingQualityReviews = pgTable("hearing_quality_reviews", {
  id: text("id").primaryKey(),
  hearingId: text("hearing_id").notNull().references(() => structuredHearings.id, { onDelete: "restrict" }),
  reviewerPersonId: text("reviewer_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  outcome: text("outcome", { enum: ["approved", "approved-with-recommendations", "minor-improvements-required", "major-improvements-required", "re-hearing-recommended"] }).notNull(),
  recommendations: jsonb("recommendations").$type<string[]>().notNull(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const scientificReviews = pgTable("scientific_reviews", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull().references(() => harmCases.id, { onDelete: "restrict" }),
  reviewerPersonIds: jsonb("reviewer_person_ids").$type<string[]>().notNull(),
  conflictDeclarationsComplete: boolean("conflict_declarations_complete").notNull(),
  methodologyAssessment: text("methodology_assessment").notNull(),
  evidenceAssessment: text("evidence_assessment").notNull(),
  findings: text("findings").notNull(),
  scientificConfidence: integer("scientific_confidence").notNull(),
  recommendations: jsonb("recommendations").$type<string[]>().notNull(),
  output: text("output", { enum: ["accepted", "accepted-with-minor-revisions", "major-revision-required", "insufficient-evidence", "rejected-for-scientific-reasons"] }).notNull(),
  decidedAt: timestamp("decided_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const repairPlans = pgTable("repair_plans", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull().references(() => harmCases.id, { onDelete: "restrict" }),
  approvedScientificReviewId: text("approved_scientific_review_id").notNull().references(() => scientificReviews.id, { onDelete: "restrict" }),
  plan: jsonb("plan").$type<{ objectives: string[]; expectedOutcomes: string[]; responsibleActors: string[]; requiredResources: string[]; timeline: string; successIndicators: string[]; monitoringMethods: string[]; risks: string[]; dependencies: string[] }>().notNull(),
  createdByPersonId: text("created_by_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const dashboardModuleManifestEntries = pgTable(
  "dashboard_module_manifest_entries",
  {
    segment: text("segment", { enum: ["visitor", "participant", "fellow"] }).notNull(),
    moduleName: text("module_name").notNull(),
    order: integer("order").notNull(),
  },
  (table) => [primaryKey({ columns: [table.segment, table.moduleName] })]
);

export const userPreferences = pgTable("user_preferences", {
  personId: text("person_id").primaryKey().references(() => people.id, { onDelete: "restrict" }),
  followedTopics: jsonb("followed_topics").$type<string[]>().notNull(),
});

export const impactEvidenceRecords = pgTable("impact_evidence_records", {
  id: text("id").primaryKey(),
  personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  description: text("description").notNull(),
  sourceFile: text("source_file").notNull(),
});

export const donorRecords = pgTable("donor_records", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
  givingHistory: jsonb("giving_history").$type<Array<{ amount: number; date: string }>>().notNull(),
});

export const institutionalPartners = pgTable("institutional_partners", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
  stage: text("stage", { enum: ["inquiry", "disclosure-pending", "active", "ended"] }).notNull(),
});

export const grantFunders = pgTable("grant_funders", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
  fundingTerms: text("funding_terms").notNull(),
});

export const conflictOfInterestDisclosures = pgTable("conflict_of_interest_disclosures", {
  id: text("id").primaryKey(),
  partnerId: text("partner_id").notNull().references(() => institutionalPartners.id, { onDelete: "restrict" }),
  disclosureText: text("disclosure_text").notNull(),
  reviewOutcome: text("review_outcome", { enum: ["pending", "approved", "rejected"] }).notNull(),
  reviewerPersonId: text("reviewer_person_id").references(() => people.id, { onDelete: "restrict" }),
});

export const fundingSourcePublicationRecords = pgTable("funding_source_publication_records", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
  publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const partnershipStatusLogs = pgTable("partnership_status_logs", {
  id: text("id").primaryKey(),
  partnerId: text("partner_id").notNull().references(() => institutionalPartners.id, { onDelete: "restrict" }),
  fromStage: text("from_stage", { enum: ["inquiry", "disclosure-pending", "active", "ended"] }).notNull(),
  toStage: text("to_stage", { enum: ["inquiry", "disclosure-pending", "active", "ended"] }).notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true, mode: "date" }).notNull(),
});

export const metricSnapshots = pgTable("metric_snapshots", {
  id: text("id").primaryKey(),
  languageCommunity: text("language_community").notNull(),
  participationCount: integer("participation_count").notNull(),
  subscriberCount: integer("subscriber_count").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true, mode: "date" }).notNull(),
});

export const funnelStageEvents = pgTable("funnel_stage_events", {
  id: text("id").primaryKey(),
  stage: text("stage").notNull(),
  count: integer("count").notNull(),
});

export const academyPrograms = pgTable(
  "academy_programs",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    state: text("state", {
      enum: ["draft", "review", "approved", "published", "archived"],
    }).notNull(),
    createdByPersonId: text("created_by_person_id")
      .notNull()
      .references(() => people.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    submittedForReviewAt: timestamp("submitted_for_review_at", {
      withTimezone: true,
      mode: "date",
    }),
    approvedByPersonId: text("approved_by_person_id").references(() => people.id, {
      onDelete: "restrict",
    }),
    approvedAt: timestamp("approved_at", { withTimezone: true, mode: "date" }),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
    archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
    version: integer("version").notNull(),
  },
  (table) => [uniqueIndex("academy_programs_slug_uq").on(table.slug)]
);

export const kgGraphBuilds = pgTable(
  "kg_graph_builds",
  {
    id: text("id").primaryKey(),
    domain: text("domain", { enum: ["civic", "governance"] }).notNull(),
    commitSha: text("commit_sha").notNull(),
    extractorName: text("extractor_name").notNull(),
    contentDigest: text("content_digest").notNull(),
    status: text("status", { enum: ["completed", "failed"] }).notNull(),
    candidateCount: integer("candidate_count").notNull(),
    initiatedByPersonId: text("initiated_by_person_id").notNull()
      .references(() => people.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    uniqueIndex("kg_graph_builds_reproducible_uq").on(
      table.domain,
      table.commitSha,
      table.extractorName,
      table.contentDigest
    ),
    index("kg_graph_builds_domain_created_idx").on(table.domain, table.createdAt),
  ]
);

export const kgCandidates = pgTable(
  "kg_candidates",
  {
    id: text("id").primaryKey(),
    buildId: text("build_id").notNull()
      .references(() => kgGraphBuilds.id, { onDelete: "restrict" }),
    domain: text("domain", { enum: ["civic", "governance"] }).notNull(),
    kind: text("kind", { enum: ["entity", "relationship"] }).notNull(),
    candidateKey: text("candidate_key").notNull(),
    fingerprint: text("fingerprint").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    sources: jsonb("sources").$type<Array<{
      file: string;
      locale: string;
      canonicalSource: string | null;
      publicEligible: boolean;
    }>>().notNull(),
    status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    decidedAt: timestamp("decided_at", { withTimezone: true, mode: "date" }),
    decidedByPersonId: text("decided_by_person_id")
      .references(() => people.id, { onDelete: "restrict" }),
    decisionReason: text("decision_reason"),
  },
  (table) => [
    uniqueIndex("kg_candidates_build_fingerprint_uq").on(table.buildId, table.fingerprint),
    index("kg_candidates_domain_status_idx").on(table.domain, table.status),
  ]
);

export const kgProvenance = pgTable(
  "kg_provenance",
  {
    id: text("id").primaryKey(),
    candidateId: text("candidate_id").notNull()
      .references(() => kgCandidates.id, { onDelete: "restrict" }),
    domain: text("domain", { enum: ["civic", "governance"] }).notNull(),
    targetKind: text("target_kind", { enum: ["entity", "relationship"] }).notNull(),
    targetKey: text("target_key").notNull(),
    sourceFile: text("source_file").notNull(),
    sourceLocale: text("source_locale").notNull(),
    canonicalSource: text("canonical_source"),
    sourceDigest: text("source_digest").notNull(),
    publicEligible: boolean("public_eligible").notNull(),
    commitSha: text("commit_sha").notNull(),
    extractorName: text("extractor_name").notNull(),
    approvedByPersonId: text("approved_by_person_id").notNull()
      .references(() => people.id, { onDelete: "restrict" }),
    approvedAt: timestamp("approved_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("kg_provenance_candidate_source_uq").on(
      table.candidateId,
      table.sourceFile,
      table.sourceLocale
    ),
    index("kg_provenance_public_target_idx").on(
      table.publicEligible,
      table.targetKind,
      table.targetKey
    ),
  ]
);

export const academyProgramTranslations = pgTable(
  "academy_program_translations",
  {
    programId: text("program_id")
      .notNull()
      .references(() => academyPrograms.id, { onDelete: "restrict" }),
    locale: text("locale", { enum: ["de", "en", "fa"] }).notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    body: text("body").notNull(),
    sourceRefs: jsonb("source_refs").$type<string[]>().notNull(),
    version: integer("version").notNull(),
  },
  (table) => [primaryKey({ columns: [table.programId, table.locale] })]
);

export const academyCourses = pgTable(
  "academy_courses",
  {
    id: text("id").primaryKey(),
    programId: text("program_id").references(() => academyPrograms.id, {
      onDelete: "restrict",
    }),
    slug: text("slug").notNull(),
    state: text("state", {
      enum: ["draft", "review", "approved", "published", "archived"],
    }).notNull(),
    enrollmentPolicy: text("enrollment_policy", {
      enum: ["public", "member-only", "invitation", "application"],
    }).notNull(),
    createdByPersonId: text("created_by_person_id")
      .notNull()
      .references(() => people.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    submittedForReviewAt: timestamp("submitted_for_review_at", {
      withTimezone: true,
      mode: "date",
    }),
    reviewedByPersonId: text("reviewed_by_person_id").references(() => people.id, {
      onDelete: "restrict",
    }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: "date" }),
    approvedByPersonId: text("approved_by_person_id").references(() => people.id, {
      onDelete: "restrict",
    }),
    approvedAt: timestamp("approved_at", { withTimezone: true, mode: "date" }),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
    archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
    version: integer("version").notNull(),
  },
  (table) => [
    uniqueIndex("academy_courses_slug_uq").on(table.slug),
    index("academy_courses_state_idx").on(table.state),
    index("academy_courses_program_idx").on(table.programId),
  ]
);

export const academyCourseTranslations = pgTable(
  "academy_course_translations",
  {
    courseId: text("course_id")
      .notNull()
      .references(() => academyCourses.id, { onDelete: "restrict" }),
    locale: text("locale", { enum: ["de", "en", "fa"] }).notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    description: text("description").notNull(),
    learningOutcomes: jsonb("learning_outcomes").$type<string[]>().notNull(),
    sourceRefs: jsonb("source_refs").$type<string[]>().notNull(),
    version: integer("version").notNull(),
  },
  (table) => [primaryKey({ columns: [table.courseId, table.locale] })]
);

export const academyModules = pgTable(
  "academy_modules",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => academyCourses.id, { onDelete: "restrict" }),
    position: integer("position").notNull(),
    required: boolean("required").notNull(),
  },
  (table) => [
    uniqueIndex("academy_modules_course_position_uq").on(table.courseId, table.position),
  ]
);

export const academyModuleTranslations = pgTable(
  "academy_module_translations",
  {
    moduleId: text("module_id")
      .notNull()
      .references(() => academyModules.id, { onDelete: "restrict" }),
    locale: text("locale", { enum: ["de", "en", "fa"] }).notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
  },
  (table) => [primaryKey({ columns: [table.moduleId, table.locale] })]
);

export const academyLessons = pgTable(
  "academy_lessons",
  {
    id: text("id").primaryKey(),
    moduleId: text("module_id")
      .notNull()
      .references(() => academyModules.id, { onDelete: "restrict" }),
    position: integer("position").notNull(),
    required: boolean("required").notNull(),
  },
  (table) => [
    uniqueIndex("academy_lessons_module_position_uq").on(table.moduleId, table.position),
  ]
);

export const academyLessonTranslations = pgTable(
  "academy_lesson_translations",
  {
    lessonId: text("lesson_id")
      .notNull()
      .references(() => academyLessons.id, { onDelete: "restrict" }),
    locale: text("locale", { enum: ["de", "en", "fa"] }).notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    sourceRefs: jsonb("source_refs").$type<string[]>().notNull(),
  },
  (table) => [primaryKey({ columns: [table.lessonId, table.locale] })]
);

export const academyResources = pgTable(
  "academy_resources",
  {
    id: text("id").primaryKey(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => academyLessons.id, { onDelete: "restrict" }),
    kind: text("kind", { enum: ["document", "link", "audio", "video"] }).notNull(),
    uri: text("uri").notNull(),
    locale: text("locale", { enum: ["de", "en", "fa"] }).notNull(),
    label: text("label").notNull(),
    accessibilityLabel: text("accessibility_label").notNull(),
    position: integer("position").notNull(),
  },
  (table) => [
    uniqueIndex("academy_resources_lesson_position_uq").on(table.lessonId, table.position),
  ]
);

export const academyInstructors = pgTable("academy_instructors", {
  personId: text("person_id")
    .primaryKey()
    .references(() => people.id, { onDelete: "restrict" }),
  publicBiographyApproved: boolean("public_biography_approved").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const academyCourseInstructors = pgTable(
  "academy_course_instructors",
  {
    courseId: text("course_id")
      .notNull()
      .references(() => academyCourses.id, { onDelete: "restrict" }),
    instructorPersonId: text("instructor_person_id")
      .notNull()
      .references(() => academyInstructors.personId, { onDelete: "restrict" }),
    role: text("role", { enum: ["lead", "facilitator", "reviewer"] }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.courseId, table.instructorPersonId] })]
);

export const academyCohorts = pgTable(
  "academy_cohorts",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => academyCourses.id, { onDelete: "restrict" }),
    startsAt: timestamp("starts_at", { withTimezone: true, mode: "date" }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true, mode: "date" }).notNull(),
    enrollmentOpensAt: timestamp("enrollment_opens_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    enrollmentClosesAt: timestamp("enrollment_closes_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    capacity: integer("capacity").notNull(),
    status: text("status", { enum: ["scheduled", "active", "completed", "cancelled"] }).notNull(),
  },
  (table) => [index("academy_cohorts_course_idx").on(table.courseId)]
);

export const academyEnrollmentApplications = pgTable(
  "academy_enrollment_applications",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => academyCourses.id, { onDelete: "restrict" }),
    cohortId: text("cohort_id")
      .notNull()
      .references(() => academyCohorts.id, { onDelete: "restrict" }),
    personId: text("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "restrict" }),
    statement: text("statement").notNull(),
    status: text("status", { enum: ["pending", "approved", "rejected", "withdrawn"] }).notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "date" }).notNull(),
    decidedAt: timestamp("decided_at", { withTimezone: true, mode: "date" }),
    decidedByPersonId: text("decided_by_person_id").references(() => people.id, {
      onDelete: "restrict",
    }),
  },
  (table) => [
    uniqueIndex("academy_enrollment_applications_person_cohort_uq").on(
      table.personId,
      table.cohortId
    ),
    index("academy_enrollment_applications_status_idx").on(table.status),
  ]
);

export const academyInvitations = pgTable(
  "academy_invitations",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => academyCourses.id, { onDelete: "restrict" }),
    cohortId: text("cohort_id")
      .notNull()
      .references(() => academyCohorts.id, { onDelete: "restrict" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    redeemedByPersonId: text("redeemed_by_person_id").references(() => people.id, {
      onDelete: "restrict",
    }),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true, mode: "date" }),
    createdByPersonId: text("created_by_person_id")
      .notNull()
      .references(() => people.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("academy_invitations_token_hash_uq").on(table.tokenHash),
    index("academy_invitations_cohort_idx").on(table.cohortId),
  ]
);

export const academyEnrollments = pgTable(
  "academy_enrollments",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => academyCourses.id, { onDelete: "restrict" }),
    cohortId: text("cohort_id")
      .notNull()
      .references(() => academyCohorts.id, { onDelete: "restrict" }),
    personId: text("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "restrict" }),
    status: text("status", { enum: ["enrolled", "in-progress", "completed", "withdrawn"] }).notNull(),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true, mode: "date" }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    uniqueIndex("academy_enrollments_person_cohort_uq").on(table.personId, table.cohortId),
    index("academy_enrollments_course_idx").on(table.courseId),
  ]
);

export const academyLessonProgress = pgTable(
  "academy_lesson_progress",
  {
    enrollmentId: text("enrollment_id")
      .notNull()
      .references(() => academyEnrollments.id, { onDelete: "restrict" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => academyLessons.id, { onDelete: "restrict" }),
    status: text("status", { enum: ["not-started", "in-progress", "completed"] }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.enrollmentId, table.lessonId] })]
);

export const academyAssessments = pgTable("academy_assessments", {
  id: text("id").primaryKey(),
  courseId: text("course_id")
    .notNull()
    .references(() => academyCourses.id, { onDelete: "restrict" }),
  moduleId: text("module_id").references(() => academyModules.id, { onDelete: "restrict" }),
  required: boolean("required").notNull(),
  reviewCriteria: jsonb("review_criteria").$type<string[]>().notNull(),
  createdByPersonId: text("created_by_person_id")
    .notNull()
    .references(() => people.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const academyAssessmentTranslations = pgTable(
  "academy_assessment_translations",
  {
    assessmentId: text("assessment_id")
      .notNull()
      .references(() => academyAssessments.id, { onDelete: "restrict" }),
    locale: text("locale", { enum: ["de", "en", "fa"] }).notNull(),
    title: text("title").notNull(),
    prompt: text("prompt").notNull(),
  },
  (table) => [primaryKey({ columns: [table.assessmentId, table.locale] })]
);

export const academyAssessmentSubmissions = pgTable(
  "academy_assessment_submissions",
  {
    id: text("id").primaryKey(),
    assessmentId: text("assessment_id")
      .notNull()
      .references(() => academyAssessments.id, { onDelete: "restrict" }),
    enrollmentId: text("enrollment_id")
      .notNull()
      .references(() => academyEnrollments.id, { onDelete: "restrict" }),
    response: text("response").notNull(),
    status: text("status", { enum: ["submitted", "revision-required", "passed"] }).notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "date" }).notNull(),
    reviewedByPersonId: text("reviewed_by_person_id").references(() => people.id, {
      onDelete: "restrict",
    }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: "date" }),
    feedback: text("feedback"),
  },
  (table) => [
    uniqueIndex("academy_assessment_submissions_enrollment_assessment_uq").on(
      table.enrollmentId,
      table.assessmentId
    ),
  ]
);

export const academyCertificates = pgTable(
  "academy_certificates",
  {
    id: text("id").primaryKey(),
    enrollmentId: text("enrollment_id")
      .notNull()
      .references(() => academyEnrollments.id, { onDelete: "restrict" }),
    verificationId: text("verification_id").notNull(),
    statementVersion: text("statement_version").notNull(),
    issuedByPersonId: text("issued_by_person_id")
      .notNull()
      .references(() => people.id, { onDelete: "restrict" }),
    issuedAt: timestamp("issued_at", { withTimezone: true, mode: "date" }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    uniqueIndex("academy_certificates_enrollment_uq").on(table.enrollmentId),
    uniqueIndex("academy_certificates_verification_uq").on(table.verificationId),
  ]
);

export const fellowshipRoleScopes = pgTable(
  "fellowship_role_scopes",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    labels: jsonb("labels").$type<Record<"de" | "en" | "fa", string>>().notNull(),
    responsibilities: jsonb("responsibilities").$type<string[]>().notNull(),
    sourceRefs: jsonb("source_refs").$type<string[]>().notNull(),
    state: text("state", { enum: ["draft", "approved", "retired"] }).notNull(),
    createdByPersonId: text("created_by_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    approvedByPersonId: text("approved_by_person_id").references(() => people.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    approvedAt: timestamp("approved_at", { withTimezone: true, mode: "date" }),
    retiredAt: timestamp("retired_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [uniqueIndex("fellowship_role_scopes_slug_uq").on(table.slug)]
);

export const fellowshipCandidacies = pgTable(
  "fellowship_candidacies",
  {
    id: text("id").primaryKey(),
    candidatePersonId: text("candidate_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    sourceType: text("source_type", { enum: ["nomination", "application"] }).notNull(),
    submittedByPersonId: text("submitted_by_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    roleScopeId: text("role_scope_id").notNull().references(() => fellowshipRoleScopes.id, { onDelete: "restrict" }),
    rationale: text("rationale").notNull(),
    status: text("status", { enum: ["submitted", "under-review", "more-information-required", "approved", "rejected", "withdrawn"] }).notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "date" }).notNull(),
    enteredReviewAt: timestamp("entered_review_at", { withTimezone: true, mode: "date" }),
    decidedAt: timestamp("decided_at", { withTimezone: true, mode: "date" }),
    decidedByPersonId: text("decided_by_person_id").references(() => people.id, { onDelete: "restrict" }),
    decisionReason: text("decision_reason"),
    memberFacingReason: text("member_facing_reason"),
  },
  (table) => [
    index("fellowship_candidacies_candidate_idx").on(table.candidatePersonId),
    index("fellowship_candidacies_status_idx").on(table.status),
  ]
);

export const fellowshipEvidenceRefs = pgTable("fellowship_evidence_refs", {
  id: text("id").primaryKey(),
  candidacyId: text("candidacy_id").notNull().references(() => fellowshipCandidacies.id, { onDelete: "restrict" }),
  kind: text("kind", { enum: ["contribution", "role-history", "reference"] }).notNull(),
  sourceRef: text("source_ref").notNull(),
  description: text("description").notNull(),
  addedByPersonId: text("added_by_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const fellowshipReviewAssignments = pgTable(
  "fellowship_review_assignments",
  {
    id: text("id").primaryKey(),
    candidacyId: text("candidacy_id").notNull().references(() => fellowshipCandidacies.id, { onDelete: "restrict" }),
    reviewerPersonId: text("reviewer_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    assignedByPersonId: text("assigned_by_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    status: text("status", { enum: ["assigned", "recused", "completed"] }).notNull(),
    assignedAt: timestamp("assigned_at", { withTimezone: true, mode: "date" }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    uniqueIndex("fellowship_review_assignments_candidacy_reviewer_uq").on(table.candidacyId, table.reviewerPersonId),
    index("fellowship_review_assignments_candidacy_idx").on(table.candidacyId),
  ]
);

export const fellowshipConflictDeclarations = pgTable(
  "fellowship_conflict_declarations",
  {
    id: text("id").primaryKey(),
    assignmentId: text("assignment_id").notNull().references(() => fellowshipReviewAssignments.id, { onDelete: "restrict" }),
    reviewerPersonId: text("reviewer_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    hasConflict: boolean("has_conflict").notNull(),
    declarationText: text("declaration_text").notNull(),
    declaredAt: timestamp("declared_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [uniqueIndex("fellowship_conflict_declarations_assignment_uq").on(table.assignmentId)]
);

export const fellowshipReviews = pgTable(
  "fellowship_reviews",
  {
    id: text("id").primaryKey(),
    assignmentId: text("assignment_id").notNull().references(() => fellowshipReviewAssignments.id, { onDelete: "restrict" }),
    reviewerPersonId: text("reviewer_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    recommendation: text("recommendation", { enum: ["approve", "reject", "more-information"] }).notNull(),
    rationale: text("rationale").notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [uniqueIndex("fellowship_reviews_assignment_uq").on(table.assignmentId)]
);

export const fellowshipRecords = pgTable(
  "fellowship_records",
  {
    id: text("id").primaryKey(),
    personId: text("person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    roleScopeId: text("role_scope_id").notNull().references(() => fellowshipRoleScopes.id, { onDelete: "restrict" }),
    candidacyId: text("candidacy_id").notNull().references(() => fellowshipCandidacies.id, { onDelete: "restrict" }),
    sponsorPersonId: text("sponsor_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
    status: text("status", { enum: ["active", "suspended", "ended"] }).notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true, mode: "date" }).notNull(),
    reviewDueAt: timestamp("review_due_at", { withTimezone: true, mode: "date" }),
    endedAt: timestamp("ended_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    uniqueIndex("fellowship_records_candidacy_uq").on(table.candidacyId),
    index("fellowship_records_person_idx").on(table.personId),
  ]
);

export const fellowshipStatusChanges = pgTable("fellowship_status_changes", {
  id: text("id").primaryKey(),
  fellowshipId: text("fellowship_id").notNull().references(() => fellowshipRecords.id, { onDelete: "restrict" }),
  fromStatus: text("from_status", { enum: ["active", "suspended", "ended"] }).notNull(),
  toStatus: text("to_status", { enum: ["active", "suspended", "ended"] }).notNull(),
  reason: text("reason").notNull(),
  changedByPersonId: text("changed_by_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  changedAt: timestamp("changed_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const fellowshipAttributions = pgTable("fellowship_attributions", {
  id: text("id").primaryKey(),
  fellowshipId: text("fellowship_id").notNull().references(() => fellowshipRecords.id, { onDelete: "restrict" }),
  publicationReference: text("publication_reference").notNull(),
  creditText: text("credit_text").notNull(),
  publicDisplayApproved: boolean("public_display_approved").notNull(),
  approvedByPersonId: text("approved_by_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
});
