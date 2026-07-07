import { createId } from "../../domain/shared";
import { appendEntry } from "../../domain/audit-log";
import type { ConflictOfInterestDisclosure, InstitutionalPartner } from "./types";
import { transitionPartnershipStage } from "./relationship";

/**
 * Log Conflict-of-Interest Disclosure — governance-critical: "Only after
 * that review is approved does the partnership move to an active status"
 * (`mvp-module-blueprint.md`), enforced here, not merely documented.
 */
export function logDisclosure(partner: InstitutionalPartner, disclosureText: string): ConflictOfInterestDisclosure {
  return { id: createId(), partnerId: partner.id, disclosureText, reviewOutcome: "pending", reviewerPersonId: null };
}

export function reviewDisclosure(
  disclosure: ConflictOfInterestDisclosure,
  outcome: "approved" | "rejected",
  reviewerPersonId: string
): ConflictOfInterestDisclosure {
  if (disclosure.reviewOutcome !== "pending") {
    throw new Error("This disclosure has already been reviewed");
  }
  appendEntry({ actorPersonId: reviewerPersonId, action: "crm.disclosure-review", target: disclosure.id });
  return { ...disclosure, reviewOutcome: outcome, reviewerPersonId };
}

/** Enforces the spec's own governance rule: activation requires an approved disclosure, never bypassed. */
export function activatePartnership(
  partner: InstitutionalPartner,
  disclosure: ConflictOfInterestDisclosure,
  approverPersonId: string
) {
  if (disclosure.partnerId !== partner.id) {
    throw new Error("Disclosure does not match this partnership");
  }
  if (disclosure.reviewOutcome !== "approved") {
    throw new Error("Cannot activate a partnership without an approved conflict-of-interest disclosure");
  }
  return transitionPartnershipStage(partner, "active", approverPersonId);
}
