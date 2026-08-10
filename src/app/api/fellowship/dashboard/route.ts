import { z } from "zod";
import { createActorResolver } from "@/auth/actor-resolver";
import { getAuthRuntime } from "@/auth/runtime";
import { getSelfFellowshipDashboard } from "@/application/fellowship";
import { withRequestContext } from "@/platform/request-context";
import { fellowshipErrorResponse, fellowshipPrivateHeaders } from "../route-errors";

const localeSchema = z.enum(["de", "en", "fa"]);

export function GET(request: Request) {
  return withRequestContext(request, async () => {
    const runtime = getAuthRuntime();
    if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
    const locale = localeSchema.safeParse(new URL(request.url).searchParams.get("locale"));
    if (!locale.success) return Response.json({ error: "invalid_locale" }, { status: 400, headers: fellowshipPrivateHeaders });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      return Response.json(await getSelfFellowshipDashboard(runtime.db, actor, locale.data), { headers: fellowshipPrivateHeaders });
    } catch (error) {
      const response = fellowshipErrorResponse(error);
      if (response) return response;
      throw error;
    }
  });
}
