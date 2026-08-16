import { z } from "zod";
import { createActorResolver } from "@/auth/actor-resolver";
import { decideFellowshipCandidacy } from "@/application/fellowship";
import { executePrivilegedWrite } from "@/platform/privileged-write";
import { FELLOWSHIP_PRIVILEGED_WRITE_RATE_LIMIT } from "@/platform/rate-limit";
import { fellowshipErrorResponse, fellowshipPrivateHeaders } from "../../../../route-errors";

const schema = z.object({
  decision: z.enum(["approve", "reject"]),
  reason: z.string().min(1).max(10_000),
  memberFacingReason: z.string().min(1).max(2_000),
  sponsorPersonId: z.string().uuid().optional(),
  reviewDueAt: z.string().datetime().transform((value) => new Date(value)).nullable().optional(),
});

export function POST(request: Request, context: { params: Promise<{ candidacyId: string }> }) {
  return executePrivilegedWrite(request, FELLOWSHIP_PRIVILEGED_WRITE_RATE_LIMIT, async (runtime, requestContext) => {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      const { candidacyId } = await context.params;
      return Response.json(await decideFellowshipCandidacy(runtime.db, actor, { candidacyId, ...parsed.data }, {
        requestId: requestContext.requestId,
        reasonCode: "fellowship-candidacy-decision",
      }), { headers: fellowshipPrivateHeaders });
    } catch (error) {
      const response = fellowshipErrorResponse(error);
      if (response) return response;
      throw error;
    }
  });
}
