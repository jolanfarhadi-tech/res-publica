import { z } from "zod";
import { createActorResolver } from "@/auth/actor-resolver";
import { createFellowshipRoleScope } from "@/application/fellowship";
import { executePrivilegedWrite } from "@/platform/privileged-write";
import { FELLOWSHIP_PRIVILEGED_WRITE_RATE_LIMIT } from "@/platform/rate-limit";
import { fellowshipErrorResponse, fellowshipPrivateHeaders } from "../../route-errors";

const schema = z.object({
  slug: z.string().min(1).max(200),
  labels: z.object({ de: z.string().min(1).max(300), en: z.string().min(1).max(300), fa: z.string().min(1).max(300) }),
  responsibilities: z.array(z.string().min(1).max(2_000)).min(1).max(50),
  sourceRefs: z.array(z.string().min(1).max(500)).min(1).max(50),
});

export function POST(request: Request) {
  return executePrivilegedWrite(request, FELLOWSHIP_PRIVILEGED_WRITE_RATE_LIMIT, async (runtime) => {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      return Response.json(await createFellowshipRoleScope(runtime.db, actor, parsed.data), { status: 201, headers: fellowshipPrivateHeaders });
    } catch (error) {
      const response = fellowshipErrorResponse(error);
      if (response) return response;
      throw error;
    }
  });
}
