import { createHash } from "node:crypto";
import { asc, eq, inArray } from "drizzle-orm";
import { requireAuthorization } from "../auth/authorize";
import type { AuthenticatedActor } from "../auth/types";
import { createId } from "../domain/shared";
import {
  evaluateDefensiveSequence,
  transitionDefensiveAction,
  type DefensiveActionState,
  type DefensiveActionTransition,
  type DefensiveSignal,
} from "../modules/security-operations/defensive-correspondence";
import type { Database } from "../persistence";
import {
  securityAttributionClaims,
  securityDefensiveActionEvents,
  securityDefensiveActions,
  securityDefensiveSignals,
  securityIncidents,
  securityObservations,
} from "../persistence/module-schema";
import { auditLog } from "../persistence/schema";

const SAFE_AUTO_ACTIONS = new Set(["WATCH_ROUTE", "ACTIVATE_DECOY_BRANCH"]);
const SAFE_REVIEWED_ACTIONS = new Set(["ALERT_OPERATOR", "PREPARE_QUARANTINE"]);
type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function requireRecentMfa(
  actor: AuthenticatedActor | null,
  capability: string,
  target: string,
  now: Date
): asserts actor is AuthenticatedActor {
  requireAuthorization(actor, {
    domain: "governance",
    capability,
    target,
    requireExactTarget: true,
    minimumAssurance: "recent-mfa",
    now,
  });
}

async function appendActionEvent(
  transaction: Transaction,
  input: {
    actionId: string;
    state: DefensiveActionState;
    actorPersonId: string;
    requestId: string;
    occurredAt: Date;
  }
) {
  return transaction.insert(securityDefensiveActionEvents).values({
    id: createId(),
    ...input,
    evidenceHash: digest(input),
  });
}

