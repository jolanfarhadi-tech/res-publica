import { z } from "zod";
import { createActorResolver } from "../../../../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../../../../auth/authorize";
import { AcademyConflictError, AcademyNotFoundError, transitionAcademyProgram } from "../../../../../../../application/academy";
import { AcademyWorkflowError } from "../../../../../../../modules/academy/workflow";
import { executePrivilegedWrite } from "../../../../../../../platform/privileged-write";
import { ACADEMY_PRIVILEGED_WRITE_RATE_LIMIT } from "../../../../../../../platform/rate-limit";

const schema = z.object({ action: z.enum(["submit-review", "approve", "publish", "archive"]) });

export function POST(request: Request, context: { params: Promise<{ programId: string }> }) {
  return executePrivilegedWrite(request, ACADEMY_PRIVILEGED_WRITE_RATE_LIMIT, async (runtime) => {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    const { programId } = await context.params;
    if (!parsed.success || !z.string().uuid().safeParse(programId).success) return Response.json({ error: "invalid_request" }, { status: 400 });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      return Response.json(await transitionAcademyProgram(runtime.db, actor, programId, parsed.data.action));
    } catch (error) {
      if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
      if (error instanceof AcademyNotFoundError) return Response.json({ error: error.code }, { status: 404 });
      if (error instanceof AcademyConflictError || error instanceof AcademyWorkflowError) return Response.json({ error: error.code }, { status: 409 });
      throw error;
    }
  });
}
