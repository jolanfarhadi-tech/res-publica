import { createHmac } from "node:crypto";
import { lt, sql } from "drizzle-orm";
import type { ResearchVerifierDatabase } from "../persistence/research-verifier-database";
import { verifierRateLimitBuckets } from "../persistence/research-verifier-schema";

const WINDOW_MS = 15 * 60 * 1000;
const LIMIT = 30;
const RETENTION_MS = 24 * 60 * 60 * 1000;

export async function consumeResearchVerifierRateLimit(
  db: ResearchVerifierDatabase,
  request: Request,
  projectDigest: string,
  pepper: string,
  now = new Date()
) {
  if (!pepper) throw new ResearchVerifierRateLimitConfigurationError();
  const windowStartedAt = new Date(Math.floor(now.getTime() / WINDOW_MS) * WINDOW_MS);
  const expiresAt = new Date(windowStartedAt.getTime() + WINDOW_MS);
  const identifier = request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for") ?? "unavailable";
  const identifierHash = createHmac("sha256", pepper)
    .update(projectDigest).update("\0").update(identifier.split(",", 1)[0].trim().slice(0, 128))
    .digest("hex");
  await db.delete(verifierRateLimitBuckets).where(
    lt(verifierRateLimitBuckets.expiresAt, new Date(now.getTime() - RETENTION_MS))
  );
  const [bucket] = await db.insert(verifierRateLimitBuckets).values({
    scope: "research.verifier", identifierHash, windowStartedAt, expiresAt, requestCount: 1,
  }).onConflictDoUpdate({
    target: [verifierRateLimitBuckets.scope, verifierRateLimitBuckets.identifierHash],
    set: {
      requestCount: sql<number>`case when ${verifierRateLimitBuckets.expiresAt} <= ${now} then 1 else ${verifierRateLimitBuckets.requestCount} + 1 end`,
      windowStartedAt: sql<Date>`case when ${verifierRateLimitBuckets.expiresAt} <= ${now} then ${windowStartedAt} else ${verifierRateLimitBuckets.windowStartedAt} end`,
      expiresAt: sql<Date>`case when ${verifierRateLimitBuckets.expiresAt} <= ${now} then ${expiresAt} else ${verifierRateLimitBuckets.expiresAt} end`,
    },
  }).returning({ requestCount: verifierRateLimitBuckets.requestCount, expiresAt: verifierRateLimitBuckets.expiresAt });
  return { allowed: bucket.requestCount <= LIMIT, retryAfter: Math.max(1, Math.ceil((bucket.expiresAt.getTime() - now.getTime()) / 1000)) };
}

export class ResearchVerifierRateLimitConfigurationError extends Error {}
