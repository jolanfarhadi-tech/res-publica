import { and, desc, eq, isNull } from "drizzle-orm";
import type { AuthenticatedActor } from "../auth/types";
import { appendEntry } from "../domain/audit-log";
import { createId } from "../domain/shared";
import { createRepositories, type Database } from "../persistence";
import { people } from "../persistence/schema";
import { drafts, moderationQueue, publishCommits, signOffRecords, submissions, translationHandoffs } from "../persistence/module-schema";
import { requireEditorialRole } from "../modules/publishing/authority";

type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

async function audit(tx: Transaction, actorPersonId: string, action: string, target: string) {
  await createRepositories(tx).auditLog.append(appendEntry({ actorPersonId, action, target }));
}

async function requireLatestDraft(tx: Transaction, submissionId: string, draftId: string) {
  const [latest] = await tx.select({ id: drafts.id }).from(drafts)
    .where(eq(drafts.submissionId, submissionId)).orderBy(desc(drafts.version)).limit(1);
  if (latest?.id !== draftId) throw new PublishingError("latest_draft_required");
}

export async function createSubmission(db: Database, actor: AuthenticatedActor | null, input: {
  publicationScope: string; title: string; rawContent: string;
}) {
  requireEditorialRole(actor, "editor", input.publicationScope);
  const now = new Date();
  const submission = { id: createId(), ...input, submittedByPersonId: actor.personId, submittedAt: now, status: "pending" as const };
  const moderation = { id: createId(), submissionId: submission.id, draftId: null, decision: "pending" as const,
    assignedReviewerPersonId: null, assignedByPersonId: null, assignedAt: null, decidedAt: null, reason: null };
  await db.transaction(async (tx) => {
    await tx.insert(submissions).values(submission);
    await tx.insert(moderationQueue).values(moderation);
    await audit(tx, actor.personId, "publishing.submission-created", `submission:${submission.id}`);
  });
  return { submission, moderation };
}

export async function createDraftVersion(db: Database, actor: AuthenticatedActor | null, input: {
  submissionId: string; content: string; citations: string[]; weakCitationFlags: string[]; authorType: "ai" | "human";
}) {
  return db.transaction(async (tx) => {
    const [submission] = await tx.select().from(submissions).where(eq(submissions.id, input.submissionId)).limit(1).for("update");
    if (!submission) throw new PublishingError("submission_not_found");
    requireEditorialRole(actor, "editor", submission.publicationScope);
    const [latest] = await tx.select({ version: drafts.version }).from(drafts).where(eq(drafts.submissionId, submission.id)).orderBy(desc(drafts.version)).limit(1);
    const now = new Date();
    const draft = { id: createId(), submissionId: submission.id, content: input.content,
      citations: input.citations, weakCitationFlags: input.weakCitationFlags, authorType: input.authorType,
      version: (latest?.version ?? 0) + 1, authoredByPersonId: actor.personId, createdAt: now };
    await tx.insert(drafts).values(draft);
    const [unboundModeration] = await tx.select().from(moderationQueue).where(and(
      eq(moderationQueue.submissionId, submission.id),
      eq(moderationQueue.decision, "pending"),
      isNull(moderationQueue.draftId),
    )).limit(1).for("update");
    if (unboundModeration) {
      await tx.update(moderationQueue).set({ draftId: draft.id }).where(eq(moderationQueue.id, unboundModeration.id));
    } else {
      await tx.insert(moderationQueue).values({
        id: createId(), submissionId: submission.id, draftId: draft.id, decision: "pending",
        assignedReviewerPersonId: null, assignedByPersonId: null, assignedAt: null, decidedAt: null, reason: null,
      });
    }
    if (latest) {
      await tx.update(submissions).set({ status: "pending" }).where(eq(submissions.id, submission.id));
      const readinessEvents = await tx.select({ readiness: publishCommits }).from(publishCommits)
        .innerJoin(drafts, eq(publishCommits.draftId, drafts.id))
        .where(eq(drafts.submissionId, submission.id));
      const supersededIds = new Set(readinessEvents
        .map(({ readiness }) => readiness.supersedesPublishCommitId)
        .filter((id): id is string => id !== null));
      for (const { readiness } of readinessEvents) {
        if (readiness.status !== "ready" || supersededIds.has(readiness.id)) continue;
        const supersession = {
          id: createId(), draftId: readiness.draftId, status: "superseded" as const, commitHash: null,
          supersedesPublishCommitId: readiness.id, createdAt: now,
        };
        await tx.insert(publishCommits).values(supersession);
        await audit(tx, actor.personId, "publishing.readiness-superseded", `publish-readiness:${readiness.id}`);
      }
    }
    await audit(tx, actor.personId, "publishing.draft-version-created", `draft:${draft.id}`);
    return draft;
  });
}

