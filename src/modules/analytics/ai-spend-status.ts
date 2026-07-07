import { totalSpend, type CostGovernanceLedger } from "../ai-layer/cost-governance";

/**
 * AI Spend/Ceiling Status — reads AI Layer's own ledger directly, per the
 * spec's explicit correction ("no independent Usage Record or Spend
 * Ledger — Analytics reads and aggregates AI Layer's own"). No reasoning
 * or generation performed here.
 */
export function getAISpendStatus(ledger: CostGovernanceLedger): { spend: number; ceiling: number; overCeiling: boolean } {
  const spend = totalSpend(ledger);
  return { spend, ceiling: ledger.monthlySpendCeiling, overCeiling: spend >= ledger.monthlySpendCeiling };
}
