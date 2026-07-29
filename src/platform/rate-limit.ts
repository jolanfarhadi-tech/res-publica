import { createHmac } from "node:crypto";
import { lt, sql } from "drizzle-orm";
import type { Database } from "../persistence";
import { rateLimitBuckets } from "../persistence/schema";

export type RateLimitInput = {
  scope: string;
  identifier: string;
  pepper: string;
  limit: number;
  windowMs: number;
  now?: Date;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
};

export type RateLimitPolicy = {
  scope: string;
  limit: number;
  windowMs: number;
};

export const AUTH_LOGIN_RATE_LIMIT: RateLimitPolicy = {
  scope: "auth.login",
  limit: 10,
  windowMs: 15 * 60 * 1000,
};

export const MEMBERSHIP_CREATE_RATE_LIMIT: RateLimitPolicy = {
  scope: "membership.create",
  limit: 5,
  windowMs: 60 * 60 * 1000,
};

export const EVENT_REGISTRATION_RATE_LIMIT: RateLimitPolicy = {
  scope: "events.registration",
  limit: 20,
  windowMs: 15 * 60 * 1000,
};

export const NEWSLETTER_SUBSCRIBE_RATE_LIMIT: RateLimitPolicy = {
  scope: "newsletter.subscribe",
  limit: 5,
  windowMs: 60 * 60 * 1000,
};

export const GOVERNANCE_PRIVILEGED_WRITE_RATE_LIMIT: RateLimitPolicy = {
  scope: "governance.privileged-write",
  limit: 60,
  windowMs: 15 * 60 * 1000,
};

export const PUBLISHING_PRIVILEGED_WRITE_RATE_LIMIT: RateLimitPolicy = {
  scope: "publishing.privileged-write",
  limit: 60,
  windowMs: 15 * 60 * 1000,
};

const RETENTION_AFTER_EXPIRY_MS = 24 * 60 * 60 * 1000;

function hashIdentifier(
  scope: string,
  identifier: string,
  pepper: string
): string {
  return createHmac("sha256", pepper)
    .update(scope)
    .update("\0")
    .update(identifier)
    .digest("hex");
}

export async function consumeRateLimit(
  db: Database,
  input: RateLimitInput
): Promise<RateLimitResult> {
  if (!input.scope || !input.identifier || !input.pepper) {
    throw new Error("Rate-limit scope, identifier, and pepper are required");
  }
  if (!Number.isInteger(input.limit) || input.limit < 1) {
    throw new Error("Rate-limit limit must be a positive integer");
  }
  if (!Number.isInteger(input.windowMs) || input.windowMs < 1) {
    throw new Error("Rate-limit window must be a positive integer");
  }

  const now = input.now ?? new Date();
  const windowStartedAt = new Date(
    Math.floor(now.getTime() / input.windowMs) * input.windowMs
  );
  const expiresAt = new Date(windowStartedAt.getTime() + input.windowMs);
  const identifierHash = hashIdentifier(
    input.scope,
    input.identifier,
    input.pepper
  );

  await db
    .delete(rateLimitBuckets)
    .where(
      lt(
        rateLimitBuckets.expiresAt,
        new Date(now.getTime() - RETENTION_AFTER_EXPIRY_MS)
      )
    );

  const [bucket] = await db
    .insert(rateLimitBuckets)
    .values({
      scope: input.scope,
      identifierHash,
      windowStartedAt,
      expiresAt,
      requestCount: 1,
    })
    .onConflictDoUpdate({
      target: [rateLimitBuckets.scope, rateLimitBuckets.identifierHash],
      set: {
        requestCount: sql<number>`case
          when ${rateLimitBuckets.expiresAt} <= ${now} then 1
          else ${rateLimitBuckets.requestCount} + 1
        end`,
        windowStartedAt: sql<Date>`case
          when ${rateLimitBuckets.expiresAt} <= ${now} then ${windowStartedAt}
          else ${rateLimitBuckets.windowStartedAt}
        end`,
        expiresAt: sql<Date>`case
          when ${rateLimitBuckets.expiresAt} <= ${now} then ${expiresAt}
          else ${rateLimitBuckets.expiresAt}
        end`,
      },
    })
    .returning({
      requestCount: rateLimitBuckets.requestCount,
      expiresAt: rateLimitBuckets.expiresAt,
    });

  const remaining = Math.max(0, input.limit - bucket.requestCount);
  return {
    allowed: bucket.requestCount <= input.limit,
    limit: input.limit,
    remaining,
    resetAt: bucket.expiresAt,
  };
}

function requestClientIdentifier(request: Request): string {
  const forwarded =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for");
  const firstAddress = forwarded?.split(",", 1)[0]?.trim();
  return firstAddress ? firstAddress.slice(0, 128) : "unavailable";
}

export async function rejectRateLimitedRequest(
  db: Database,
  request: Request,
  policy: RateLimitPolicy,
  options: {
    environment?: Record<string, string | undefined>;
    now?: Date;
  } = {}
): Promise<Response | null> {
  const environment = options.environment ?? process.env;
  const pepper = environment.SESSION_SECRET;
  if (!pepper) {
    return Response.json(
      { error: "request_protection_not_configured" },
      {
        status: 503,
        headers: { "Cache-Control": "private, no-store, max-age=0" },
      }
    );
  }

  const result = await consumeRateLimit(db, {
    ...policy,
    identifier: requestClientIdentifier(request),
    pepper,
    now: options.now,
  });
  if (result.allowed) return null;

  const now = options.now ?? new Date();
  const retryAfter = Math.max(
    1,
    Math.ceil((result.resetAt.getTime() - now.getTime()) / 1000)
  );
  return Response.json(
    { error: "rate_limited" },
    {
      status: 429,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(
          Math.ceil(result.resetAt.getTime() / 1000)
        ),
      },
    }
  );
}
