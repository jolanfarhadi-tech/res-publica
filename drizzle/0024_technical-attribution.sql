CREATE TABLE "security_attribution_claims" (
	"id" text PRIMARY KEY NOT NULL,
	"incident_id" text NOT NULL,
	"level" text NOT NULL,
	"claim" text NOT NULL,
	"observed_evidence" jsonb NOT NULL,
	"inferences" jsonb NOT NULL,
	"contradictory_evidence" jsonb NOT NULL,
	"alternative_explanations" jsonb NOT NULL,
	"confidence" text NOT NULL,
	"source" text NOT NULL,
	"authored_by_person_id" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_incident_correlations" (
	"id" text PRIMARY KEY NOT NULL,
	"left_incident_id" text NOT NULL,
	"right_incident_id" text NOT NULL,
	"relation" text NOT NULL,
	"matching_signals" jsonb NOT NULL,
	"contradictory_signals" jsonb NOT NULL,
	"alternative_explanations" jsonb NOT NULL,
	"reviewed_by_person_id" text NOT NULL,
	"reviewed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_incidents" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"severity" text NOT NULL,
	"status" text NOT NULL,
	"affected_assets" jsonb NOT NULL,
	"opened_by_person_id" text NOT NULL,
	"opened_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_observations" (
	"id" text PRIMARY KEY NOT NULL,
	"incident_id" text NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"source" text NOT NULL,
	"source_handle" text,
	"source_port" integer,
	"actor_handle" text,
	"session_handle" text,
	"api_credential_handle" text,
	"route_sequence" jsonb NOT NULL,
	"user_agent_family" text,
	"protocol" text,
	"tls_version" text,
	"techniques" jsonb NOT NULL,
	"affected_assets" jsonb NOT NULL,
	"evidence_hash" text NOT NULL,
	"recorded_by_person_id" text NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "security_attribution_claims" ADD CONSTRAINT "security_attribution_claims_incident_id_security_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."security_incidents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_attribution_claims" ADD CONSTRAINT "security_attribution_claims_authored_by_person_id_people_id_fk" FOREIGN KEY ("authored_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_incident_correlations" ADD CONSTRAINT "security_incident_correlations_left_incident_id_security_incidents_id_fk" FOREIGN KEY ("left_incident_id") REFERENCES "public"."security_incidents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_incident_correlations" ADD CONSTRAINT "security_incident_correlations_right_incident_id_security_incidents_id_fk" FOREIGN KEY ("right_incident_id") REFERENCES "public"."security_incidents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_incident_correlations" ADD CONSTRAINT "security_incident_correlations_reviewed_by_person_id_people_id_fk" FOREIGN KEY ("reviewed_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_incidents" ADD CONSTRAINT "security_incidents_opened_by_person_id_people_id_fk" FOREIGN KEY ("opened_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_observations" ADD CONSTRAINT "security_observations_incident_id_security_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."security_incidents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_observations" ADD CONSTRAINT "security_observations_recorded_by_person_id_people_id_fk" FOREIGN KEY ("recorded_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "security_attribution_claims_incident_time_idx" ON "security_attribution_claims" USING btree ("incident_id","timestamp");--> statement-breakpoint
CREATE UNIQUE INDEX "security_incident_correlations_pair_uq" ON "security_incident_correlations" USING btree ("left_incident_id","right_incident_id");--> statement-breakpoint
CREATE INDEX "security_incident_correlations_left_idx" ON "security_incident_correlations" USING btree ("left_incident_id");--> statement-breakpoint
CREATE INDEX "security_incident_correlations_right_idx" ON "security_incident_correlations" USING btree ("right_incident_id");--> statement-breakpoint
CREATE INDEX "security_incidents_status_opened_idx" ON "security_incidents" USING btree ("status","opened_at");--> statement-breakpoint
CREATE INDEX "security_observations_incident_time_idx" ON "security_observations" USING btree ("incident_id","observed_at");--> statement-breakpoint
CREATE INDEX "security_observations_source_handle_idx" ON "security_observations" USING btree ("source_handle");--> statement-breakpoint
CREATE FUNCTION prevent_security_evidence_mutation() RETURNS trigger AS $$
BEGIN
	RAISE EXCEPTION 'security evidence is append-only';
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER security_observations_no_update_or_delete
BEFORE UPDATE OR DELETE ON "security_observations"
FOR EACH ROW EXECUTE FUNCTION prevent_security_evidence_mutation();--> statement-breakpoint
CREATE TRIGGER security_attribution_claims_no_update_or_delete
BEFORE UPDATE OR DELETE ON "security_attribution_claims"
FOR EACH ROW EXECUTE FUNCTION prevent_security_evidence_mutation();--> statement-breakpoint
CREATE TRIGGER security_incident_correlations_no_update_or_delete
BEFORE UPDATE OR DELETE ON "security_incident_correlations"
FOR EACH ROW EXECUTE FUNCTION prevent_security_evidence_mutation();
