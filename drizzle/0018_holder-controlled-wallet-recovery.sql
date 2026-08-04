CREATE TABLE "research_wallet_recovery_challenges" (
	"challenge_hash" text PRIMARY KEY NOT NULL,
	"wallet_id" text NOT NULL,
	"audience_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "research_wallets" ADD COLUMN "recovery_public_key" jsonb;--> statement-breakpoint
ALTER TABLE "research_wallet_recovery_challenges" ADD CONSTRAINT "research_wallet_recovery_challenges_wallet_id_research_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."research_wallets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "research_wallet_recovery_challenges_expires_idx" ON "research_wallet_recovery_challenges" USING btree ("expires_at");
