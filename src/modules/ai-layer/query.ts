import { totalSpend, recordQuery, type CostGovernanceLedger } from "./cost-governance";
import type { AIProvider, AIQueryResult } from "./types";

/**
 * The single entry point every module should use for AI Layer queries —
 * enforces cost governance and citation-or-refuse regardless of which
 * provider answers, per `ADR-008` and Constitution Principle 1.
 */
export function queryAILayer(
  provider: AIProvider,
  prompt: string,
  ledger: CostGovernanceLedger
): { result: AIQueryResult; ledger: CostGovernanceLedger } {
  // Prospective check: would *this* query push spend over the ceiling? —
  // not merely "are we already over," which would let exactly one query
  // slip through above the limit (a real bug, caught by this module's own
  // test suite before being shipped).
  if (totalSpend(ledger) + provider.estimatedCostPerQuery > ledger.monthlySpendCeiling) {
    return {
      result: {
        answer: "Monthly spend ceiling reached — falling back to keyword search only.",
        citations: [],
        refused: true,
      },
      ledger,
    };
  }

  const raw = provider.query(prompt);

  // Citation-or-refuse enforcement: an answer not marked refused must
  // still carry at least one citation, regardless of what the provider
  // itself claims.
  const result: AIQueryResult =
    !raw.refused && raw.citations.length === 0 ? { ...raw, refused: true } : raw;

  const updatedLedger = recordQuery(ledger, {
    timestamp: new Date(),
    prompt,
    providerName: provider.name,
    cost: provider.estimatedCostPerQuery,
    refused: result.refused,
  });

  return { result, ledger: updatedLedger };
}
