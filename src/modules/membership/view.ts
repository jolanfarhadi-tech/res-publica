import { VALID_TRANSITIONS } from "./lifecycle";
import type { Member, MembershipStatus, StatusChange } from "./types";

/**
 * Membership Journey view model — a stable, presentation-ready shape
 * matching `MEMBER_PROFILE.md`'s own documented display fields exactly
 * ("Current Membership Status, Previous Status, Status Change Date,
 * Triggering Activity... Next Available Status"). A future frontend
 * consumes this, never raw `Member`/`StatusChange` domain objects
 * directly — the same reuse discipline `MEMBER_PROFILE.md` itself
 * requires ("displays status... does not become a second implementation").
 */
export type MembershipJourneyView = {
  memberId: string;
  currentStatus: MembershipStatus;
  previousStatus: MembershipStatus | null;
  statusChangeDate: Date | null;
  triggeringActivity: string | null;
  nextAvailableStatuses: MembershipStatus[];
};

export function toMembershipJourneyView(member: Member, changes: readonly StatusChange[]): MembershipJourneyView {
  const relevant = changes
    .filter((c) => c.memberId === member.id)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const latest = relevant[0] ?? null;

  return {
    memberId: member.id,
    currentStatus: member.status,
    previousStatus: latest?.previousStatus ?? null,
    statusChangeDate: latest?.timestamp ?? null,
    triggeringActivity: latest?.triggeringActivity ?? null,
    nextAvailableStatuses: VALID_TRANSITIONS[member.status],
  };
}
