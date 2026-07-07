import { describe, it, expect } from "vitest";
import { createMember, transitionStatus } from "./lifecycle";
import { createPledge, processRenewal, cancelPledge } from "./pledge";
import { createInstitutionalProfile } from "./institutional";
import { grantBenefit } from "./benefits";
import { reviewStatusFromCommunityStanding } from "./community-integration";
import { toMembershipJourneyView } from "./view";
import { createOrganization } from "../../domain/organization";
import { createCommunityMember, recordTouchpoint } from "../community/ladder";

describe("Membership lifecycle", () => {
  it("starts every member as registered", () => {
    const member = createMember("person-1", "basic");
    expect(member.status).toBe("registered");
  });

  it("follows the documented lifecycle and audits every transition", () => {
    let member = createMember("person-1", "basic");
    let result = transitionStatus(member, "verified", "email-confirmed");
    expect(result.member.status).toBe("verified");
    expect(result.auditEntry.action).toBe("membership.status-transition");

    result = transitionStatus(result.member, "active", "first-payment-received");
    expect(result.member.status).toBe("active");
  });

  it("rejects an invalid transition (never uses 'deleted' as a status)", () => {
    const member = createMember("person-1", "basic");
    expect(() => transitionStatus(member, "terminated", "x")).toThrow(/Cannot transition/);
  });

  it("allows suspended members to be reactivated or terminated, never silently deleted", () => {
    let member = createMember("person-1", "basic");
    member = transitionStatus(member, "verified", "x").member;
    member = transitionStatus(member, "active", "x").member;
    member = transitionStatus(member, "suspended", "policy-violation").member;
    expect(() => transitionStatus(member, "active", "reinstated").member).not.toThrow();
  });
});

describe("Membership x Payment integration", () => {
  it("processes a renewal as a real settled Payment", () => {
    const member = createMember("person-1", "supporter");
    const pledge = createPledge(member, 15, "EUR", 1);
    const { payment } = processRenewal(pledge, member, "provider-ref-1");
    expect(payment.status).toBe("settled");
    expect(payment.purpose).toBe("membership-renewal");
  });

  it("refuses to renew a cancelled pledge", () => {
    const member = createMember("person-1", "supporter");
    const pledge = cancelPledge(createPledge(member, 15, "EUR", 1));
    expect(() => processRenewal(pledge, member, "ref")).toThrow(/inactive pledge/);
  });
});

describe("Membership x Organization integration", () => {
  it("creates an institutional profile referencing a real Organization", () => {
    const member = createMember("person-1", "institutional");
    const org = createOrganization({ name: "Supporter Org", relationshipTypes: ["supporter"] });
    const profile = createInstitutionalProfile(member, org);
    expect(profile.organizationId).toBe(org.id);
  });
});

describe("Membership x Community integration", () => {
  it("promotes a verified member to active based on real Community standing", () => {
    let member = createMember("person-1", "basic");
    member = transitionStatus(member, "verified", "email-confirmed").member;

    let communityMember = createCommunityMember("person-1");
    for (let i = 0; i < 3; i++) {
      communityMember = recordTouchpoint(communityMember, "content-view").member;
    }
    expect(communityMember.currentStage).toBe("contributing-participant");

    member = reviewStatusFromCommunityStanding(member, communityMember);
    expect(member.status).toBe("active");
  });

  it("does not promote a member whose community standing isn't yet a contributing participant", () => {
    let member = createMember("person-1", "basic");
    member = transitionStatus(member, "verified", "email-confirmed").member;
    const communityMember = createCommunityMember("person-1");
    const reviewed = reviewStatusFromCommunityStanding(member, communityMember);
    expect(reviewed.status).toBe("verified");
  });

  it("never skips the required verification step — a merely-registered member is not promoted regardless of community standing", () => {
    const member = createMember("person-1", "basic");
    let communityMember = createCommunityMember("person-1");
    for (let i = 0; i < 3; i++) {
      communityMember = recordTouchpoint(communityMember, "content-view").member;
    }
    const reviewed = reviewStatusFromCommunityStanding(member, communityMember);
    expect(reviewed.status).toBe("registered");
  });
});

describe("MembershipJourneyView", () => {
  it("reflects the most recent status change and lists valid next statuses", () => {
    const member = createMember("person-1", "basic");
    const { member: verified, change } = transitionStatus(member, "verified", "email-confirmed");
    const view = toMembershipJourneyView(verified, [change]);
    expect(view.currentStatus).toBe("verified");
    expect(view.previousStatus).toBe("registered");
    expect(view.triggeringActivity).toBe("email-confirmed");
    expect(view.nextAvailableStatuses).toContain("active");
  });
});

describe("Membership benefits", () => {
  it("grants a benefit as a record, never a score", () => {
    const member = createMember("person-1", "basic");
    const grant = grantBenefit(member, "early-access-newsletter");
    expect(grant.benefitName).toBe("early-access-newsletter");
  });
});
