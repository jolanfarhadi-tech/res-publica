import { z } from "zod";
import { createActorResolver } from "../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../auth/authorize";
import { getAuthRuntime } from "../../../../auth/runtime";
import {
  createSecurityIncident,
  getSecurityOperationsOverview,
  SecurityAttributionError,
} from "../../../../application/security-attribution";
import {
  AttributionValidationError,
  OBSERVED_TECHNIQUES,
  SECURITY_ASSETS,
} from "../../../../modules/security-operations/attribution";
import { executePrivilegedWrite } from "../../../../platform/privileged-write";
import {
  rejectRateLimitedRequest,
  SECURITY_OPERATIONS_READ_RATE_LIMIT,
  SECURITY_OPERATIONS_WRITE_RATE_LIMIT,
} from "../../../../platform/rate-limit";
import { withRequestContext } from "../../../../platform/request-context";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};

const observationSchema = z.object({
  observedAt: z.string().datetime(),
  source: z.enum([
    "application-request",
    "provider-export",
    "canonical-audit",
    "human-security-review",
  ]),
  sourceAddress: z.string().min(2).max(128).optional(),
  sourcePort: z.number().int().min(1).max(65_535).optional(),
  authenticationSubject: z.string().min(1).max(512).optional(),
  sessionId: z.string().min(1).max(512).optional(),
  apiCredentialId: z.string().min(1).max(512).optional(),
  routes: z.array(z.string().min(1).max(2_048)).max(32),
  userAgent: z.string().min(1).max(2_048).optional(),
  protocol: z.string().min(1).max(32).optional(),
  tlsVersion: z.string().min(1).max(32).optional(),
  techniques: z.array(z.enum(OBSERVED_TECHNIQUES)).max(16),
  affectedAssets: z.array(z.enum(SECURITY_ASSETS)).min(1).max(16),
});

const incidentSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{2,127}$/),
  title: z.string().min(1).max(200),
  severity: z.enum(["low", "moderate", "high", "critical"]),
  affectedAssets: z.array(z.enum(SECURITY_ASSETS)).min(1).max(16),
  observation: observationSchema,
});

export function GET(request: Request) {
  return withRequestContext(request, async () => {
    const requestedLimit = new URL(request.url).searchParams.get("limit");
    const limit = requestedLimit === null ? 50 : Number(requestedLimit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return Response.json({ error: "invalid_limit" }, { status: 400, headers: PRIVATE_HEADERS });
    }
    const runtime = getAuthRuntime();
    if (!runtime) {
      return Response.json({ error: "service_not_configured" }, { status: 503, headers: PRIVATE_HEADERS });
    }
    const rateLimitRejection = await rejectRateLimitedRequest(
      runtime.db,
      request,
      SECURITY_OPERATIONS_READ_RATE_LIMIT
    );
    if (rateLimitRejection) return rateLimitRejection;
    const actor = await createActorResolver(runtime.db).resolve(request);
    try {
      return Response.json(
        await getSecurityOperationsOverview(runtime.db, actor, limit),
        { headers: PRIVATE_HEADERS }
      );
    } catch (error) {
      if (error instanceof AuthorizationDeniedError) {
        return Response.json(
          { error: actor ? "forbidden" : "authentication_required" },
          { status: actor ? 403 : 401, headers: PRIVATE_HEADERS }
        );
      }
      throw error;
    }
  });
}

export function POST(request: Request) {
  return executePrivilegedWrite(
    request,
    SECURITY_OPERATIONS_WRITE_RATE_LIMIT,
    async (runtime, context) => {
      const parsed = incidentSchema.safeParse(await request.json().catch(() => null));
      if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
      const correlationSecret = process.env.SECURITY_ATTRIBUTION_CORRELATION_SECRET;
      if (!correlationSecret) {
        return Response.json({ error: "security_attribution_not_configured" }, { status: 503 });
      }
      const actor = await createActorResolver(runtime.db).resolve(request);
      try {
        return Response.json(
          await createSecurityIncident(runtime.db, actor, {
            ...parsed.data,
            requestId: context.requestId,
            correlationSecret,
            observation: {
              ...parsed.data.observation,
              observedAt: new Date(parsed.data.observation.observedAt),
            },
          }),
          { status: 201, headers: PRIVATE_HEADERS }
        );
      } catch (error) {
        return securityError(error, actor !== null);
      }
    }
  );
}

function securityError(error: unknown, authenticated: boolean): Response {
  if (error instanceof AuthorizationDeniedError) {
    return Response.json(
      { error: authenticated ? "forbidden" : "authentication_required" },
      { status: authenticated ? 403 : 401, headers: PRIVATE_HEADERS }
    );
  }
  if (error instanceof AttributionValidationError || error instanceof SecurityAttributionError) {
    const status = error.code === "incident_not_found" ? 404 : 400;
    return Response.json({ error: error.code }, { status, headers: PRIVATE_HEADERS });
  }
  throw error;
}
