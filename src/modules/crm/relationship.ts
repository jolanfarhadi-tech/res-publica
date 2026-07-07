import { createId } from "../../domain/shared";
import { appendEntry } from "../../domain/audit-log";
import type { Organization } from "../../domain/organization";
import type { InstitutionalPartner, PartnershipStage, PartnershipStatusLog } from "./types";

/** Create/Update Relationship Record — real integration with `domain/organization`; never duplicates it. */
export function createInstitutionalPartner(organization: Organization): InstitutionalPartner {
  return { id: createId(), organizationId: organization.id, stage: "inquiry" };
}

export function transitionPartnershipStage(
  partner: InstitutionalPartner,
  toStage: PartnershipStage,
  approverPersonId: string
): { partner: InstitutionalPartner; log: PartnershipStatusLog } {
  if (partner.stage === "active" && toStage === "inquiry") {
    throw new Error("Cannot revert an active partnership to inquiry");
  }
  const log: PartnershipStatusLog = {
    id: createId(),
    partnerId: partner.id,
    fromStage: partner.stage,
    toStage,
    timestamp: new Date(),
  };
  appendEntry({ actorPersonId: approverPersonId, action: "crm.partnership-stage-transition", target: partner.id });
  return { partner: { ...partner, stage: toStage }, log };
}
