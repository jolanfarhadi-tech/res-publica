import { describe, it, expect } from "vitest";
import { getDashboardManifest } from "./manifest-composition";
import { createUserPreference, followTopic } from "./preferences";
import { getPersonalizedDigest } from "./digest";
import { buildImpactEvidence } from "./impact-tracker";
import { grantConsent } from "../../domain/consent";
import type { KnowledgeGraph } from "../knowledge-graph/types";
import type { LadderStageTransition } from "../community/types";
import type { OutcomePublication } from "../events/types";

describe("Dashboard manifest composition", () => {
  it("shows the topic-chip picker for cold-start visitors", () => {
    const manifest = getDashboardManifest("visitor");
    expect(manifest).toEqual([{ segment: "visitor", moduleName: "topic-chip-picker", order: 1 }]);
  });

  it("differs for participant vs visitor without duplicated logic", () => {
    const participant = getDashboardManifest("participant");
    expect(participant.map((m) => m.moduleName)).toEqual(["personalized-digest", "upcoming-events", "impact-tracker"]);
  });
});

describe("Follow Preferences (consent-gated)", () => {
  it("refuses to personalize without active tracking consent", () => {
    const pref = createUserPreference("person-1");
    expect(() => followTopic(pref, [], "entity-1")).toThrow(/tracking consent/);
  });

  it("follows a topic once tracking consent is active", () => {
    const pref = createUserPreference("person-1");
    const consent = grantConsent("person-1", "tracking");
    const updated = followTopic(pref, [consent], "entity-1");
    expect(updated.followedTopics).toContain("entity-1");
  });
});

describe("Personalized Digest", () => {
  function graph(): KnowledgeGraph {
    return {
      entities: new Map([
        ["e1", { id: "e1", domain: "civic", type: "topic", canonicalName: "Participation", aliases: [], sources: [] }],
      ]),
      relationships: [],
    };
  }

  it("returns an empty digest for cold-start (no followed topics)", () => {
    const pref = createUserPreference("person-1");
    expect(getPersonalizedDigest(graph(), pref)).toEqual([]);
  });

  it("returns matched entities for followed topics", () => {
    const pref = { personId: "person-1", followedTopics: ["e1"] };
    const digest = getPersonalizedDigest(graph(), pref);
    expect(digest.map((e) => e.id)).toContain("e1");
  });
});

describe("Impact Tracker — evidentiary, never a score", () => {
  it("produces traceable facts, not a number", () => {
    const transitions: LadderStageTransition[] = [
      {
        id: "t1",
        communityMemberId: "cm1",
        fromStage: "anonymous",
        toStage: "identified-interest",
        triggeringTouchpoint: "content-view",
        relatedEntityId: "src/content/de/pages/research.mdx",
        timestamp: new Date(),
      },
    ];
    const outcomes: OutcomePublication[] = [
      { id: "o1", eventId: "evt-1", summary: "Great turnout!", publishedAt: new Date() },
    ];
    const records = buildImpactEvidence("person-1", transitions, outcomes);
    expect(records).toHaveLength(2);
    expect(records[0].description).toContain("identified-interest");
    expect(records[1].description).toContain("Great turnout!");
    expect(records.every((r) => typeof r.description === "string")).toBe(true);
  });
});
