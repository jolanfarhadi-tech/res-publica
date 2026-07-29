import { z } from "zod";
import { createActorResolver } from "../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../auth/authorize";
import { HarmGovernanceError, recordBasicValidation } from "../../../../application/harm-governance";
import { executePrivilegedWrite } from "../../../../platform/privileged-write";
import { GOVERNANCE_PRIVILEGED_WRITE_RATE_LIMIT } from "../../../../platform/rate-limit";

const schema = z.object({ caseId: z.string().min(1), status: z.enum(["valid", "valid-with-minor-issues", "incomplete", "duplicate", "invalid-submission"]), missingInformation: z.array(z.string().min(1)), duplicateOfCaseId: z.string().min(1).nullable(), notes: z.string() });

export function POST(request: Request) {
  return executePrivilegedWrite(
    request,
    GOVERNANCE_PRIVILEGED_WRITE_RATE_LIMIT,
    async (runtime) => {
      const parsed = schema.safeParse(await request.json().catch(() => null));
      if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
      try {
        const actor = await createActorResolver(runtime.db).resolve(request);
        return Response.json(await recordBasicValidation(runtime.db, actor, parsed.data), { status: 201 });
      } catch (error) {
        if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
        if (error instanceof HarmGovernanceError) return Response.json({ error: error.code }, { status: error.code === "case_not_found" ? 404 : 409 });
        if (error instanceof Error && ["validation_not_applicable", "duplicate_case_reference_required", "missing_information_required"].includes(error.message)) return Response.json({ error: error.message }, { status: 409 });
        throw error;
      }
    }
  );
}
