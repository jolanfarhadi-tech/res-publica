import { createId } from "../../../../domain/shared";
import { createActorResolver, SESSION_COOKIE_NAME } from "../../../../auth/actor-resolver";
import { getAuthRuntime } from "../../../../auth/runtime";
import { rejectUntrustedWriteRequest } from "../../../../auth/request-security";
import { revokeAuthenticatedSession } from "../../../../auth/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rejection = rejectUntrustedWriteRequest(request);
  if (rejection) return rejection;
  const runtime = getAuthRuntime();
  if (!runtime) return Response.json({ error: "authentication_not_configured" }, { status: 503 });
  const actor = await createActorResolver(runtime.db).resolve(request);
  if (actor) await revokeAuthenticatedSession(runtime.db, actor, createId());

  const response = new Response(null, { status: 204 });
  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
  );
  return response;
}
