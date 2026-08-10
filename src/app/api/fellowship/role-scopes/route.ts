import { z } from "zod";
import { getAuthRuntime } from "@/auth/runtime";
import { listApprovedFellowshipRoleScopes } from "@/application/fellowship";
import { withRequestContext } from "@/platform/request-context";

const localeSchema = z.enum(["de", "en", "fa"]);

export function GET(request: Request) {
  return withRequestContext(request, async () => {
    const runtime = getAuthRuntime();
    if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
    const parsed = localeSchema.safeParse(new URL(request.url).searchParams.get("locale"));
    if (!parsed.success) return Response.json({ error: "invalid_locale" }, { status: 400 });
    return Response.json(await listApprovedFellowshipRoleScopes(parsed.data, runtime.db), {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=300" },
    });
  });
}
