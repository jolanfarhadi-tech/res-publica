import { createId } from "../../domain/shared";
import type { FundingSourcePublicationRecord, InstitutionalPartner } from "./types";

/** Publish Funding Disclosure — only for active partnerships (which themselves require an approved COI disclosure). */
export function publishFundingDisclosure(partner: InstitutionalPartner): FundingSourcePublicationRecord {
  if (partner.stage !== "active") {
    throw new Error("Cannot publish a funding disclosure for a partnership that is not active");
  }
  return { id: createId(), organizationId: partner.organizationId, publishedAt: new Date() };
}
