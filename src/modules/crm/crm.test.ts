import { describe, it, expect } from "vitest";
import { createInstitutionalPartner } from "./relationship";
import { logDisclosure, reviewDisclosure, activatePartnership } from "./disclosure";
import { publishFundingDisclosure } from "./funding-disclosure";
import { createDonorRecord } from "./donor";
import { sharesOrganization } from "./membership-integration";
import { createOrganization } from "../../domain/organization";
import { createPayment, settlePayment } from "../../domain/payment";
import { createMember } from "../membership/lifecycle";
import { createInstitutionalProfile } from "../membership/institutional";

describe("CRM relationship + disclosure governance gate", () => {
  it("cannot activate a partnership without an approved disclosure", () => {
    const org = createOrganization({ name: "Municipal Gov", relationshipTypes: ["funder"] });
    const partner = createInstitutionalPartner(org);
    const disclosure = logDisclosure(partner, "No conflict identified");
    expect(() => activatePartnership(partner, disclosure, "reviewer-1")).toThrow(/approved conflict-of-interest/);
  });

  it("activates only after an approved disclosure review", () => {
    const org = createOrganization({ name: "Municipal Gov", relationshipTypes: ["funder"] });
    const partner = createInstitutionalPartner(org);
    let disclosure = logDisclosure(partner, "No conflict identified");
    disclosure = reviewDisclosure(disclosure, "approved", "reviewer-1");
    const { partner: activated } = activatePartnership(partner, disclosure, "reviewer-1");
    expect(activated.stage).toBe("active");
  });

  it("cannot publish funding disclosure for a non-active partnership", () => {
    const org = createOrganization({ name: "Org", relationshipTypes: ["funder"] });
    const partner = createInstitutionalPartner(org);
    expect(() => publishFundingDisclosure(partner)).toThrow(/not active/);
  });

  it("rejects reviewing the same disclosure twice", () => {
    const org = createOrganization({ name: "Org", relationshipTypes: ["funder"] });
    const partner = createInstitutionalPartner(org);
    const disclosure = reviewDisclosure(logDisclosure(partner, "x"), "approved", "r1");
    expect(() => reviewDisclosure(disclosure, "approved", "r1")).toThrow(/already been reviewed/);
  });
});

describe("CRM x Membership integration", () => {
  it("confirms a Membership institutional profile and a CRM partnership share the same real Organization", () => {
    const org = createOrganization({ name: "Shared Org", relationshipTypes: ["funder", "supporter"] });
    const member = createMember("person-1", "institutional");
    const profile = createInstitutionalProfile(member, org);
    const partner = createInstitutionalPartner(org);
    expect(sharesOrganization(profile, partner)).toBe(true);
  });

  it("detects when they reference different organizations (data-siloing guard)", () => {
    const orgA = createOrganization({ name: "Org A", relationshipTypes: ["funder"] });
    const orgB = createOrganization({ name: "Org B", relationshipTypes: ["funder"] });
    const member = createMember("person-1", "institutional");
    const profile = createInstitutionalProfile(member, orgA);
    const partner = createInstitutionalPartner(orgB);
    expect(sharesOrganization(profile, partner)).toBe(false);
  });
});

describe("CRM donor record (real Payment integration)", () => {
  it("derives giving history from real settled payments only", () => {
    const org = createOrganization({ name: "Donor Org", relationshipTypes: ["supporter"] });
    const pending = createPayment({ payerId: org.id, amount: 100, currency: "EUR", purpose: "donation" });
    const settled = settlePayment(pending, "ref-1");
    const record = createDonorRecord(org, [settled]);
    expect(record.givingHistory).toHaveLength(1);
    expect(record.givingHistory[0].amount).toBe(100);
  });
});
