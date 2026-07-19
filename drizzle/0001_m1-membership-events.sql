CREATE TABLE "event_qa_log" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"citations" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"location" text NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"capacity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "institutional_supporter_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"organization_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"tier" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membership_benefit_grants" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"benefit_name" text NOT NULL,
	"granted_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "status_changes" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"previous_status" text NOT NULL,
	"current_status" text NOT NULL,
	"triggering_activity" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outcome_publications" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"summary" text NOT NULL,
	"published_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurring_pledges" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"payment_id" text,
	"amount" numeric(14, 2) NOT NULL,
	"currency" text NOT NULL,
	"interval_months" integer NOT NULL,
	"active" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"person_id" text NOT NULL,
	"status" text NOT NULL,
	"registered_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlist_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"registration_id" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_qa_log" ADD CONSTRAINT "event_qa_log_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "institutional_supporter_profiles" ADD CONSTRAINT "institutional_supporter_profiles_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "institutional_supporter_profiles" ADD CONSTRAINT "institutional_supporter_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_benefit_grants" ADD CONSTRAINT "membership_benefit_grants_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_changes" ADD CONSTRAINT "status_changes_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outcome_publications" ADD CONSTRAINT "outcome_publications_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_pledges" ADD CONSTRAINT "recurring_pledges_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_pledges" ADD CONSTRAINT "recurring_pledges_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "members_person_idx" ON "members" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "status_changes_member_idx" ON "status_changes" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "registrations_event_person_idx" ON "registrations" USING btree ("event_id","person_id");