import { z } from "zod";
import { createActorResolver } from "../../../../auth/actor-resolver";
import {
  AIRuntimeNotConfiguredError,
  runGroundedCivicQuery,
} from "../../../../application/governed-ai";
import { getPublicKnowledgeGraph } from "../../../../application/knowledge-graph";
import { AuthorizationDeniedError } from "../../../../auth/authorize";
import type { KnowledgeGraph } from "../../../../modules/knowledge-graph/types";
import { executePrivilegedWrite } from "../../../../platform/privileged-write";
import { AI_RAG_QUERY_RATE_LIMIT } from "../../../../platform/rate-limit";

const schema = z.object({ query: z.string().min(1).max(4_000) });

export function POST(request: Request) {
  return executePrivilegedWrite(
    request,
    AI_RAG_QUERY_RATE_LIMIT,
    async (runtime, context) => {
      const parsed = schema.safeParse(await request.json().catch(() => null));
      if (!parsed.success) {
        return Response.json({ error: "invalid_request" }, { status: 400 });
      }
      try {
        const actor = await createActorResolver(runtime.db).resolve(request);
        const result = await runGroundedCivicQuery(
          runtime.db,
          actor,
          {
            query: parsed.data.query,
            requestId: context.requestId,
          },
          async () => {
            const projection = await getPublicKnowledgeGraph(runtime.db);
            return {
              entities: new Map(
                projection.entities.map((entity) => [entity.id, entity])
              ),
              relationships: projection.relationships,
            } satisfies KnowledgeGraph;
          }
        );
        return Response.json(result, {
          headers: {
            "Cache-Control": "private, no-store",
            Vary: "Cookie",
          },
        });
      } catch (error) {
        if (error instanceof AuthorizationDeniedError) {
          return Response.json({ error: "forbidden" }, { status: 403 });
        }
        if (error instanceof AIRuntimeNotConfiguredError) {
          return Response.json({ error: error.code }, { status: 503 });
        }
        throw error;
      }
    }
  );
}
