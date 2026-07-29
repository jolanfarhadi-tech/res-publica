import { z } from "zod";
import { createActorResolver } from "../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../auth/authorize";
import { getAuthRuntime } from "../../../../auth/runtime";
import { rejectUntrustedWriteRequest } from "../../../../auth/request-security";
import { createMembership, DuplicateMembershipError } from "../../../../application/membership";
import { profileConsentSubmissionSchema } from "../../../../domain/consent";
import {
  MEMBERSHIP_CREATE_RATE_LIMIT,
  rejectRateLimitedRequest,
} from "../../../../platform/rate-limit";
import { withRequestContext } from "../../../../platform/request-context";

const bodySchema = z.object({
  tier: z.enum(["basic", "supporter", "volunteer", "research", "institutional"]),
  profileConsents: profileConsentSubmissionSchema,
});

async function handleCreateMembership(request: Request) {
  const rejection = rejectUntrustedWriteRequest(request);
  if (rejection) return rejection;
  const runtime = getAuthRuntime();
  if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
  const rateLimitRejection = await rejectRateLimitedRequest(
    runtime.db,
    request,
    MEMBERSHIP_CREATE_RATE_LIMIT
  );
  if (rateLimitRejection) return rateLimitRejection;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  try {
    const actor = await createActorResolver(runtime.db).resolve(request);
    const member = await createMembership(
      runtime.db,
      actor,
      parsed.data.tier,
      parsed.data.profileConsents
    );
    return Response.json({ member }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
    if (error instanceof DuplicateMembershipError) return Response.json({ error: "already_member" }, { status: 409 });
    throw error;
  }
}

export function POST(request: Request) {
  return withRequestContext(request, () => handleCreateMembership(request));
}
