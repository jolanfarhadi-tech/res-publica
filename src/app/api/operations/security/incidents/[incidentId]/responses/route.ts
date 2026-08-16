import { z } from "zod";
import { createActorResolver } from "../../../../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../../../../auth/authorize";
import {
  DefensiveResponseError,
  recordDefensiveSequence,
} from "../../../../../../../application/defensive-correspondence";
import { DefensiveCorrespondenceError } from "../../../../../../../modules/security-operations/defensive-correspondence";
import { SECURITY_ASSETS } from "../../../../../../../modules/security-operations/attribution";
import { executePrivilegedWrite } from "../../../../../../../platform/privileged-write";
import { SECURITY_OPERATIONS_WRITE_RATE_LIMIT } from "../../../../../../../platform/rate-limit";

export const dynamic = "force-dynamic";

const signalSchema = z.object({
  id: z.string().min(1).max(128),
  sequence: z.number().int().min(1).max(64),
  loop: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  kind: z.enum([
    "INITIAL_DECOY_SIGNAL", "HONEYPOT_ENGAGEMENT", "HIGH_VALUE_CONFIRMATION",
    "ADAPTIVE_ATTRIBUTION", "DEFENSIVE_SHADOW_CONFIRMATION",
  ]),
  evidenceIds: z.array(z.string().min(1).max(128)).min(1).max(32),
  targetAsset: z.enum(SECURITY_ASSETS),
  targetScope: z.string().min(1).max(128),
  observedAt: z.string().datetime(),
  contradictoryEvidence: z.array(z.string().min(1).max(128)).max(32).optional(),
  compromiseConfirmed: z.boolean().optional(),
});

const requestSchema = z.object({ signals: z.array(signalSchema).min(1).max(64) });

export function POST(
  request: Request,
  context: { params: Promise<{ incidentId: string }> }
) {
  return executePrivilegedWrite(
    request,
    SECURITY_OPERATIONS_WRITE_RATE_LIMIT,
    async (runtime, requestContext) => {
      const { incidentId } = await context.params;
      const parsed = requestSchema.safeParse(await request.json().catch(() => null));
      if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
      const actor = await createActorResolver(runtime.db).resolve(request);
      try {
        const result = await recordDefensiveSequence(runtime.db, actor, {
          incidentId,
          requestId: requestContext.requestId,
          signals: parsed.data.signals.map((signal) => ({
            ...signal,
            incidentId,
            observedAt: new Date(signal.observedAt),
          })),
        });
        return Response.json(result, { status: 201, headers: PRIVATE_HEADERS });
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