export async function assignReviewer(db: Database, actor: AuthenticatedActor | null, input: {
  submissionId: string; draftId: string; reviewerPersonId: string;
}) {
  return db.transaction(async (tx) => {
    const [row] = await tx.select({ submission: submissions, draft: drafts }).from(drafts)
      .innerJoin(submissions, eq(drafts.submissionId, submissions.id))
      .where(and(eq(submissions.id, input.submissionId), eq(drafts.id, input.draftId))).limit(1).for("update");
    if (!row) throw new PublishingError("draft_not_found");
    requireEditorialRole(actor, "editor", row.submission.publicationScope);
    await requireLatestDraft(tx, row.submission.id, row.draft.id);
    if (actor.personId === input.reviewerPersonId) throw new PublishingError("self_review_forbidden");
    if (row.submission.submittedByPersonId === input.reviewerPersonId) {
      throw new PublishingError("submission_author_review_forbidden");
    }
    if (row.draft.authoredByPersonId === input.reviewerPersonId) {
      throw new PublishingError("author_review_forbidden");
    }
    const [reviewer] = await tx.select({ id: people.id }).from(people)
      .where(eq(people.id, input.reviewerPersonId)).limit(1);
    if (!reviewer) throw new PublishingError("reviewer_not_found");
    const [entry] = await tx.select().from(moderationQueue).where(and(
      eq(moderationQueue.submissionId, row.submission.id),
      eq(moderationQueue.draftId, row.draft.id),
    )).limit(1).for("update");
    if (!entry || entry.decision !== "pending") throw new PublishingError("moderation_not_pending");
    if (entry.assignedReviewerPersonId !== null) throw new PublishingError("reviewer_already_assigned");
    const assignedAt = new Date();
    await tx.update(moderationQueue).set({
      assignedReviewerPersonId: input.reviewerPersonId,
      assignedByPersonId: actor.personId,
      assignedAt,
    }).where(eq(moderationQueue.id, entry.id));
    await audit(tx, actor.personId, "publishing.reviewer-assigned", `moderation:${entry.id}`);
    return { ...entry, assignedReviewerPersonId: input.reviewerPersonId, assignedByPersonId: actor.personId, assignedAt };
  });
}

export async function decideModeration(db: Database, actor: AuthenticatedActor | null, input: {
  submissionId: string; draftId: string; decision: "approved" | "rejected"; reason: string;
}) {
  return db.transaction(async (tx) => {
    const [submission] = await tx.select().from(submissions).where(eq(submissions.id, input.submissionId)).limit(1).for("update");
    if (!submission) throw new PublishingError("submission_not_found");
    requireEditorialRole(actor, "reviewer", submission.publicationScope);
    await requireLatestDraft(tx, submission.id, input.draftId);
    const [entry] = await tx.select().from(moderationQueue).where(and(
      eq(moderationQueue.submissionId, submission.id),
      eq(moderationQueue.draftId, input.draftId),
    )).limit(1).for("update");
    if (!entry || entry.decision !== "pending") throw new PublishingError("moderation_not_pending");
    if (entry.assignedReviewerPersonId !== actor.personId) throw new PublishingError("reviewer_assignment_required");
    if (submission.submittedByPersonId === actor.personId) throw new PublishingError("submission_author_review_forbidden");
    const authored = await tx.select({ id: drafts.id }).from(drafts).where(and(
      eq(drafts.id, input.draftId),
      eq(drafts.authoredByPersonId, actor.personId),
    )).limit(1);
    if (authored.length) throw new PublishingError("author_review_forbidden");
    const reason = input.reason.trim();
    if (!reason) throw new PublishingError("moderation_reason_required");
    const decidedAt = new Date();
    await tx.update(moderationQueue).set({
      decision: input.decision,
      reason,
      decidedAt,
    }).where(eq(moderationQueue.id, entry.id));
    await tx.update(submissions).set({ status: "moderated" }).where(eq(submissions.id, submission.id));
    await audit(tx, actor.personId, `publishing.moderation-${input.decision}`, `draft:${input.draftId}`);
    return { ...entry, decision: input.decision, reason, decidedAt };
  });
}

export async function createTranslationAssignment(db: Database, actor: AuthenticatedActor | null, input: {
  draftId: string; locale: string; translatorPersonId: string;
}) {
  return db.transaction(async (tx) => {
    const [row] = await tx.select({ draft: drafts, scope: submissions.publicationScope }).from(drafts)
      .innerJoin(submissions, eq(drafts.submissionId, submissions.id)).where(eq(drafts.id, input.draftId)).limit(1).for("update");
    if (!row) throw new PublishingError("draft_not_found");
    requireEditorialRole(actor, "editor", row.scope);
    await requireLatestDraft(tx, row.draft.submissionId, row.draft.id);
    if (actor.personId === input.translatorPersonId) throw new PublishingError("self_translation_assignment_forbidden");
    const [translator] = await tx.select({ id: people.id }).from(people)
      .where(eq(people.id, input.translatorPersonId)).limit(1);
    if (!translator) throw new PublishingError("translator_not_found");
    const [moderation] = await tx.select().from(moderationQueue).where(and(
      eq(moderationQueue.draftId, row.draft.id),
      eq(moderationQueue.decision, "approved"),
    )).limit(1);
    if (!moderation) throw new PublishingError("approved_moderation_required");
    const [existingHandoff] = await tx.select({ id: translationHandoffs.id }).from(translationHandoffs).where(and(
      eq(translationHandoffs.draftId, input.draftId),
      eq(translationHandoffs.locale, input.locale),
    )).limit(1);
    if (existingHandoff) throw new PublishingError("translation_locale_already_assigned");
    const handoff = { id: createId(), draftId: input.draftId, locale: input.locale, status: "pending" as const,
      content: null, assigneePersonId: input.translatorPersonId, assignedByPersonId: actor.personId, finalizedAt: null };
    await tx.insert(translationHandoffs).values(handoff);
    await audit(tx, actor.personId, "publishing.translation-assigned", `translation:${handoff.id}`);
    return handoff;
  });
}

