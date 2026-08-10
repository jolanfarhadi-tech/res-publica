import { z } from "zod";
import { createActorResolver } from "@/auth/actor-resolver";
import { reviewKnowledgeGraphCandidate } from "@/application/knowledge-graph";
import { executePrivilegedWrite } from "@/platform/privileged-write";
import { KNOWLEDGE_GRAPH_PRIVILEGED_WRITE_RATE_LIMIT } from "@/platform/rate-limit";
import { knowledgeGraphErrorResponse, knowledgeGraphPrivateHeaders } from "../../../route-support";

const schema = z.object({
  decision: z.enum(["approve", "reject"]),
  reason: z.string().min(1).max(10_000),
});

export function POST(request: Request, context: { params: Promise<{ candidateId: string }> }) {
  return executePrivilegedWrite(request, KNOWLEDGE_GRAPH_PRIVILEGED_WRITE_RATE_LIMIT, async (runtime) => {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      const { candidateId } = await context.params;
      return Response.json(await reviewKnowledgeGraphCandidate(runtime.db, actor, {
        candidateId,
        ...parsed.data,
      }), { headers: knowledgeGraphPrivateHeaders });
    } catch (error) {
      const response = knowledgeGraphErrorResponse(error);
      if (response) return response;
      throw error;
    }
  });
}
