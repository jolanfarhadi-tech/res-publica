import { rejectUntrustedWriteRequest } from "../auth/request-security";
import { getAuthRuntime } from "../auth/runtime";
import {
  rejectRateLimitedRequest,
  type RateLimitPolicy,
} from "./rate-limit";
import { withRequestContext, type RequestContext } from "./request-context";

export type PrivilegedWriteRuntime = NonNullable<
  ReturnType<typeof getAuthRuntime>
>;

function isPrivilegedWriteActivated(policy: RateLimitPolicy): boolean {
  if (policy.scope !== "governance.privileged-write") return true;
  return process.env.HARM_OPERATIONS_ENABLED === "true";
}

export function executePrivilegedWrite(
  request: Request,
  policy: RateLimitPolicy,
  operation: (runtime: PrivilegedWriteRuntime, context: RequestContext) => Promise<Response>
): Promise<Response> {
  return withRequestContext(request, async (context) => {
    const originRejection = rejectUntrustedWriteRequest(request);
    if (originRejection) return originRejection;

    if (!isPrivilegedWriteActivated(policy)) {
      return Response.json(
        { error: "feature_not_activated" },
        {
          status: 503,
          headers: {
            "Cache-Control": "private, no-store, max-age=0",
          },
        }
      );
    }

    const runtime = getAuthRuntime();
    if (!runtime) {
      return Response.json(
        { error: "service_not_configured" },
        { status: 503 }
      );
    }

    const rateLimitRejection = await rejectRateLimitedRequest(
      runtime.db,
      request,
      policy
    );
    if (rateLimitRejection) return rateLimitRejection;

    return operation(runtime, context);
  });
}
