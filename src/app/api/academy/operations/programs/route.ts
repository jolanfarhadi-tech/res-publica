import { z } from "zod";
import { createActorResolver } from "../../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../../auth/authorize";
import { AcademyValidationError, createAcademyProgram } from "../../../../../application/academy";
import { executePrivilegedWrite } from "../../../../../platform/privileged-write";
import { ACADEMY_PRIVILEGED_WRITE_RATE_LIMIT } from "../../../../../platform/rate-limit";

const translation = z.object({
  title: z.string().min(1).max(300), summary: z.string().min(1).max(2_000),
  body: z.string().min(1).max(50_000), sourceRefs: z.array(z.string().min(1).max(500)).min(1).max(50),
});
const schema = z.object({
  slug: z.string().min(1).max(200),
  translations: z.object({ de: translation, en: translation, fa: translation }),
});

export function POST(request: Request) {
  return executePrivilegedWrite(request, ACADEMY_PRIVILEGED_WRITE_RATE_LIMIT, async (runtime) => {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
    try {
      const actor = await createActorResolver(runtime.db).resolve(request);
      return Response.json(await createAcademyProgram(runtime.db, actor, parsed.data), { status: 201 });
    } catch (error) {
      if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
      if (error instanceof AcademyValidationError) return Response.json({ error: error.code }, { status: 400 });
      throw error;
    }
  });
}
