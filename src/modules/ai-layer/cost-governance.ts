import type { BusinessDomain } from "../../platform/domain";

/**
 * Cost Governance Ledger — `ADR-008`: "AI Layer is the sole owner of raw
 * cost/usage data; Analytics reads and aggregates it." Deterministic,
 * in-memory today (no persistence layer exists yet — Backend Architecture
 * is separate work); the shape here is what a future persisted ledger
 * will store.
 */

export type QueryLogEntry = {
  timestamp: Date;
  prompt: string;
  providerName: string;
  domain: BusinessDomain;
  useCaseId: string;
  cost: number;
  refused: boolean;
};

export type CostGovernanceLedger = {
  entries: QueryLogEntry[];
  monthlySpendCeiling: number;
};

export function createLedger(monthlySpendCeiling: number): CostGovernanceLedger {
  return { entries: [], monthlySpendCeiling };
}

export function totalSpend(ledger: CostGovernanceLedger): number {
  return ledger.entries.reduce((sum, e) => sum + e.cost, 0);
}

export function isOverCeiling(ledger: CostGovernanceLedger): boolean {
  return totalSpend(ledger) >= ledger.monthlySpendCeiling;
}

export function recordQuery(ledger: CostGovernanceLedger, entry: QueryLogEntry): CostGovernanceLedger {
  return { ...ledger, entries: [...ledger.entries, entry] };
}
