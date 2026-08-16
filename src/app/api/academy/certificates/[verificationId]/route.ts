import { z } from "zod";
import { verifyAcademyCertificate } from "../../../../../application/academy";
import { getPersistenceRuntime } from "../../../../../persistence";
import { withRequestContext } from "../../../../../platform/request-context";
import {
  ACADEMY_CERTIFICATE_VERIFY_RATE_LIMIT,
  rejectRateLimitedRequest,
} from "../../../../../platform/rate-limit";

const localeSchema = z.enum(["de", "en", "fa"]);

export function GET(request: Request, context: { params: Promise<{ verificationId: string }> }) {
  return withRequestContext(request, async () => {
    const runtime = getPersistenceRuntime();
    if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
    const rateLimitRejection = await rejectRateLimitedRequest(
      runtime.db, request, ACADEMY_CERTIFICATE_VERIFY_RATE_LIMIT
    );
    if (rateLimitRejection) return rateLimitRejection;
    const locale = localeSchema.safeParse(new URL(request.url).searchParams.get("locale"));
    const { verificationId } = await context.params;
    if (!locale.success || !/^[A-Za-z0-9_-]{32}$/.test(verificationId)) {
      return Response.json({ error: "invalid_request" }, { status: 400 });
    }
    const result = await verifyAcademyCertificate(runtime.db, verificationId, locale.data);
    return Response.json(result, {
      status: result.valid ? 200 : 404,
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    });
  });
}