export async function recordDefensiveSequence(
  db: Database,
  actor: AuthenticatedActor | null,
  input: { incidentId: string; requestId: string; signals: DefensiveSignal[] }
) {
  const now = new Date();
  requireRecentMfa(actor, "security.response.evaluate", input.incidentId, now);
  if (input.signals.some((signal) => signal.incidentId !== input.incidentId)) {
    throw new DefensiveResponseError("defensive_sequence_scope_mismatch");
  }
  const decision = evaluateDefensiveSequence(input.signals);
  if (decision.actionClass <= 1 && !SAFE_AUTO_ACTIONS.has(decision.action)) {
    throw new DefensiveResponseError("automatic_action_not_allowlisted");
  }
  const actionId = createId();

  return db.transaction(async (transaction) => {
    const [incident] = await transaction.select({
      id: securityIncidents.id,
      openedByPersonId: securityIncidents.openedByPersonId,
    }).from(securityIncidents).where(eq(securityIncidents.id, input.incidentId)).limit(1).for("update");
    if (!incident) throw new DefensiveResponseError("incident_not_found");
    if (incident.openedByPersonId === actor.personId) {
      throw new DefensiveResponseError("separation_of_duties_required");
    }

    const evidenceIds = [...new Set([
      ...decision.evidenceIds,
      ...decision.contradictoryEvidence,
    ])];
    const observations = evidenceIds.length ? await transaction.select({
      id: securityObservations.id,
      incidentId: securityObservations.incidentId,
    })
      .from(securityObservations)
      .where(inArray(securityObservations.id, evidenceIds)) : [];
    const claims = evidenceIds.length ? await transaction.select({
      id: securityAttributionClaims.id,
      incidentId: securityAttributionClaims.incidentId,
      confidence: securityAttributionClaims.confidence,
      authoredByPersonId: securityAttributionClaims.authoredByPersonId,
    })
      .from(securityAttributionClaims)
      .where(inArray(securityAttributionClaims.id, evidenceIds)) : [];
    const foundEvidence = new Set([...observations, ...claims].map((item) => item.id));
    if (evidenceIds.some((id) => !foundEvidence.has(id))) {
      throw new DefensiveResponseError("defensive_evidence_not_found");
    }
    if ([...observations, ...claims].some((item) => item.incidentId !== input.incidentId)) {
      throw new DefensiveResponseError("defensive_evidence_scope_mismatch");
    }
    if (
      decision.actionClass >= 2 &&
      !claims.some((claim) =>
        decision.evidenceIds.includes(claim.id) &&
        claim.confidence === "HIGH" &&
        claim.authoredByPersonId !== actor.personId &&
        claim.authoredByPersonId !== incident.openedByPersonId
      )
    ) {
      throw new DefensiveResponseError("defensive_independent_confirmation_required");
    }

    await transaction.insert(securityDefensiveSignals).values(input.signals.map((signal) => ({
      id: signal.id,
      incidentId: signal.incidentId,
      sequence: signal.sequence,
      loop: signal.loop,
      kind: signal.kind,
      evidenceIds: signal.evidenceIds,
      targetAsset: signal.targetAsset,
      targetScope: signal.targetScope,
      contradictoryEvidence: signal.contradictoryEvidence ?? [],
      compromiseConfirmed: signal.compromiseConfirmed ?? false,
      observedAt: signal.observedAt,
      evidenceHash: digest(signal),
      recordedByPersonId: actor.personId,
      recordedAt: now,
    })));
    await transaction.insert(securityDefensiveActions).values({
      id: actionId,
      incidentId: decision.incidentId,
      policyId: decision.policyId,
      evidenceLevel: decision.evidenceLevel,
      action: decision.action,
      actionClass: decision.actionClass,
      disposition: decision.disposition,
      approvalCount: decision.approvalCount,
      reversibility: decision.reversibility,
      targetAsset: decision.targetAsset,
      targetScope: decision.targetScope,
      eventIds: decision.eventIds,
      evidenceIds: decision.evidenceIds,
      contradictoryEvidence: decision.contradictoryEvidence,
      rationale: decision.rationale,
      proposedByPersonId: actor.personId,
      proposedAt: now,
    });
    await appendActionEvent(transaction, {
      actionId, state: "PROPOSED", actorPersonId: actor.personId,
      requestId: input.requestId, occurredAt: now,
    });
    if (decision.disposition === "AUTO_EXECUTE") {
      const executedAt = new Date(now.getTime() + 1);
      await appendActionEvent(transaction, {
        actionId, state: "EXECUTED", actorPersonId: actor.personId,
        requestId: input.requestId, occurredAt: executedAt,
      });
      await appendActionEvent(transaction, {
        actionId, state: "EFFECT_VERIFIED", actorPersonId: actor.personId,
        requestId: input.requestId, occurredAt: new Date(now.getTime() + 2),
      });
    }
    await transaction.insert(auditLog).values({
      id: createId(),
      actorPersonId: actor.personId,
      action: "security.defensive-response-evaluated",
      target: `security-response:${actionId}`,
      sessionId: actor.sessionId,
      requestId: input.requestId,
      capability: "security.response.evaluate",
      reasonCode: "security-defensive-response",
      timestamp: now,
      pseudonymized: false,
    });
    return { actionId, decision };
  });
}

async function actionWithHistory(transaction: Transaction, actionId: string) {
  const [action] = await transaction.select().from(securityDefensiveActions)
    .where(eq(securityDefensiveActions.id, actionId)).limit(1).for("update");
  if (!action) throw new DefensiveResponseError("defensive_action_not_found");
  const events = await transaction.select().from(securityDefensiveActionEvents)
    .where(eq(securityDefensiveActionEvents.actionId, actionId))
    .orderBy(asc(securityDefensiveActionEvents.occurredAt));
  return { action, events };
}

