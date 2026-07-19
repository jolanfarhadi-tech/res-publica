import { z } from "zod";
import { createActorResolver } from "../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../auth/authorize";
import { rejectUntrustedWriteRequest } from "../../../../auth/request-security";
import { getAuthRuntime } from "../../../../auth/runtime";
import { registerHarmCase } from "../../../../application/harm-governance";

const schema = z.object({
  institutionId: z.string().min(1), location: z.string().min(1), harmCategory: z.string().min(1),
  description: z.string().min(1), affectedGroups: z.array(z.string().min(1)),
  allegedResponsibleActors: z.array(z.string().min(1)), sourceType: z.string().min(1),
  reporterPersonId: z.string().min(1).nullable(),
  confidentialityLevel: z.enum(["public", "restricted", "confidential"]),
});

export async function POST(request: Request) {
  const rejection = rejectUntrustedWriteRequest(request);
  if (rejection) return rejection;
  const runtime = getAuthRuntime();
  if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  try {
    const actor = await createActorResolver(runtime.db).resolve(request);
    return Response.json({ harmCase: await registerHarmCase(runtime.db, actor, parsed.data) }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
    throw error;
  }
}
