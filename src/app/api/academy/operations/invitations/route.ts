import { z } from "zod";
import { createActorResolver } from "../../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../../auth/authorize";
import { AcademyNotFoundError, AcademyValidationError, createAcademyInvitation } from "../../../../../application/academy";
import { executePrivilegedWrite } from "../../../../../platform/privileged-write";
import { ACADEMY_PRIVILEGED_WRITE_RATE_LIMIT } from "../../../../../platform/rate-limit";

const schema = z.object({
  courseId: z.string().uuid(), cohortId: z.string().uuid(),
  expiresAt: z.string().datetime().transform((value) => new Date(value)),
});

export function POST(request: Request) {
  return executePrivilegedWrite(request, ACADEMY_PRIVILEGED_WRITE_RATE_LIMIT, async (runtime) => {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      return Response.json(await createAcademyInvitation(runtime.db, actor, parsed.data), {
        status: 201,
        headers: { "Cache-Control": "private, no-store, max-age=0" },
      });
    } catch (error) {
      if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
      if (error instanceof AcademyNotFoundError) return Response.json({ error: error.code }, { status: 404 });
      if (error instanceof AcademyValidationError) return Response.json({ error: error.code }, { status: 400 });
      throw error;
    }
  });
}