export async function reviewDefensiveAction(
  db: Database,
  actor: AuthenticatedActor | null,
  input: { actionId: string; decision: "approve" | "reject"; requestId: string }
) {
  const now = new Date();
  requireRecentMfa(actor, "security.response.approve", input.actionId, now);
  return db.transaction(async (transaction) => {
    const { action, events } = await actionWithHistory(transaction, input.actionId);
    const [incident] = await transaction.select({ openedByPersonId: securityIncidents.openedByPersonId })
      .from(securityIncidents).where(eq(securityIncidents.id, action.incidentId)).limit(1).for("update");
    if (!incident) throw new DefensiveResponseError("incident_not_found");
    if (actor.personId === action.proposedByPersonId || actor.personId === incident.openedByPersonId) {
      throw new DefensiveResponseError("separation_of_duties_required");
    }
    const history = events.map((event) => ({ state: event.state, occurredAt: event.occurredAt })) as DefensiveActionTransition[];
    const firstState = input.decision === "approve" ? "APPROVED" : "REJECTED";
    const first = transitionDefensiveAction(history, firstState, now);
    await appendActionEvent(transaction, {
      actionId: input.actionId, state: first.state, actorPersonId: actor.personId,
      requestId: input.requestId, occurredAt: first.occurredAt,
    });
    if (input.decision === "approve") {
      if (!SAFE_REVIEWED_ACTIONS.has(action.action)) {
        throw new DefensiveResponseError("reviewed_action_requires_external_execution");
      }
      const executed = transitionDefensiveAction([...history, first], "EXECUTED", new Date(now.getTime() + 1));
      const verified = transitionDefensiveAction([...history, first, executed], "EFFECT_VERIFIED", new Date(now.getTime() + 2));
      await appendActionEvent(transaction, {
        actionId: input.actionId, state: executed.state, actorPersonId: actor.personId,
        requestId: input.requestId, occurredAt: executed.occurredAt,
      });
      await appendActionEvent(transaction, {
        actionId: input.actionId, state: verified.state, actorPersonId: actor.personId,
        requestId: input.requestId, occurredAt: verified.occurredAt,
      });
    }
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: input.decision === "approve" ? "security.defensive-response-approved" : "security.defensive-response-rejected",
      target: `security-response:${input.actionId}`,
      sessionId: actor.sessionId, requestId: input.requestId,
      capability: "security.response.approve", reasonCode: "security-defensive-response",
      timestamp: now, pseudonymized: false,
    });
    return { actionId: input.actionId, state: input.decision === "approve" ? "EFFECT_VERIFIED" : "REJECTED" };
  });
}

export async function rollbackDefensiveAction(
  db: Database,
  actor: AuthenticatedActor | null,
  input: { actionId: string; requestId: string }
) {
  const now = new Date();
  requireRecentMfa(actor, "security.response.rollback", input.actionId, now);
  return db.transaction(async (transaction) => {
    const { action, events } = await actionWithHistory(transaction, input.actionId);
    if (actor.personId === action.proposedByPersonId) {
      throw new DefensiveResponseError("separation_of_duties_required");
    }
    const history = events.map((event) => ({ state: event.state, occurredAt: event.occurredAt })) as DefensiveActionTransition[];
    const latestTime = history.at(-1)?.occurredAt.getTime() ?? 0;
    const rollbackTime = new Date(Math.max(now.getTime(), latestTime + 1));
    const rolledBack = transitionDefensiveAction(history, "ROLLED_BACK", rollbackTime);
    await appendActionEvent(transaction, {
      actionId: input.actionId, state: rolledBack.state, actorPersonId: actor.personId,
      requestId: input.requestId, occurredAt: rolledBack.occurredAt,
    });
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: "security.defensive-response-rolled-back",
      target: `security-response:${input.actionId}`,
      sessionId: actor.sessionId, requestId: input.requestId,
      capability: "security.response.rollback", reasonCode: "security-defensive-response",
      timestamp: now, pseudonymized: false,
    });
    return { actionId: input.actionId, state: rolledBack.state };
  });
}

export class DefensiveResponseError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "DefensiveResponseError";
  }
}
