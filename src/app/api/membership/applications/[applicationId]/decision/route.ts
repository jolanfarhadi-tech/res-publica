import { z } from "zod";
import { createActorResolver } from "../../../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../../../auth/authorize";
import { getAuthRuntime } from "../../../../../../auth/runtime";
import { rejectUntrustedWriteRequest } from "../../../../../../auth/request-security";
import {
  ApplicantCannotDecideError,
  decideMembershipApplication,
  MembershipApplicationAlreadyDecidedError,
  MembershipApplicationNotFoundError,
} from "../../../../../../application/membership-applications";
import {
  MEMBERSHIP_DECISION_RATE_LIMIT,
  rejectRateLimitedRequest,
} from "../../../../../../platform/rate-limit";
import { withRequestContext } from "../../../../../../platform/request-context";

const bodySchema = z.object({ decision: z.enum(["approved", "rejected"]) });

async function handlePost(
  request: Request,
  context: { params: Promise<{ applicationId: string }> }
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
      parsed.data.decision
    );
    return Response.json(result);
  } catch (error) {
    if (error instanceof AuthorizationDeniedError || error instanceof ApplicantCannotDecideError) {
      return Response.json({ error: "forbidden" }, { status: 403 });
    }
    if (error instanceof MembershipApplicationNotFoundError) {
      return Response.json({ error: "application_not_found" }, { status: 404 });
    }
    if (error instanceof MembershipApplicationAlreadyDecidedError) {
      return Response.json({ error: "application_already_decided" }, { status: 409 });
    }
    throw error;
  }
}

export function POST(
  request: Request,
  context: { params: Promise<{ applicationId: string }> }
) {
  return withRequestContext(request, () => handlePost(request, context));
}
