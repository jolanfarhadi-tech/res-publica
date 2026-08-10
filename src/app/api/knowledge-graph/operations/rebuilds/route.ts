import { createActorResolver } from "@/auth/actor-resolver";
import { createKnowledgeGraphBuild } from "@/application/knowledge-graph";
import { buildRepositoryKnowledgeGraph } from "@/modules/knowledge-graph/repository-build";
import { executePrivilegedWrite } from "@/platform/privileged-write";
import { KNOWLEDGE_GRAPH_PRIVILEGED_WRITE_RATE_LIMIT } from "@/platform/rate-limit";
import { knowledgeGraphErrorResponse, knowledgeGraphPrivateHeaders } from "../../route-support";

function repositoryVersion() {
  return process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? "local-development";
}

export function POST(request: Request) {
  return executePrivilegedWrite(request, KNOWLEDGE_GRAPH_PRIVILEGED_WRITE_RATE_LIMIT, async (runtime) => {
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      const result = await createKnowledgeGraphBuild(runtime.db, actor, {
        graph: buildRepositoryKnowledgeGraph(),
        domain: "civic",
        commitSha: repositoryVersion(),
        extractorName: "frontmatter-v1",
      });
      return Response.json(result, { status: result.idempotent ? 200 : 201, headers: knowledgeGraphPrivateHeaders });
    } catch (error) {
      const response = knowledgeGraphErrorResponse(error);
      if (response) return response;
      throw error;
    }
  });
}
