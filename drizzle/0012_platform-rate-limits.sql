CREATE TABLE "rate_limit_buckets" (
	"scope" text NOT NULL,
	"identifier_hash" text NOT NULL,
	"window_started_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"request_count" integer NOT NULL,
	CONSTRAINT "rate_limit_buckets_scope_identifier_hash_pk" PRIMARY KEY("scope","identifier_hash")
);
--> statement-breakpoint
CREATE INDEX "rate_limit_buckets_expires_idx" ON "rate_limit_buckets" USING btree ("expires_at");
--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'res_publica_runtime') THEN
		GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "rate_limit_buckets" TO "res_publica_runtime";
	END IF;
END
$$;
