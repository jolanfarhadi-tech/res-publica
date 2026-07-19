CREATE TABLE "evidence_quality_assessments" ("id" text PRIMARY KEY NOT NULL,"evidence_item_id" text NOT NULL,"reviewer_person_id" text NOT NULL,"satisfied_criteria" jsonb NOT NULL,"contradictions" jsonb NOT NULL,"corroborating_evidence_item_ids" jsonb NOT NULL,"confidence" text NOT NULL,"reviewed_at" timestamp with time zone NOT NULL);
--> statement-breakpoint
CREATE TABLE "documentation_quality_reviews" ("id" text PRIMARY KEY NOT NULL,"case_id" text NOT NULL,"artifact_reference" text NOT NULL,"reviewer_person_id" text NOT NULL,"outcome" text NOT NULL,"findings" jsonb NOT NULL,"reviewed_at" timestamp with time zone NOT NULL);
--> statement-breakpoint
CREATE TABLE "hearing_quality_reviews" ("id" text PRIMARY KEY NOT NULL,"hearing_id" text NOT NULL,"reviewer_person_id" text NOT NULL,"outcome" text NOT NULL,"recommendations" jsonb NOT NULL,"reviewed_at" timestamp with time zone NOT NULL);
--> statement-breakpoint
CREATE TABLE "scientific_reviews" ("id" text PRIMARY KEY NOT NULL,"case_id" text NOT NULL,"reviewer_person_ids" jsonb NOT NULL,"conflict_declarations_complete" boolean NOT NULL,"methodology_assessment" text NOT NULL,"evidence_assessment" text NOT NULL,"findings" text NOT NULL,"scientific_confidence" integer NOT NULL,"recommendations" jsonb NOT NULL,"output" text NOT NULL,"decided_at" timestamp with time zone NOT NULL);
--> statement-breakpoint
CREATE TABLE "repair_plans" ("id" text PRIMARY KEY NOT NULL,"case_id" text NOT NULL,"approved_scientific_review_id" text NOT NULL,"plan" jsonb NOT NULL,"created_by_person_id" text NOT NULL,"created_at" timestamp with time zone NOT NULL);
--> statement-breakpoint
ALTER TABLE "evidence_quality_assessments" ADD CONSTRAINT "eqa_evidence_fk" FOREIGN KEY ("evidence_item_id") REFERENCES "public"."harm_evidence_items"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "evidence_quality_assessments" ADD CONSTRAINT "eqa_reviewer_fk" FOREIGN KEY ("reviewer_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "documentation_quality_reviews" ADD CONSTRAINT "dqr_case_fk" FOREIGN KEY ("case_id") REFERENCES "public"."harm_cases"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "documentation_quality_reviews" ADD CONSTRAINT "dqr_reviewer_fk" FOREIGN KEY ("reviewer_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "hearing_quality_reviews" ADD CONSTRAINT "hqr_hearing_fk" FOREIGN KEY ("hearing_id") REFERENCES "public"."structured_hearings"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "hearing_quality_reviews" ADD CONSTRAINT "hqr_reviewer_fk" FOREIGN KEY ("reviewer_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "scientific_reviews" ADD CONSTRAINT "scientific_reviews_case_fk" FOREIGN KEY ("case_id") REFERENCES "public"."harm_cases"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "repair_plans" ADD CONSTRAINT "repair_plans_case_fk" FOREIGN KEY ("case_id") REFERENCES "public"."harm_cases"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "repair_plans" ADD CONSTRAINT "repair_plans_review_fk" FOREIGN KEY ("approved_scientific_review_id") REFERENCES "public"."scientific_reviews"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "repair_plans" ADD CONSTRAINT "repair_plans_creator_fk" FOREIGN KEY ("created_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;
