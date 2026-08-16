import { getPublicKnowledgeGraph } from "../../../../../../application/knowledge-graph";
import { publicApiError, publicApiJson } from "../../../../../../modules/public-api/http";
import {
  PublicApiValidationError,
  projectPublicRelationships,
} from "../../../../../../modules/public-api/projection";
import type { KnowledgeGraph } from "../../../../../../modules/knowledge-graph/types";
import { withPublicApiRuntime } from "../../public-runtime";
import { publicApiQuerySchema, searchParams } from "../route-support";

export function GET(request: Request) {
  return withPublicApiRuntime(request, async (db) => {
    const parsed = publicApiQuerySchema.safeParse(searchParams(request));
    if (!parsed.success) return publicApiError("invalid_query", 400);
    try {
      const projection = await getPublicKnowledgeGraph(db);
      const graph: KnowledgeGraph = {
        entities: new Map(
          projection.entities.map((entity) => [entity.id, entity])
        ),
        relationships: projection.relationships,
      };
      const page = projectPublicRelationships(graph, parsed.data);
      return publicApiJson(request, page);
    } catch (error) {
      if (error instanceof PublicApiValidationError) {
        return publicApiError(error.code, 400);
      }
      throw error;
    }
  });
}
