import { createId } from "../../domain/shared";
import { appendEntry } from "../../domain/audit-log";
import type { AuditLogEntry } from "../../domain/audit-log";
import type { Member, MembershipStatus, MembershipTier, StatusChange } from "./types";

/**
 * Membership Lifecycle: REGISTERED → VERIFIED → ACTIVE →
 * INACTIVE/PAUSED/SELF-ISOLATED/WITHDRAWN/RETIRED/SUSPENDED/TERMINATED,
 * exactly as specified in `MEMBER_PROFILE.md`'s "Membership Journey"
 * section. Every transition writes a real `AuditLog` entry (`ADR-002`)
 * and never touches any prior record — "Membership state changes do not
 * delete, invalidate, or remove documented contributions."
 */

export const VALID_TRANSITIONS: Record<MembershipStatus, MembershipStatus[]> = {
  registered: ["verified", "withdrawn"],
  verified: ["active", "withdrawn"],
  active: ["inactive", "paused", "self-isolated", "withdrawn", "retired", "suspended"],
  inactive: ["active", "withdrawn", "terminated"],
  paused: ["active", "withdrawn"],
  "self-isolated": ["active", "withdrawn"],
  withdrawn: [],
  retired: [],
  suspended: ["active", "terminated"],
  terminated: [],
};

export function createMember(personId: string, tier: MembershipTier): Member {
  return { id: createId(), personId, tier, status: "registered", createdAt: new Date() };
}

/**
 * Every progression step is milestone-based and human-confirmed — this
 * function performs the transition once the caller (a human-confirmed
 * process) has decided it; it never triggers itself from raw activity
 * counts, matching `MEMBER_PROFILE.md`'s Civic Progression System
 * discipline.
 */
export function transitionStatus(
  member: Member,
  toStatus: MembershipStatus,
  triggeringActivity: string
): { member: Member; change: StatusChange; auditEntry: AuditLogEntry } {
  const allowed = VALID_TRANSITIONS[member.status];
  if (!allowed.includes(toStatus)) {
    throw new Error(`Cannot transition Membership from "${member.status}" to "${toStatus}"`);
  }
  const change: StatusChange = {
    id: createId(),
    memberId: member.id,
    previousStatus: member.status,
    currentStatus: toStatus,
    triggeringActivity,
    timestamp: new Date(),
  };
  const auditEntry = appendEntry({
    actorPersonId: member.personId,
    action: "membership.status-transition",
    target: member.id,
  });
  return { member: { ...member, status: toStatus }, change, auditEntry };
}
