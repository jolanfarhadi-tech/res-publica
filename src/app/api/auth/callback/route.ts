import { createId } from "../../../../domain/shared";
import { SESSION_COOKIE_NAME } from "../../../../auth/actor-resolver";
import { createSessionToken, hashSecret } from "../../../../auth/crypto";
import { finishOidcFlow } from "../../../../auth/oidc";
import { getAuthRuntime } from "../../../../auth/runtime";
import { consumeAuthFlow, createAuthenticatedSession, findAuthIdentity } from "../../../../auth/store";
import {
  EmailVerificationRequiredError,
  IdentityReviewRequiredError,
  provisionSelfRegisteredIdentity,
} from "../../../../auth/self-registration";
import { withRequestContext } from "../../../../platform/request-context";

export const dynamic = "force-dynamic";

async function handleCallback(request: Request) {
  const runtime = getAuthRuntime();
  if (!runtime) return Response.json({ error: "authentication_not_configured" }, { status: 503 });
  const callbackUrl = new URL(request.url);
  const state = callbackUrl.searchParams.get("state");
  if (!state) return Response.json({ error: "invalid_authentication_state" }, { status: 400 });

  const flow = await consumeAuthFlow(runtime.db, hashSecret(state));
  if (!flow) return Response.json({ error: "invalid_or_expired_authentication_state" }, { status: 400 });

  try {
    const result = await finishOidcFlow(runtime.oidc, callbackUrl, {
      state,
      nonce: flow.nonce,
      codeVerifier: flow.codeVerifier,
    });
    let identity = await findAuthIdentity(runtime.db, result.issuer, result.subject);
    if (!identity && flow.intent === "signup") {
      if (!result.emailVerified) {
        return Response.json({ error: "email_verification_pending" }, { status: 403 });
      }
      const provisioned = await provisionSelfRegisteredIdentity(
        runtime.db,
        result,
        localeFromReturnTo(flow.returnTo)
      );
      identity = provisioned.identity;
    }
    if (!identity) return Response.json({ error: "identity_not_provisioned" }, { status: 403 });

    const token = createSessionToken();
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
    await createAuthenticatedSession(runtime.db, {
      id: createId(),
      authIdentityId: identity.id,
      tokenHash: hashSecret(token),
      assurance: result.assurance,
      authenticatedAt: result.authenticatedAt,
      expiresAt,
      personId: identity.personId,
      auditId: createId(),
    });

    return new Response(null, {
      status: 303,
      headers: {
        Location: new URL(flow.returnTo, request.url).toString(),
        "Set-Cookie": `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${8 * 60 * 60}`,
      },
    });
  } catch (error) {
    if (error instanceof EmailVerificationRequiredError) {
      return Response.json({ error: "email_verification_pending" }, { status: 403 });
    }
    if (error instanceof IdentityReviewRequiredError) {
      return Response.json({ error: "identity_review_required" }, { status: 409 });
    }
    return Response.json({ error: "authentication_callback_failed" }, { status: 400 });
  }
}

function localeFromReturnTo(returnTo: string): "de" | "en" | "fa" {
  const locale = returnTo.split("/")[1];
  return locale === "en" || locale === "fa" ? locale : "de";
}

export function GET(request: Request) {
  return withRequestContext(request, () => handleCallback(request));
}
