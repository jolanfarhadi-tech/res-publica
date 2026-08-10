import { createActorResolver } from "../../../../auth/actor-resolver";
import { getAuthRuntime } from "../../../../auth/runtime";
import { withRequestContext } from "../../../../platform/request-context";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};

async function handleSession(request: Request) {
  const runtime = getAuthRuntime();
  if (!runtime) {
    return Response.json(
      { authenticated: false, available: false },
      { headers: PRIVATE_HEADERS }
    );
  }

  const actor = await createActorResolver(runtime.db).resolve(request);
  if (!actor) {
    return Response.json(
      { authenticated: false, available: true },
      { headers: PRIVATE_HEADERS }
    );
  }

  return Response.json(
    {
      authenticated: true,
      available: true,
      assurance: actor.assurance,
    },
    { headers: PRIVATE_HEADERS }
  );
}

export function GET(request: Request) {
  return withRequestContext(request, () => handleSession(request));
}
