import { createId } from "../../domain/shared";
import type { PublishCommit, SignOffRecord } from "./types";

/**
 * Publish/Commit — models the decision that a signed-off draft is ready
 * to become a real Git commit. Deliberately does NOT write any file or
 * invoke git: creating a real commit is this session's "commit boundary"
 * exclusive stop condition, not a domain-logic concern. This marks a
 * `PublishCommit` record "ready" only — the actual file write and git
 * commit are a separate, explicitly-approved action, never performed here.
 */
export function markReadyToPublish(draftId: string, signOffRecord: SignOffRecord): PublishCommit {
  if (signOffRecord.draftId !== draftId) {
    throw new Error("Sign-off record does not match this draft");
  }
  return { id: createId(), draftId, status: "ready", commitHash: null };
}
