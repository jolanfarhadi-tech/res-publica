import { SECURITY_ASSETS, type SecurityAsset } from "./attribution";

export const DEFENSIVE_ACTIONS = [
  "WATCH_ROUTE",
  "ELEVATE_LOGGING",
  "CORRELATE_INCIDENT",
  "TIGHTEN_RATE_LIMIT",
  "CHALLENGE_CLIENT",
  "ACTIVATE_DECOY_BRANCH",
  "REQUIRE_STEP_UP_MFA",
  "TEMPORARILY_BLOCK_SOURCE",
  "RESTRICT_SESSION",
  "NARROW_CAPABILITY",
  "TERMINATE_SESSION",
  "REVOKE_TOKEN",
  "ISOLATE_ACCOUNT",
  "FREEZE_SENSITIVE_WRITES",
  "PREPARE_QUARANTINE",
  "QUARANTINE_CAPABILITY",
  "DISABLE_AI_TOOL",
  "DISABLE_RAG_CORPUS",
  "FREEZE_CREDENTIAL_ISSUANCE",
  "FORCE_RESEARCH_FAIL_CLOSED",
  "ROTATE_CONFIRMED_EXPOSED_SECRET",
  "ALERT_OPERATOR",
  "PRESERVE_EVIDENCE",
] as const;

export type DefensiveAction = (typeof DEFENSIVE_ACTIONS)[number];
export type EvidenceLevel = "E0" | "E1" | "E2" | "E3";
export type DefensiveDisposition =
  | "AUTO_EXECUTE"
  | "REQUIRES_OPERATOR"
  | "REQUIRES_DUAL_APPROVAL";
export type Reversibility =
  | "REVERSIBLE"
  | "CONDITIONALLY_REVERSIBLE"
  | "MANUAL_RECOVERY_REQUIRED";

export type DefensiveSignal = {
  id: string;
  incidentId: string;
  sequence: number;
  loop: 1 | 2 | 3 | 4 | 5;
  kind:
    | "INITIAL_DECOY_SIGNAL"
    | "HONEYPOT_ENGAGEMENT"
    | "HIGH_VALUE_CONFIRMATION"
    | "ADAPTIVE_ATTRIBUTION"
    | "DEFENSIVE_SHADOW_CONFIRMATION";
  evidenceIds: string[];
  targetAsset: SecurityAsset;
  targetScope: string;
  observedAt: Date;
  contradictoryEvidence?: string[];
  compromiseConfirmed?: boolean;
};

export type DefensiveDecision = {
  policyId: string;
  evidenceLevel: EvidenceLevel;
  action: DefensiveAction;
  actionClass: 0 | 1 | 2 | 3 | 4;
  disposition: DefensiveDisposition;
  approvalCount: 0 | 1 | 2;
  reversibility: Reversibility;
  incidentId: string;
  targetAsset: SecurityAsset;
  targetScope: string;
  eventIds: string[];
  evidenceIds: string[];
  contradictoryEvidence: string[];
  rationale: string;
};

export type DefensiveActionState =
  | "PROPOSED"
  | "APPROVED"
  | "EXECUTED"
  | "EFFECT_VERIFIED"
  | "ROLLED_BACK"
  | "REJECTED";

export type DefensiveActionTransition = {
  state: DefensiveActionState;
  occurredAt: Date;
};

const IDENTIFIER = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/;
const SCOPE = /^[a-z0-9][a-z0-9.-]{0,127}$/;
const KIND_BY_LOOP: Record<DefensiveSignal["loop"], DefensiveSignal["kind"]> = {
  1: "INITIAL_DECOY_SIGNAL",
  2: "HONEYPOT_ENGAGEMENT",
  3: "HIGH_VALUE_CONFIRMATION",
  4: "ADAPTIVE_ATTRIBUTION",
  5: "DEFENSIVE_SHADOW_CONFIRMATION",
};

