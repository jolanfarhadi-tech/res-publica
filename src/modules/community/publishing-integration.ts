import type { PublishCommit } from "../publishing/types";
import type { CommunityMember, TouchpointType } from "./types";
import { recordTouchpoint } from "./ladder";

/**
 * Real integration with Publishing: a community member viewing content
 * that has actually been published (or is sign-off-ready) is a legitimate
 * content-view touchpoint. Reads Publishing's already-produced
 * `PublishCommit` status only — never duplicates Publishing's own data or
 * logic (Composition over Duplication).
 */
export function touchpointFromPublishedContent(
  member: CommunityMember,
  publishCommit: PublishCommit,
  relatedEntityId: string | null = null
) {
  if (publishCommit.status !== "ready" && publishCommit.status !== "committed") {
    throw new Error("Cannot record a touchpoint for content that is neither ready nor committed");
  }
  const touchpoint: TouchpointType = "content-view";
  return recordTouchpoint(member, touchpoint, relatedEntityId);
}
