import { hashSecret } from "../../../../auth/crypto";
import { beginOidcFlow } from "../../../../auth/oidc";
import { getAuthRuntime } from "../../../../auth/runtime";
import { saveAuthFlow } from "../../../../auth/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const runtime = getAuthRuntime();
  if (!runtime) return Response.json({ error: "authentication_not_configured" }, { status: 503 });
  const requestedReturnTo = new URL(request.url).searchParams.get("returnTo") ?? "/de";
  const returnTo = requestedReturnTo.startsWith("/") && !requestedReturnTo.startsWith("//")
    ? requestedReturnTo
    : "/de";

  try {
    const flow = await beginOidcFlow(runtime.oidc);
    const now = new Date();
    await saveAuthFlow(runtime.db, {
      stateHash: hashSecret(flow.state),
      codeVerifier: flow.codeVerifier,
      nonce: flow.nonce,
      returnTo,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
    });
    return Response.redirect(flow.authorizationUrl, 302);
  } catch {
    return Response.json({ error: "authentication_provider_unavailable" }, { status: 503 });
  }
}
