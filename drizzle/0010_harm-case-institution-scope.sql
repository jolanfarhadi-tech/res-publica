ALTER TABLE "harm_cases" ADD COLUMN "institution_id" text;
--> statement-breakpoint
UPDATE "harm_cases" SET "institution_id" = (
  SELECT "id" FROM "organizations" ORDER BY "created_at" ASC LIMIT 1
) WHERE "institution_id" IS NULL;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "harm_cases" WHERE "institution_id" IS NULL) THEN
    RAISE EXCEPTION 'Cannot scope existing harm cases: no organization exists';
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "harm_cases" ALTER COLUMN "institution_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "harm_cases" ADD CONSTRAINT "harm_cases_institution_id_organizations_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "harm_cases_institution_idx" ON "harm_cases" USING btree ("institution_id");
