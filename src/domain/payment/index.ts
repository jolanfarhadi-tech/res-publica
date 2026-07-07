import { z } from "zod";
import { createId, type EntityId } from "../shared";

/**
 * Payment — "a single transaction record type (amount, currency, purpose,
 * provider reference, status), reused by every module that ever needs to
 * move money" (`mvp-module-blueprint.md`, Core Domain Model section;
 * `ADR-002`).
 *
 * Invariant (`CORE_DOMAIN_MODEL.md` §3a): "Created per transaction;
 * immutable once settled." Enforced here by freezing the object once
 * `settlePayment`/`failPayment` runs, and by only ever returning new
 * objects from state-transition functions — never mutating a payment
 * in place.
 *
 * Governing documents: `ADR-002`; `CORE_DOMAIN_MODEL.md` §3a (LOCKED,
 * referenced only).
 */

export const PAYMENT_STATUSES = ["pending", "settled", "failed", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const paymentSchema = z.object({
  id: z.string(),
  /** The Person or Organization id the transaction is attributed to. */
  payerId: z.string(),
  amount: z.number().positive(),
  /** ISO 4217 currency code. */
  currency: z.string().length(3),
  purpose: z.string().min(1),
  providerReference: z.string().nullable(),
  status: z.enum(PAYMENT_STATUSES),
  createdAt: z.date(),
  settledAt: z.date().nullable(),
});

export type Payment = z.infer<typeof paymentSchema>;

export type CreatePaymentInput = {
  payerId: EntityId;
  amount: number;
  currency: string;
  purpose: string;
};

export function createPayment(input: CreatePaymentInput): Payment {
  const payment: Payment = {
    id: createId(),
    payerId: input.payerId,
    amount: input.amount,
    currency: input.currency,
    purpose: input.purpose,
    providerReference: null,
    status: "pending",
    createdAt: new Date(),
    settledAt: null,
  };
  return paymentSchema.parse(payment);
}

function assertPending(payment: Payment, action: string): void {
  if (payment.status !== "pending") {
    throw new Error(`Cannot ${action}: payment ${payment.id} is already ${payment.status}`);
  }
}

export function settlePayment(payment: Payment, providerReference: string): Readonly<Payment> {
  assertPending(payment, "settle");
  return Object.freeze({
    ...payment,
    status: "settled" as const,
    providerReference,
    settledAt: new Date(),
  });
}

export function failPayment(payment: Payment, providerReference: string | null = null): Readonly<Payment> {
  assertPending(payment, "fail");
  return Object.freeze({
    ...payment,
    status: "failed" as const,
    providerReference,
  });
}

export function refundPayment(payment: Payment): Readonly<Payment> {
  if (payment.status !== "settled") {
    throw new Error(`Cannot refund: payment ${payment.id} was never settled`);
  }
  return Object.freeze({ ...payment, status: "refunded" as const });
}
