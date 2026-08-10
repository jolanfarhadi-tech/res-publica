import { z } from "zod";
import { createActorResolver } from "../../../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../../../auth/authorize";
import { AcademyConflictError, AcademyNotFoundError, AcademyValidationError, updateAcademyCourseContent } from "../../../../../../application/academy";
import { executePrivilegedWrite } from "../../../../../../platform/privileged-write";
import { ACADEMY_PRIVILEGED_WRITE_RATE_LIMIT } from "../../../../../../platform/rate-limit";

const translation = z.object({
  title: z.string().min(1).max(300), summary: z.string().min(1).max(2_000),
  description: z.string().min(1).max(50_000),
  learningOutcomes: z.array(z.string().min(1).max(1_000)).min(1).max(30),
  sourceRefs: z.array(z.string().min(1).max(500)).min(1).max(50),
});
const schema = z.object({
  enrollmentPolicy: z.enum(["public", "member-only", "invitation", "application"]),
  translations: z.object({ de: translation, en: translation, fa: translation }),
});

export function PATCH(request: Request, context: { params: Promise<{ courseId: string }> }) {
  return executePrivilegedWrite(request, ACADEMY_PRIVILEGED_WRITE_RATE_LIMIT, async (runtime) => {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    const { courseId } = await context.params;
    if (!parsed.success || !z.string().uuid().safeParse(courseId).success) return Response.json({ error: "invalid_request" }, { status: 400 });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      return Response.json(await updateAcademyCourseContent(runtime.db, actor, courseId, parsed.data));
    } catch (error) {
      if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
      if (error instanceof AcademyNotFoundError) return Response.json({ error: error.code }, { status: 404 });
      if (error instanceof AcademyConflictError) return Response.json({ error: error.code }, { status: 409 });
      if (error instanceof AcademyValidationError) return Response.json({ error: error.code }, { status: 400 });
      throw error;
    }
  });
}
