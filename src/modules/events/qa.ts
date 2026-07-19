import { createId } from "../../domain/shared";
import { createLocalProvider } from "../ai-layer/providers/local-provider";
import { queryAILayer } from "../ai-layer/query";
import type { CostGovernanceLedger } from "../ai-layer/cost-governance";
import type { Entity, KnowledgeGraph } from "../knowledge-graph/types";
import type { Event, EventQALogEntry } from "./types";

/**
 * Event Q&A Query — "deliberately retrieval-restricted to a single
 * event's own published fields so a question about Event B can never be
 * answered with Event A's address — the single most important guardrail
 * in this module" (`mvp-module-blueprint.md`).
 *
 * Enforced structurally, not by convention: the Knowledge Graph is
 * filtered down to only entities sourced from this event's own content
 * *before* the AI Layer's local provider ever sees it — Event B's data is
 * not merely ignored, it is absent from the scoped graph entirely.
 */
function scopeGraphToEvent(graph: KnowledgeGraph, event: Event): KnowledgeGraph {
  const scoped = new Map<string, Entity>(
    [...graph.entities].filter(([, entity]) => entity.sources.some((s) => s.file.includes(event.id)))
  );
  return {
    entities: scoped,
    relationships: graph.relationships.filter((r) => scoped.has(r.fromEntityId) && scoped.has(r.toEntityId)),
  };
}

export function askEventQuestion(
  event: Event,
  question: string,
  graph: KnowledgeGraph,
  ledger: CostGovernanceLedger
): { logEntry: EventQALogEntry; ledger: CostGovernanceLedger } {
  const scopedGraph = scopeGraphToEvent(graph, event);
  const scopedProvider = createLocalProvider(scopedGraph);
  const { result, ledger: updatedLedger } = queryAILayer(scopedProvider, question, ledger, {
    domain: "civic",
    useCaseId: "events.scoped-qa",
  });

  const logEntry: EventQALogEntry = {
    id: createId(),
    eventId: event.id,
    question,
    answer: result.answer,
    citations: result.citations,
  };
  return { logEntry, ledger: updatedLedger };
}
