import { createActorResolver } from "@/auth/actor-resolver";
import { approveFellowshipRoleScope } from "@/application/fellowship";
import { executePrivilegedWrite } from "@/platform/privileged-write";
import { FELLOWSHIP_PRIVILEGED_WRITE_RATE_LIMIT } from "@/platform/rate-limit";
import { fellowshipErrorResponse, fellowshipPrivateHeaders } from "../../../../route-errors";

export function POST(request: Request, context: { params: Promise<{ roleScopeId: string }> }) {
  return executePrivilegedWrite(request, FELLOWSHIP_PRIVILEGED_WRITE_RATE_LIMIT, async (runtime, requestContext) => {
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      const { roleScopeId } = await context.params;
      return Response.json(await approveFellowshipRoleScope(runtime.db, actor, roleScopeId, {
        requestId: requestContext.requestId,
        reasonCode: "fellowship-role-scope-approval",
      }), { headers: fellowshipPrivateHeaders });
    } catch (error) {
      const response = fellowshipErrorResponse(error);
      if (response) return response;
      throw error;
    }
  });
}
