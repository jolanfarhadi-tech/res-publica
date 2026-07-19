import { z } from "zod";
import { createActorResolver } from "../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../auth/authorize";
import { getAuthRuntime } from "../../../../auth/runtime";
import { rejectUntrustedWriteRequest } from "../../../../auth/request-security";
import { createMembership, DuplicateMembershipError } from "../../../../application/membership";

const bodySchema = z.object({ tier: z.enum(["basic", "supporter", "volunteer", "research", "institutional"]) });

export async function POST(request: Request) {
  const rejection = rejectUntrustedWriteRequest(request);
  if (rejection) return rejection;
  const runtime = getAuthRuntime();
  if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  try {
    const actor = await createActorResolver(runtime.db).resolve(request);
    const member = await createMembership(runtime.db, actor, parsed.data.tier);
    return Response.json({ member }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
    if (error instanceof DuplicateMembershipError) return Response.json({ error: "already_member" }, { status: 409 });
    throw error;
  }
}
