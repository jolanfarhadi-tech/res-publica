import { describe, it, expect } from "vitest";
import { createCommunityMember, getLadderStage, recordTouchpoint } from "./ladder";
import { grantCommunityTrackingConsent, isTrackingConsented } from "./consent";
import { generateInvitation, mechanicForLocale, createReferralLink } from "./evangelism";
import { touchpointFromPublishedContent } from "./publishing-integration";
import type { PublishCommit } from "../publishing/types";

describe("Community ladder", () => {
  it("starts every member at the anonymous stage", () => {
    const member = createCommunityMember("person-1");
    expect(getLadderStage(member)).toBe("anonymous");
  });

  it("advances exactly one stage per touchpoint, and audits it", () => {
    const member = createCommunityMember("person-1");
    const { member: advanced, transition, auditEntry } = recordTouchpoint(member, "content-view", "entity-1");
    expect(advanced.currentStage).toBe("identified-interest");
    expect(transition.fromStage).toBe("anonymous");
    expect(transition.toStage).toBe("identified-interest");
    expect(transition.relatedEntityId).toBe("entity-1");
    expect(auditEntry.action).toBe("community.ladder-stage-transition");
  });

  it("throws once a member is already at the final stage", () => {
    let member = createCommunityMember("person-1");
    for (let i = 0; i < 4; i++) {
      member = recordTouchpoint(member, "content-view").member;
    }
    expect(member.currentStage).toBe("recurring-supporter");
    expect(() => recordTouchpoint(member, "content-view")).toThrow(/final ladder stage/);
  });
});

describe("Community consent (reuses domain/consent)", () => {
  it("grants and checks tracking consent through the canonical ConsentRecord", () => {
    const member = createCommunityMember("person-1");
    const consent = grantCommunityTrackingConsent(member);
    expect(isTrackingConsented(member, [consent])).toBe(true);
  });
});

describe("Community evangelism mechanics", () => {
  it("maps each locale to its distinct mechanic", () => {
    expect(mechanicForLocale("de")).toBe("co-signed-institutional-invitation");
    expect(mechanicForLocale("en")).toBe("comparative-outside-observer-invitation");
    expect(mechanicForLocale("fa")).toBe("trust-and-independence-first-invitation");
  });

  it("generates an invitation using the correct mechanic for the member's locale", () => {
    const member = createCommunityMember("person-1");
    const invitation = generateInvitation(member, "fa");
    expect(invitation.mechanic).toBe("trust-and-independence-first-invitation");
  });

  it("creates a referral link referencing the member", () => {
    const member = createCommunityMember("person-1");
    expect(createReferralLink(member)).toContain(member.id);
  });
});

describe("Community x Publishing integration", () => {
  it("records a touchpoint from a ready-to-publish PublishCommit", () => {
    const member = createCommunityMember("person-1");
    const publishCommit: PublishCommit = { id: "pc-1", draftId: "draft-1", status: "ready", commitHash: null };
    const { transition } = touchpointFromPublishedContent(member, publishCommit, "entity-1");
    expect(transition.triggeringTouchpoint).toBe("content-view");
  });

  it("refuses to record a touchpoint for content that isn't published or ready", () => {
    const member = createCommunityMember("person-1");
    const publishCommit: PublishCommit = { id: "pc-1", draftId: "draft-1", status: "pending", commitHash: null };
    expect(() => touchpointFromPublishedContent(member, publishCommit)).toThrow(/neither ready nor committed/);
  });
});
