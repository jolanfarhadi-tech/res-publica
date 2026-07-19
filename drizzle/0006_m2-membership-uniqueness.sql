DROP INDEX "members_person_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "members_person_uq" ON "members" USING btree ("person_id");