/**
 * AI Layer — Foundation Build Order Step 5, MVP module #2 (`ADR-008`).
 *
 * "The single, shared, grounded-retrieval service... that every other
 * module consumes rather than reimplements." Provider-agnostic by design:
 * `AIProvider` is the extension point a real LLM-backed provider will
 * implement later — activation is then a configuration change (which
 * provider is passed to `queryAILayer`), not an architectural redesign.
 */

export type AIQueryResult = {
  answer: string;
  citations: string[];
  /** Constitution Principle 1: "When no source supports an answer, the system refuses rather than improvises." */
  refused: boolean;
};

export type AIProvider = {
  name: string;
  query(prompt: string): AIQueryResult;
  /** Approximate cost in the smallest currency unit, for cost governance. Real providers report real cost; the local provider is free. */
  estimatedCostPerQuery: number;
};
