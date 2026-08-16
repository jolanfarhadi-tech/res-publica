import { z } from "zod";
import { getPublicKnowledgeGraph } from "../../../../../../application/knowledge-graph";
import { publicApiError, publicApiJson } from "../../../../../../modules/public-api/http";
import {
  PublicApiValidationError,
  projectPublicEntities,
} from "../../../../../../modules/public-api/projection";
import type { KnowledgeGraph } from "../../../../../../modules/knowledge-graph/types";
import { withPublicApiRuntime } from "../../public-runtime";
import { publicApiQuerySchema, searchParams } from "../route-support";

const schema = publicApiQuerySchema.extend({
  type: z
    .enum(["person", "organization", "topic", "legislation", "dialogue", "finding"])
    .optional(),
  q: z.string().trim().min(2).max(120).optional(),
});

export function GET(request: Request) {
  return withPublicApiRuntime(request, async (db) => {
    const parsed = schema.safeParse(searchParams(request));
    if (!parsed.success) return publicApiError("invalid_query", 400);
    try {
      const projection = await getPublicKnowledgeGraph(db);
      const graph: KnowledgeGraph = {
        entities: new Map(
          projection.entities.map((entity) => [entity.id, entity])
        ),
        relationships: projection.relationships,
      };
      const page = projectPublicEntities(graph, {
        locale: parsed.data.locale,
        type: parsed.data.type,
        query: parsed.data.q,
        cursor: parsed.data.cursor,
        limit: parsed.data.limit,
      });
      return publicApiJson(request, page);
    } catch (error) {
      if (error instanceof PublicApiValidationError) {
        return publicApiError(error.code, 400);
      }
      throw error;
    }
  });
}
