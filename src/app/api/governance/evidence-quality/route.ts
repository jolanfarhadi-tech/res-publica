import { z } from "zod";
import { createActorResolver } from "../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../auth/authorize";
import { assessEvidenceQuality, GovernanceReviewError } from "../../../../application/harm-governance-review";
import { EVIDENCE_QUALITY_CRITERIA } from "../../../../modules/harm-governance/types";
import { executePrivilegedWrite } from "../../../../platform/privileged-write";
import { GOVERNANCE_PRIVILEGED_WRITE_RATE_LIMIT } from "../../../../platform/rate-limit";
const schema = z.object({ evidenceItemId: z.string().min(1), satisfiedCriteria: z.array(z.enum(EVIDENCE_QUALITY_CRITERIA)).min(1), contradictions: z.array(z.string()), corroboratingEvidenceItemIds: z.array(z.string().min(1)), confidence: z.enum(["very-low", "low", "moderate", "high", "very-high"]) });
export async function POST(request: Request) { return execute(request, schema, assessEvidenceQuality); }
async function execute<T extends z.ZodTypeAny>(request: Request, bodySchema: T, operation: typeof assessEvidenceQuality) {
  return executePrivilegedWrite(request, GOVERNANCE_PRIVILEGED_WRITE_RATE_LIMIT, async (runtime) => {
    const parsed = bodySchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
    try { const actor = await createActorResolver(runtime.db).resolve(request); return Response.json({ result: await operation(runtime.db, actor, parsed.data) }, { status: 201 }); }
    catch (error) { if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 }); if (error instanceof GovernanceReviewError) return Response.json({ error: error.code }, { status: 409 }); throw error; }
  });
}
