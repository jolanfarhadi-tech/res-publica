import { z } from "zod";
import { createActorResolver } from "../../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../../auth/authorize";
import {
  createSecurityIncidentCorrelation,
  SecurityAttributionError,
} from "../../../../../application/security-attribution";
import {
  AttributionValidationError,
  CORRELATION_SIGNALS,
} from "../../../../../modules/security-operations/attribution";
import { executePrivilegedWrite } from "../../../../../platform/privileged-write";
import { SECURITY_OPERATIONS_WRITE_RATE_LIMIT } from "../../../../../platform/rate-limit";

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store, max-age=0" };
const schema = z.object({
  leftIncidentId: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{2,127}$/),
  rightIncidentId: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{2,127}$/),
  matchingSignals: z.array(z.enum(CORRELATION_SIGNALS)).max(CORRELATION_SIGNALS.length),
  contradictorySignals: z.array(z.string().min(1).max(500)).max(50),
  reviewedAt: z.string().datetime(),
});

export function POST(request: Request) {
  return executePrivilegedWrite(
    request,
    SECURITY_OPERATIONS_WRITE_RATE_LIMIT,
    async (runtime, context) => {
      const parsed = schema.safeParse(await request.json().catch(() => null));
      if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400, headers: PRIVATE_HEADERS });
      const actor = await createActorResolver(runtime.db).resolve(request);
      try {
        return Response.json(
          await createSecurityIncidentCorrelation(runtime.db, actor, {
            ...parsed.data,
            reviewedAt: new Date(parsed.data.reviewedAt),
            requestId: context.requestId,
          }),
          { status: 201, headers: PRIVATE_HEADERS }
        );
      } catch (error) {
        if (error instanceof AuthorizationDeniedError) {
          return Response.json(
            { error: actor ? "forbidden" : "authentication_required" },
            { status: actor ? 403 : 401, headers: PRIVATE_HEADERS }
          );
        }
        if (error instanceof AttributionValidationError || error instanceof SecurityAttributionError) {
          const status = error.code === "incident_not_found" ? 404 : error.code === "separation_of_duties_required" ? 403 : 400;
          return Response.json({ error: error.code }, { status, headers: PRIVATE_HEADERS });
        }
        throw error;
      }
    }
  );
}
