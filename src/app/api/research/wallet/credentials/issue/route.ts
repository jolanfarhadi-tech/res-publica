import { z } from "zod";
import { createActorResolver } from "../../../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../../../auth/authorize";
import { getAuthRuntime } from "../../../../../../auth/runtime";
import { rejectUntrustedWriteRequest } from "../../../../../../auth/request-security";
import {
  InvalidCredentialIssuanceChallengeError,
  issueProjectResearchCredential,
  parseIssuerKeyEnvironment,
  ResearchRealDataGateClosedError,
} from "../../../../../../application/research-credential-issuer";
import { readResearchRealDataGate } from "../../../../../../application/research-real-data-gate";
import {
  rejectRateLimitedRequest,
  RESEARCH_CREDENTIAL_ISSUANCE_RATE_LIMIT,
} from "../../../../../../platform/rate-limit";
import { withRequestContext } from "../../../../../../platform/request-context";

const bodySchema = z.object({
  walletId: z.string().uuid(),
  challenge: z.object({
    challenge: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    audience: z.string().url().max(512),
    projectDigest: z.string().regex(/^[0-9a-f]{64}$/),
    presentationDigest: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    expiresAt: z.string().datetime({ offset: true }),
  }).strict(),
  deviceSignature: z.string().regex(/^[A-Za-z0-9_-]+$/).max(256),
}).strict();

async function handlePost(request: Request) {
  const originRejection = rejectUntrustedWriteRequest(request);
  if (originRejection) return originRejection;
  const runtime = getAuthRuntime();
  if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
  const limited = await rejectRateLimitedRequest(runtime.db, request, RESEARCH_CREDENTIAL_ISSUANCE_RATE_LIMIT);
  if (limited) return limited;
  const gate = readResearchRealDataGate();
  const issuer = parseIssuerKeyEnvironment();
  if (!gate.enabled || !issuer) return Response.json({ error: "research_real_data_gate_closed" }, { status: 503 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  try {
    const actor = await createActorResolver(runtime.db).resolve(request);
    const credential = await issueProjectResearchCredential(runtime.db, actor, parsed.data, issuer, gate);
    return Response.json({ credential }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
  } catch (error) {
    if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
    if (error instanceof ResearchRealDataGateClosedError) return Response.json({ error: "research_real_data_gate_closed" }, { status: 503 });
    if (error instanceof InvalidCredentialIssuanceChallengeError) {
      return Response.json({ error: "invalid_or_replayed_challenge" }, { status: 409 });
    }
    throw error;
  }
}

export function POST(request: Request) {
  return withRequestContext(request, () => handlePost(request));
}
