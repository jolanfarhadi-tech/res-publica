import { z } from "zod";
import { createActorResolver } from "../../../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../../../auth/authorize";
import { getAuthRuntime } from "../../../../../../auth/runtime";
import { rejectUntrustedWriteRequest } from "../../../../../../auth/request-security";
import {
  ApplicantCannotDecideError,
  decideMembershipApplication,
  MembershipApplicationAlreadyDecidedError,
  MembershipDecisionReasonMismatchError,
  MembershipApplicationNotFoundError,
} from "../../../../../../application/membership-applications";
import {
  MEMBERSHIP_DECISION_RATE_LIMIT,
  rejectRateLimitedRequest,
} from "../../../../../../platform/rate-limit";
import {
  logPrivilegedAccessDenial,
  withRequestContext,
} from "../../../../../../platform/request-context";
import { PRIVILEGED_REASON_CODES } from "../../../../../../platform/privileged-access";

const bodySchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  reasonCode: z.enum(PRIVILEGED_REASON_CODES),
}).superRefine((value, context) => {
  const expected = value.decision === "approved"
    ? "membership-board-approval"
    : "membership-board-rejection";
  if (value.reasonCode !== expected) {
    context.addIssue({ code: "custom", message: "reason_code_mismatch", path: ["reasonCode"] });
  }
});

async function handlePost(
  request: Request,
  context: { params: Promise<{ applicationId: string }> },
  requestId: string,
) {
  const originRejection = rejectUntrustedWriteRequest(request);
  if (originRejection) return originRejection;
  const runtime = getAuthRuntime();
  if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
  const rateLimitRejection = await rejectRateLimitedRequest(
    runtime.db,
    request,
    MEMBERSHIP_DECISION_RATE_LIMIT
  );
  if (rateLimitRejection) return rateLimitRejection;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });

  const { applicationId } = await context.params;
  try {
    const actor = await createActorResolver(runtime.db).resolve(request);
    const result = await decideMembershipApplication(
      runtime.db,
      actor,
      applicationId,
      parsed.data.decision,
      { reasonCode: parsed.data.reasonCode, requestId }
    );
    return Response.json(result);
  } catch (error) {
    if (error instanceof AuthorizationDeniedError || error instanceof ApplicantCannotDecideError) {
      logPrivilegedAccessDenial({
        request,
        requestId,
        scope: MEMBERSHIP_DECISION_RATE_LIMIT.scope,
        status: 403,
      });
      return Response.json({ error: "forbidden" }, { status: 403 });
    }
    if (error instanceof MembershipApplicationNotFoundError) {
      return Response.json({ error: "application_not_found" }, { status: 404 });
    }
    if (error instanceof MembershipApplicationAlreadyDecidedError) {
      return Response.json({ error: "application_already_decided" }, { status: 409 });
    }
    if (error instanceof MembershipDecisionReasonMismatchError) {
      return Response.json({ error: "reason_code_mismatch" }, { status: 400 });
    }
    throw error;
  }
}

export function POST(
  request: Request,
  context: { params: Promise<{ applicationId: string }> }
) {
  return withRequestContext(request, (requestContext) =>
    handlePost(request, context, requestContext.requestId)
  );
}