function assertSignal(signal: DefensiveSignal): void {
  if (!IDENTIFIER.test(signal.id) || !IDENTIFIER.test(signal.incidentId)) {
    throw new DefensiveCorrespondenceError("defensive_event_identifier_invalid");
  }
  if (!Number.isInteger(signal.sequence) || signal.sequence < 1) {
    throw new DefensiveCorrespondenceError("defensive_event_order_invalid");
  }
  if (KIND_BY_LOOP[signal.loop] !== signal.kind) {
    throw new DefensiveCorrespondenceError("defensive_loop_kind_invalid");
  }
  if (!SCOPE.test(signal.targetScope) || !SECURITY_ASSETS.includes(signal.targetAsset)) {
    throw new DefensiveCorrespondenceError("defensive_target_scope_invalid");
  }
  if (!Number.isFinite(signal.observedAt.getTime())) {
    throw new DefensiveCorrespondenceError("defensive_event_time_invalid");
  }
  if (signal.compromiseConfirmed === true && signal.loop !== 5) {
    throw new DefensiveCorrespondenceError("defensive_confirmation_scope_invalid");
  }
  if (signal.evidenceIds.length === 0 || signal.evidenceIds.length > 32) {
    throw new DefensiveCorrespondenceError("defensive_evidence_invalid");
  }
  for (const reference of [...signal.evidenceIds, ...(signal.contradictoryEvidence ?? [])]) {
    if (!IDENTIFIER.test(reference)) {
      throw new DefensiveCorrespondenceError("defensive_evidence_invalid");
    }
  }
}

function evidenceLevel(signals: DefensiveSignal[]): EvidenceLevel {
  const evidence = new Set(signals.flatMap((signal) => signal.evidenceIds));
  const contradictions = new Set(
    signals.flatMap((signal) => signal.contradictoryEvidence ?? [])
  );
  if (contradictions.size > 0) return "E0";
  const highestLoop = Math.max(...signals.map((signal) => signal.loop));
  if (
    highestLoop >= 5 &&
    evidence.size >= 5 &&
    signals.some((signal) => signal.compromiseConfirmed === true)
  ) return "E3";
  if (highestLoop >= 3 && evidence.size >= 3) return "E2";
  if (highestLoop >= 2 && evidence.size >= 2) return "E1";
  return "E0";
}

