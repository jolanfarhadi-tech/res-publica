import type { KnowledgeGraph } from "../../knowledge-graph/types";
import { searchEntities } from "../../knowledge-graph/api";
import type { AIProvider, AIQueryResult } from "../types";

/**
 * Local Provider — the repository-local AI Layer implementation, grounded
 * in deterministic Knowledge Graph keyword search.
 *
 * This is not a placeholder awaiting a "real" implementation to replace
 * it — it directly implements `ADR-008`'s own documented fallback
 * behavior: "a hard monthly spend ceiling that falls back to plain
 * keyword search if exceeded — never an unbounded bill." Building the
 * fallback first, as the default, is the correct order: a future
 * LLM-backed provider is an additive implementation of the same
 * `AIProvider` interface, not a prerequisite for this one working.
 */
export function createLocalProvider(graph: KnowledgeGraph): AIProvider {
  return {
    name: "local-keyword-search",
    estimatedCostPerQuery: 0,
    query(prompt: string): AIQueryResult {
      const matches = searchEntities(graph, prompt);
      if (matches.length === 0) {
        return {
          answer: `No grounded source found for "${prompt}" — refusing rather than guessing (Constitution Principle 1).`,
          citations: [],
          refused: true,
        };
      }
      const top = matches[0];
      return {
        answer: `${top.canonicalName} (${top.type}) — found via deterministic keyword search.`,
        citations: top.sources.map((s) => s.file),
        refused: false,
      };
    },
  };
}
