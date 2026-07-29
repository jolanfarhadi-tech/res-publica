import { rejectUntrustedWriteRequest } from "../auth/request-security";
import { getAuthRuntime } from "../auth/runtime";
import {
  rejectRateLimitedRequest,
  type RateLimitPolicy,
} from "./rate-limit";
import { withRequestContext } from "./request-context";

export type PrivilegedWriteRuntime = NonNullable<
  ReturnType<typeof getAuthRuntime>
>;

export function executePrivilegedWrite(
  request: Request,
  policy: RateLimitPolicy,
  operation: (runtime: PrivilegedWriteRuntime) => Promise<Response>
): Promise<Response> {
  return withRequestContext(request, async () => {
    const originRejection = rejectUntrustedWriteRequest(request);
    if (originRejection) return originRejection;

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

    return operation(runtime);
  });
}
