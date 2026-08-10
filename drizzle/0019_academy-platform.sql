CREATE TABLE "academy_assessment_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"assessment_id" text NOT NULL,
	"enrollment_id" text NOT NULL,
	"response" text NOT NULL,
	"status" text NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	"reviewed_by_person_id" text,
	"reviewed_at" timestamp with time zone,
	"feedback" text
);
--> statement-breakpoint
CREATE TABLE "academy_assessment_translations" (
	"assessment_id" text NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"prompt" text NOT NULL,
	CONSTRAINT "academy_assessment_translations_assessment_id_locale_pk" PRIMARY KEY("assessment_id","locale")
);
--> statement-breakpoint
CREATE TABLE "academy_assessments" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"module_id" text,
	"required" boolean NOT NULL,
	"review_criteria" jsonb NOT NULL,
	"created_by_person_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy_certificates" (
	"id" text PRIMARY KEY NOT NULL,
	"enrollment_id" text NOT NULL,
	"verification_id" text NOT NULL,
	"statement_version" text NOT NULL,
	"issued_by_person_id" text NOT NULL,
	"issued_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "academy_cohorts" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"enrollment_opens_at" timestamp with time zone NOT NULL,
	"enrollment_closes_at" timestamp with time zone NOT NULL,
	"capacity" integer NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy_course_instructors" (
	"course_id" text NOT NULL,
	"instructor_person_id" text NOT NULL,
	"role" text NOT NULL,
	CONSTRAINT "academy_course_instructors_course_id_instructor_person_id_pk" PRIMARY KEY("course_id","instructor_person_id")
);
--> statement-breakpoint
CREATE TABLE "academy_course_translations" (
	"course_id" text NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"description" text NOT NULL,
	"learning_outcomes" jsonb NOT NULL,
	"source_refs" jsonb NOT NULL,
	"version" integer NOT NULL,
	CONSTRAINT "academy_course_translations_course_id_locale_pk" PRIMARY KEY("course_id","locale")
);
--> statement-breakpoint
CREATE TABLE "academy_courses" (
	"id" text PRIMARY KEY NOT NULL,
	"program_id" text,
	"slug" text NOT NULL,
	"state" text NOT NULL,
	"enrollment_policy" text NOT NULL,
	"created_by_person_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"submitted_for_review_at" timestamp with time zone,
	"reviewed_by_person_id" text,
	"reviewed_at" timestamp with time zone,
	"approved_by_person_id" text,
	"approved_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"version" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy_enrollment_applications" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"cohort_id" text NOT NULL,
	"person_id" text NOT NULL,
	"statement" text NOT NULL,
	"status" text NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	"decided_at" timestamp with time zone,
	"decided_by_person_id" text
);
--> statement-breakpoint
CREATE TABLE "academy_enrollments" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"cohort_id" text NOT NULL,
	"person_id" text NOT NULL,
	"status" text NOT NULL,
	"enrolled_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "academy_instructors" (
	"person_id" text PRIMARY KEY NOT NULL,
	"public_biography_approved" boolean NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"cohort_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"redeemed_by_person_id" text,
	"redeemed_at" timestamp with time zone,
	"created_by_person_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy_lesson_progress" (
	"enrollment_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"status" text NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "academy_lesson_progress_enrollment_id_lesson_id_pk" PRIMARY KEY("enrollment_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "academy_lesson_translations" (
	"lesson_id" text NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"source_refs" jsonb NOT NULL,
	CONSTRAINT "academy_lesson_translations_lesson_id_locale_pk" PRIMARY KEY("lesson_id","locale")
);
--> statement-breakpoint
CREATE TABLE "academy_lessons" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"position" integer NOT NULL,
	"required" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy_module_translations" (
	"module_id" text NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	CONSTRAINT "academy_module_translations_module_id_locale_pk" PRIMARY KEY("module_id","locale")
);
--> statement-breakpoint
CREATE TABLE "academy_modules" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"position" integer NOT NULL,
	"required" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy_program_translations" (
	"program_id" text NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"body" text NOT NULL,
	"source_refs" jsonb NOT NULL,
	"version" integer NOT NULL,
	CONSTRAINT "academy_program_translations_program_id_locale_pk" PRIMARY KEY("program_id","locale")
);
--> statement-breakpoint
CREATE TABLE "academy_programs" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"state" text NOT NULL,
	"created_by_person_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"submitted_for_review_at" timestamp with time zone,
	"approved_by_person_id" text,
	"approved_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"version" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy_resources" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"kind" text NOT NULL,
	"uri" text NOT NULL,
	"locale" text NOT NULL,
	"label" text NOT NULL,
	"accessibility_label" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "academy_assessment_submissions" ADD CONSTRAINT "academy_assessment_submissions_assessment_id_academy_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."academy_assessments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_assessment_submissions" ADD CONSTRAINT "academy_assessment_submissions_enrollment_id_academy_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."academy_enrollments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_assessment_submissions" ADD CONSTRAINT "academy_assessment_submissions_reviewed_by_person_id_people_id_fk" FOREIGN KEY ("reviewed_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_assessment_translations" ADD CONSTRAINT "academy_assessment_translations_assessment_id_academy_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."academy_assessments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_assessments" ADD CONSTRAINT "academy_assessments_course_id_academy_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."academy_courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_assessments" ADD CONSTRAINT "academy_assessments_module_id_academy_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."academy_modules"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_assessments" ADD CONSTRAINT "academy_assessments_created_by_person_id_people_id_fk" FOREIGN KEY ("created_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_certificates" ADD CONSTRAINT "academy_certificates_enrollment_id_academy_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."academy_enrollments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_certificates" ADD CONSTRAINT "academy_certificates_issued_by_person_id_people_id_fk" FOREIGN KEY ("issued_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_cohorts" ADD CONSTRAINT "academy_cohorts_course_id_academy_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."academy_courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_course_instructors" ADD CONSTRAINT "academy_course_instructors_course_id_academy_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."academy_courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_course_instructors" ADD CONSTRAINT "academy_course_instructors_instructor_person_id_academy_instructors_person_id_fk" FOREIGN KEY ("instructor_person_id") REFERENCES "public"."academy_instructors"("person_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_course_translations" ADD CONSTRAINT "academy_course_translations_course_id_academy_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."academy_courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_courses" ADD CONSTRAINT "academy_courses_program_id_academy_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."academy_programs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_courses" ADD CONSTRAINT "academy_courses_created_by_person_id_people_id_fk" FOREIGN KEY ("created_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_courses" ADD CONSTRAINT "academy_courses_reviewed_by_person_id_people_id_fk" FOREIGN KEY ("reviewed_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_courses" ADD CONSTRAINT "academy_courses_approved_by_person_id_people_id_fk" FOREIGN KEY ("approved_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_enrollment_applications" ADD CONSTRAINT "academy_enrollment_applications_course_id_academy_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."academy_courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_enrollment_applications" ADD CONSTRAINT "academy_enrollment_applications_cohort_id_academy_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."academy_cohorts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_enrollment_applications" ADD CONSTRAINT "academy_enrollment_applications_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_enrollment_applications" ADD CONSTRAINT "academy_enrollment_applications_decided_by_person_id_people_id_fk" FOREIGN KEY ("decided_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_enrollments" ADD CONSTRAINT "academy_enrollments_course_id_academy_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."academy_courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_enrollments" ADD CONSTRAINT "academy_enrollments_cohort_id_academy_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."academy_cohorts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_enrollments" ADD CONSTRAINT "academy_enrollments_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_instructors" ADD CONSTRAINT "academy_instructors_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_invitations" ADD CONSTRAINT "academy_invitations_course_id_academy_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."academy_courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_invitations" ADD CONSTRAINT "academy_invitations_cohort_id_academy_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."academy_cohorts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_invitations" ADD CONSTRAINT "academy_invitations_redeemed_by_person_id_people_id_fk" FOREIGN KEY ("redeemed_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_invitations" ADD CONSTRAINT "academy_invitations_created_by_person_id_people_id_fk" FOREIGN KEY ("created_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_lesson_progress" ADD CONSTRAINT "academy_lesson_progress_enrollment_id_academy_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."academy_enrollments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_lesson_progress" ADD CONSTRAINT "academy_lesson_progress_lesson_id_academy_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."academy_lessons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_lesson_translations" ADD CONSTRAINT "academy_lesson_translations_lesson_id_academy_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."academy_lessons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_lessons" ADD CONSTRAINT "academy_lessons_module_id_academy_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."academy_modules"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_module_translations" ADD CONSTRAINT "academy_module_translations_module_id_academy_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."academy_modules"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_modules" ADD CONSTRAINT "academy_modules_course_id_academy_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."academy_courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_program_translations" ADD CONSTRAINT "academy_program_translations_program_id_academy_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."academy_programs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_programs" ADD CONSTRAINT "academy_programs_created_by_person_id_people_id_fk" FOREIGN KEY ("created_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_programs" ADD CONSTRAINT "academy_programs_approved_by_person_id_people_id_fk" FOREIGN KEY ("approved_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_resources" ADD CONSTRAINT "academy_resources_lesson_id_academy_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."academy_lessons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "academy_assessment_submissions_enrollment_assessment_uq" ON "academy_assessment_submissions" USING btree ("enrollment_id","assessment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "academy_certificates_enrollment_uq" ON "academy_certificates" USING btree ("enrollment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "academy_certificates_verification_uq" ON "academy_certificates" USING btree ("verification_id");--> statement-breakpoint
CREATE INDEX "academy_cohorts_course_idx" ON "academy_cohorts" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "academy_courses_slug_uq" ON "academy_courses" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "academy_courses_state_idx" ON "academy_courses" USING btree ("state");--> statement-breakpoint
CREATE INDEX "academy_courses_program_idx" ON "academy_courses" USING btree ("program_id");--> statement-breakpoint
CREATE UNIQUE INDEX "academy_enrollment_applications_person_cohort_uq" ON "academy_enrollment_applications" USING btree ("person_id","cohort_id");--> statement-breakpoint
CREATE INDEX "academy_enrollment_applications_status_idx" ON "academy_enrollment_applications" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "academy_enrollments_person_cohort_uq" ON "academy_enrollments" USING btree ("person_id","cohort_id");--> statement-breakpoint
CREATE INDEX "academy_enrollments_course_idx" ON "academy_enrollments" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "academy_invitations_token_hash_uq" ON "academy_invitations" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "academy_invitations_cohort_idx" ON "academy_invitations" USING btree ("cohort_id");--> statement-breakpoint
CREATE UNIQUE INDEX "academy_lessons_module_position_uq" ON "academy_lessons" USING btree ("module_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "academy_modules_course_position_uq" ON "academy_modules" USING btree ("course_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "academy_programs_slug_uq" ON "academy_programs" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "academy_resources_lesson_position_uq" ON "academy_resources" USING btree ("lesson_id","position");