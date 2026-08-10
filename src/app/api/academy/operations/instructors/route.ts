import { z } from "zod";
import { createActorResolver } from "../../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../../auth/authorize";
import { AcademyNotFoundError, AcademySeparationOfDutiesError, assignAcademyInstructor } from "../../../../../application/academy";
import { executePrivilegedWrite } from "../../../../../platform/privileged-write";
import { ACADEMY_PRIVILEGED_WRITE_RATE_LIMIT } from "../../../../../platform/rate-limit";

const schema = z.object({
  courseId: z.string().uuid(), instructorPersonId: z.string().min(1),
  role: z.enum(["lead", "facilitator", "reviewer"]), publicBiographyApproved: z.literal(true),
});

export function POST(request: Request) {
  return executePrivilegedWrite(request, ACADEMY_PRIVILEGED_WRITE_RATE_LIMIT, async (runtime) => {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      return Response.json(await assignAcademyInstructor(runtime.db, actor, parsed.data), { status: 201 });
    } catch (error) {
      if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
      if (error instanceof AcademyNotFoundError) return Response.json({ error: error.code }, { status: 404 });
      if (error instanceof AcademySeparationOfDutiesError) return Response.json({ error: "separation_of_duties" }, { status: 409 });
      throw error;
    }
  });
}
