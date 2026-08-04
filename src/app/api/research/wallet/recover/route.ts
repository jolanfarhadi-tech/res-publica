import { z } from "zod";
import { createActorResolver } from "../../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../../auth/authorize";
import { getAuthRuntime } from "../../../../../auth/runtime";
import { rejectUntrustedWriteRequest } from "../../../../../auth/request-security";
import {
  InvalidWalletRecoveryRequestError,
  ResearchWalletDeviceNotActiveError,
  ResearchWalletFeatureDisabledError,
  ResearchWalletNotFoundError,
  rotateResearchWalletDevice,
} from "../../../../../application/research-wallet";
import { readResearchWalletFeatureGate } from "../../../../../application/research-wallet-gate";
import { rejectRateLimitedRequest, RESEARCH_WALLET_RECOVERY_RATE_LIMIT } from "../../../../../platform/rate-limit";
import { withRequestContext } from "../../../../../platform/request-context";

const bodySchema = z.object({
  walletId: z.string().uuid(), previousDeviceBindingId: z.string().uuid(),
  newHolderPublicKey: z.object({
    kty: z.literal("EC"), crv: z.literal("P-256"),
    x: z.string().min(1), y: z.string().min(1),
    ext: z.boolean().optional(), key_ops: z.array(z.string()).optional(),
  }).strict(),
  recoveryChallenge: z.object({
    challenge: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    audience: z.string().url().max(512),
    projectDigest: z.string().regex(/^[0-9a-f]{64}$/),
    presentationDigest: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    expiresAt: z.string().datetime({ offset: true }),
  }).strict(),
  recoverySignature: z.string().regex(/^[A-Za-z0-9_-]+$/).max(256),
}).strict();

async function handlePost(request: Request) {
  const originRejection = rejectUntrustedWriteRequest(request);
  if (originRejection) return originRejection;
  const runtime = getAuthRuntime();
  if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
  const limited = await rejectRateLimitedRequest(runtime.db, request, RESEARCH_WALLET_RECOVERY_RATE_LIMIT);
  if (limited) return limited;
  const gate = readResearchWalletFeatureGate();
  if (!gate.enabled) return Response.json({ error: "research_wallet_not_approved" }, { status: 503 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  try {
    const actor = await createActorResolver(runtime.db).resolve(request);
    const binding = await rotateResearchWalletDevice(runtime.db, actor, parsed.data, gate);
    return Response.json({ binding });
  } catch (error) {
    if (error instanceof AuthorizationDeniedError) return Response.json({ error: "mfa_required_or_forbidden" }, { status: 403 });
    if (error instanceof ResearchWalletFeatureDisabledError) return Response.json({ error: "research_wallet_not_approved" }, { status: 503 });
    if (error instanceof ResearchWalletNotFoundError) return Response.json({ error: "wallet_not_found" }, { status: 404 });
    if (error instanceof ResearchWalletDeviceNotActiveError) return Response.json({ error: "device_binding_not_active" }, { status: 409 });
    if (error instanceof InvalidWalletRecoveryRequestError) return Response.json({ error: "invalid_or_replayed_recovery_proof" }, { status: 409 });
    throw error;
  }
}

export function POST(request: Request) {
  return withRequestContext(request, () => handlePost(request));
}
