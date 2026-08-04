import { z } from "zod";
import { createActorResolver } from "../../../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../../../auth/authorize";
import { getAuthRuntime } from "../../../../../../auth/runtime";
import { rejectUntrustedWriteRequest } from "../../../../../../auth/request-security";
import {
  createCredentialIssuanceChallenge,
  InvalidProjectPublicKeyError,
  ResearchProjectConsentRequiredError,
  ResearchProjectEligibilityRequiredError,
  ResearchRealDataGateClosedError,
  ResearchWalletDeviceUnavailableError,
  ResearchWalletNotEligibleForIssuanceError,
} from "../../../../../../application/research-credential-issuer";
import { readResearchRealDataGate } from "../../../../../../application/research-real-data-gate";
import {
  rejectRateLimitedRequest,
  RESEARCH_CREDENTIAL_ISSUANCE_RATE_LIMIT,
} from "../../../../../../platform/rate-limit";
import { withRequestContext } from "../../../../../../platform/request-context";

const bodySchema = z.object({
  walletId: z.string().uuid(),
  projectRef: z.string().trim().min(1).max(128),
  audience: z.string().url().max(512).refine((value) => value.startsWith("https://")),
  projectPublicKey: z.object({
    kty: z.literal("EC"), crv: z.literal("P-256"),
    x: z.string().min(1), y: z.string().min(1),
    ext: z.boolean().optional(), key_ops: z.array(z.string()).optional(),
  }).strict(),
}).strict();

async function handlePost(request: Request) {
  const originRejection = rejectUntrustedWriteRequest(request);
  if (originRejection) return originRejection;
  const runtime = getAuthRuntime();
  if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
  const limited = await rejectRateLimitedRequest(runtime.db, request, RESEARCH_CREDENTIAL_ISSUANCE_RATE_LIMIT);
  if (limited) return limited;
  const gate = readResearchRealDataGate();
  if (!gate.enabled) return Response.json({ error: "research_real_data_gate_closed" }, { status: 503 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  try {
    const actor = await createActorResolver(runtime.db).resolve(request);
    const challenge = await createCredentialIssuanceChallenge(runtime.db, actor, parsed.data, gate);
    return Response.json({ challenge });
  } catch (error) {
    if (error instanceof AuthorizationDeniedError) return Response.json({ error: "forbidden" }, { status: 403 });
    if (error instanceof ResearchRealDataGateClosedError) return Response.json({ error: "research_real_data_gate_closed" }, { status: 503 });
    if (error instanceof InvalidProjectPublicKeyError) return Response.json({ error: "invalid_project_key" }, { status: 400 });
    if (error instanceof ResearchWalletNotEligibleForIssuanceError ||
      error instanceof ResearchWalletDeviceUnavailableError ||
      error instanceof ResearchProjectEligibilityRequiredError ||
      error instanceof ResearchProjectConsentRequiredError) {
      return Response.json({ error: "credential_issuance_not_allowed" }, { status: 409 });
    }
    throw error;
  }
}

export function POST(request: Request) {
  return withRequestContext(request, () => handlePost(request));
}
