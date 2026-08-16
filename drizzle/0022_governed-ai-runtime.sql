ALTER TABLE "ai_query_log" ADD COLUMN "actor_person_id" text;--> statement-breakpoint
ALTER TABLE "ai_query_log" ADD COLUMN "request_id" text;--> statement-breakpoint
ALTER TABLE "ai_query_log" ADD COLUMN "prompt_hash" text;--> statement-breakpoint
ALTER TABLE "ai_query_log" ADD COLUMN "policy_id" text;--> statement-breakpoint
ALTER TABLE "ai_query_log" ADD COLUMN "input_class" text;--> statement-breakpoint
ALTER TABLE "ai_query_log" ADD COLUMN "provider_mode" text;--> statement-breakpoint
ALTER TABLE "ai_query_log" ADD COLUMN "citations" jsonb;--> statement-breakpoint
ALTER TABLE "ai_query_log" ADD COLUMN "answer_digest" text;--> statement-breakpoint
ALTER TABLE "ai_query_log" ADD CONSTRAINT "ai_query_log_actor_person_id_people_id_fk" FOREIGN KEY ("actor_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;