import { getPublicKnowledgeGraph } from "@/application/knowledge-graph";
import { knowledgeGraphPublicHeaders } from "../route-support";
import { withPublicGraphRuntime } from "../public-runtime";

export function GET(request: Request) {
  return withPublicGraphRuntime(request, async (db) => {
    const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
    if (!id || id.length > 300) return Response.json({ error: "invalid_entity_id" }, { status: 400 });
    const projection = await getPublicKnowledgeGraph(db);
    const entity = projection.entities.find((candidate) => candidate.id === id);
    if (!entity) return Response.json({ error: "entity_not_found" }, { status: 404 });
    return Response.json({
      data: {
        id: entity.id,
        type: entity.type,
        name: entity.canonicalName,
        aliases: entity.aliases,
        verifiedSourceCount: entity.sources.filter((source) => source.publicEligible).length,
      },
      meta: { deterministic: true, humanVerified: true, publicOnly: true },
    }, { headers: knowledgeGraphPublicHeaders });
  });
}
