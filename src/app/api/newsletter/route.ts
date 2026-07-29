import { rejectUntrustedWriteRequest } from "../../../auth/request-security";
import { getPersistenceRuntime } from "../../../persistence";
import {
  NEWSLETTER_SUBSCRIBE_RATE_LIMIT,
  rejectRateLimitedRequest,
} from "../../../platform/rate-limit";
import { withRequestContext } from "../../../platform/request-context";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONSENT_VERSION = "newsletter-v1";
const LOCALES = new Set(["de", "en", "fa"]);
const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
};

type Result = { ok: true } | { ok: false; status: number };

async function subscribeButtondown(email: string): Promise<Result> {
  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) return { ok: false, status: 503 };

  const response = await fetch("https://api.buttondown.email/v1/subscribers", {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email_address: email }),
  });

  if (response.status === 201) return { ok: true };
  if (response.status === 400) {
    const body = await response.text();
    if (body.includes("already")) return { ok: true };
  }
  return { ok: false, status: 502 };
}

async function subscribeMailchimp(email: string): Promise<Result> {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const datacenter = apiKey?.split("-")[1];
  if (!apiKey || !audienceId || !datacenter) {
    return { ok: false, status: 503 };
  }

  const response = await fetch(
    `https://${datacenter}.api.mailchimp.com/3.0/lists/${audienceId}/members`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: email, status: "pending" }),
    }
  );

  if (response.ok) return { ok: true };
  const body = await response.text();
  if (body.includes("Member Exists")) return { ok: true };
  return { ok: false, status: 502 };
}

export function POST(request: Request) {
  return withRequestContext(request, async () => {
    const originRejection = rejectUntrustedWriteRequest(request);
    if (originRejection) return originRejection;

    if (process.env.NEWSLETTER_ENABLED !== "true") {
      return Response.json(
        { error: "feature_not_activated" },
        { status: 503, headers: PRIVATE_HEADERS }
      );
    }

    const runtime = getPersistenceRuntime();
    if (!runtime) {
      return Response.json(
        { error: "service_not_configured" },
        { status: 503, headers: PRIVATE_HEADERS }
      );
    }
    const rateLimitRejection = await rejectRateLimitedRequest(
      runtime.db,
      request,
      NEWSLETTER_SUBSCRIBE_RATE_LIMIT
    );
    if (rateLimitRejection) return rateLimitRejection;

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return Response.json(
        { error: "invalid" },
        { status: 400, headers: PRIVATE_HEADERS }
      );
    }

    const honeypot = String(body.website ?? "");
    if (honeypot) {
      return Response.json({ ok: true }, { headers: PRIVATE_HEADERS });
    }

    const email = String(body.email ?? "").trim();
    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
      return Response.json(
        { error: "invalid" },
        { status: 400, headers: PRIVATE_HEADERS }
      );
    }
    if (
      body.consent !== true ||
      body.consentVersion !== CONSENT_VERSION ||
      typeof body.locale !== "string" ||
      !LOCALES.has(body.locale)
    ) {
      return Response.json(
        { error: "consent_required" },
        { status: 400, headers: PRIVATE_HEADERS }
      );
    }

    const provider = process.env.NEWSLETTER_PROVIDER;
    let result: Result;
    try {
      if (provider === "buttondown") {
        result = await subscribeButtondown(email);
      } else if (provider === "mailchimp") {
        result = await subscribeMailchimp(email);
      } else {
        result = { ok: false, status: 503 };
      }
    } catch {
      result = { ok: false, status: 502 };
    }

    if (result.ok) {
      return Response.json({ ok: true }, { headers: PRIVATE_HEADERS });
    }
    return Response.json(
      { error: "unavailable" },
      { status: result.status, headers: PRIVATE_HEADERS }
    );
  });
}
