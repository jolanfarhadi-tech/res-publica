import type { CommunityMember } from "../community/types";
import type { Member } from "./types";
import { transitionStatus } from "./lifecycle";

/**
 * Real integration with Community, per `MEMBER_PROFILE.md`'s Civic
 * Progression System: "A pattern of verified activity may prompt a
 * Membership Status review within Membership System's own existing
 * workflow." Human-confirmed, milestone-based: this function reflects a
 * standing already reached (by Community's own rules engine) — it does
 * not itself score or auto-promote from a raw activity count, matching
 * that document's "never a numeric accumulation" discipline.
 */
export function reviewStatusFromCommunityStanding(member: Member, communityMember: CommunityMember): Member {
  // Only "verified" members are eligible — the documented lifecycle is
  // sequential (REGISTERED → VERIFIED → ACTIVE); community standing alone
  // must not skip the verification step. A "registered" member's standing
  // has no effect here until they're separately verified.
  if (member.status !== "verified") {
    return member;
  }
  if (communityMember.currentStage === "contributing-participant" || communityMember.currentStage === "recurring-supporter") {
    return transitionStatus(member, "active", `community-standing:${communityMember.currentStage}`).member;
  }
  return member;
}
