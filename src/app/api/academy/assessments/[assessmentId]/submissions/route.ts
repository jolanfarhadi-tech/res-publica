import { z } from "zod";
import { createActorResolver } from "../../../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../../../auth/authorize";
import { rejectUntrustedWriteRequest } from "../../../../../../auth/request-security";
import { getAuthRuntime } from "../../../../../../auth/runtime";
import { AcademyAuthenticationError, AcademyNotFoundError, AcademyValidationError, submitAcademyAssessment } from "../../../../../../application/academy";
import { ACADEMY_SELF_SERVICE_RATE_LIMIT, rejectRateLimitedRequest } from "../../../../../../platform/rate-limit";
import { withRequestContext } from "../../../../../../platform/request-context";

const schema = z.object({ enrollmentId: z.string().uuid(), response: z.string().min(1).max(50_000) });

export function POST(request: Request, context: { params: Promise<{ assessmentId: string }> }) {
  return withRequestContext(request, async () => {
    const originRejection = rejectUntrustedWriteRequest(request);
    if (originRejection) return originRejection;
    if (process.env.ACADEMY_ENROLLMENT_ENABLED !== "true") {
      return Response.json({ error: "feature_not_activated" }, { status: 503 });
    }
    const runtime = getAuthRuntime();
    if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
    const rateLimitRejection = await rejectRateLimitedRequest(runtime.db, request, ACADEMY_SELF_SERVICE_RATE_LIMIT);
    if (rateLimitRejection) return rateLimitRejection;
    const parsed = schema.safeParse(await request.json().catch(() => null));
    const { assessmentId } = await context.params;
    if (!parsed.success || !z.string().uuid().safeParse(assessmentId).success) {
      return Response.json({ error: "invalid_request" }, { status: 400 });
    }
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      return Response.json(await submitAcademyAssessment(runtime.db, actor, { assessmentId, ...parsed.data }), { status: 201 });
    } catch (error) {
      if (error instanceof AcademyAuthenticationError) return Response.json({ error: "authentication_required" }, { status: 401 });
      if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
      if (error instanceof AcademyNotFoundError) return Response.json({ error: error.code }, { status: 404 });
      if (error instanceof AcademyValidationError) return Response.json({ error: error.code }, { status: 400 });
      throw error;
    }
  });
}
