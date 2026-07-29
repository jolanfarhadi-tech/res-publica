import { createActorResolver } from "../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../auth/authorize";
import { getAuthRuntime } from "../../../../auth/runtime";
import { getPublishingWorkspace } from "../../../../application/publishing-workspace";
import { withRequestContext } from "../../../../platform/request-context";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};
const PUBLICATION_SCOPE = /^[a-z0-9][a-z0-9._:/-]{0,127}$/i;

export function GET(request: Request) {
  return withRequestContext(request, async () => {
    const searchParams = new URL(request.url).searchParams;
    const scope = searchParams.get("scope")?.trim();
    if (!scope || !PUBLICATION_SCOPE.test(scope)) {
      return Response.json(
        { error: "invalid_publication_scope" },
        { status: 400, headers: PRIVATE_HEADERS }
      );
    }
    const requestedLimit = searchParams.get("limit");
    const limit = requestedLimit === null ? 50 : Number(requestedLimit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return Response.json(
        { error: "invalid_limit" },
        { status: 400, headers: PRIVATE_HEADERS }
      );
    }

    const runtime = getAuthRuntime();
    if (!runtime) {
      return Response.json(
        { error: "service_not_configured" },
        { status: 503, headers: PRIVATE_HEADERS }
      );
    }

    const actor = await createActorResolver(runtime.db).resolve(request);
    try {
      return Response.json(
        await getPublishingWorkspace(runtime.db, actor, scope, undefined, limit),
        { headers: PRIVATE_HEADERS }
      );
    } catch (error) {
      if (error instanceof AuthorizationDeniedError) {
        return Response.json(
          { error: "forbidden" },
          { status: 403, headers: PRIVATE_HEADERS }
        );
      }
      throw error;
    }
  });
}
