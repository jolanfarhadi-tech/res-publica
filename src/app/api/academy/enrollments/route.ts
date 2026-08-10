import { z } from "zod";
import { createActorResolver } from "../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../auth/authorize";
import { rejectUntrustedWriteRequest } from "../../../../auth/request-security";
import { getAuthRuntime } from "../../../../auth/runtime";
import {
  AcademyAuthenticationError,
  AcademyEnrollmentError,
  AcademyNotFoundError,
  AcademyValidationError,
  enrollInAcademyCourse,
  getSelfAcademyDashboard,
} from "../../../../application/academy";
import { ACADEMY_SELF_SERVICE_RATE_LIMIT, rejectRateLimitedRequest } from "../../../../platform/rate-limit";
import { withRequestContext } from "../../../../platform/request-context";

const schema = z.object({
  courseId: z.string().uuid(),
  cohortId: z.string().uuid(),
  invitationToken: z.string().min(32).max(256).optional(),
  applicationStatement: z.string().min(1).max(4_000).optional(),
});
const localeSchema = z.enum(["de", "en", "fa"]);
const privateHeaders = { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" };

export function GET(request: Request) {
  return withRequestContext(request, async () => {
    const runtime = getAuthRuntime();
    if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503, headers: privateHeaders });
    const locale = localeSchema.safeParse(new URL(request.url).searchParams.get("locale"));
    if (!locale.success) return Response.json({ error: "invalid_locale" }, { status: 400, headers: privateHeaders });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      return Response.json(await getSelfAcademyDashboard(runtime.db, actor, locale.data), { headers: privateHeaders });
    } catch (error) {
      if (error instanceof AcademyAuthenticationError) {
        return Response.json({ error: "authentication_required" }, { status: 401, headers: privateHeaders });
      }
      throw error;
    }
  });
}

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
      return Response.json(await enrollInAcademyCourse(runtime.db, actor, parsed.data), { status: 201, headers: privateHeaders });
    } catch (error) {
      if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
      if (error instanceof AcademyNotFoundError) return Response.json({ error: error.code }, { status: 404 });
      if (error instanceof AcademyEnrollmentError || error instanceof AcademyValidationError) {
        return Response.json({ error: error.code }, { status: 409 });
      }
      throw error;
    }
  });
}
