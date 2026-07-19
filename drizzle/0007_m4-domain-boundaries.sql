ALTER TABLE "ai_query_log" ADD COLUMN "domain" text DEFAULT 'civic' NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_query_log" ADD COLUMN "use_case_id" text DEFAULT 'legacy-unclassified' NOT NULL;--> statement-breakpoint
ALTER TABLE "kg_entities" ADD COLUMN "domain" text DEFAULT 'civic' NOT NULL;--> statement-breakpoint
ALTER TABLE "kg_relationships" ADD COLUMN "domain" text DEFAULT 'civic' NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_query_log" ALTER COLUMN "domain" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ai_query_log" ALTER COLUMN "use_case_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "kg_entities" ALTER COLUMN "domain" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "kg_relationships" ALTER COLUMN "domain" DROP DEFAULT;
