import { mkdtemp, rm } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterEach, describe, expect, it } from "vitest";
import type { AuthenticatedActor } from "../auth/types";
import type { Database } from "../persistence";
import * as coreSchema from "../persistence/schema";
import * as moduleSchema from "../persistence/module-schema";
import { auditLog, people } from "../persistence/schema";
import { drafts, moderationQueue, publishCommits, signOffRecords, translationHandoffs } from "../persistence/module-schema";
import { editorialCapability, type EditorialRole } from "../modules/publishing/authority";
import { assignReviewer, createDraftVersion, createSubmission, createTranslationAssignment,
  decideModeration, finalizeTranslation, signOffAndMarkReady } from "./publishing";

const directories: string[] = [];
afterEach(async () => Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true }))));

function actor(personId: string, role: EditorialRole): AuthenticatedActor {
  return { personId, sessionId: `session-${personId}`, authenticatedAt: new Date(), assurance: "mfa", grants: [{
    id: `grant-${personId}`, personId, domain: "civic", capability: editorialCapability(role), target: "website",
    assuranceRequired: "mfa", validFrom: new Date(0), validUntil: null, revokedAt: null,
  }] };
}

describe("ADR-036 Publishing application workflow", () => {
  it("persists a separated human workflow and stops at ready with atomic audit evidence", async () => {
    const directory = await mkdtemp(join(tmpdir(), "res-publica-publishing-")); directories.push(directory);
    const client = new PGlite(directory);
    const db = drizzle({ client, schema: { ...coreSchema, ...moduleSchema } });
    await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
    const serviceDb = db as unknown as Database;
    const now = new Date();
    await db.insert(people).values([
      { id: "editor", name: "Editor", contact: { email: "editor@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "reviewer", name: "Reviewer", contact: { email: "reviewer@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "translator", name: "Translator", contact: { email: "translator@example.org" }, locale: "fa", rtlPreference: true, createdAt: now },
      { id: "publisher", name: "Publisher", contact: { email: "publisher@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
    ]);
    const { submission } = await createSubmission(serviceDb, actor("editor", "editor"), {
      publicationScope: "website", title: "Institutional note", rawContent: "Source material",
    });
    const draft = await createDraftVersion(serviceDb, actor("editor", "editor"), {
      submissionId: submission.id, content: "Reviewed draft", citations: ["source:1"], weakCitationFlags: [], authorType: "human",
    });
    await expect(assignReviewer(serviceDb, actor("editor", "editor"), {
      submissionId: submission.id, draftId: draft.id, reviewerPersonId: "editor",
    })).rejects.toThrow("self_review_forbidden");
    await assignReviewer(serviceDb, actor("editor", "editor"), {
      submissionId: submission.id, draftId: draft.id, reviewerPersonId: "reviewer",
    });
    await decideModeration(serviceDb, actor("reviewer", "reviewer"), {
      submissionId: submission.id, draftId: draft.id, decision: "approved", reason: "Citations and scope confirmed",
    });
    const handoff = await createTranslationAssignment(serviceDb, actor("editor", "editor"), {
      draftId: draft.id, locale: "fa", translatorPersonId: "translator",
    });
    await finalizeTranslation(serviceDb, actor("translator", "translator"), {
      handoffId: handoff.id,
      content: "Finalized translation",
    });
    await expect(signOffAndMarkReady(serviceDb, actor("reviewer", "publisher"), draft.id))
      .rejects.toThrow("publisher_separation_required");
    const result = await signOffAndMarkReady(serviceDb, actor("publisher", "publisher"), draft.id);
    expect(result.readiness).toMatchObject({ draftId: draft.id, status: "ready", commitHash: null });
    expect(await db.select().from(signOffRecords)).toHaveLength(1);
    expect(await db.select().from(publishCommits)).toHaveLength(1);
    const actions = (await db.select().from(auditLog)).map((entry) => entry.action);
    expect(actions).toEqual(expect.arrayContaining([
      "publishing.submission-created", "publishing.draft-version-created", "publishing.reviewer-assigned",
      "publishing.moderation-approved", "publishing.translation-assigned", "publishing.translation-finalized",
      "publishing.sign-off", "publishing.ready",
    ]));
    expect(actions).not.toContain("publishing.committed");
    await client.close();
  }, 20_000);

  it("binds moderation to the exact draft and persists assignment and decision timestamps", async () => {
    const directory = await mkdtemp(join(tmpdir(), "res-publica-publishing-versioned-review-")); directories.push(directory);
    const client = new PGlite(directory);
    const db = drizzle({ client, schema: { ...coreSchema, ...moduleSchema } });
    await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
    const serviceDb = db as unknown as Database;
    const now = new Date();
    await db.insert(people).values([
      { id: "editor", name: "Editor", contact: { email: "editor@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "reviewer", name: "Reviewer", contact: { email: "reviewer@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "publisher", name: "Publisher", contact: { email: "publisher@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
    ]);
    const { submission } = await createSubmission(serviceDb, actor("editor", "editor"), {
      publicationScope: "website", title: "Versioned note", rawContent: "Source material",
    });
    const reviewedDraft = await createDraftVersion(serviceDb, actor("editor", "editor"), {
      submissionId: submission.id, content: "Version one", citations: ["source:1"], weakCitationFlags: [], authorType: "human",
    });
    const assignment = await assignReviewer(serviceDb, actor("editor", "editor"), {
      submissionId: submission.id, draftId: reviewedDraft.id, reviewerPersonId: "reviewer",
    });
    expect(assignment).toMatchObject({ draftId: reviewedDraft.id, assignedReviewerPersonId: "reviewer", assignedAt: expect.any(Date) });
    const decision = await decideModeration(serviceDb, actor("reviewer", "reviewer"), {
      submissionId: submission.id, draftId: reviewedDraft.id, decision: "approved", reason: "Version one reviewed",
    });
    expect(decision).toMatchObject({ draftId: reviewedDraft.id, decidedAt: expect.any(Date) });
    const [persisted] = await db.select().from(moderationQueue);
    expect(persisted as Record<string, unknown>).toMatchObject({
      draftId: reviewedDraft.id,
      assignedAt: expect.any(Date),
      decidedAt: expect.any(Date),
    });
    await client.close();
  }, 20_000);

  it("rejects a blank moderation reason before changing decision state", async () => {
    const directory = await mkdtemp(join(tmpdir(), "res-publica-publishing-reason-")); directories.push(directory);
    const client = new PGlite(directory);
    const db = drizzle({ client, schema: { ...coreSchema, ...moduleSchema } });
    await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
    const serviceDb = db as unknown as Database;
    const now = new Date();
    await db.insert(people).values([
      { id: "editor", name: "Editor", contact: { email: "editor@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "reviewer", name: "Reviewer", contact: { email: "reviewer@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
    ]);
    const { submission } = await createSubmission(serviceDb, actor("editor", "editor"), {
      publicationScope: "website", title: "Reason required", rawContent: "Source material",
    });
    const draft = await createDraftVersion(serviceDb, actor("editor", "editor"), {
      submissionId: submission.id, content: "Draft", citations: ["source:1"], weakCitationFlags: [], authorType: "human",
    });
    await assignReviewer(serviceDb, actor("editor", "editor"), {
      submissionId: submission.id, draftId: draft.id, reviewerPersonId: "reviewer",
    });
    await expect(decideModeration(serviceDb, actor("reviewer", "reviewer"), {
      submissionId: submission.id, draftId: draft.id, decision: "approved", reason: "   ",
    })).rejects.toThrow("moderation_reason_required");
    const [persisted] = await db.select().from(moderationQueue);
    expect(persisted).toMatchObject({ decision: "pending", reason: null, decidedAt: null });
    await client.close();
  }, 20_000);

  it("rejects stale or unreviewed drafts and append-only supersedes readiness after a new version", async () => {
    const directory = await mkdtemp(join(tmpdir(), "res-publica-publishing-readiness-")); directories.push(directory);
    const client = new PGlite(directory);
    const db = drizzle({ client, schema: { ...coreSchema, ...moduleSchema } });
    await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
    const serviceDb = db as unknown as Database;
    const now = new Date();
    await db.insert(people).values([
      { id: "editor", name: "Editor", contact: { email: "editor@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "reviewer", name: "Reviewer", contact: { email: "reviewer@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "publisher", name: "Publisher", contact: { email: "publisher@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
    ]);
    const { submission } = await createSubmission(serviceDb, actor("editor", "editor"), {
      publicationScope: "website", title: "Readiness note", rawContent: "Source material",
    });
    const reviewedDraft = await createDraftVersion(serviceDb, actor("editor", "editor"), {
      submissionId: submission.id, content: "Version one", citations: ["source:1"], weakCitationFlags: [], authorType: "human",
    });
    await assignReviewer(serviceDb, actor("editor", "editor"), {
      submissionId: submission.id, draftId: reviewedDraft.id, reviewerPersonId: "reviewer",
    });
    await decideModeration(serviceDb, actor("reviewer", "reviewer"), {
      submissionId: submission.id, draftId: reviewedDraft.id, decision: "approved", reason: "Version one reviewed",
    });
    const ready = await signOffAndMarkReady(serviceDb, actor("publisher", "publisher"), reviewedDraft.id);
    expect(ready.readiness).toMatchObject({ status: "ready", commitHash: null });
    await expect(signOffAndMarkReady(serviceDb, actor("publisher", "publisher"), reviewedDraft.id))
      .rejects.toThrow("draft_already_ready");

    const unreviewedDraft = await createDraftVersion(serviceDb, actor("editor", "editor"), {
      submissionId: submission.id, content: "Version two", citations: ["source:2"], weakCitationFlags: [], authorType: "human",
    });
    await expect(signOffAndMarkReady(serviceDb, actor("publisher", "publisher"), reviewedDraft.id))
      .rejects.toThrow("latest_draft_required");
    await expect(signOffAndMarkReady(serviceDb, actor("publisher", "publisher"), unreviewedDraft.id))
      .rejects.toThrow("approved_moderation_required");

    const readinessEvents = await db.select().from(publishCommits);
    expect(readinessEvents).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: ready.readiness.id, draftId: reviewedDraft.id, status: "ready", commitHash: null }),
      expect.objectContaining({
        draftId: reviewedDraft.id,
        status: "superseded",
        commitHash: null,
        supersedesPublishCommitId: ready.readiness.id,
      }),
    ]));
    expect(await db.select().from(drafts)).toHaveLength(2);
    await client.close();
  }, 20_000);

  it("prevents a submission author and an assigning Editor from later approving the same artifact", async () => {
    const directory = await mkdtemp(join(tmpdir(), "res-publica-publishing-artifact-history-")); directories.push(directory);
    const client = new PGlite(directory);
    const db = drizzle({ client, schema: { ...coreSchema, ...moduleSchema } });
    await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
    const serviceDb = db as unknown as Database;
    const now = new Date();
    await db.insert(people).values([
      { id: "submitter", name: "Submitter", contact: { email: "submitter@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "author", name: "Author", contact: { email: "author@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "assigner", name: "Assigner", contact: { email: "assigner@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "reviewer", name: "Reviewer", contact: { email: "reviewer@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "publisher", name: "Publisher", contact: { email: "publisher@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
    ]);
    const { submission } = await createSubmission(serviceDb, actor("submitter", "editor"), {
      publicationScope: "website", title: "Artifact history", rawContent: "Source material",
    });
    const draft = await createDraftVersion(serviceDb, actor("author", "editor"), {
      submissionId: submission.id, content: "Draft", citations: ["source:1"], weakCitationFlags: [], authorType: "human",
    });
    await expect(assignReviewer(serviceDb, actor("assigner", "editor"), {
      submissionId: submission.id, draftId: draft.id, reviewerPersonId: "submitter",
    })).rejects.toThrow("submission_author_review_forbidden");

    const second = await createDraftVersion(serviceDb, actor("author", "editor"), {
      submissionId: submission.id, content: "Draft two", citations: ["source:2"], weakCitationFlags: [], authorType: "human",
    });
    await assignReviewer(serviceDb, actor("assigner", "editor"), {
      submissionId: submission.id, draftId: second.id, reviewerPersonId: "reviewer",
    });
    await decideModeration(serviceDb, actor("reviewer", "reviewer"), {
      submissionId: submission.id, draftId: second.id, decision: "approved", reason: "Independent review",
    });
    await expect(signOffAndMarkReady(serviceDb, actor("assigner", "publisher"), second.id))
      .rejects.toThrow("publisher_separation_required");
    expect((await db.select().from(signOffRecords))).toHaveLength(0);
    await client.close();
  }, 20_000);

  it("rejects stale moderation and requires approval before a pending human translation handoff", async () => {
    const directory = await mkdtemp(join(tmpdir(), "res-publica-publishing-ordered-gates-")); directories.push(directory);
    const client = new PGlite(directory);
    const db = drizzle({ client, schema: { ...coreSchema, ...moduleSchema } });
    await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
    const serviceDb = db as unknown as Database;
    const now = new Date();
    await db.insert(people).values([
      { id: "editor", name: "Editor", contact: { email: "editor@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "reviewer", name: "Reviewer", contact: { email: "reviewer@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "translator", name: "Translator", contact: { email: "translator@example.org" }, locale: "fa", rtlPreference: true, createdAt: now },
    ]);
    const { submission } = await createSubmission(serviceDb, actor("editor", "editor"), {
      publicationScope: "website", title: "Ordered gates", rawContent: "Source material",
    });
    const staleDraft = await createDraftVersion(serviceDb, actor("editor", "editor"), {
      submissionId: submission.id, content: "Version one", citations: ["source:1"], weakCitationFlags: [], authorType: "human",
    });
    const currentDraft = await createDraftVersion(serviceDb, actor("editor", "editor"), {
      submissionId: submission.id, content: "Version two", citations: ["source:2"], weakCitationFlags: [], authorType: "human",
    });
    await expect(assignReviewer(serviceDb, actor("editor", "editor"), {
      submissionId: submission.id, draftId: staleDraft.id, reviewerPersonId: "reviewer",
    })).rejects.toThrow("latest_draft_required");
    await expect(createTranslationAssignment(serviceDb, actor("editor", "editor"), {
      draftId: currentDraft.id, locale: "fa", translatorPersonId: "translator",
    })).rejects.toThrow("approved_moderation_required");
    await assignReviewer(serviceDb, actor("editor", "editor"), {
      submissionId: submission.id, draftId: currentDraft.id, reviewerPersonId: "reviewer",
    });
    await decideModeration(serviceDb, actor("reviewer", "reviewer"), {
      submissionId: submission.id, draftId: currentDraft.id, decision: "approved", reason: "Current version reviewed",
    });
    const handoff = await createTranslationAssignment(serviceDb, actor("editor", "editor"), {
      draftId: currentDraft.id, locale: "fa", translatorPersonId: "translator",
    });
    expect(handoff.status).toBe("pending");
    await expect(createTranslationAssignment(serviceDb, actor("editor", "editor"), {
      draftId: currentDraft.id, locale: "fa", translatorPersonId: "translator",
    })).rejects.toThrow("translation_locale_already_assigned");
    await expect(finalizeTranslation(serviceDb, actor("translator", "translator"), {
      handoffId: handoff.id,
      content: "   ",
    })).rejects.toThrow("translation_content_required");
    await expect(finalizeTranslation(serviceDb, actor("translator", "translator"), {
      handoffId: handoff.id,
      content: "Human-finalized translation",
    })).resolves.toMatchObject({
      status: "human-finalized",
      content: "Human-finalized translation",
      finalizedAt: expect.any(Date),
    });
    const [persistedTranslation] = await db.select().from(translationHandoffs);
    expect(persistedTranslation).toMatchObject({
      status: "human-finalized",
      content: "Human-finalized translation",
      assigneePersonId: "translator",
      assignedByPersonId: "editor",
    });
    await client.close();
  }, 20_000);

  it("rejects nonexistent reviewer and translator assignees with controlled domain errors", async () => {
    const directory = await mkdtemp(join(tmpdir(), "res-publica-publishing-assignees-")); directories.push(directory);
    const client = new PGlite(directory);
    const db = drizzle({ client, schema: { ...coreSchema, ...moduleSchema } });
    await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
    const serviceDb = db as unknown as Database;
    const now = new Date();
    await db.insert(people).values([
      { id: "editor", name: "Editor", contact: { email: "editor@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "reviewer", name: "Reviewer", contact: { email: "reviewer@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
    ]);
    const { submission } = await createSubmission(serviceDb, actor("editor", "editor"), {
      publicationScope: "website", title: "Assignee validation", rawContent: "Source material",
    });
    const draft = await createDraftVersion(serviceDb, actor("editor", "editor"), {
      submissionId: submission.id, content: "Draft", citations: ["source:1"], weakCitationFlags: [], authorType: "human",
    });
    await expect(assignReviewer(serviceDb, actor("editor", "editor"), {
      submissionId: submission.id, draftId: draft.id, reviewerPersonId: "missing-reviewer",
    })).rejects.toThrow("reviewer_not_found");
    await assignReviewer(serviceDb, actor("editor", "editor"), {
      submissionId: submission.id, draftId: draft.id, reviewerPersonId: "reviewer",
    });
    await decideModeration(serviceDb, actor("reviewer", "reviewer"), {
      submissionId: submission.id, draftId: draft.id, decision: "approved", reason: "Reviewed",
    });
    await expect(createTranslationAssignment(serviceDb, actor("editor", "editor"), {
      draftId: draft.id, locale: "fa", translatorPersonId: "missing-translator",
    })).rejects.toThrow("translator_not_found");
    expect(await db.select().from(translationHandoffs)).toHaveLength(0);
    await client.close();
  }, 20_000);

  it("does not fabricate legacy authorship, timestamps, or reviewed versions in migration 0011", async () => {
    const migrationSql = await readFile(join(process.cwd(), "drizzle", "0011_publishing-authority.sql"), "utf8");
    expect(migrationSql).not.toMatch(/UPDATE "drafts" SET "authored_by_person_id"/);
    expect(migrationSql).not.toMatch(/"created_at" timestamp with time zone DEFAULT now\(\)/);
    expect(migrationSql).not.toMatch(/UPDATE "moderation_queue" SET "draft_id"/);
  });

  it("rolls back sign-off and readiness when the canonical audit append fails", async () => {
    const directory = await mkdtemp(join(tmpdir(), "res-publica-publishing-rollback-")); directories.push(directory);
    const client = new PGlite(directory);
    const db = drizzle({ client, schema: { ...coreSchema, ...moduleSchema } });
    await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
    const serviceDb = db as unknown as Database;
    const now = new Date();
    await db.insert(people).values([
      { id: "editor", name: "Editor", contact: { email: "editor@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "reviewer", name: "Reviewer", contact: { email: "reviewer@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "publisher", name: "Publisher", contact: { email: "publisher@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
    ]);
    const { submission } = await createSubmission(serviceDb, actor("editor", "editor"), {
      publicationScope: "website", title: "Rollback", rawContent: "Source material",
    });
    const draft = await createDraftVersion(serviceDb, actor("editor", "editor"), {
      submissionId: submission.id, content: "Draft", citations: ["source:1"], weakCitationFlags: [], authorType: "human",
    });
    await assignReviewer(serviceDb, actor("editor", "editor"), {
      submissionId: submission.id, draftId: draft.id, reviewerPersonId: "reviewer",
    });
    await decideModeration(serviceDb, actor("reviewer", "reviewer"), {
      submissionId: submission.id, draftId: draft.id, decision: "approved", reason: "Reviewed",
    });
    await client.exec(`
      CREATE FUNCTION reject_publishing_sign_off_audit() RETURNS trigger AS $$
      BEGIN
        IF NEW.action = 'publishing.sign-off' THEN
          RAISE EXCEPTION 'forced publishing audit failure';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      CREATE TRIGGER reject_publishing_sign_off_audit
      BEFORE INSERT ON audit_log
      FOR EACH ROW EXECUTE FUNCTION reject_publishing_sign_off_audit();
    `);

    await expect(signOffAndMarkReady(serviceDb, actor("publisher", "publisher"), draft.id))
      .rejects.toThrow();
    expect(await db.select().from(signOffRecords)).toHaveLength(0);
    expect(await db.select().from(publishCommits)).toHaveLength(0);
    await client.close();
  }, 20_000);
});
