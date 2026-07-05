import { NextRequest, NextResponse } from "next/server";

/**
 * Newsletter subscription API — Milestone 6.
 *
 * POST /api/newsletter  { "email": "person@example.org" }
 *
 * The provider is configured via environment variables (Vercel →
 * Project → Settings → Environment Variables):
 *
 *   NEWSLETTER_PROVIDER=buttondown
 *   BUTTONDOWN_API_KEY=…
 *
 *   or
 *
 *   NEWSLETTER_PROVIDER=mailchimp
 *   MAILCHIMP_API_KEY=…            (ends in -usXX, the datacenter)
 *   MAILCHIMP_AUDIENCE_ID=…
 *
 * If no provider is configured, the endpoint returns 503 — an
 * honest "not available" instead of a fake success. The API key
 * stays on the server; it is never exposed to the browser.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Rate limiting — P0 fix (ADR-012). In-memory, per-process fixed window:
 * 5 requests/hour per IP. No external service (Upstash/Vercel KV) is
 * configured for this project yet, so this is the dependency-free
 * fallback `implementation-plan.md` names for that case, not a
 * permanent design choice.
 *
 * Known limitation: this Map is local to one running process. On a
 * single long-running Node server this enforces the limit correctly;
 * under multi-instance serverless scaling, each instance keeps its own
 * count, so the effective global limit is higher than 5/hour. Still a
 * large improvement over no rate limiting at all. Revisit with a
 * shared store (Upstash Redis, Vercel KV) once one is actually
 * provisioned for this deployment — not a P0-scope decision to make
 * speculatively.
 */
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

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

  // 201 = created; 400 with "already subscribed" is fine for the user.
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
  if (!apiKey || !audienceId || !datacenter) return { ok: false, status: 503 };

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

export async function POST(request: NextRequest) {
  if (isRateLimited(clientIp(request))) {
    return NextResponse.json(
      { error: "too_many_requests" },
      { status: 429 }
    );
  }

  let email = "";
  let honeypot = "";
  try {
    const body = await request.json();
    email = String(body.email ?? "").trim();
    honeypot = String(body.website ?? "");
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Bots fill the hidden field; pretend success and store nothing.
  if (honeypot) return NextResponse.json({ ok: true });

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const provider = process.env.NEWSLETTER_PROVIDER;
  let result: Result;
  try {
    if (provider === "buttondown") result = await subscribeButtondown(email);
    else if (provider === "mailchimp") result = await subscribeMailchimp(email);
    else result = { ok: false, status: 503 };
  } catch {
    result = { ok: false, status: 502 };
  }

  if (result.ok) return NextResponse.json({ ok: true });
  return NextResponse.json({ error: "unavailable" }, { status: result.status });
}
