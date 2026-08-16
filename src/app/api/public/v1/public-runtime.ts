import { getPersistenceRuntime } from "../../../../persistence/runtime";
import { withRequestContext } from "../../../../platform/request-context";
import {
  PUBLIC_API_READ_RATE_LIMIT,
  rejectRateLimitedRequest,
} from "../../../../platform/rate-limit";
import { publicApiError } from "../../../../modules/public-api/http";

export function withPublicApiRuntime(
  request: Request,
  operation: (
    database: NonNullable<ReturnType<typeof getPersistenceRuntime>>["db"]
  ) => Promise<Response>
) {
  return withRequestContext(request, async () => {
    const runtime = getPersistenceRuntime();
    if (!runtime) return publicApiError("service_not_configured", 503);
    const rejection = await rejectRateLimitedRequest(
      runtime.db,
      request,
      PUBLIC_API_READ_RATE_LIMIT
    );
    if (rejection) return rejection;
    return operation(runtime.db);
  });
}
