import { z } from "zod";
import { createActorResolver } from "../../../../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../../../../auth/authorize";
import { AcademyConflictError, AcademyNotFoundError, AcademySeparationOfDutiesError, AcademyValidationError, reviewAcademyAssessment } from "../../../../../../../application/academy";
import { executePrivilegedWrite } from "../../../../../../../platform/privileged-write";
import { ACADEMY_PRIVILEGED_WRITE_RATE_LIMIT } from "../../../../../../../platform/rate-limit";

const schema = z.object({ outcome: z.enum(["revision-required", "passed"]), feedback: z.string().min(1).max(20_000) });

export function POST(request: Request, context: { params: Promise<{ submissionId: string }> }) {
  return executePrivilegedWrite(request, ACADEMY_PRIVILEGED_WRITE_RATE_LIMIT, async (runtime) => {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    const { submissionId } = await context.params;
    if (!parsed.success || !z.string().uuid().safeParse(submissionId).success) return Response.json({ error: "invalid_request" }, { status: 400 });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      return Response.json(await reviewAcademyAssessment(runtime.db, actor, submissionId, parsed.data));
    } catch (error) {
      if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
      if (error instanceof AcademyNotFoundError) return Response.json({ error: error.code }, { status: 404 });
      if (error instanceof AcademySeparationOfDutiesError) return Response.json({ error: "separation_of_duties" }, { status: 409 });
      if (error instanceof AcademyConflictError) return Response.json({ error: error.code }, { status: 409 });
      if (error instanceof AcademyValidationError) return Response.json({ error: error.code }, { status: 400 });
      throw error;
    }
  });
}
