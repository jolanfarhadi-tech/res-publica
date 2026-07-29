import { z } from "zod";
import { createActorResolver } from "../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../auth/authorize";
import { grantGovernanceRole, GovernanceGrantError, revokeGovernanceRole } from "../../../../application/governance-authority";
import { executePrivilegedWrite } from "../../../../platform/privileged-write";
import { GOVERNANCE_PRIVILEGED_WRITE_RATE_LIMIT } from "../../../../platform/rate-limit";

const operationalRole = z.enum([
  "intake-moderator", "validation-officer", "evidence-reviewer", "hearing-moderator",
  "quality-reviewer", "scientific-reviewer", "repair-coordinator",
]);
const grantSchema = z.object({
  granteePersonId: z.string().min(1), institutionId: z.string().min(1), role: operationalRole,
  validUntil: z.string().datetime().nullable().default(null),
});
const revokeSchema = z.object({ grantId: z.string().min(1), institutionId: z.string().min(1) });

export function POST(request: Request) {
  return executePrivilegedWrite(
    request,
    GOVERNANCE_PRIVILEGED_WRITE_RATE_LIMIT,
    async (runtime) => {
      const parsed = grantSchema.safeParse(await request.json().catch(() => null));
      if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
      const actor = await createActorResolver(runtime.db).resolve(request);
      try {
        const grant = await grantGovernanceRole(runtime.db, actor, {
          ...parsed.data, validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null,
        });
        return Response.json({ grant }, { status: 201 });
      } catch (error) { return governanceError(error); }
    }
  );
}

export function DELETE(request: Request) {
  return executePrivilegedWrite(
    request,
    GOVERNANCE_PRIVILEGED_WRITE_RATE_LIMIT,
    async (runtime) => {
      const parsed = revokeSchema.safeParse(await request.json().catch(() => null));
      if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
      const actor = await createActorResolver(runtime.db).resolve(request);
      try {
        return Response.json({ grant: await revokeGovernanceRole(runtime.db, actor, parsed.data) });
      } catch (error) { return governanceError(error); }
    }
  );
}

function governanceError(error: unknown): Response {
  if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
  if (error instanceof GovernanceGrantError) {
    const status = error.code === "grant_not_found" || error.code === "grantee_not_found" ? 404 : 403;
    return Response.json({ error: error.code }, { status });
  }
  throw error;
}
