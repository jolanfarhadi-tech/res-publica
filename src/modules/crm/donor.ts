import { createId } from "../../domain/shared";
import type { Organization } from "../../domain/organization";
import type { Payment } from "../../domain/payment";
import type { DonorRecord } from "./types";

/** Real integration: donor giving history derives from real `domain/payment` settlements — never a parallel ledger. */
export function createDonorRecord(organization: Organization, settledPayments: readonly Payment[]): DonorRecord {
  const givingHistory = settledPayments
    .filter((p) => p.status === "settled")
    .map((p) => ({ amount: p.amount, date: p.settledAt ?? new Date() }));
  return { id: createId(), organizationId: organization.id, givingHistory };
}
