import { createActorResolver } from "../../../../auth/actor-resolver";
import { getAuthRuntime } from "../../../../auth/runtime";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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
