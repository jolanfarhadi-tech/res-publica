import { totalSpend, recordQuery, type CostGovernanceLedger } from "./cost-governance";
import type { AIProvider, AIQueryResult } from "./types";
import { resolveAIUseCasePolicy } from "./policy";
export type AIQueryContext = {
  domain: "civic" | "governance";
  useCaseId: "grounded-search" | "publishing.draft-authoring" | "events.scoped-qa";
};

/**
 * The single entry point every module should use for AI Layer queries —
 * enforces cost governance and citation-or-refuse regardless of which
 * provider answers, per `ADR-008` and Constitution Principle 1.
 */
export function queryAILayer(
  provider: AIProvider,
  prompt: string,
  ledger: CostGovernanceLedger,
  context: AIQueryContext
): { result: AIQueryResult; ledger: CostGovernanceLedger } {
  const policy = resolveAIUseCasePolicy(context.domain, context.useCaseId);
  const userInput = prompt.trim();
  if (!userInput || userInput.length > 4_000) {
    throw new AIQueryValidationError("invalid_query");
  }
  if (provider.mode === "external" && !policy.externalProviderPermitted) {
    throw new AIProviderNotActivatedError();
  }
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

  const providerRequest = Object.freeze({
    userInput,
    policy: Object.freeze({
      id: policy.id,
      inputClass: policy.inputClass,
      outputStatus: policy.outputStatus,
      humanReviewRequired: policy.humanReviewRequired,
    }),
  });
  const raw = provider.query(providerRequest);

  // Citation-or-refuse enforcement: an answer not marked refused must
  // still carry at least one citation, regardless of what the provider
  // itself claims.
  const { retrievedReferences, ...providerResult } = raw;
  const allowedCitations = new Set(retrievedReferences);
  const citationsAreGrounded = raw.citations.length > 0 &&
    raw.citations.every((citation) => allowedCitations.has(citation));
  const result: AIQueryResult = !raw.refused && !citationsAreGrounded
    ? { answer: "No approved source supports this answer.", citations: [], refused: true }
    : providerResult;

  const updatedLedger = recordQuery(ledger, {
    timestamp: new Date(),
    inputCharacters: userInput.length,
    providerName: provider.name,
    domain: context.domain,
    useCaseId: context.useCaseId,
    cost: provider.estimatedCostPerQuery,
    refused: result.refused,
  });

  return { result, ledger: updatedLedger };
}

export class AIQueryValidationError extends Error {
  readonly code: string;
  constructor(code: string) { super(code); this.name = "AIQueryValidationError"; this.code = code; }
}

export class AIProviderNotActivatedError extends Error {
  readonly code = "external_provider_not_activated";
  constructor() { super("External AI providers are not activated"); this.name = "AIProviderNotActivatedError"; }
}
