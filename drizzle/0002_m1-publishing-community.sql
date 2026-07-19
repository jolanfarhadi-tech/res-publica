CREATE TABLE "community_members" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"current_stage" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drafts" (
	"id" text PRIMARY KEY NOT NULL,
	"submission_id" text NOT NULL,
	"content" text NOT NULL,
	"citations" jsonb NOT NULL,
	"weak_citation_flags" jsonb NOT NULL,
	"author_type" text NOT NULL,
	"version" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evangelism_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"community_member_id" text NOT NULL,
	"mechanic" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ladder_stage_transitions" (
	"id" text PRIMARY KEY NOT NULL,
	"community_member_id" text NOT NULL,
	"from_stage" text NOT NULL,
	"to_stage" text NOT NULL,
	"triggering_touchpoint" text NOT NULL,
	"related_entity_id" text,
	"timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderation_queue" (
	"id" text PRIMARY KEY NOT NULL,
	"submission_id" text NOT NULL,
	"decision" text NOT NULL,
	"assigned_reviewer_person_id" text,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "publish_commits" (
	"id" text PRIMARY KEY NOT NULL,
	"draft_id" text NOT NULL,
	"status" text NOT NULL,
	"commit_hash" text
);
--> statement-breakpoint
CREATE TABLE "sign_off_records" (
	"id" text PRIMARY KEY NOT NULL,
	"draft_id" text NOT NULL,
	"approver_person_id" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"raw_content" text NOT NULL,
	"submitted_by_person_id" text NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "translation_handoffs" (
	"id" text PRIMARY KEY NOT NULL,
	"draft_id" text NOT NULL,
	"locale" text NOT NULL,
	"status" text NOT NULL,
	"assignee_person_id" text
);
--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evangelism_invitations" ADD CONSTRAINT "evangelism_invitations_community_member_id_community_members_id_fk" FOREIGN KEY ("community_member_id") REFERENCES "public"."community_members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ladder_stage_transitions" ADD CONSTRAINT "ladder_stage_transitions_community_member_id_community_members_id_fk" FOREIGN KEY ("community_member_id") REFERENCES "public"."community_members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_assigned_reviewer_person_id_people_id_fk" FOREIGN KEY ("assigned_reviewer_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publish_commits" ADD CONSTRAINT "publish_commits_draft_id_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."drafts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sign_off_records" ADD CONSTRAINT "sign_off_records_draft_id_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."drafts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sign_off_records" ADD CONSTRAINT "sign_off_records_approver_person_id_people_id_fk" FOREIGN KEY ("approver_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_submitted_by_person_id_people_id_fk" FOREIGN KEY ("submitted_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translation_handoffs" ADD CONSTRAINT "translation_handoffs_draft_id_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."drafts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translation_handoffs" ADD CONSTRAINT "translation_handoffs_assignee_person_id_people_id_fk" FOREIGN KEY ("assignee_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "community_members_person_idx" ON "community_members" USING btree ("person_id");