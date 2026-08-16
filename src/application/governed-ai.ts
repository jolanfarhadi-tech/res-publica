import { createHmac, createHash } from "node:crypto";
import { requireAuthorization } from "../auth/authorize";
import type { AuthenticatedActor } from "../auth/types";
import type { Database } from "../persistence";
import { aiQueryLog } from "../persistence/module-schema";
import { createLedger } from "../modules/ai-layer/cost-governance";
import { resolveAIUseCasePolicy } from "../modules/ai-layer/policy";
import { createLocalProvider } from "../modules/ai-layer/providers/local-provider";
import { queryAILayer } from "../modules/ai-layer/query";
import { publicContentSource } from "../modules/knowledge-graph/public-source";
import type { KnowledgeGraph } from "../modules/knowledge-graph/types";

const TARGET = "public-knowledge";

export async function runGroundedCivicQuery(
  db: Database,
  actor: AuthenticatedActor | null,
  input: { query: string; requestId: string },
  retrieve: () => Promise<KnowledgeGraph>,
  options: { pepper?: string; now?: Date } = {}
) {
  requireAuthorization(actor, {
    domain: "civic",
    capability: "ai.rag.query",
    target: TARGET,
    requireExactTarget: true,
    minimumAssurance: "verified",
  });
  const pepper = options.pepper ?? process.env.SESSION_SECRET;
  if (!pepper) throw new AIRuntimeNotConfiguredError();

  // Authorization is deliberately complete before this callback can access retrieval data.
  const graph = await retrieve();
  const provider = createLocalProvider(graph);
  const policy = resolveAIUseCasePolicy("civic", "grounded-search");
  const { result } = queryAILayer(provider, input.query, createLedger(0), {
    domain: "civic",
    useCaseId: "grounded-search",
  });
  const citations = [
    ...new Set(
      result.citations
        .map((file) => publicContentSource(file)?.url)
        .filter((value): value is string => value !== undefined)
    ),
  ];
  const refused = result.refused || citations.length === 0;
  const answer = refused ? "No approved public source supports this answer." : result.answer;
  const now = options.now ?? new Date();
  const promptHash = createHmac("sha256", pepper).update(input.query.trim()).digest("hex");
  const answerDigest = createHash("sha256").update(answer).digest("hex");

  await db.insert(aiQueryLog).values({
    timestamp: now,
    prompt: promptHash,
    promptHash,
    providerName: provider.name,
    providerMode: provider.mode,
    domain: "civic",
    useCaseId: "grounded-search",
    policyId: policy.id,
    inputClass: policy.inputClass,
    cost: 0,
    refused,
    actorPersonId: actor.personId,
    requestId: input.requestId,
    citations,
    answerDigest,
  });
  return { answer, citations, refused, policyId: policy.id, providerMode: provider.mode };
}

export class AIRuntimeNotConfiguredError extends Error {
  readonly code = "ai_runtime_not_configured";
  constructor() { super("AI runtime privacy controls are not configured"); this.name = "AIRuntimeNotConfiguredError"; }
}
