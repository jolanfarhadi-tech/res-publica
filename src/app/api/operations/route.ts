import { createActorResolver } from "../../../auth/actor-resolver";
import { getAuthRuntime } from "../../../auth/runtime";
import {
  getOperationsOverview,
  OperationsAuthenticationError,
  OperationsAuthorizationError,
  OperationsMfaRequiredError,
} from "../../../application/operations-console";
import { withRequestContext } from "../../../platform/request-context";
import {
  OPERATIONS_READ_RATE_LIMIT,
  rejectRateLimitedRequest,
} from "../../../platform/rate-limit";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};

export function GET(request: Request) {
  return withRequestContext(request, async () => {
    const requestedLimit = new URL(request.url).searchParams.get("limit");
    const limit = requestedLimit === null ? 100 : Number(requestedLimit);
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

    const rateLimitRejection = await rejectRateLimitedRequest(
      runtime.db, request, OPERATIONS_READ_RATE_LIMIT
    );
    if (rateLimitRejection) return rateLimitRejection;

    const actor = await createActorResolver(runtime.db).resolve(request);
    try {
      return Response.json(
        await getOperationsOverview(runtime.db, actor, undefined, limit),
        { headers: PRIVATE_HEADERS }
      );
    } catch (error) {
      if (error instanceof OperationsAuthenticationError) {
        return Response.json(
          { error: "authentication_required" },
          { status: 401, headers: PRIVATE_HEADERS }
        );
      }
      if (error instanceof OperationsMfaRequiredError) {
        return Response.json(
          { error: "mfa_required" },
          { status: 403, headers: PRIVATE_HEADERS }
        );
      }
      if (error instanceof OperationsAuthorizationError) {
        return Response.json(
          { error: "forbidden" },
          { status: 403, headers: PRIVATE_HEADERS }
        );
      }
      throw error;
    }
  });
}
