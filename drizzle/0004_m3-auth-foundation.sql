CREATE TABLE "auth_identities" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"issuer" text NOT NULL,
	"subject" text NOT NULL,
	"linked_at" timestamp with time zone NOT NULL,
	"disabled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"auth_identity_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"assurance" text NOT NULL,
	"authenticated_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "authorization_grants" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"domain" text NOT NULL,
	"capability" text NOT NULL,
	"target" text,
	"assurance_required" text NOT NULL,
	"valid_from" timestamp with time zone NOT NULL,
	"valid_until" timestamp with time zone,
	"granted_by_person_id" text NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_auth_identity_id_auth_identities_id_fk" FOREIGN KEY ("auth_identity_id") REFERENCES "public"."auth_identities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authorization_grants" ADD CONSTRAINT "authorization_grants_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authorization_grants" ADD CONSTRAINT "authorization_grants_granted_by_person_id_people_id_fk" FOREIGN KEY ("granted_by_person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_identities_issuer_subject_uq" ON "auth_identities" USING btree ("issuer","subject");--> statement-breakpoint
CREATE INDEX "auth_identities_person_idx" ON "auth_identities" USING btree ("person_id");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_sessions_token_hash_uq" ON "auth_sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "auth_sessions_identity_idx" ON "auth_sessions" USING btree ("auth_identity_id");--> statement-breakpoint
CREATE INDEX "authorization_grants_person_domain_idx" ON "authorization_grants" USING btree ("person_id","domain");