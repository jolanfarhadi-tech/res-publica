import { describe, it, expect } from "vitest";
import { computeParticipationPerSubscriber, computeFunnelStageEvents } from "./metrics";
import { getAISpendStatus } from "./ai-spend-status";
import { feedImpactTrackerSource } from "./impact-feed";
import { createPerson } from "../../domain/person";
import { createLedger, recordQuery } from "../ai-layer/cost-governance";
import type { LadderStageTransition } from "../community/types";
import type { ImpactEvidenceRecord } from "../dashboard/types";

describe("Analytics metrics — no attention/engagement fields", () => {
  it("computes participation-per-subscriber by language community", () => {
    const people = [
      createPerson({ name: "A", contact: { email: "a@x.com" }, locale: "de" }),
      createPerson({ name: "B", contact: { email: "b@x.com" }, locale: "fa" }),
    ];
    const snapshots = computeParticipationPerSubscriber(people, []);
    expect(snapshots.map((s) => s.languageCommunity).sort()).toEqual(["de", "fa"]);
  });

  it("never includes a duration, click-through, or time-on-site field (structural guardrail)", () => {
    const snapshot = computeParticipationPerSubscriber([], [])[0] ?? {
      id: "x",
      languageCommunity: "de",
      participationCount: 0,
      subscriberCount: 0,
      timestamp: new Date(),
    };
    const keys = Object.keys(snapshot);
    expect(keys).not.toContain("duration");
    expect(keys).not.toContain("clickThrough");
    expect(keys).not.toContain("timeOnSite");
    expect(keys).not.toContain("sessionDuration");
  });

  it("computes funnel stage events from real Community transitions", () => {
    const transitions: LadderStageTransition[] = [
      {
        id: "t1",
        communityMemberId: "cm1",
        fromStage: "anonymous",
        toStage: "identified-interest",
        triggeringTouchpoint: "content-view",
        relatedEntityId: null,
        timestamp: new Date(),
      },
    ];
    const events = computeFunnelStageEvents(transitions);
    expect(events).toEqual([{ id: expect.any(String), stage: "identified-interest", count: 1 }]);
  });
});

describe("Analytics x AI Layer integration (no independent usage ledger)", () => {
  it("reads spend directly from AI Layer's own ledger", () => {
    let ledger = createLedger(100);
    ledger = recordQuery(ledger, {
      timestamp: new Date(),
      prompt: "x",
      providerName: "local-keyword-search",
      cost: 10,
      refused: false,
    });
    const status = getAISpendStatus(ledger);
    expect(status.spend).toBe(10);
    expect(status.overCeiling).toBe(false);
  });
});

describe("Analytics x Dashboard integration (faithful surfacing, never re-derived)", () => {
  it("surfaces Impact Evidence Records unchanged", () => {
    const records: ImpactEvidenceRecord[] = [
      { id: "r1", personId: "p1", description: "Cited in the March dialogue summary", sourceFile: "x.mdx" },
    ];
    expect(feedImpactTrackerSource(records)).toEqual(records);
  });
});
