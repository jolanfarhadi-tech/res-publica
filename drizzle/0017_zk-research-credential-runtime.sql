CREATE TABLE "research_credential_issuance_challenges" (
	"challenge_hash" text PRIMARY KEY NOT NULL,
	"wallet_id" text NOT NULL,
	"device_binding_id" text NOT NULL,
	"project_ref" text NOT NULL,
	"project_digest" text NOT NULL,
	"audience_hash" text NOT NULL,
	"project_public_key" jsonb NOT NULL,
	"consent_digest" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_wallet_recovery_events" (
	"id" text PRIMARY KEY NOT NULL,
	"wallet_id" text NOT NULL,
	"event_type" text NOT NULL,
	"previous_device_binding_id" text,
	"new_device_binding_id" text,
	"performed_by_person_id" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "research_wallet_device_bindings" ADD COLUMN "holder_public_key" jsonb;--> statement-breakpoint
ALTER TABLE "research_credential_issuance_challenges" ADD CONSTRAINT "research_credential_issuance_challenges_wallet_id_research_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."research_wallets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_credential_issuance_challenges" ADD CONSTRAINT "research_credential_issuance_challenges_device_binding_id_research_wallet_device_bindings_id_fk" FOREIGN KEY ("device_binding_id") REFERENCES "public"."research_wallet_device_bindings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_wallet_recovery_events" ADD CONSTRAINT "research_wallet_recovery_events_wallet_id_research_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."research_wallets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_wallet_recovery_events" ADD CONSTRAINT "research_wallet_recovery_events_previous_device_binding_id_research_wallet_device_bindings_id_fk" FOREIGN KEY ("previous_device_binding_id") REFERENCES "public"."research_wallet_device_bindings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_wallet_recovery_events" ADD CONSTRAINT "research_wallet_recovery_events_new_device_binding_id_research_wallet_device_bindings_id_fk" FOREIGN KEY ("new_device_binding_id") REFERENCES "public"."research_wallet_device_bindings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_wallet_recovery_events" ADD CONSTRAINT "research_wallet_recovery_events_performed_by_person_id_people_id_fk" FOREIGN KEY ("performed_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "research_credential_challenges_expires_idx" ON "research_credential_issuance_challenges" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "research_wallet_recovery_events_wallet_idx" ON "research_wallet_recovery_events" USING btree ("wallet_id");
