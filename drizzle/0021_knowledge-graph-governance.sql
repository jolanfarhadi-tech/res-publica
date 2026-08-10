CREATE TABLE "kg_candidates" (
	"id" text PRIMARY KEY NOT NULL,
	"build_id" text NOT NULL,
	"domain" text NOT NULL,
	"kind" text NOT NULL,
	"candidate_key" text NOT NULL,
	"fingerprint" text NOT NULL,
	"payload" jsonb NOT NULL,
	"sources" jsonb NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"decided_at" timestamp with time zone,
	"decided_by_person_id" text,
	"decision_reason" text
);
--> statement-breakpoint
CREATE TABLE "kg_graph_builds" (
	"id" text PRIMARY KEY NOT NULL,
	"domain" text NOT NULL,
	"commit_sha" text NOT NULL,
	"extractor_name" text NOT NULL,
	"content_digest" text NOT NULL,
	"status" text NOT NULL,
	"candidate_count" integer NOT NULL,
	"initiated_by_person_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "kg_provenance" (
	"id" text PRIMARY KEY NOT NULL,
	"candidate_id" text NOT NULL,
	"domain" text NOT NULL,
	"target_kind" text NOT NULL,
	"target_key" text NOT NULL,
	"source_file" text NOT NULL,
	"source_locale" text NOT NULL,
	"canonical_source" text,
	"source_digest" text NOT NULL,
	"public_eligible" boolean NOT NULL,
	"commit_sha" text NOT NULL,
	"extractor_name" text NOT NULL,
	"approved_by_person_id" text NOT NULL,
	"approved_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kg_candidates" ADD CONSTRAINT "kg_candidates_build_id_kg_graph_builds_id_fk" FOREIGN KEY ("build_id") REFERENCES "public"."kg_graph_builds"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kg_candidates" ADD CONSTRAINT "kg_candidates_decided_by_person_id_people_id_fk" FOREIGN KEY ("decided_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kg_graph_builds" ADD CONSTRAINT "kg_graph_builds_initiated_by_person_id_people_id_fk" FOREIGN KEY ("initiated_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kg_provenance" ADD CONSTRAINT "kg_provenance_candidate_id_kg_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."kg_candidates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kg_provenance" ADD CONSTRAINT "kg_provenance_approved_by_person_id_people_id_fk" FOREIGN KEY ("approved_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "kg_candidates_build_fingerprint_uq" ON "kg_candidates" USING btree ("build_id","fingerprint");--> statement-breakpoint
CREATE INDEX "kg_candidates_domain_status_idx" ON "kg_candidates" USING btree ("domain","status");--> statement-breakpoint
CREATE UNIQUE INDEX "kg_graph_builds_reproducible_uq" ON "kg_graph_builds" USING btree ("domain","commit_sha","extractor_name","content_digest");--> statement-breakpoint
CREATE INDEX "kg_graph_builds_domain_created_idx" ON "kg_graph_builds" USING btree ("domain","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "kg_provenance_candidate_source_uq" ON "kg_provenance" USING btree ("candidate_id","source_file","source_locale");--> statement-breakpoint
CREATE INDEX "kg_provenance_public_target_idx" ON "kg_provenance" USING btree ("public_eligible","target_kind","target_key");