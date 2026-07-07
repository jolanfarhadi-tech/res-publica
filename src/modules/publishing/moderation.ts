import { createId } from "../../domain/shared";
import type { ModerationQueueEntry, SubmissionItem } from "./types";

/** Moderation Queue — list, assign, and decide on queued items. */
export function createModerationEntry(submission: SubmissionItem): ModerationQueueEntry {
  return {
    id: createId(),
    submissionId: submission.id,
    decision: "pending",
    assignedReviewerPersonId: null,
    reason: null,
  };
}

export function assignReviewer(entry: ModerationQueueEntry, reviewerPersonId: string): ModerationQueueEntry {
  return { ...entry, assignedReviewerPersonId: reviewerPersonId };
}

export function decide(
  entry: ModerationQueueEntry,
  decision: "approved" | "rejected",
  reason?: string
): ModerationQueueEntry {
  if (entry.decision !== "pending") {
    throw new Error(`Moderation entry ${entry.id} has already been decided`);
  }
  if (!entry.assignedReviewerPersonId) {
    throw new Error("Cannot decide a moderation entry with no assigned reviewer");
  }
  return { ...entry, decision, reason: reason ?? null };
}
