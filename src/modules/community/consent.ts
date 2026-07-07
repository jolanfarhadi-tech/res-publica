import { grantConsent, hasActiveConsent, type ConsentRecord } from "../../domain/consent";
import type { CommunityMember } from "./types";

/**
 * Update Consent — Community reuses the canonical `ConsentRecord` entity
 * (`ADR-002`) directly. No parallel consent mechanism: Community's own
 * pre-unification `ConsentRecord` concept was one of the exact duplicates
 * `ADR-002` was written to eliminate, and this module does not reintroduce
 * it.
 */
export function grantCommunityTrackingConsent(member: CommunityMember): ConsentRecord {
  return grantConsent(member.personId, "tracking");
}

export function isTrackingConsented(member: CommunityMember, records: readonly ConsentRecord[]): boolean {
  return hasActiveConsent(records, member.personId, "tracking");
}
