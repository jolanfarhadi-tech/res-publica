import { rejectUntrustedWriteRequest } from "../auth/request-security";
import { getAuthRuntime } from "../auth/runtime";
import {
  rejectRateLimitedRequest,
  type RateLimitPolicy,
} from "./rate-limit";
import {
  logPrivilegedAccessDenial,
  logSecurityQuarantineEnforced,
  withRequestContext,
  type RequestContext,
} from "./request-context";
import { isWriteScopeQuarantined } from "./capability-quarantine";

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

    if (isWriteScopeQuarantined(policy.scope)) {
      logSecurityQuarantineEnforced({
        request,
        requestId: context.requestId,
        scope: policy.scope,
      });
      return Response.json(
        { error: "security_quarantine_active" },
        {
          status: 503,
          headers: { "Cache-Control": "private, no-store, max-age=0" },
        }
      );
    }

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

    const response = await operation(runtime, context);
    if (response.status === 401 || response.status === 403) {
      logPrivilegedAccessDenial({
        request,
        requestId: context.requestId,
        status: response.status,
        scope: policy.scope,
      });
    }
    return response;
  });
}
