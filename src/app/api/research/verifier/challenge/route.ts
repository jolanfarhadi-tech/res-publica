import { z } from "zod";
import { readResearchRealDataGate } from "../../../../../application/research-real-data-gate";
import { authorizeResearchVerifierClient } from "../../../../../application/research-verifier-access";
import { createResearchVerifierChallenge } from "../../../../../application/research-verifier";
import { consumeResearchVerifierRateLimit } from "../../../../../application/research-verifier-rate-limit";
import { getResearchVerifierRuntime } from "../../../../../persistence/research-verifier-runtime";
import { withRequestContext } from "../../../../../platform/request-context";

const bodySchema = z.object({ projectDigest: z.string().regex(/^[0-9a-f]{64}$/) }).strict();

async function handlePost(request: Request) {
  if (!readResearchRealDataGate().enabled) {
    return Response.json({ error: "research_real_data_gate_closed" }, { status: 503 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  const client = authorizeResearchVerifierClient(request, parsed.data.projectDigest);
  if (!client) return Response.json({ error: "verifier_client_forbidden" }, { status: 403 });
  const runtime = getResearchVerifierRuntime();
  const pepper = process.env.RESEARCH_VERIFIER_PEPPER;
  if (!runtime || !pepper) return Response.json({ error: "service_not_configured" }, { status: 503 });
  const limit = await consumeResearchVerifierRateLimit(runtime.db, request, client.projectDigest, pepper);
  if (!limit.allowed) {
    return Response.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  }
  const challenge = await createResearchVerifierChallenge(runtime.db, {
    projectDigest: client.projectDigest, audience: client.audience,
  });
  return Response.json({ challenge }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}

export function POST(request: Request) {
  return withRequestContext(request, () => handlePost(request));
}
