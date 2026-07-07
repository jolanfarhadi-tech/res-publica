import { createId } from "../../domain/shared";
import type { Member, MembershipBenefitGrant } from "./types";

/** A non-gamified benefit/access record — a grant, never a score or rank (Constitution Principle 2). */
export function grantBenefit(member: Member, benefitName: string): MembershipBenefitGrant {
  return { id: createId(), memberId: member.id, benefitName, grantedAt: new Date() };
}
