import { z } from "zod";
import { listPublishedAcademyCatalog } from "../../../../application/academy";
import { getPersistenceRuntime } from "../../../../persistence";
import { withRequestContext } from "../../../../platform/request-context";

export const dynamic = "force-dynamic";

const localeSchema = z.enum(["de", "en", "fa"]);

export function GET(request: Request) {
  return withRequestContext(request, async () => {
    const locale = localeSchema.safeParse(new URL(request.url).searchParams.get("locale"));
    if (!locale.success) return Response.json({ error: "invalid_locale" }, { status: 400 });
    const runtime = getPersistenceRuntime();
    if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
    return Response.json(await listPublishedAcademyCatalog(runtime.db, locale.data), {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    });
  });
}
