import {
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
});

export const moderationQueue = pgTable("moderation_queue", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id").notNull().references(() => submissions.id, { onDelete: "restrict" }),
  decision: text("decision", { enum: ["pending", "approved", "rejected"] }).notNull(),
  assignedReviewerPersonId: text("assigned_reviewer_person_id").references(() => people.id, { onDelete: "restrict" }),
  reason: text("reason"),
});

export const drafts = pgTable("drafts", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id").notNull().references(() => submissions.id, { onDelete: "restrict" }),
  content: text("content").notNull(),
  citations: jsonb("citations").$type<string[]>().notNull(),
  weakCitationFlags: jsonb("weak_citation_flags").$type<string[]>().notNull(),
  authorType: text("author_type", { enum: ["ai", "human"] }).notNull(),
  version: integer("version").notNull(),
});

export const translationHandoffs = pgTable("translation_handoffs", {
  id: text("id").primaryKey(),
  draftId: text("draft_id").notNull().references(() => drafts.id, { onDelete: "restrict" }),
  locale: text("locale").notNull(),
  status: text("status", { enum: ["pending", "ai-draft", "human-finalized"] }).notNull(),
  assigneePersonId: text("assignee_person_id").references(() => people.id, { onDelete: "restrict" }),
});

export const signOffRecords = pgTable("sign_off_records", {
  id: text("id").primaryKey(),
  draftId: text("draft_id").notNull().references(() => drafts.id, { onDelete: "restrict" }),
  approverPersonId: text("approver_person_id").notNull().references(() => people.id, { onDelete: "restrict" }),
  timestamp: timestamp("timestamp", { withTimezone: true, mode: "date" }).notNull(),
});

export const publishCommits = pgTable("publish_commits", {
  id: text("id").primaryKey(),
  draftId: text("draft_id").notNull().references(() => drafts.id, { onDelete: "restrict" }),
  status: text("status", { enum: ["pending", "ready", "committed"] }).notNull(),
  commitHash: text("commit_hash"),
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
  type: text("type", { enum: ["person", "organization", "topic", "legislation", "dialogue", "finding"] }).notNull(),
  canonicalName: text("canonical_name").notNull(),
  aliases: jsonb("aliases").$type<Array<{ locale: string; name: string }>>().notNull(),
  sources: jsonb("sources").$type<Array<{ file: string; locale: string }>>().notNull(),
});

export const kgRelationships = pgTable(
  "kg_relationships",
  {
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
    cost: numeric("cost", { precision: 14, scale: 6, mode: "number" }).notNull(),
    refused: boolean("refused").notNull(),
  },
  (table) => [primaryKey({ columns: [table.timestamp, table.providerName, table.prompt] })]
);

export const aiCostLedger = pgTable("ai_cost_ledger", {
  id: text("id").primaryKey(),
  monthlySpendCeiling: numeric("monthly_spend_ceiling", { precision: 14, scale: 2, mode: "number" }).notNull(),
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
