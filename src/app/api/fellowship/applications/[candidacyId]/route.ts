import { createActorResolver } from "@/auth/actor-resolver";
import { rejectUntrustedWriteRequest } from "@/auth/request-security";
import { getAuthRuntime } from "@/auth/runtime";
import { withdrawFellowshipApplication } from "@/application/fellowship";
import { FELLOWSHIP_SELF_SERVICE_RATE_LIMIT, rejectRateLimitedRequest } from "@/platform/rate-limit";
import { withRequestContext } from "@/platform/request-context";
import { fellowshipErrorResponse, fellowshipPrivateHeaders } from "../../route-errors";

export function DELETE(request: Request, context: { params: Promise<{ candidacyId: string }> }) {
  return withRequestContext(request, async () => {
    const originRejection = rejectUntrustedWriteRequest(request);
    if (originRejection) return originRejection;
    if (process.env.FELLOWSHIP_APPLICATIONS_ENABLED !== "true") {
      return Response.json({ error: "feature_not_activated" }, { status: 503, headers: fellowshipPrivateHeaders });
    }
    const runtime = getAuthRuntime();
    if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
    const limited = await rejectRateLimitedRequest(runtime.db, request, FELLOWSHIP_SELF_SERVICE_RATE_LIMIT);
    if (limited) return limited;
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      const { candidacyId } = await context.params;
      return Response.json(await withdrawFellowshipApplication(runtime.db, actor, candidacyId), { headers: fellowshipPrivateHeaders });
    } catch (error) {
      const response = fellowshipErrorResponse(error);
      if (response) return response;
      throw error;
    }
  });
}
