import { z } from "zod";
import { createActorResolver } from "../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../auth/authorize";
import { registerHarmCase } from "../../../../application/harm-governance";
import { executePrivilegedWrite } from "../../../../platform/privileged-write";
import { GOVERNANCE_PRIVILEGED_WRITE_RATE_LIMIT } from "../../../../platform/rate-limit";

const schema = z.object({
  institutionId: z.string().min(1), location: z.string().min(1), harmCategory: z.string().min(1),
  description: z.string().min(1), affectedGroups: z.array(z.string().min(1)),
  allegedResponsibleActors: z.array(z.string().min(1)), sourceType: z.string().min(1),
  reporterPersonId: z.string().min(1).nullable(),
  confidentialityLevel: z.enum(["public", "restricted", "confidential"]),
});

export function POST(request: Request) {
  return executePrivilegedWrite(
    request,
    GOVERNANCE_PRIVILEGED_WRITE_RATE_LIMIT,
    async (runtime) => {
      const parsed = schema.safeParse(await request.json().catch(() => null));
      if (!parsed.success) {
        return Response.json({ error: "invalid_request" }, { status: 400 });
      }
      try {
        const actor = await createActorResolver(runtime.db).resolve(request);
        return Response.json(
          {
            harmCase: await registerHarmCase(
              runtime.db,
              actor,
              parsed.data
            ),
          },
          { status: 201 }
        );
      } catch (error) {
        if (error instanceof AuthorizationDeniedError) {
          return Response.json({ error: "forbidden" }, { status: 403 });
        }
        throw error;
      }
    }
  );
}
