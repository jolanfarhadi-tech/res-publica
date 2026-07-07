/**
 * Publishing — Foundation Build Order Step 5, MVP module #3.
 *
 * "The back-stage editorial pipeline — intake, moderation, AI-assisted
 * draft authoring, translation handoff, and the actual commit into the
 * Git-sourced content tree — kept strictly separate from the public-facing
 * Website & CMS so that AI assistance never bypasses a named human's
 * sign-off before anything goes live" (`mvp-module-blueprint.md`).
 */

export type SubmissionStatus = "pending" | "moderated";

export type SubmissionItem = {
  id: string;
  title: string;
  rawContent: string;
  submittedByPersonId: string;
  submittedAt: Date;
  status: SubmissionStatus;
};

export type ModerationDecision = "pending" | "approved" | "rejected";

export type ModerationQueueEntry = {
  id: string;
  submissionId: string;
  decision: ModerationDecision;
  assignedReviewerPersonId: string | null;
  reason: string | null;
};

export type DraftAuthorType = "ai" | "human";

export type DraftDocument = {
  id: string;
  submissionId: string;
  content: string;
  citations: string[];
  weakCitationFlags: string[];
  authorType: DraftAuthorType;
  version: number;
};

export type TranslationStatus = "pending" | "ai-draft" | "human-finalized";

export type TranslationHandoff = {
  id: string;
  draftId: string;
  locale: string;
  status: TranslationStatus;
  assigneePersonId: string | null;
};

export type SignOffRecord = {
  id: string;
  draftId: string;
  approverPersonId: string;
  timestamp: Date;
};

export type PublishCommitStatus = "pending" | "ready" | "committed";

export type PublishCommit = {
  id: string;
  draftId: string;
  status: PublishCommitStatus;
  /** Populated only once a real Git commit has actually happened — never set by this module itself (see publish.ts). */
  commitHash: string | null;
};
