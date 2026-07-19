CREATE TABLE "ai_cost_ledger" (
	"id" text PRIMARY KEY NOT NULL,
	"monthly_spend_ceiling" numeric(14, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_query_log" (
	"timestamp" timestamp with time zone NOT NULL,
	"prompt" text NOT NULL,
	"provider_name" text NOT NULL,
	"cost" numeric(14, 6) NOT NULL,
	"refused" boolean NOT NULL,
	CONSTRAINT "ai_query_log_timestamp_provider_name_prompt_pk" PRIMARY KEY("timestamp","provider_name","prompt")
);
--> statement-breakpoint
CREATE TABLE "conflict_of_interest_disclosures" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"disclosure_text" text NOT NULL,
	"review_outcome" text NOT NULL,
	"reviewer_person_id" text
);
--> statement-breakpoint
CREATE TABLE "dashboard_module_manifest_entries" (
	"segment" text NOT NULL,
	"module_name" text NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "dashboard_module_manifest_entries_segment_module_name_pk" PRIMARY KEY("segment","module_name")
);
--> statement-breakpoint
CREATE TABLE "donor_records" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"giving_history" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "funding_source_publication_records" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"published_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "funnel_stage_events" (
	"id" text PRIMARY KEY NOT NULL,
	"stage" text NOT NULL,
	"count" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grant_funders" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"funding_terms" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "impact_evidence_records" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"description" text NOT NULL,
	"source_file" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "institutional_partners" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"stage" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kg_entities" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"canonical_name" text NOT NULL,
	"aliases" jsonb NOT NULL,
	"sources" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kg_relationships" (
	"from_entity_id" text NOT NULL,
	"to_entity_id" text NOT NULL,
	"type" text NOT NULL,
	"source" jsonb NOT NULL,
	CONSTRAINT "kg_relationships_from_entity_id_to_entity_id_type_pk" PRIMARY KEY("from_entity_id","to_entity_id","type")
);
--> statement-breakpoint
CREATE TABLE "metric_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"language_community" text NOT NULL,
	"participation_count" integer NOT NULL,
	"subscriber_count" integer NOT NULL,
	"timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partnership_status_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"from_stage" text NOT NULL,
	"to_stage" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"person_id" text PRIMARY KEY NOT NULL,
	"followed_topics" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "conflict_of_interest_disclosures" ADD CONSTRAINT "conflict_of_interest_disclosures_partner_id_institutional_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."institutional_partners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conflict_of_interest_disclosures" ADD CONSTRAINT "conflict_of_interest_disclosures_reviewer_person_id_people_id_fk" FOREIGN KEY ("reviewer_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donor_records" ADD CONSTRAINT "donor_records_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding_source_publication_records" ADD CONSTRAINT "funding_source_publication_records_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grant_funders" ADD CONSTRAINT "grant_funders_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impact_evidence_records" ADD CONSTRAINT "impact_evidence_records_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "institutional_partners" ADD CONSTRAINT "institutional_partners_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kg_relationships" ADD CONSTRAINT "kg_relationships_from_entity_id_kg_entities_id_fk" FOREIGN KEY ("from_entity_id") REFERENCES "public"."kg_entities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kg_relationships" ADD CONSTRAINT "kg_relationships_to_entity_id_kg_entities_id_fk" FOREIGN KEY ("to_entity_id") REFERENCES "public"."kg_entities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnership_status_logs" ADD CONSTRAINT "partnership_status_logs_partner_id_institutional_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."institutional_partners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;