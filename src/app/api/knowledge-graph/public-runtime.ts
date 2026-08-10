import { getPersistenceRuntime } from "@/persistence/runtime";
import { rejectRateLimitedRequest } from "@/platform/rate-limit";
import { KNOWLEDGE_GRAPH_PUBLIC_READ_RATE_LIMIT } from "@/platform/rate-limit";
import { withRequestContext } from "@/platform/request-context";

export function withPublicGraphRuntime(
  request: Request,
  operation: (database: NonNullable<ReturnType<typeof getPersistenceRuntime>>["db"]) => Promise<Response>
) {
  return withRequestContext(request, async () => {
    const runtime = getPersistenceRuntime();
    if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
    const rejection = await rejectRateLimitedRequest(
      runtime.db,
      request,
      KNOWLEDGE_GRAPH_PUBLIC_READ_RATE_LIMIT
    );
    if (rejection) return rejection;
    return operation(runtime.db);
  });
}
