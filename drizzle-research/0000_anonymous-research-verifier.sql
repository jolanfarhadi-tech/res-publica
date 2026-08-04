CREATE SCHEMA IF NOT EXISTS "research_anonymous";
--> statement-breakpoint
CREATE TABLE "research_anonymous"."protocols" (
	"project_digest" text PRIMARY KEY NOT NULL,
	"protocol_version" text NOT NULL,
	"status" text NOT NULL,
	"minimum_cohort_size" integer NOT NULL,
	"background_characteristics" jsonb NOT NULL,
	"contribution_max_length" integer NOT NULL,
	"retention_rule" text NOT NULL,
	"activated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "protocol_project_digest_format" CHECK ("project_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "protocol_minimum_cohort" CHECK ("minimum_cohort_size" >= 10),
	CONSTRAINT "protocol_status_allowed" CHECK ("status" IN ('synthetic', 'approved-real-data'))
);
--> statement-breakpoint
CREATE TABLE "research_anonymous"."rate_limit_buckets" (
	"scope" text NOT NULL,
	"identifier_hash" text NOT NULL,
	"window_started_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"request_count" integer NOT NULL,
	CONSTRAINT "research_anonymous_rate_limit_buckets_scope_identifier_hash_pk" PRIMARY KEY("scope","identifier_hash")
);
--> statement-breakpoint
CREATE TABLE "research_anonymous"."verifier_challenges" (
	"challenge_hash" text PRIMARY KEY NOT NULL,
	"project_digest" text NOT NULL,
	"audience_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "challenge_hash_format" CHECK ("challenge_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "challenge_project_digest_format" CHECK ("project_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "challenge_audience_hash_format" CHECK ("audience_hash" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "research_anonymous"."submission_nullifiers" (
	"project_digest" text NOT NULL,
	"nullifier_hash" text NOT NULL,
	"accepted_on" date NOT NULL,
	"expires_on" date NOT NULL,
	CONSTRAINT "submission_nullifiers_project_digest_nullifier_hash_pk" PRIMARY KEY("project_digest","nullifier_hash"),
	CONSTRAINT "nullifier_hash_format" CHECK ("nullifier_hash" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "research_anonymous"."intake_tokens" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"project_digest" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "token_hash_format" CHECK ("token_hash" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "research_anonymous"."contributions" (
	"id" text PRIMARY KEY NOT NULL,
	"project_digest" text NOT NULL,
	"protocol_version" text NOT NULL,
	"background" jsonb NOT NULL,
	"contribution" text NOT NULL,
	"submitted_on" date NOT NULL,
	CONSTRAINT "contribution_project_digest_format" CHECK ("project_digest" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE INDEX "verifier_challenges_expires_idx" ON "research_anonymous"."verifier_challenges" USING btree ("expires_at");
--> statement-breakpoint
CREATE INDEX "intake_tokens_expires_idx" ON "research_anonymous"."intake_tokens" USING btree ("expires_at");
--> statement-breakpoint
CREATE INDEX "anonymous_contributions_project_idx" ON "research_anonymous"."contributions" USING btree ("project_digest");
--> statement-breakpoint
CREATE INDEX "anonymous_contributions_submitted_on_idx" ON "research_anonymous"."contributions" USING btree ("submitted_on");
--> statement-breakpoint
CREATE INDEX "research_rate_limit_expiry_idx" ON "research_anonymous"."rate_limit_buckets" USING btree ("expires_at");
--> statement-breakpoint
REVOKE ALL ON SCHEMA "research_anonymous" FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON ALL TABLES IN SCHEMA "research_anonymous" FROM PUBLIC;
