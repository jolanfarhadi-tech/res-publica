import { z } from "zod";
import { createActorResolver } from "../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../auth/authorize";
import { getAuthRuntime } from "../../../../auth/runtime";
import { rejectUntrustedWriteRequest } from "../../../../auth/request-security";
import {
  DuplicateMembershipApplicationError,
  ExistingMemberCannotApplyError,
  getSelfMembershipApplication,
  InvalidMembershipApplicationError,
  MembershipApplicationEmailMismatchError,
  MembershipApplicationAuthenticationError,
  submitMembershipApplication,
} from "../../../../application/membership-applications";
import {
  MEMBERSHIP_APPLICATION_RATE_LIMIT,
  rejectRateLimitedRequest,
} from "../../../../platform/rate-limit";
import { withRequestContext } from "../../../../platform/request-context";
import {
  MEMBERSHIP_APPLICATION_PROTOCOL_VERSION,
  MEMBERSHIP_PRIVACY_NOTICE_VERSION,
  MEMBERSHIP_STATUTES_VERSION,
  RESEARCH_READINESS_STATEMENT_VERSION,
} from "../../../../domain/membership-application/protocol";

function versionedAcceptance(version: string) {
  return z.object({
  accepted: z.literal(true),
    version: z.literal(version),
  });
}

const bodySchema = z.object({
  givenName: z.string().trim().min(1).max(120),
  familyName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  address: z.object({
    line1: z.string().trim().min(1).max(200),
    line2: z.string().trim().max(200).nullable(),
    postalCode: z.string().trim().min(1).max(24),
    city: z.string().trim().min(1).max(120),
    countryCode: z.string().trim().length(2),
  }),
  requestedTier: z.enum(["basic", "supporter", "volunteer", "research", "institutional"]),
  acknowledgements: z.object({
    statutes: versionedAcceptance(MEMBERSHIP_STATUTES_VERSION),
    technicalProtocol: versionedAcceptance(MEMBERSHIP_APPLICATION_PROTOCOL_VERSION),
    privacyNotice: z.object({
      acknowledged: z.literal(true),
      version: z.literal(MEMBERSHIP_PRIVACY_NOTICE_VERSION),
    }),
  }),
  researchReadiness: z.object({
    willing: z.literal(true),
    statementVersion: z.literal(RESEARCH_READINESS_STATEMENT_VERSION),
  }).optional(),
});

async function handlePost(request: Request) {
  const originRejection = rejectUntrustedWriteRequest(request);
  if (originRejection) return originRejection;
  const runtime = getAuthRuntime();
  if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
  const rateLimitRejection = await rejectRateLimitedRequest(
    runtime.db,
    request,
    MEMBERSHIP_APPLICATION_RATE_LIMIT
  );
  if (rateLimitRejection) return rateLimitRejection;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  try {
    const actor = await createActorResolver(runtime.db).resolve(request);
    const application = await submitMembershipApplication(runtime.db, actor, parsed.data);
    return Response.json({ application }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationDeniedError) {
      return Response.json({ error: "forbidden" }, { status: 403 });
    }
    if (error instanceof DuplicateMembershipApplicationError) {
      return Response.json({ error: "application_already_exists" }, { status: 409 });
    }
    if (error instanceof ExistingMemberCannotApplyError) {
      return Response.json({ error: "already_member" }, { status: 409 });
    }
    if (error instanceof MembershipApplicationEmailMismatchError) {
      return Response.json({ error: "verified_email_mismatch" }, { status: 409 });
    }
    if (error instanceof InvalidMembershipApplicationError) {
      return Response.json({ error: "invalid_request" }, { status: 400 });
    }
    throw error;
  }
}

export function POST(request: Request) {
  return withRequestContext(request, () => handlePost(request));
}

async function handleGet(request: Request) {
  const runtime = getAuthRuntime();
  if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
  try {
    const actor = await createActorResolver(runtime.db).resolve(request);
    const application = await getSelfMembershipApplication(runtime.db, actor);
    return Response.json({ application }, {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch (error) {
    if (error instanceof MembershipApplicationAuthenticationError) {
      return Response.json({ error: "authentication_required" }, {
        status: 401,
        headers: { "Cache-Control": "private, no-store, max-age=0" },
      });
    }
    throw error;
  }
}

export function GET(request: Request) {
  return withRequestContext(request, () => handleGet(request));
}