export async function finalizeTranslation(db: Database, actor: AuthenticatedActor | null, input: {
  handoffId: string; content: string;
}) {
  return db.transaction(async (tx) => {
    const [row] = await tx.select({ handoff: translationHandoffs, scope: submissions.publicationScope }).from(translationHandoffs)
      .innerJoin(drafts, eq(translationHandoffs.draftId, drafts.id)).innerJoin(submissions, eq(drafts.submissionId, submissions.id))
      .where(eq(translationHandoffs.id, input.handoffId)).limit(1).for("update");
    if (!row) throw new PublishingError("translation_not_found");
    requireEditorialRole(actor, "translator", row.scope);
    if (row.handoff.assigneePersonId !== actor.personId) throw new PublishingError("translator_assignment_required");
    if (row.handoff.status !== "pending" && row.handoff.status !== "ai-draft") {
      throw new PublishingError("translation_not_pending_finalization");
    }
    const content = input.content.trim();
    if (!content) throw new PublishingError("translation_content_required");
    const finalizedAt = new Date();
    await tx.update(translationHandoffs).set({
      status: "human-finalized",
      content,
      finalizedAt,
    }).where(eq(translationHandoffs.id, input.handoffId));
    await audit(tx, actor.personId, "publishing.translation-finalized", `translation:${input.handoffId}`);
    return { ...row.handoff, status: "human-finalized" as const, content, finalizedAt };
  });
}

export async function signOffAndMarkReady(db: Database, actor: AuthenticatedActor | null, draftId: string) {
  return db.transaction(async (tx) => {
    const [row] = await tx.select({ draft: drafts, submission: submissions }).from(drafts)
      .innerJoin(submissions, eq(drafts.submissionId, submissions.id)).where(eq(drafts.id, draftId)).limit(1).for("update");
    if (!row) throw new PublishingError("draft_not_found");
    requireEditorialRole(actor, "publisher", row.submission.publicationScope);
    await requireLatestDraft(tx, row.submission.id, draftId);
    if (row.draft.authoredByPersonId === null || row.draft.createdAt === null) {
      throw new PublishingError("draft_provenance_required");
    }
    const [moderation] = await tx.select().from(moderationQueue).where(and(
      eq(moderationQueue.submissionId, row.submission.id),
      eq(moderationQueue.draftId, draftId),
    )).limit(1);
    if (!moderation || moderation.decision !== "approved") throw new PublishingError("approved_moderation_required");
    if ([
      row.submission.submittedByPersonId,
      row.draft.authoredByPersonId,
      moderation.assignedByPersonId,
      moderation.assignedReviewerPersonId,
    ].includes(actor.personId)) throw new PublishingError("publisher_separation_required");
    const translations = await tx.select().from(translationHandoffs).where(eq(translationHandoffs.draftId, draftId));
    if (translations.some((item) => item.status !== "human-finalized" || !item.content?.trim())) {
      throw new PublishingError("finalized_translations_required");
    }
    if (translations.some((item) =>
      item.assigneePersonId === actor.personId || item.assignedByPersonId === actor.personId
    )) throw new PublishingError("publisher_separation_required");
    const readinessEvents = await tx.select().from(publishCommits).where(eq(publishCommits.draftId, draftId));
    const supersededIds = new Set(readinessEvents
      .map((event) => event.supersedesPublishCommitId)
      .filter((id): id is string => id !== null));
    if (readinessEvents.some((event) => event.status === "committed")) {
      throw new PublishingError("draft_already_committed");
    }
    if (readinessEvents.some((event) => event.status === "ready" && !supersededIds.has(event.id))) {
      throw new PublishingError("draft_already_ready");
    }
    const now = new Date();
    const signOff = { id: createId(), draftId, approverPersonId: actor.personId, timestamp: now };
    const readiness = { id: createId(), draftId, status: "ready" as const, commitHash: null,
      supersedesPublishCommitId: null, createdAt: now };
    await tx.insert(signOffRecords).values(signOff);
    await tx.insert(publishCommits).values(readiness);
    await audit(tx, actor.personId, "publishing.sign-off", `sign-off:${signOff.id}`);
    await audit(tx, actor.personId, "publishing.ready", `draft:${draftId}`);
    return { signOff, readiness };
  });
}

export class PublishingError extends Error {
  constructor(public readonly code: string) { super(code); this.name = "PublishingError"; }
}
