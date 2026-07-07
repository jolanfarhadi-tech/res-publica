import { createId } from "../../domain/shared";
import { appendEntry } from "../../domain/audit-log";
import type { AuditLogEntry } from "../../domain/audit-log";
import type { CommunityMember, LadderStage, LadderStageTransition, TouchpointType } from "./types";

/**
 * The Community Journey ladder — "a deliberately non-ML, auditable rules
 * engine." Every transition is a plain, inspectable rule; every transition
 * writes a real AuditLog entry (`ADR-002`), not a parallel log.
 */

const STAGE_ORDER: LadderStage[] = [
  "anonymous",
  "identified-interest",
  "first-touch",
  "contributing-participant",
  "recurring-supporter",
];

export function createCommunityMember(personId: string): CommunityMember {
  return { id: createId(), personId, currentStage: "anonymous" };
}

function nextStage(current: LadderStage): LadderStage | null {
  const index = STAGE_ORDER.indexOf(current);
  return index >= 0 && index < STAGE_ORDER.length - 1 ? STAGE_ORDER[index + 1] : null;
}

/**
 * Get Ladder Stage — the member's current stage, read-only.
 */
export function getLadderStage(member: CommunityMember): LadderStage {
  return member.currentStage;
}

/**
 * Record Touchpoint — advances a member exactly one stage per call, per
 * the deterministic rule ladder. Never skips a stage, never scores or
 * predicts — a rules engine, not a model.
 */
export function recordTouchpoint(
  member: CommunityMember,
  touchpoint: TouchpointType,
  relatedEntityId: string | null = null
): { member: CommunityMember; transition: LadderStageTransition; auditEntry: AuditLogEntry } {
  const to = nextStage(member.currentStage);
  if (!to) {
    throw new Error(`Community member ${member.id} is already at the final ladder stage`);
  }
  const transition: LadderStageTransition = {
    id: createId(),
    communityMemberId: member.id,
    fromStage: member.currentStage,
    toStage: to,
    triggeringTouchpoint: touchpoint,
    relatedEntityId,
    timestamp: new Date(),
  };
  const auditEntry = appendEntry({
    actorPersonId: member.personId,
    action: "community.ladder-stage-transition",
    target: member.id,
  });
  return { member: { ...member, currentStage: to }, transition, auditEntry };
}
