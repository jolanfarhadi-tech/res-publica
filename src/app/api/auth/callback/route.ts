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
import { defaultLocale, isLocale, type Locale } from "../../../../i18n/config";

export const dynamic = "force-dynamic";

async function handleCallback(request: Request) {
  const runtime = getAuthRuntime();
  if (!runtime) {
    return authenticationError(
      request,
      "authentication_not_configured",
      503
    );
  }
  const callbackUrl = new URL(request.url);
  const state = callbackUrl.searchParams.get("state");
  if (!state) {
    return authenticationError(request, "invalid_authentication_state", 400);
  }

  const flow = await consumeAuthFlow(runtime.db, hashSecret(state));
  if (!flow) {
    return authenticationError(
      request,
      "invalid_or_expired_authentication_state",
      400
    );
  }
  const locale = localeFromReturnTo(flow.returnTo);

  try {
    const result = await finishOidcFlow(runtime.oidc, callbackUrl, {
      state,
      nonce: flow.nonce,
      codeVerifier: flow.codeVerifier,
    });
    let identity = await findAuthIdentity(runtime.db, result.issuer, result.subject);
    if (!identity && flow.intent === "signup") {
      if (!result.emailVerified) {
        return authenticationError(
          request,
          "email_verification_pending",
          403,
          locale
        );
      }
      const provisioned = await provisionSelfRegisteredIdentity(
        runtime.db,
        result,
        localeFromReturnTo(flow.returnTo)
      );
      identity = provisioned.identity;
    }
    if (!identity) {
      return authenticationError(
        request,
        "identity_not_provisioned",
        403,
        locale
      );
    }

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
      return authenticationError(
        request,
        "email_verification_pending",
        403,
        locale
      );
    }
    if (error instanceof IdentityReviewRequiredError) {
      return authenticationError(
        request,
        "identity_review_required",
        409,
        locale
      );
    }
    return authenticationError(
      request,
      "authentication_callback_failed",
      400,
      locale
    );
  }
}

function authenticationError(
  request: Request,
  reason: string,
  status: number,
  locale = preferredLocale(request)
) {
  if (request.headers.get("accept")?.includes("text/html")) {
    const target = new URL(`/${locale}/auth/error`, request.url);
    target.searchParams.set("reason", reason);
    return new Response(null, {
      status: 303,
      headers: {
        Location: target.toString(),
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  }
  return Response.json(
    { error: reason },
    {
      status,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    }
  );
}

function preferredLocale(request: Request): Locale {
  const accepted = request.headers.get("accept-language") ?? "";
  for (const preference of accepted.split(",")) {
    const language = preference.trim().split(";")[0]?.split("-")[0];
    if (language && isLocale(language)) return language;
  }
  return defaultLocale;
}

function localeFromReturnTo(returnTo: string): "de" | "en" | "fa" {
  const locale = returnTo.split("/")[1];
  return locale === "en" || locale === "fa" ? locale : "de";
}

export function GET(request: Request) {
  return withRequestContext(request, () => handleCallback(request));
}
