import { describe, expect, it } from "vitest";
import {
  evaluateDefensiveSequence,
  transitionDefensiveAction,
  type DefensiveSignal,
} from "./defensive-correspondence";

const at = (minute: number) => new Date(`2026-08-16T12:${String(minute).padStart(2, "0")}:00.000Z`);

function signal(
  sequence: number,
  loop: 1 | 2 | 3 | 4 | 5,
  kind: DefensiveSignal["kind"],
  overrides: Partial<DefensiveSignal> = {}
): DefensiveSignal {
  return {
    id: `event-${sequence}`,
    incidentId: "incident-1",
    sequence,
    loop,
    kind,
    evidenceIds: [`observation-${sequence}`],
    targetAsset: "research-zk",
    targetScope: "research.verifier",
    observedAt: at(sequence),
    ...overrides,
  };
}

describe("A/A′ defensive correspondence", () => {
  it("maps an isolated observation only to automatic observational action", () => {
    const decision = evaluateDefensiveSequence([signal(1, 1, "INITIAL_DECOY_SIGNAL")]);
    expect(decision).toMatchObject({
      evidenceLevel: "E0",
      action: "WATCH_ROUTE",
      actionClass: 0,
      disposition: "AUTO_EXECUTE",
      reversibility: "REVERSIBLE",
    });
    expect(decision.evidenceIds).toEqual(["observation-1"]);
  });

  it("permits a bounded decoy branch only after independent modest evidence", () => {
    const decision = evaluateDefensiveSequence([
      signal(1, 1, "INITIAL_DECOY_SIGNAL"),
      signal(2, 2, "HONEYPOT_ENGAGEMENT"),
    ]);
    expect(decision).toMatchObject({
      evidenceLevel: "E1",
      action: "ACTIVATE_DECOY_BRANCH",
      actionClass: 1,
      disposition: "AUTO_EXECUTE",
    });
  });

  it.each([
    ["fake research probing", "research-zk"],
    ["fake RAG attacks", "ai-rag"],
    ["fake administrator attacks", "operations"],
  ])("resists %s causing high-impact self-denial", (_scenario, targetAsset) => {
    const decision = evaluateDefensiveSequence([
      signal(1, 1, "INITIAL_DECOY_SIGNAL", { targetAsset: targetAsset as DefensiveSignal["targetAsset"] }),
      signal(2, 2, "HONEYPOT_ENGAGEMENT", { targetAsset: targetAsset as DefensiveSignal["targetAsset"] }),
    ]);
    expect(decision.actionClass).toBeLessThanOrEqual(1);
    expect(decision.disposition).toBe("AUTO_EXECUTE");
  });

  it("does not escalate distributed low-confidence events or contradictions", () => {
    const decision = evaluateDefensiveSequence([
      signal(1, 1, "INITIAL_DECOY_SIGNAL"),
      signal(2, 2, "HONEYPOT_ENGAGEMENT", {
        evidenceIds: ["observation-1"],
        contradictoryEvidence: ["benign-monitor-confirmed"],
      }),
      signal(3, 3, "HIGH_VALUE_CONFIRMATION", {
        evidenceIds: ["observation-1"],
      }),
    ]);
    expect(decision.evidenceLevel).toBe("E0");
    expect(decision.actionClass).toBe(0);
  });

  it("requires strong composite evidence and review for containment", () => {
    const decision = evaluateDefensiveSequence([
      signal(1, 1, "INITIAL_DECOY_SIGNAL"),
      signal(2, 2, "HONEYPOT_ENGAGEMENT"),
      signal(3, 3, "HIGH_VALUE_CONFIRMATION"),
      signal(4, 4, "ADAPTIVE_ATTRIBUTION", { evidenceIds: ["observation-4", "claim-1"] }),
      signal(5, 5, "DEFENSIVE_SHADOW_CONFIRMATION", {
        evidenceIds: ["observation-5", "claim-2"],
        compromiseConfirmed: true,
      }),
    ]);
    expect(decision).toMatchObject({
      evidenceLevel: "E3",
      action: "PREPARE_QUARANTINE",
      actionClass: 3,
      disposition: "REQUIRES_OPERATOR",
      approvalCount: 1,
    });
  });

  it("rejects replay, reordering, loop skipping and attacker-controlled fields", () => {
    expect(() => evaluateDefensiveSequence([
      signal(1, 1, "INITIAL_DECOY_SIGNAL"),
      signal(1, 2, "HONEYPOT_ENGAGEMENT"),
    ])).toThrow("defensive_event_replay");
    expect(() => evaluateDefensiveSequence([
      signal(2, 1, "INITIAL_DECOY_SIGNAL"),
      signal(1, 2, "HONEYPOT_ENGAGEMENT"),
    ])).toThrow("defensive_event_order_invalid");
    expect(() => evaluateDefensiveSequence([
      signal(1, 1, "INITIAL_DECOY_SIGNAL"),
      signal(2, 3, "HIGH_VALUE_CONFIRMATION"),
    ])).toThrow("defensive_loop_transition_invalid");
    expect(() => evaluateDefensiveSequence([
      signal(1, 1, "INITIAL_DECOY_SIGNAL", { targetScope: "x; rm -rf /" }),
    ])).toThrow("defensive_target_scope_invalid");
  });

  it("requires every sequence to start at Loop 1 with sequence number 1", () => {
    expect(() => evaluateDefensiveSequence([
      signal(5, 5, "DEFENSIVE_SHADOW_CONFIRMATION", {
        evidenceIds: ["evidence-1", "evidence-2", "evidence-3", "evidence-4", "evidence-5"],
        compromiseConfirmed: true,
      }),
    ])).toThrow("defensive_sequence_start_invalid");

    expect(() => evaluateDefensiveSequence([
      signal(2, 1, "INITIAL_DECOY_SIGNAL"),
    ])).toThrow("defensive_sequence_start_invalid");
  });

  it("requires contiguous sequence numbers and strictly increasing observation times", () => {
    expect(() => evaluateDefensiveSequence([
      signal(1, 1, "INITIAL_DECOY_SIGNAL"),
      signal(3, 2, "HONEYPOT_ENGAGEMENT"),
    ])).toThrow("defensive_event_sequence_gap");

    expect(() => evaluateDefensiveSequence([
      signal(1, 1, "INITIAL_DECOY_SIGNAL", { observedAt: at(10) }),
      signal(2, 2, "HONEYPOT_ENGAGEMENT", { observedAt: at(9) }),
    ])).toThrow("defensive_event_time_order_invalid");
  });

  it("accepts compromise confirmation only at the final defensive-shadow loop", () => {
    expect(() => evaluateDefensiveSequence([
      signal(1, 1, "INITIAL_DECOY_SIGNAL", { compromiseConfirmed: true }),
    ])).toThrow("defensive_confirmation_scope_invalid");
  });

  it("requires verified effect before rollback and preserves transition order", () => {
    const proposed = transitionDefensiveAction([], "PROPOSED", at(1));
    const executed = transitionDefensiveAction([proposed], "EXECUTED", at(2));
    expect(() => transitionDefensiveAction([proposed, executed], "ROLLED_BACK", at(3)))
      .toThrow("defensive_effect_not_verified");
    const verified = transitionDefensiveAction([proposed, executed], "EFFECT_VERIFIED", at(3));
    const rolledBack = transitionDefensiveAction(
      [proposed, executed, verified],
      "ROLLED_BACK",
      at(4)
    );
    expect(rolledBack.state).toBe("ROLLED_BACK");
  });
});
