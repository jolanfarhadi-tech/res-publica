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
  sources: jsonb("sources").$type<Array<{ file: string; locale: string }>>().notNull(),
});

export const kgRelationships = pgTable(
  "kg_relationships",
  {
    domain: text("domain", { enum: ["civic", "governance"] }).notNull(),
    fromEntityId: text("from_entity_id").notNull().references(() => kgEntities.id, { onDelete: "restrict" }),
    toEntityId: text("to_entity_id").notNull().references(() => kgEntities.id, { onDelete: "restrict" }),
    type: text("type", { enum: ["co-occurs"] }).notNull(),
    source: jsonb("source").$type<{ file: string; locale: string }>().notNull(),
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
