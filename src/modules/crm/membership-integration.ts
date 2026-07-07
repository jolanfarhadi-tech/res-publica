import type { InstitutionalSupporterProfile } from "../membership/types";
import type { InstitutionalPartner } from "./types";

/**
 * Real integration with Membership, per the approved dependency
 * (`mvp-module-blueprint.md` §8: "Dependencies. Core Platform, Membership
 * System") — found missing during the MVP Architectural Review and added
 * here rather than left as a documented-but-unimplemented dependency.
 *
 * Confirms an institutional Membership relationship and its CRM
 * partnership record reference the same underlying Organization, never
 * duplicating which organization is which (the same "Data siloing"
 * risk the spec itself names).
 */
export function sharesOrganization(profile: InstitutionalSupporterProfile, partner: InstitutionalPartner): boolean {
  return profile.organizationId === partner.organizationId;
}
