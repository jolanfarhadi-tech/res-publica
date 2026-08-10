import { createActorResolver } from "@/auth/actor-resolver";
import { getKnowledgeGraphOperations } from "@/application/knowledge-graph";
import { getAuthRuntime } from "@/auth/runtime";
import { KNOWLEDGE_GRAPH_OPERATIONS_READ_RATE_LIMIT, rejectRateLimitedRequest } from "@/platform/rate-limit";
import { withRequestContext } from "@/platform/request-context";
import { knowledgeGraphErrorResponse, knowledgeGraphPrivateHeaders } from "../route-support";

export function GET(request: Request) {
  return withRequestContext(request, async () => {
    const runtime = getAuthRuntime();
    if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
    const rateLimitRejection = await rejectRateLimitedRequest(
      runtime.db,
      request,
      KNOWLEDGE_GRAPH_OPERATIONS_READ_RATE_LIMIT
    );
    if (rateLimitRejection) return rateLimitRejection;
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      return Response.json(await getKnowledgeGraphOperations(runtime.db, actor, "civic"), { headers: knowledgeGraphPrivateHeaders });
    } catch (error) {
      const response = knowledgeGraphErrorResponse(error);
      if (response) return response;
      throw error;
    }
  });
}
