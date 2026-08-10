import { z } from "zod";
import { createActorResolver } from "@/auth/actor-resolver";
import { getAuthRuntime } from "@/auth/runtime";
import { getFellowshipOperationsOverview, submitFellowshipNomination } from "@/application/fellowship";
import { executePrivilegedWrite } from "@/platform/privileged-write";
import { FELLOWSHIP_PRIVILEGED_WRITE_RATE_LIMIT } from "@/platform/rate-limit";
import { withRequestContext } from "@/platform/request-context";
import { fellowshipErrorResponse, fellowshipPrivateHeaders } from "../../route-errors";

const evidence = z.object({ kind: z.enum(["contribution", "role-history", "reference"]), sourceRef: z.string().min(1).max(500), description: z.string().min(1).max(2_000) });
const schema = z.object({ candidatePersonId: z.string().uuid(), roleScopeId: z.string().uuid(), rationale: z.string().min(1).max(4_000), evidence: z.array(evidence).min(1).max(50) });

export function GET(request: Request) {
  return withRequestContext(request, async () => {
    const runtime = getAuthRuntime();
    if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      return Response.json(await getFellowshipOperationsOverview(runtime.db, actor), { headers: fellowshipPrivateHeaders });
    } catch (error) {
      const response = fellowshipErrorResponse(error);
      if (response) return response;
      throw error;
    }
  });
}

export function POST(request: Request) {
  return executePrivilegedWrite(request, FELLOWSHIP_PRIVILEGED_WRITE_RATE_LIMIT, async (runtime) => {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      return Response.json(await submitFellowshipNomination(runtime.db, actor, parsed.data), { status: 201, headers: fellowshipPrivateHeaders });
    } catch (error) {
      const response = fellowshipErrorResponse(error);
      if (response) return response;
      throw error;
    }
  });
}
