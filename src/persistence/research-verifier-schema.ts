import {
  date,
  index,
  integer,
  jsonb,
  pgSchema,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { BackgroundCharacteristic } from "../domain/research-intake/protocol";

export const anonymousResearchSchema = pgSchema("research_anonymous");

export const researchProtocols = anonymousResearchSchema.table(
  "protocols",
  {
    projectDigest: text("project_digest").primaryKey(),
    protocolVersion: text("protocol_version").notNull(),
    status: text("status", { enum: ["synthetic", "approved-real-data"] }).notNull(),
    minimumCohortSize: integer("minimum_cohort_size").notNull(),
    backgroundCharacteristics: jsonb("background_characteristics")
      .$type<BackgroundCharacteristic[]>().notNull(),
    contributionMaxLength: integer("contribution_max_length").notNull(),
    retentionRule: text("retention_rule").notNull(),
    activatedAt: timestamp("activated_at", { withTimezone: true, mode: "date" }).notNull(),
  }
);

export const verifierRateLimitBuckets = anonymousResearchSchema.table(
  "rate_limit_buckets",
  {
    scope: text("scope").notNull(),
    identifierHash: text("identifier_hash").notNull(),
    windowStartedAt: timestamp("window_started_at", { withTimezone: true, mode: "date" }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    requestCount: integer("request_count").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.scope, table.identifierHash] }),
    index("research_rate_limit_expiry_idx").on(table.expiresAt),
  ]
);

export const verifierChallenges = anonymousResearchSchema.table(
  "verifier_challenges",
  {
    challengeHash: text("challenge_hash").primaryKey(),
    projectDigest: text("project_digest").notNull(),
    audienceHash: text("audience_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [index("verifier_challenges_expires_idx").on(table.expiresAt)]
);

export const submissionNullifiers = anonymousResearchSchema.table(
  "submission_nullifiers",
  {
    projectDigest: text("project_digest").notNull(),
    nullifierHash: text("nullifier_hash").notNull(),
    acceptedOn: date("accepted_on", { mode: "date" }).notNull(),
    expiresOn: date("expires_on", { mode: "date" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.projectDigest, table.nullifierHash] })]
);

export const intakeTokens = anonymousResearchSchema.table(
  "intake_tokens",
  {
    tokenHash: text("token_hash").primaryKey(),
    projectDigest: text("project_digest").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [index("intake_tokens_expires_idx").on(table.expiresAt)]
);

export const anonymousResearchContributions = anonymousResearchSchema.table(
  "contributions",
  {
    id: text("id").primaryKey(),
    projectDigest: text("project_digest").notNull(),
    protocolVersion: text("protocol_version").notNull(),
    background: jsonb("background").$type<Record<string, string>>().notNull(),
    contribution: text("contribution").notNull(),
    submittedOn: date("submitted_on", { mode: "date" }).notNull(),
  },
  (table) => [
    index("anonymous_contributions_project_idx").on(table.projectDigest),
    index("anonymous_contributions_submitted_on_idx").on(table.submittedOn),
  ]
);
