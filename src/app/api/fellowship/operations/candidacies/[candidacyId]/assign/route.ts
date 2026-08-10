import { z } from "zod";
import { createActorResolver } from "@/auth/actor-resolver";
import { assignFellowshipReviewer } from "@/application/fellowship";
import { executePrivilegedWrite } from "@/platform/privileged-write";
import { FELLOWSHIP_PRIVILEGED_WRITE_RATE_LIMIT } from "@/platform/rate-limit";
import { fellowshipErrorResponse, fellowshipPrivateHeaders } from "../../../../route-errors";

const schema = z.object({ reviewerPersonId: z.string().uuid() });
export function POST(request: Request, context: { params: Promise<{ candidacyId: string }> }) {
  return executePrivilegedWrite(request, FELLOWSHIP_PRIVILEGED_WRITE_RATE_LIMIT, async (runtime) => {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      const { candidacyId } = await context.params;
      return Response.json(await assignFellowshipReviewer(runtime.db, actor, { candidacyId, ...parsed.data }), { status: 201, headers: fellowshipPrivateHeaders });
    } catch (error) {
      const response = fellowshipErrorResponse(error);
      if (response) return response;
      throw error;
    }
  });
}
