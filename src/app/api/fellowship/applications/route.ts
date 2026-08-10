import { z } from "zod";
import { createActorResolver } from "../../../../auth/actor-resolver";
import { rejectUntrustedWriteRequest } from "../../../../auth/request-security";
import { getAuthRuntime } from "../../../../auth/runtime";
import { submitFellowshipApplication } from "../../../../application/fellowship";
import { FELLOWSHIP_SELF_SERVICE_RATE_LIMIT, rejectRateLimitedRequest } from "../../../../platform/rate-limit";
import { withRequestContext } from "../../../../platform/request-context";
import { fellowshipErrorResponse, fellowshipPrivateHeaders } from "../route-errors";

const evidence = z.object({
  kind: z.enum(["contribution", "role-history", "reference"]),
  sourceRef: z.string().min(1).max(500),
  description: z.string().min(1).max(2_000),
});
const schema = z.object({
  roleScopeId: z.string().uuid(),
  rationale: z.string().min(1).max(4_000),
  evidence: z.array(evidence).min(1).max(50),
});

export function POST(request: Request) {
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
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400, headers: fellowshipPrivateHeaders });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      return Response.json(await submitFellowshipApplication(runtime.db, actor, parsed.data), { status: 201, headers: fellowshipPrivateHeaders });
    } catch (error) {
      const response = fellowshipErrorResponse(error);
      if (response) return response;
      throw error;
    }
  });
}
