import { z } from "zod";
import { createActorResolver } from "../../../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../../../auth/authorize";
import {
  DefensiveResponseError,
  reviewDefensiveAction,
  rollbackDefensiveAction,
} from "../../../../../../application/defensive-correspondence";
import { DefensiveCorrespondenceError } from "../../../../../../modules/security-operations/defensive-correspondence";
import { executePrivilegedWrite } from "../../../../../../platform/privileged-write";
import { SECURITY_OPERATIONS_WRITE_RATE_LIMIT } from "../../../../../../platform/rate-limit";

export const dynamic = "force-dynamic";

const requestSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("review"), decision: z.enum(["approve", "reject"]) }),
  z.object({ operation: z.literal("rollback") }),
]);

export function POST(
  request: Request,
  context: { params: Promise<{ actionId: string }> }
) {
  return executePrivilegedWrite(
    request,
    SECURITY_OPERATIONS_WRITE_RATE_LIMIT,
    async (runtime, requestContext) => {
      const { actionId } = await context.params;
      const parsed = requestSchema.safeParse(await request.json().catch(() => null));
      if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
      const actor = await createActorResolver(runtime.db).resolve(request);
      try {
        const result = parsed.data.operation === "review"
          ? await reviewDefensiveAction(runtime.db, actor, {
              actionId, decision: parsed.data.decision, requestId: requestContext.requestId,
            })
          : await rollbackDefensiveAction(runtime.db, actor, {
              actionId, requestId: requestContext.requestId,
            });
        return Response.json(result, { headers: PRIVATE_HEADERS });
      } catch (error) {
        return responseError(error, actor !== null);
      }
    }
  );
}

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store, max-age=0" };

function responseError(error: unknown, authenticated: boolean): Response {
  if (error instanceof AuthorizationDeniedError) {
    return Response.json(
      { error: authenticated ? "forbidden" : "authentication_required" },
      { status: authenticated ? 403 : 401, headers: PRIVATE_HEADERS }
    );
  }
  if (error instanceof DefensiveResponseError || error instanceof DefensiveCorrespondenceError) {
    return Response.json(
      { error: error.code },
      { status: error.code.endsWith("not_found") ? 404 : 400, headers: PRIVATE_HEADERS }
    );
  }
  throw error;
}
