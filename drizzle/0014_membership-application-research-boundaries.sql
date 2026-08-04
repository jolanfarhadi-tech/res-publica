CREATE TABLE "document_acknowledgements" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"context_type" text NOT NULL,
	"context_id" text NOT NULL,
	"document_type" text NOT NULL,
	"document_version" text NOT NULL,
	"acknowledged_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membership_applications" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"requested_tier" text NOT NULL,
	"status" text NOT NULL,
	"given_name" text NOT NULL,
	"family_name" text NOT NULL,
	"email" text NOT NULL,
	"address" jsonb NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	"decided_at" timestamp with time zone,
	"decided_by_person_id" text,
	"decision_audit_id" text,
	"decision_audit_timestamp" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "project_eligibility_records" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"project_ref" text NOT NULL,
	"status" text NOT NULL,
	"basis" text NOT NULL,
	"project_consent_id" text,
	"reason_code" text NOT NULL,
	"assessed_at" timestamp with time zone NOT NULL,
	"assessed_by_person_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_research_consents" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"project_ref" text NOT NULL,
	"purpose_version" text NOT NULL,
	"purpose" text NOT NULL,
	"data_categories" jsonb NOT NULL,
	"pseudonymization" text NOT NULL,
	"recipients" jsonb NOT NULL,
	"retention_rule" text NOT NULL,
	"status" text NOT NULL,
	"granted_at" timestamp with time zone NOT NULL,
	"withdrawn_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "research_participation_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"status" text NOT NULL,
	"statement_version" text NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL,
	"withdrawn_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "document_acknowledgements" ADD CONSTRAINT "document_acknowledgements_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_acknowledgements" ADD CONSTRAINT "document_acknowledgements_context_id_membership_applications_id_fk" FOREIGN KEY ("context_id") REFERENCES "public"."membership_applications"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_decided_by_person_id_people_id_fk" FOREIGN KEY ("decided_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_eligibility_records" ADD CONSTRAINT "project_eligibility_records_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_eligibility_records" ADD CONSTRAINT "project_eligibility_records_project_consent_id_project_research_consents_id_fk" FOREIGN KEY ("project_consent_id") REFERENCES "public"."project_research_consents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_eligibility_records" ADD CONSTRAINT "project_eligibility_records_assessed_by_person_id_people_id_fk" FOREIGN KEY ("assessed_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_research_consents" ADD CONSTRAINT "project_research_consents_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_participation_preferences" ADD CONSTRAINT "research_participation_preferences_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "document_acknowledgements_context_document_uq" ON "document_acknowledgements" USING btree ("context_type","context_id","document_type");--> statement-breakpoint
CREATE INDEX "document_acknowledgements_person_idx" ON "document_acknowledgements" USING btree ("person_id");--> statement-breakpoint
CREATE UNIQUE INDEX "membership_applications_person_uq" ON "membership_applications" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "membership_applications_status_idx" ON "membership_applications" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "project_eligibility_records_person_project_uq" ON "project_eligibility_records" USING btree ("person_id","project_ref");--> statement-breakpoint
CREATE INDEX "project_eligibility_records_project_idx" ON "project_eligibility_records" USING btree ("project_ref");--> statement-breakpoint
CREATE UNIQUE INDEX "project_research_consents_person_project_purpose_uq" ON "project_research_consents" USING btree ("person_id","project_ref","purpose_version");--> statement-breakpoint
CREATE INDEX "project_research_consents_project_idx" ON "project_research_consents" USING btree ("project_ref");--> statement-breakpoint
CREATE UNIQUE INDEX "research_participation_preferences_person_uq" ON "research_participation_preferences" USING btree ("person_id");