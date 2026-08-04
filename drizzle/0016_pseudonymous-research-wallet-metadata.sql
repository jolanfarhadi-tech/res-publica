CREATE TABLE "research_wallet_activation_records" (
	"id" text PRIMARY KEY NOT NULL,
	"wallet_id" text NOT NULL,
	"person_id" text NOT NULL,
	"consent_version" text NOT NULL,
	"granted_at" timestamp with time zone NOT NULL,
	"withdrawn_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "research_wallet_device_bindings" (
	"id" text PRIMARY KEY NOT NULL,
	"wallet_id" text NOT NULL,
	"holder_key_thumbprint" text NOT NULL,
	"bound_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "research_wallets" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"status" text NOT NULL,
	"protocol_profile" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"activated_at" timestamp with time zone,
	"suspended_at" timestamp with time zone,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "research_wallet_activation_records" ADD CONSTRAINT "research_wallet_activation_records_wallet_id_research_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."research_wallets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_wallet_activation_records" ADD CONSTRAINT "research_wallet_activation_records_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_wallet_device_bindings" ADD CONSTRAINT "research_wallet_device_bindings_wallet_id_research_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."research_wallets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_wallets" ADD CONSTRAINT "research_wallets_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "research_wallet_activation_records_wallet_idx" ON "research_wallet_activation_records" USING btree ("wallet_id");--> statement-breakpoint
CREATE UNIQUE INDEX "research_wallet_device_bindings_thumbprint_uq" ON "research_wallet_device_bindings" USING btree ("holder_key_thumbprint");--> statement-breakpoint
CREATE INDEX "research_wallet_device_bindings_wallet_idx" ON "research_wallet_device_bindings" USING btree ("wallet_id");--> statement-breakpoint
CREATE UNIQUE INDEX "research_wallets_person_uq" ON "research_wallets" USING btree ("person_id");