import { hashSecret } from "../../../../auth/crypto";
import { beginOidcFlow } from "../../../../auth/oidc";
import { getAuthRuntime } from "../../../../auth/runtime";
import { saveAuthFlow } from "../../../../auth/store";
import {
  AUTH_LOGIN_RATE_LIMIT,
  rejectRateLimitedRequest,
} from "../../../../platform/rate-limit";
import {
  logOperationalFailure,
  type RequestContext,
  withRequestContext,
} from "../../../../platform/request-context";

export const dynamic = "force-dynamic";

async function handleLogin(request: Request, context: RequestContext) {
  const runtime = getAuthRuntime();
  if (!runtime) return Response.json({ error: "authentication_not_configured" }, { status: 503 });
  const rateLimitRejection = await rejectRateLimitedRequest(
    runtime.db,
    request,
    AUTH_LOGIN_RATE_LIMIT
  );
  if (rateLimitRejection) return rateLimitRejection;
  const requestedReturnTo = new URL(request.url).searchParams.get("returnTo") ?? "/de";
  const intent = new URL(request.url).searchParams.get("mode") === "signup"
    ? "signup" as const
    : "login" as const;
  const stepUp = intent === "login" &&
    new URL(request.url).searchParams.get("stepUp") === "recent-mfa";
  const returnTo = requestedReturnTo.startsWith("/") && !requestedReturnTo.startsWith("//")
    ? requestedReturnTo
    : "/de";

  try {
    const flow = await beginOidcFlow(runtime.oidc, intent, { stepUp });
    const now = new Date();
    await saveAuthFlow(runtime.db, {
      stateHash: hashSecret(flow.state),
      codeVerifier: flow.codeVerifier,
      nonce: flow.nonce,
      returnTo,
      intent,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
    });
    return new Response(null, {
      status: 302,
      headers: {
        Location: flow.authorizationUrl.href,
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch {
    logOperationalFailure({
      event: "auth.provider_unavailable",
      dependency: "oidc",
      requestId: context.requestId,
      status: 503,
    });
    return Response.json(
      { error: "authentication_provider_unavailable" },
      {
        status: 503,
        headers: { "Cache-Control": "private, no-store, max-age=0" },
      }
    );
  }
}

export function GET(request: Request) {
  return withRequestContext(request, (context) => handleLogin(request, context));
}
