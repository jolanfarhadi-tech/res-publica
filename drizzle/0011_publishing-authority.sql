ALTER TABLE "submissions" ADD COLUMN "publication_scope" text DEFAULT 'website' NOT NULL;
--> statement-breakpoint
ALTER TABLE "drafts" ADD COLUMN "authored_by_person_id" text;
--> statement-breakpoint
ALTER TABLE "drafts" ADD COLUMN "created_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_authored_by_person_id_people_id_fk" FOREIGN KEY ("authored_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "translation_handoffs" ADD COLUMN "finalized_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "translation_handoffs" ADD COLUMN "assigned_by_person_id" text;
--> statement-breakpoint
ALTER TABLE "translation_handoffs" ADD COLUMN "content" text;
--> statement-breakpoint
ALTER TABLE "translation_handoffs" ADD CONSTRAINT "translation_handoffs_assigned_by_person_id_people_id_fk" FOREIGN KEY ("assigned_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "translation_handoffs_draft_locale_uq" ON "translation_handoffs" USING btree ("draft_id","locale");
--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD COLUMN "draft_id" text;
--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD COLUMN "assigned_by_person_id" text;
--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD COLUMN "assigned_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD COLUMN "decided_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_draft_id_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."drafts"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_assigned_by_person_id_people_id_fk" FOREIGN KEY ("assigned_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "moderation_queue_draft_uq" ON "moderation_queue" USING btree ("draft_id");
--> statement-breakpoint
ALTER TABLE "publish_commits" ADD COLUMN "supersedes_publish_commit_id" text;
--> statement-breakpoint
ALTER TABLE "publish_commits" ADD COLUMN "created_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "publish_commits" ADD CONSTRAINT "publish_commits_supersedes_publish_commit_id_publish_commits_id_fk" FOREIGN KEY ("supersedes_publish_commit_id") REFERENCES "public"."publish_commits"("id") ON DELETE restrict ON UPDATE no action;
