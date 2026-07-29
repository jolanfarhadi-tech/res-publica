import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { describe, expect, it } from "vitest";
import { AuthorizationDeniedError } from "../auth/authorize";
import type { AuthenticatedActor } from "../auth/types";
import type { Database } from "../persistence";
import * as coreSchema from "../persistence/schema";
import * as moduleSchema from "../persistence/module-schema";
import { people } from "../persistence/schema";
import {
  drafts,
  moderationQueue,
  publishCommits,
  submissions,
  translationHandoffs,
} from "../persistence/module-schema";
import { getPublishingWorkspace } from "./publishing-workspace";

const schema = { ...coreSchema, ...moduleSchema };
const now = new Date("2026-07-29T12:00:00.000Z");

function actor(
  personId: string,
  role: "editor" | "reviewer" | "translator" | "publisher",
  scope = "website",
  assurance: AuthenticatedActor["assurance"] = "mfa"
): AuthenticatedActor {
  return {
    personId,
    sessionId: `session-${personId}`,
    assurance,
    authenticatedAt: now,
    grants: [
      {
        id: `grant-${personId}-${role}`,
        personId,
        domain: "civic",
        capability: `publishing.role.${role}`,
        target: scope,
        assuranceRequired: "mfa",
        validFrom: new Date(now.getTime() - 1_000),
        validUntil: null,
        revokedAt: null,
      },
    ],
  };
}

async function withDatabase(run: (db: Database) => Promise<void>) {
  const directory = await mkdtemp(join(tmpdir(), "res-publica-publishing-workspace-"));
  const client = new PGlite(directory);
  const pgliteDb = drizzle({ client, schema });
  await migrate(pgliteDb, { migrationsFolder: join(process.cwd(), "drizzle") });
  try {
    await run(pgliteDb as unknown as Database);
  } finally {
    await client.close();
    await rm(directory, { recursive: true, force: true });
  }
}

async function seed(db: Database) {
  await db.insert(people).values([
    { id: "editor", name: "Editor", contact: { email: "editor@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
    { id: "reviewer", name: "Reviewer", contact: { email: "reviewer@example.org" }, locale: "en", rtlPreference: false, createdAt: now },
    { id: "translator", name: "Translator", contact: { email: "translator@example.org" }, locale: "fa", rtlPreference: true, createdAt: now },
    { id: "publisher", name: "Publisher", contact: { email: "publisher@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
  ]);
  await db.insert(submissions).values([
    {
      id: "submission-website",
      title: "Website article",
      rawContent: "Website source",
      submittedByPersonId: "editor",
      submittedAt: now,
      status: "pending",
      publicationScope: "website",
    },
    {
      id: "submission-research",
      title: "Research article",
      rawContent: "Research source",
      submittedByPersonId: "editor",
      submittedAt: now,
      status: "pending",
      publicationScope: "research",
    },
  ]);
  await db.insert(drafts).values([
    {
      id: "draft-website",
      submissionId: "submission-website",
      content: "Website draft",
      citations: ["source-1"],
      weakCitationFlags: [],
      authorType: "human",
      version: 1,
      authoredByPersonId: "editor",
      createdAt: now,
    },
    {
      id: "draft-research",
      submissionId: "submission-research",
      content: "Research draft",
      citations: ["source-2"],
      weakCitationFlags: [],
      authorType: "human",
      version: 1,
      authoredByPersonId: "editor",
      createdAt: now,
    },
  ]);
  await db.insert(moderationQueue).values([
    {
      id: "moderation-website",
      submissionId: "submission-website",
      draftId: "draft-website",
      decision: "pending",
      assignedReviewerPersonId: "reviewer",
      assignedByPersonId: "editor",
      assignedAt: now,
      decidedAt: null,
      reason: null,
    },
    {
      id: "moderation-research",
      submissionId: "submission-research",
      draftId: "draft-research",
      decision: "pending",
      assignedReviewerPersonId: "publisher",
      assignedByPersonId: "editor",
      assignedAt: now,
      decidedAt: null,
      reason: null,
    },
  ]);
  await db.insert(translationHandoffs).values({
    id: "translation-website",
    draftId: "draft-website",
    locale: "fa",
    status: "pending",
    content: null,
    assigneePersonId: "translator",
    assignedByPersonId: "editor",
    finalizedAt: null,
  });
  await db.insert(publishCommits).values({
    id: "readiness-website",
    draftId: "draft-website",
    status: "ready",
    commitHash: null,
    supersedesPublishCommitId: null,
    createdAt: now,
  });
}

describe("bounded Publishing workspace", () => {
  it("shows an MFA publisher the complete exact-scope workflow without another scope", async () => {
    await withDatabase(async (db) => {
      await seed(db);

      const workspace = await getPublishingWorkspace(
        db,
        actor("publisher", "publisher"),
        "website",
        now
      );

      expect(workspace.roles).toEqual(["publisher"]);
      expect(workspace.submissions).toEqual([
        expect.objectContaining({
          id: "submission-website",
          title: "Website article",
          rawContent: "Website source",
        }),
      ]);
      expect(workspace.drafts).toEqual([
        expect.objectContaining({ id: "draft-website", content: "Website draft" }),
      ]);
      expect(workspace.moderation).toHaveLength(1);
      expect(workspace.translations).toHaveLength(1);
      expect(workspace.readiness).toEqual([
        expect.objectContaining({
          id: "readiness-website",
          status: "ready",
          commitHash: null,
        }),
      ]);
      expect(JSON.stringify(workspace)).not.toContain("submission-research");
      expect(JSON.stringify(workspace)).not.toContain("Research source");
    });
  }, 30_000);

  it("limits reviewers and translators to their own assigned artifacts", async () => {
    await withDatabase(async (db) => {
      await seed(db);

      const reviewer = await getPublishingWorkspace(
        db,
        actor("reviewer", "reviewer"),
        "website",
        now
      );
      expect(reviewer.moderation).toEqual([
        expect.objectContaining({ id: "moderation-website" }),
      ]);
      expect(reviewer.drafts.map((draft) => draft.id)).toEqual(["draft-website"]);
      expect(reviewer.translations).toEqual([]);
      expect(reviewer.readiness).toEqual([]);

      const translator = await getPublishingWorkspace(
        db,
        actor("translator", "translator"),
        "website",
        now
      );
      expect(translator.translations).toEqual([
        expect.objectContaining({ id: "translation-website" }),
      ]);
      expect(translator.drafts.map((draft) => draft.id)).toEqual(["draft-website"]);
      expect(translator.moderation).toEqual([]);
      expect(translator.readiness).toEqual([]);
    });
  }, 30_000);

  it("fails closed without exact scoped MFA authority", async () => {
    await withDatabase(async (db) => {
      await seed(db);

      await expect(
        getPublishingWorkspace(
          db,
          actor("publisher", "publisher", "research"),
          "website",
          now
        )
      ).rejects.toBeInstanceOf(AuthorizationDeniedError);
      await expect(
        getPublishingWorkspace(
          db,
          actor("publisher", "publisher", "website", "verified"),
          "website",
          now
        )
      ).rejects.toBeInstanceOf(AuthorizationDeniedError);
      await expect(
        getPublishingWorkspace(db, null, "website", now)
      ).rejects.toBeInstanceOf(AuthorizationDeniedError);
    });
  }, 30_000);
});
