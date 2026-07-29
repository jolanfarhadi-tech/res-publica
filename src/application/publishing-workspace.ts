import { desc, eq } from "drizzle-orm";
import { isAuthorized } from "../auth/authorize";
import type { AuthenticatedActor } from "../auth/types";
import type { Database } from "../persistence";
import {
  drafts,
  moderationQueue,
  publishCommits,
  signOffRecords,
  submissions,
  translationHandoffs,
} from "../persistence/module-schema";
import {
  EDITORIAL_ROLES,
  editorialCapability,
  requireEditorialRole,
  type EditorialRole,
} from "../modules/publishing/authority";

function authorizedRoles(
  actor: AuthenticatedActor | null,
  publicationScope: string,
  now: Date
): EditorialRole[] {
  if (!actor) return [];
  return EDITORIAL_ROLES.filter((role) =>
    isAuthorized(actor, {
      domain: "civic",
      capability: editorialCapability(role),
      target: publicationScope,
      requireExactTarget: true,
      minimumAssurance: "mfa",
      now,
    })
  );
}

export async function getPublishingWorkspace(
  db: Database,
  actor: AuthenticatedActor | null,
  publicationScope: string,
  now = new Date(),
  requestedLimit = 50
) {
  const limit = Math.max(1, Math.min(100, Math.trunc(requestedLimit)));
  const roles = authorizedRoles(actor, publicationScope, now);
  if (!roles.length) {
    // Reuse the canonical denial type and exact-scope/MFA evaluator.
    requireEditorialRole(actor, "editor", publicationScope);
  }

  const [
    scopedSubmissions,
    scopedDrafts,
    scopedModeration,
    scopedTranslations,
    scopedSignOffs,
    scopedReadiness,
  ] = await Promise.all([
    db
      .select()
      .from(submissions)
      .where(eq(submissions.publicationScope, publicationScope))
      .orderBy(desc(submissions.submittedAt))
      .limit(limit),
    db
      .select({ draft: drafts })
      .from(drafts)
      .innerJoin(submissions, eq(drafts.submissionId, submissions.id))
      .where(eq(submissions.publicationScope, publicationScope))
      .orderBy(desc(drafts.createdAt))
      .limit(limit),
    db
      .select({ moderation: moderationQueue })
      .from(moderationQueue)
      .innerJoin(
        submissions,
        eq(moderationQueue.submissionId, submissions.id)
      )
      .where(eq(submissions.publicationScope, publicationScope))
      .orderBy(desc(moderationQueue.assignedAt))
      .limit(limit),
    db
      .select({ translation: translationHandoffs })
      .from(translationHandoffs)
      .innerJoin(drafts, eq(translationHandoffs.draftId, drafts.id))
      .innerJoin(submissions, eq(drafts.submissionId, submissions.id))
      .where(eq(submissions.publicationScope, publicationScope))
      .orderBy(desc(translationHandoffs.finalizedAt))
      .limit(limit),
    db
      .select({ signOff: signOffRecords })
      .from(signOffRecords)
      .innerJoin(drafts, eq(signOffRecords.draftId, drafts.id))
      .innerJoin(submissions, eq(drafts.submissionId, submissions.id))
      .where(eq(submissions.publicationScope, publicationScope))
      .orderBy(desc(signOffRecords.timestamp))
      .limit(limit),
    db
      .select({ readiness: publishCommits })
      .from(publishCommits)
      .innerJoin(drafts, eq(publishCommits.draftId, drafts.id))
      .innerJoin(submissions, eq(drafts.submissionId, submissions.id))
      .where(eq(submissions.publicationScope, publicationScope))
      .orderBy(desc(publishCommits.createdAt))
      .limit(limit),
  ]);

  const canSeeWholeScope =
    roles.includes("editor") || roles.includes("publisher");
  if (canSeeWholeScope) {
    return {
      scope: publicationScope,
      roles,
      submissions: scopedSubmissions,
      drafts: scopedDrafts.map(({ draft }) => draft),
      moderation: scopedModeration.map(({ moderation }) => moderation),
      translations: scopedTranslations.map(({ translation }) => translation),
      signOffs: scopedSignOffs.map(({ signOff }) => signOff),
      readiness: scopedReadiness.map(({ readiness }) => readiness),
    };
  }

  const assignedModeration = roles.includes("reviewer")
    ? scopedModeration
        .map(({ moderation }) => moderation)
        .filter(
          (moderation) =>
            moderation.assignedReviewerPersonId === actor!.personId
        )
    : [];
  const assignedTranslations = roles.includes("translator")
    ? scopedTranslations
        .map(({ translation }) => translation)
        .filter(
          (translation) => translation.assigneePersonId === actor!.personId
        )
    : [];
  const visibleDraftIds = new Set([
    ...assignedModeration.flatMap((item) =>
      item.draftId === null ? [] : [item.draftId]
    ),
    ...assignedTranslations.map((item) => item.draftId),
  ]);
  const visibleDrafts = scopedDrafts
    .map(({ draft }) => draft)
    .filter((draft) => visibleDraftIds.has(draft.id));
  const visibleSubmissionIds = new Set(
    visibleDrafts.map((draft) => draft.submissionId)
  );

  return {
    scope: publicationScope,
    roles,
    submissions: scopedSubmissions.filter((submission) =>
      visibleSubmissionIds.has(submission.id)
    ),
    drafts: visibleDrafts,
    moderation: assignedModeration,
    translations: assignedTranslations,
    signOffs: [],
    readiness: [],
  };
}
