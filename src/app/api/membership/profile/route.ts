import { createActorResolver } from "../../../../auth/actor-resolver";
import { getAuthRuntime } from "../../../../auth/runtime";
import {
  getSelfMemberProfile,
  MemberProfileAuthenticationError,
} from "../../../../application/member-profile";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};

export async function GET(request: Request) {
  const runtime = getAuthRuntime();
  if (!runtime) {
    return Response.json(
      { error: "service_not_configured" },
      { status: 503, headers: PRIVATE_HEADERS }
    );
  }

  const actor = await createActorResolver(runtime.db).resolve(request);
  try {
    const profile = await getSelfMemberProfile(runtime.db, actor);
    return Response.json(profile, { headers: PRIVATE_HEADERS });
  } catch (error) {
    if (error instanceof MemberProfileAuthenticationError) {
      return Response.json(
        { error: "authentication_required" },
        { status: 401, headers: PRIVATE_HEADERS }
      );
    }
    throw error;
  }
}
