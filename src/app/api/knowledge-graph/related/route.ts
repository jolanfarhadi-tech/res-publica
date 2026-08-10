import { getPublicKnowledgeGraph } from "@/application/knowledge-graph";
import { knowledgeGraphPublicHeaders } from "../route-support";
import { withPublicGraphRuntime } from "../public-runtime";

export function GET(request: Request) {
  return withPublicGraphRuntime(request, async (db) => {
    const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
    if (!id || id.length > 300) return Response.json({ error: "invalid_entity_id" }, { status: 400 });
    const projection = await getPublicKnowledgeGraph(db);
    const entityMap = new Map(projection.entities.map((entity) => [entity.id, entity]));
    if (!entityMap.has(id)) return Response.json({ error: "entity_not_found" }, { status: 404 });
    const relatedIds = new Set<string>();
    for (const relationship of projection.relationships) {
      if (relationship.fromEntityId === id) relatedIds.add(relationship.toEntityId);
      if (relationship.toEntityId === id) relatedIds.add(relationship.fromEntityId);
    }
    return Response.json({
      data: [...relatedIds].map((relatedId) => entityMap.get(relatedId)).filter(Boolean).map((entity) => ({
        id: entity!.id,
        type: entity!.type,
        name: entity!.canonicalName,
      })),
      meta: { deterministic: true, humanVerified: true, publicOnly: true },
    }, { headers: knowledgeGraphPublicHeaders });
  });
}
