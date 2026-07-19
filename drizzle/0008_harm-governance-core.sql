CREATE TABLE "harm_cases" (
	"id" text PRIMARY KEY NOT NULL,
	"reported_at" timestamp with time zone NOT NULL,
	"location" text NOT NULL,
	"harm_category" text NOT NULL,
	"description" text NOT NULL,
	"affected_groups" jsonb NOT NULL,
	"alleged_responsible_actors" jsonb NOT NULL,
	"source_type" text NOT NULL,
	"reporter_person_id" text,
	"confidentiality_level" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "harm_evidence_items" (
	"id" text PRIMARY KEY NOT NULL,
	"case_id" text NOT NULL,
	"description" text NOT NULL,
	"source" text NOT NULL,
	"media_type" text NOT NULL,
	"storage_reference" text NOT NULL,
	"collected_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "basic_validation_decisions" (
	"id" text PRIMARY KEY NOT NULL,
	"case_id" text NOT NULL,
	"status" text NOT NULL,
	"reviewer_person_id" text NOT NULL,
	"missing_information" jsonb NOT NULL,
	"duplicate_of_case_id" text,
	"notes" text NOT NULL,
	"decided_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "structured_hearings" (
	"id" text PRIMARY KEY NOT NULL,
	"case_id" text NOT NULL,
	"moderator_person_id" text NOT NULL,
	"participant_consent_confirmed_at" timestamp with time zone NOT NULL,
	"documented_at" timestamp with time zone,
	"report_reference" text
);
--> statement-breakpoint
ALTER TABLE "harm_cases" ADD CONSTRAINT "harm_cases_reporter_person_id_people_id_fk" FOREIGN KEY ("reporter_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "harm_evidence_items" ADD CONSTRAINT "harm_evidence_items_case_id_harm_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."harm_cases"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "basic_validation_decisions" ADD CONSTRAINT "basic_validation_decisions_case_id_harm_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."harm_cases"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "basic_validation_decisions" ADD CONSTRAINT "basic_validation_decisions_reviewer_person_id_people_id_fk" FOREIGN KEY ("reviewer_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "basic_validation_decisions" ADD CONSTRAINT "basic_validation_decisions_duplicate_of_case_id_harm_cases_id_fk" FOREIGN KEY ("duplicate_of_case_id") REFERENCES "public"."harm_cases"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "structured_hearings" ADD CONSTRAINT "structured_hearings_case_id_harm_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."harm_cases"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "structured_hearings" ADD CONSTRAINT "structured_hearings_moderator_person_id_people_id_fk" FOREIGN KEY ("moderator_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "harm_cases_status_idx" ON "harm_cases" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "harm_evidence_items_case_idx" ON "harm_evidence_items" USING btree ("case_id");
--> statement-breakpoint
CREATE INDEX "basic_validation_case_idx" ON "basic_validation_decisions" USING btree ("case_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "structured_hearings_case_uq" ON "structured_hearings" USING btree ("case_id");
