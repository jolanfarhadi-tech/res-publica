CREATE TABLE "fellowship_attributions" (
	"id" text PRIMARY KEY NOT NULL,
	"fellowship_id" text NOT NULL,
	"publication_reference" text NOT NULL,
	"credit_text" text NOT NULL,
	"public_display_approved" boolean NOT NULL,
	"approved_by_person_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_candidacies" (
	"id" text PRIMARY KEY NOT NULL,
	"candidate_person_id" text NOT NULL,
	"source_type" text NOT NULL,
	"submitted_by_person_id" text NOT NULL,
	"role_scope_id" text NOT NULL,
	"rationale" text NOT NULL,
	"status" text NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	"entered_review_at" timestamp with time zone,
	"decided_at" timestamp with time zone,
	"decided_by_person_id" text,
	"decision_reason" text,
	"member_facing_reason" text
);
--> statement-breakpoint
CREATE TABLE "fellowship_conflict_declarations" (
	"id" text PRIMARY KEY NOT NULL,
	"assignment_id" text NOT NULL,
	"reviewer_person_id" text NOT NULL,
	"has_conflict" boolean NOT NULL,
	"declaration_text" text NOT NULL,
	"declared_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_evidence_refs" (
	"id" text PRIMARY KEY NOT NULL,
	"candidacy_id" text NOT NULL,
	"kind" text NOT NULL,
	"source_ref" text NOT NULL,
	"description" text NOT NULL,
	"added_by_person_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_records" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"role_scope_id" text NOT NULL,
	"candidacy_id" text NOT NULL,
	"sponsor_person_id" text NOT NULL,
	"status" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"review_due_at" timestamp with time zone,
	"ended_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fellowship_review_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"candidacy_id" text NOT NULL,
	"reviewer_person_id" text NOT NULL,
	"assigned_by_person_id" text NOT NULL,
	"status" text NOT NULL,
	"assigned_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fellowship_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"assignment_id" text NOT NULL,
	"reviewer_person_id" text NOT NULL,
	"recommendation" text NOT NULL,
	"rationale" text NOT NULL,
	"reviewed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_role_scopes" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"labels" jsonb NOT NULL,
	"responsibilities" jsonb NOT NULL,
	"source_refs" jsonb NOT NULL,
	"state" text NOT NULL,
	"created_by_person_id" text NOT NULL,
	"approved_by_person_id" text,
	"created_at" timestamp with time zone NOT NULL,
	"approved_at" timestamp with time zone,
	"retired_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fellowship_status_changes" (
	"id" text PRIMARY KEY NOT NULL,
	"fellowship_id" text NOT NULL,
	"from_status" text NOT NULL,
	"to_status" text NOT NULL,
	"reason" text NOT NULL,
	"changed_by_person_id" text NOT NULL,
	"changed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fellowship_attributions" ADD CONSTRAINT "fellowship_attributions_fellowship_id_fellowship_records_id_fk" FOREIGN KEY ("fellowship_id") REFERENCES "public"."fellowship_records"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_attributions" ADD CONSTRAINT "fellowship_attributions_approved_by_person_id_people_id_fk" FOREIGN KEY ("approved_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_candidacies" ADD CONSTRAINT "fellowship_candidacies_candidate_person_id_people_id_fk" FOREIGN KEY ("candidate_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_candidacies" ADD CONSTRAINT "fellowship_candidacies_submitted_by_person_id_people_id_fk" FOREIGN KEY ("submitted_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_candidacies" ADD CONSTRAINT "fellowship_candidacies_role_scope_id_fellowship_role_scopes_id_fk" FOREIGN KEY ("role_scope_id") REFERENCES "public"."fellowship_role_scopes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_candidacies" ADD CONSTRAINT "fellowship_candidacies_decided_by_person_id_people_id_fk" FOREIGN KEY ("decided_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_conflict_declarations" ADD CONSTRAINT "fellowship_conflict_declarations_assignment_id_fellowship_review_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."fellowship_review_assignments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_conflict_declarations" ADD CONSTRAINT "fellowship_conflict_declarations_reviewer_person_id_people_id_fk" FOREIGN KEY ("reviewer_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_evidence_refs" ADD CONSTRAINT "fellowship_evidence_refs_candidacy_id_fellowship_candidacies_id_fk" FOREIGN KEY ("candidacy_id") REFERENCES "public"."fellowship_candidacies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_evidence_refs" ADD CONSTRAINT "fellowship_evidence_refs_added_by_person_id_people_id_fk" FOREIGN KEY ("added_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_records" ADD CONSTRAINT "fellowship_records_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_records" ADD CONSTRAINT "fellowship_records_role_scope_id_fellowship_role_scopes_id_fk" FOREIGN KEY ("role_scope_id") REFERENCES "public"."fellowship_role_scopes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_records" ADD CONSTRAINT "fellowship_records_candidacy_id_fellowship_candidacies_id_fk" FOREIGN KEY ("candidacy_id") REFERENCES "public"."fellowship_candidacies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_records" ADD CONSTRAINT "fellowship_records_sponsor_person_id_people_id_fk" FOREIGN KEY ("sponsor_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_review_assignments" ADD CONSTRAINT "fellowship_review_assignments_candidacy_id_fellowship_candidacies_id_fk" FOREIGN KEY ("candidacy_id") REFERENCES "public"."fellowship_candidacies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_review_assignments" ADD CONSTRAINT "fellowship_review_assignments_reviewer_person_id_people_id_fk" FOREIGN KEY ("reviewer_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_review_assignments" ADD CONSTRAINT "fellowship_review_assignments_assigned_by_person_id_people_id_fk" FOREIGN KEY ("assigned_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_reviews" ADD CONSTRAINT "fellowship_reviews_assignment_id_fellowship_review_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."fellowship_review_assignments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_reviews" ADD CONSTRAINT "fellowship_reviews_reviewer_person_id_people_id_fk" FOREIGN KEY ("reviewer_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_role_scopes" ADD CONSTRAINT "fellowship_role_scopes_created_by_person_id_people_id_fk" FOREIGN KEY ("created_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_role_scopes" ADD CONSTRAINT "fellowship_role_scopes_approved_by_person_id_people_id_fk" FOREIGN KEY ("approved_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_status_changes" ADD CONSTRAINT "fellowship_status_changes_fellowship_id_fellowship_records_id_fk" FOREIGN KEY ("fellowship_id") REFERENCES "public"."fellowship_records"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_status_changes" ADD CONSTRAINT "fellowship_status_changes_changed_by_person_id_people_id_fk" FOREIGN KEY ("changed_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fellowship_candidacies_candidate_idx" ON "fellowship_candidacies" USING btree ("candidate_person_id");--> statement-breakpoint
CREATE INDEX "fellowship_candidacies_status_idx" ON "fellowship_candidacies" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "fellowship_conflict_declarations_assignment_uq" ON "fellowship_conflict_declarations" USING btree ("assignment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fellowship_records_candidacy_uq" ON "fellowship_records" USING btree ("candidacy_id");--> statement-breakpoint
CREATE INDEX "fellowship_records_person_idx" ON "fellowship_records" USING btree ("person_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fellowship_review_assignments_candidacy_reviewer_uq" ON "fellowship_review_assignments" USING btree ("candidacy_id","reviewer_person_id");--> statement-breakpoint
CREATE INDEX "fellowship_review_assignments_candidacy_idx" ON "fellowship_review_assignments" USING btree ("candidacy_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fellowship_reviews_assignment_uq" ON "fellowship_reviews" USING btree ("assignment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fellowship_role_scopes_slug_uq" ON "fellowship_role_scopes" USING btree ("slug");