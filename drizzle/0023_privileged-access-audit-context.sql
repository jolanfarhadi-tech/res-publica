ALTER TABLE "audit_log" ADD COLUMN "session_id" text;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "request_id" text;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "capability" text;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "reason_code" text;--> statement-breakpoint
CREATE INDEX "audit_log_session_idx" ON "audit_log" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "audit_log_request_idx" ON "audit_log" USING btree ("request_id");