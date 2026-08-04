import { createHash, timingSafeEqual } from "node:crypto";
import { runSyntheticResearchSmoke } from "../../../../application/research-synthetic-smoke";
import { getAuthRuntime } from "../../../../auth/runtime";
import { rejectRateLimitedRequest, RESEARCH_CREDENTIAL_ISSUANCE_RATE_LIMIT } from "../../../../platform/rate-limit";
import { withRequestContext } from "../../../../platform/request-context";

async function handlePost(request: Request) {
  const expected = process.env.RESEARCH_SYNTHETIC_SMOKE_TOKEN;
  const authorization = request.headers.get("authorization");
  if (process.env.RESEARCH_SYNTHETIC_SMOKE_ENABLED !== "true" || !expected ||
    !authorization?.startsWith("Bearer ") ||
    !safeEqual(sha256(authorization.slice(7)), sha256(expected))) {
    return Response.json({ error: "synthetic_smoke_forbidden" }, { status: 403 });
  }
  const runtime = getAuthRuntime();
  if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
  const limited = await rejectRateLimitedRequest(runtime.db, request, RESEARCH_CREDENTIAL_ISSUANCE_RATE_LIMIT);
  if (limited) return limited;
  return Response.json(await runSyntheticResearchSmoke(), {
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

export function POST(request: Request) {
  return withRequestContext(request, () => handlePost(request));
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}
