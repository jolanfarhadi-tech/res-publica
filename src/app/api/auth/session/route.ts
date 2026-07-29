import { createActorResolver } from "../../../../auth/actor-resolver";
import { getAuthRuntime } from "../../../../auth/runtime";
import { withRequestContext } from "../../../../platform/request-context";

export const dynamic = "force-dynamic";

async function handleSession(request: Request) {
  const runtime = getAuthRuntime();
  if (!runtime) return Response.json({ authenticated: false, available: false });

  const actor = await createActorResolver(runtime.db).resolve(request);
  if (!actor) return Response.json({ authenticated: false, available: true });

  return Response.json({
    authenticated: true,
    available: true,
    assurance: actor.assurance,
  });
}

export function GET(request: Request) {
  return withRequestContext(request, () => handleSession(request));
}
