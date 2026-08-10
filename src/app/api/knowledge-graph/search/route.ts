import { getPublicKnowledgeGraph } from "@/application/knowledge-graph";
import { searchEntities } from "@/modules/knowledge-graph/api";
import type { KnowledgeGraph } from "@/modules/knowledge-graph/types";
import { knowledgeGraphPublicHeaders } from "../route-support";
import { withPublicGraphRuntime } from "../public-runtime";

function publicEntity(entity: Awaited<ReturnType<typeof getPublicKnowledgeGraph>>["entities"][number]) {
  return {
    id: entity.id,
    type: entity.type,
    name: entity.canonicalName,
    aliases: entity.aliases,
    verifiedSourceCount: entity.sources.filter((source) => source.publicEligible).length,
  };
}

export function GET(request: Request) {
  return withPublicGraphRuntime(request, async (db) => {
    const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
    if (query.length < 2 || query.length > 120) {
      return Response.json({ error: "invalid_query" }, { status: 400 });
    }
    const projection = await getPublicKnowledgeGraph(db);
    const graph: KnowledgeGraph = {
      entities: new Map(projection.entities.map((entity) => [entity.id, entity])),
      relationships: projection.relationships,
    };
    return Response.json({
      data: searchEntities(graph, query, "civic").slice(0, 50).map(publicEntity),
      meta: { deterministic: true, humanVerified: true, publicOnly: true },
    }, { headers: knowledgeGraphPublicHeaders });
  });
}
