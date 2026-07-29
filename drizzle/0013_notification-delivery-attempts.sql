CREATE TABLE "notification_delivery_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"notification_id" text NOT NULL,
	"attempt_number" integer NOT NULL,
	"provider" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"status" text NOT NULL,
	"retryable" boolean,
	"provider_message_id" text,
	"error_code" text,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "notification_delivery_attempts" ADD CONSTRAINT "notification_delivery_attempts_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "notification_delivery_attempts_notification_number_uq" ON "notification_delivery_attempts" USING btree ("notification_id","attempt_number");--> statement-breakpoint
CREATE UNIQUE INDEX "notification_delivery_attempts_idempotency_uq" ON "notification_delivery_attempts" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "notification_delivery_attempts_notification_idx" ON "notification_delivery_attempts" USING btree ("notification_id");--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'res_publica_runtime') THEN
		GRANT SELECT, INSERT, UPDATE ON TABLE "notification_delivery_attempts" TO "res_publica_runtime";
	END IF;
END
$$;
