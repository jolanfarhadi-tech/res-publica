import { z } from "zod";
import { createActorResolver } from "@/auth/actor-resolver";
import { changeFellowshipStatus } from "@/application/fellowship";
import { executePrivilegedWrite } from "@/platform/privileged-write";
import { FELLOWSHIP_PRIVILEGED_WRITE_RATE_LIMIT } from "@/platform/rate-limit";
import { fellowshipErrorResponse, fellowshipPrivateHeaders } from "../../../../route-errors";

const schema = z.object({ toStatus: z.enum(["active", "suspended", "ended"]), reason: z.string().min(1).max(4_000) });
export function POST(request: Request, context: { params: Promise<{ fellowshipId: string }> }) {
  return executePrivilegedWrite(request, FELLOWSHIP_PRIVILEGED_WRITE_RATE_LIMIT, async (runtime) => {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      const { fellowshipId } = await context.params;
      return Response.json(await changeFellowshipStatus(runtime.db, actor, { fellowshipId, ...parsed.data }), { headers: fellowshipPrivateHeaders });
    } catch (error) {
      const response = fellowshipErrorResponse(error);
      if (response) return response;
      throw error;
    }
  });
}
