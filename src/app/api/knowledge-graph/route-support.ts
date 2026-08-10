import { AuthorizationDeniedError } from "@/auth/authorize";
import {
  KnowledgeGraphBoundaryError,
  KnowledgeGraphNotFoundError,
  KnowledgeGraphSeparationOfDutiesError,
  KnowledgeGraphStateError,
  KnowledgeGraphValidationError,
} from "@/application/knowledge-graph";

export const knowledgeGraphPrivateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};

export const knowledgeGraphPublicHeaders = {
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
};

export function knowledgeGraphErrorResponse(error: unknown): Response | null {
  if (error instanceof AuthorizationDeniedError) {
    return Response.json({ error: "forbidden" }, { status: 403, headers: knowledgeGraphPrivateHeaders });
  }
  if (error instanceof KnowledgeGraphNotFoundError) {
    return Response.json({ error: error.code }, { status: 404, headers: knowledgeGraphPrivateHeaders });
  }
  if (
    error instanceof KnowledgeGraphStateError ||
    error instanceof KnowledgeGraphBoundaryError ||
    error instanceof KnowledgeGraphSeparationOfDutiesError
  ) {
    return Response.json({ error: error.code }, { status: 409, headers: knowledgeGraphPrivateHeaders });
  }
  if (error instanceof KnowledgeGraphValidationError) {
    return Response.json({ error: error.code }, { status: 400, headers: knowledgeGraphPrivateHeaders });
  }
  return null;
}