export function evaluateDefensiveSequence(signals: DefensiveSignal[]): DefensiveDecision {
  if (signals.length === 0 || signals.length > 64) {
    throw new DefensiveCorrespondenceError("defensive_sequence_invalid");
  }
  const ids = new Set<string>();
  let previousSequence = 0;
  let previousLoop = 0;
  let previousObservedAt: Date | null = null;
  const incidentId = signals[0].incidentId;
  const targetAsset = signals[0].targetAsset;
  const targetScope = signals[0].targetScope;
  for (const signal of signals) {
    assertSignal(signal);
    if (ids.has(signal.id) || signal.sequence === previousSequence) {
      throw new DefensiveCorrespondenceError("defensive_event_replay");
    }
    if (signal.sequence <= previousSequence) {
      throw new DefensiveCorrespondenceError("defensive_event_order_invalid");
    }
    if (previousSequence > 0 && signal.sequence !== previousSequence + 1) {
      throw new DefensiveCorrespondenceError("defensive_event_sequence_gap");
    }
    if (previousLoop > 0 && (signal.loop < previousLoop || signal.loop > previousLoop + 1)) {
      throw new DefensiveCorrespondenceError("defensive_loop_transition_invalid");
    }
    if (previousObservedAt !== null && signal.observedAt <= previousObservedAt) {
      throw new DefensiveCorrespondenceError("defensive_event_time_order_invalid");
    }
    if (
      signal.incidentId !== incidentId ||
      signal.targetAsset !== targetAsset ||
      signal.targetScope !== targetScope
    ) {
      throw new DefensiveCorrespondenceError("defensive_sequence_scope_mismatch");
    }
    ids.add(signal.id);
    previousSequence = signal.sequence;
    previousLoop = signal.loop;
    previousObservedAt = signal.observedAt;
  }
  if (signals[0].sequence !== 1 || signals[0].loop !== 1) {
    throw new DefensiveCorrespondenceError("defensive_sequence_start_invalid");
  }

  const level = evidenceLevel(signals);
  const configuration: Record<EvidenceLevel, Omit<DefensiveDecision,
    "incidentId" | "targetAsset" | "targetScope" | "eventIds" |
    "evidenceIds" | "contradictoryEvidence">> = {
    E0: {
      policyId: "aa-observe-v1",
      evidenceLevel: "E0",
      action: "WATCH_ROUTE",
      actionClass: 0,
      disposition: "AUTO_EXECUTE",
      approvalCount: 0,
      reversibility: "REVERSIBLE",
      rationale: "An isolated or contradicted signal supports observation only.",
    },
    E1: {
      policyId: "aa-bounded-decoy-v1",
      evidenceLevel: "E1",
      action: "ACTIVATE_DECOY_BRANCH",
      actionClass: 1,
      disposition: "AUTO_EXECUTE",
      approvalCount: 0,
      reversibility: "REVERSIBLE",
      rationale: "Independent modest evidence permits only an inert synthetic branch.",
    },
    E2: {
      policyId: "aa-prepare-containment-v1",
      evidenceLevel: "E2",
      action: "ALERT_OPERATOR",
      actionClass: 2,
      disposition: "REQUIRES_OPERATOR",
      approvalCount: 1,
      reversibility: "REVERSIBLE",
      rationale: "Strong evidence permits operator-reviewed preparation, not containment.",
    },
    E3: {
      policyId: "aa-high-confidence-quarantine-v1",
      evidenceLevel: "E3",
      action: "PREPARE_QUARANTINE",
      actionClass: 3,
      disposition: "REQUIRES_OPERATOR",
      approvalCount: 1,
      reversibility: "CONDITIONALLY_REVERSIBLE",
      rationale: "Confirmed composite evidence permits reviewed quarantine preparation.",
    },
  };
  const selected = configuration[level];
  return {
    ...selected,
    incidentId,
    targetAsset,
    targetScope,
    eventIds: signals.map((signal) => signal.id),
    evidenceIds: [...new Set(signals.flatMap((signal) => signal.evidenceIds))].sort(),
    contradictoryEvidence: [
      ...new Set(signals.flatMap((signal) => signal.contradictoryEvidence ?? [])),
    ].sort(),
  };
}

const ALLOWED_TRANSITIONS: Record<DefensiveActionState, DefensiveActionState[]> = {
  PROPOSED: ["APPROVED", "EXECUTED", "REJECTED"],
  APPROVED: ["EXECUTED", "REJECTED"],
  EXECUTED: ["EFFECT_VERIFIED"],
  EFFECT_VERIFIED: ["ROLLED_BACK"],
  ROLLED_BACK: [],
  REJECTED: [],
};

export function transitionDefensiveAction(
  history: DefensiveActionTransition[],
  state: DefensiveActionState,
  occurredAt: Date
): DefensiveActionTransition {
  if (!Number.isFinite(occurredAt.getTime())) {
    throw new DefensiveCorrespondenceError("defensive_transition_time_invalid");
  }
  if (history.length === 0) {
    if (state !== "PROPOSED") {
      throw new DefensiveCorrespondenceError("defensive_transition_invalid");
    }
    return { state, occurredAt };
  }
  const previous = history.at(-1)!;
  if (occurredAt <= previous.occurredAt) {
    throw new DefensiveCorrespondenceError("defensive_transition_order_invalid");
  }
  if (state === "ROLLED_BACK" && previous.state !== "EFFECT_VERIFIED") {
    throw new DefensiveCorrespondenceError("defensive_effect_not_verified");
  }
  if (!ALLOWED_TRANSITIONS[previous.state].includes(state)) {
    throw new DefensiveCorrespondenceError("defensive_transition_invalid");
  }
  return { state, occurredAt };
}

export class DefensiveCorrespondenceError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "DefensiveCorrespondenceError";
  }
}
