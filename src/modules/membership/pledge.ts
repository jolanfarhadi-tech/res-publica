import { createId } from "../../domain/shared";
import { createPayment, settlePayment, type Payment } from "../../domain/payment";
import type { Member, RecurringPledge } from "./types";

/**
 * Update Recurring Pledge / Process Renewal — real integration with
 * `domain/payment` (`ADR-002`). Every renewal creates a real `Payment`
 * through the canonical entity, never a parallel transaction record.
 */
export function createPledge(
  member: Member,
  amount: number,
  currency: string,
  intervalMonths: number
): RecurringPledge {
  return { id: createId(), memberId: member.id, amount, currency, intervalMonths, active: true };
}

export function processRenewal(
  pledge: RecurringPledge,
  member: Member,
  providerReference: string
): { payment: Payment } {
  if (!pledge.active) {
    throw new Error("Cannot process a renewal for an inactive pledge");
  }
  const payment = settlePayment(
    createPayment({
      payerId: member.personId,
      amount: pledge.amount,
      currency: pledge.currency,
      purpose: "membership-renewal",
    }),
    providerReference
  );
  return { payment };
}

export function cancelPledge(pledge: RecurringPledge): RecurringPledge {
  return { ...pledge, active: false };
}
