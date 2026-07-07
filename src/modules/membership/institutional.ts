import { createId } from "../../domain/shared";
import type { Organization } from "../../domain/organization";
import type { InstitutionalSupporterProfile, Member } from "./types";

/** Real integration with `domain/organization` (`ADR-002`) for institutional members. */
export function createInstitutionalProfile(member: Member, organization: Organization): InstitutionalSupporterProfile {
  return { id: createId(), memberId: member.id, organizationId: organization.id };
}
