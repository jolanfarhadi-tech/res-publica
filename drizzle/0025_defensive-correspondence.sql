CREATE TABLE "security_defensive_action_events" (
	"id" text PRIMARY KEY NOT NULL,
	"action_id" text NOT NULL,
	"state" text NOT NULL,
	"actor_person_id" text NOT NULL,
	"request_id" text NOT NULL,
	"evidence_hash" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_defensive_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"incident_id" text NOT NULL,
	"policy_id" text NOT NULL,
	"evidence_level" text NOT NULL,
	"action" text NOT NULL,
	"action_class" integer NOT NULL,
	"disposition" text NOT NULL,
	"approval_count" integer NOT NULL,
	"reversibility" text NOT NULL,
	"target_asset" text NOT NULL,
	"target_scope" text NOT NULL,
	"event_ids" jsonb NOT NULL,
	"evidence_ids" jsonb NOT NULL,
	"contradictory_evidence" jsonb NOT NULL,
	"rationale" text NOT NULL,
	"proposed_by_person_id" text NOT NULL,
	"proposed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_defensive_signals" (
	"id" text PRIMARY KEY NOT NULL,
	"incident_id" text NOT NULL,
	"sequence" integer NOT NULL,
	"loop" integer NOT NULL,
	"kind" text NOT NULL,
	"evidence_ids" jsonb NOT NULL,
	"target_asset" text NOT NULL,
	"target_scope" text NOT NULL,
	"contradictory_evidence" jsonb NOT NULL,
	"compromise_confirmed" boolean NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"evidence_hash" text NOT NULL,
	"recorded_by_person_id" text NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "security_defensive_action_events" ADD CONSTRAINT "security_defensive_action_events_action_id_security_defensive_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."security_defensive_actions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_defensive_action_events" ADD CONSTRAINT "security_defensive_action_events_actor_person_id_people_id_fk" FOREIGN KEY ("actor_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_defensive_actions" ADD CONSTRAINT "security_defensive_actions_incident_id_security_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."security_incidents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_defensive_actions" ADD CONSTRAINT "security_defensive_actions_proposed_by_person_id_people_id_fk" FOREIGN KEY ("proposed_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_defensive_signals" ADD CONSTRAINT "security_defensive_signals_incident_id_security_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."security_incidents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_defensive_signals" ADD CONSTRAINT "security_defensive_signals_recorded_by_person_id_people_id_fk" FOREIGN KEY ("recorded_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "security_defensive_action_events_action_time_idx" ON "security_defensive_action_events" USING btree ("action_id","occurred_at");--> statement-breakpoint
CREATE INDEX "security_defensive_actions_incident_time_idx" ON "security_defensive_actions" USING btree ("incident_id","proposed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "security_defensive_signals_incident_sequence_uq" ON "security_defensive_signals" USING btree ("incident_id","sequence");--> statement-breakpoint
CREATE INDEX "security_defensive_signals_incident_time_idx" ON "security_defensive_signals" USING btree ("incident_id","observed_at");--> statement-breakpoint
CREATE TRIGGER security_defensive_signals_no_update_or_delete
BEFORE UPDATE OR DELETE ON "security_defensive_signals"
FOR EACH ROW EXECUTE FUNCTION prevent_security_evidence_mutation();--> statement-breakpoint
CREATE TRIGGER security_defensive_actions_no_update_or_delete
BEFORE UPDATE OR DELETE ON "security_defensive_actions"
FOR EACH ROW EXECUTE FUNCTION prevent_security_evidence_mutation();--> statement-breakpoint
CREATE TRIGGER security_defensive_action_events_no_update_or_delete
BEFORE UPDATE OR DELETE ON "security_defensive_action_events"
FOR EACH ROW EXECUTE FUNCTION prevent_security_evidence_mutation();
