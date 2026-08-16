import { createActorResolver } from "../../../auth/actor-resolver";
import { getAuthRuntime } from "../../../auth/runtime";
import {
  DashboardAuthenticationError,
  getSelfDashboard,
} from "../../../application/dashboard";
import { withRequestContext } from "../../../platform/request-context";
import {
  DASHBOARD_READ_RATE_LIMIT,
  rejectRateLimitedRequest,
} from "../../../platform/rate-limit";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};

export function GET(request: Request) {
  return withRequestContext(request, async () => {
    const runtime = getAuthRuntime();
    if (!runtime) {
      return Response.json(
        { error: "service_not_configured" },
        { status: 503, headers: PRIVATE_HEADERS }
      );
    }

    const rateLimitRejection = await rejectRateLimitedRequest(
      runtime.db, request, DASHBOARD_READ_RATE_LIMIT
    );
    if (rateLimitRejection) return rateLimitRejection;

    const actor = await createActorResolver(runtime.db).resolve(request);
    try {
      return Response.json(await getSelfDashboard(runtime.db, actor), {
        headers: PRIVATE_HEADERS,
      });
    } catch (error) {
      if (error instanceof DashboardAuthenticationError) {
        return Response.json(
          { error: "authentication_required" },
          { status: 401, headers: PRIVATE_HEADERS }
        );
      }
      throw error;
    }
  });
}
