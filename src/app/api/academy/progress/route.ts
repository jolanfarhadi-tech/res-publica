import { z } from "zod";
import { createActorResolver } from "../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../auth/authorize";
import { getAuthRuntime } from "../../../../auth/runtime";
import { rejectUntrustedWriteRequest } from "../../../../auth/request-security";
import { AcademyAuthenticationError, AcademyNotFoundError, updateAcademyLessonProgress } from "../../../../application/academy";
import { ACADEMY_SELF_SERVICE_RATE_LIMIT, rejectRateLimitedRequest } from "../../../../platform/rate-limit";
import { withRequestContext } from "../../../../platform/request-context";

const schema = z.object({
  enrollmentId: z.string().uuid(),
  lessonId: z.string().uuid(),
  status: z.enum(["in-progress", "completed"]),
});

export function POST(request: Request) {
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
    if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      return Response.json(await updateAcademyLessonProgress(runtime.db, actor, parsed.data));
    } catch (error) {
      if (error instanceof AcademyAuthenticationError) return Response.json({ error: "authentication_required" }, { status: 401 });
      if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
      if (error instanceof AcademyNotFoundError) return Response.json({ error: error.code }, { status: 404 });
      throw error;
    }
  });
}
