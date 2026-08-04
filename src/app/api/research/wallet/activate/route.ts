import { z } from "zod";
import { createActorResolver } from "../../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../../auth/authorize";
import { getAuthRuntime } from "../../../../../auth/runtime";
import { rejectUntrustedWriteRequest } from "../../../../../auth/request-security";
import {
  activateResearchWallet,
  InvalidWalletActivationConsentError,
  ResearchWalletFeatureDisabledError,
  ResearchWalletNotFoundError,
  ResearchWalletNotOfferedError,
  VerifiedMembershipRequiredForWalletError,
} from "../../../../../application/research-wallet";
import { readResearchWalletFeatureGate } from "../../../../../application/research-wallet-gate";
import {
  rejectRateLimitedRequest,
  RESEARCH_WALLET_ACTIVATION_RATE_LIMIT,
} from "../../../../../platform/rate-limit";
import { withRequestContext } from "../../../../../platform/request-context";

const bodySchema = z.object({
  walletId: z.string().uuid(),
  holderKeyThumbprint: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  holderPublicKey: z.object({
    kty: z.literal("EC"),
    crv: z.literal("P-256"),
    x: z.string().min(1),
    y: z.string().min(1),
    ext: z.boolean().optional(),
    key_ops: z.array(z.string()).optional(),
  }).strict(),
  recoveryPublicKey: z.object({
    kty: z.literal("EC"), crv: z.literal("P-256"),
    x: z.string().min(1), y: z.string().min(1),
    ext: z.boolean().optional(), key_ops: z.array(z.string()).optional(),
  }).strict(),
  activationConsent: z.object({
    accepted: z.literal(true),
    version: z.literal("research-wallet-activation-v1"),
  }).strict(),
}).strict();

async function handlePost(request: Request) {
  const originRejection = rejectUntrustedWriteRequest(request);
  if (originRejection) return originRejection;
  const runtime = getAuthRuntime();
  if (!runtime) return Response.json({ error: "service_not_configured" }, { status: 503 });
  const rateLimitRejection = await rejectRateLimitedRequest(
    runtime.db,
    request,
    RESEARCH_WALLET_ACTIVATION_RATE_LIMIT
  );
  if (rateLimitRejection) return rateLimitRejection;
  const gate = readResearchWalletFeatureGate();
  if (!gate.enabled) {
    return Response.json({ error: "research_wallet_not_approved" }, { status: 503 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  try {
    const actor = await createActorResolver(runtime.db).resolve(request);
    const wallet = await activateResearchWallet(runtime.db, actor, parsed.data, gate);
    return Response.json({ wallet });
  } catch (error) {
    if (error instanceof AuthorizationDeniedError) {
      return Response.json({ error: "forbidden" }, { status: 403 });
    }
    if (error instanceof ResearchWalletFeatureDisabledError) {
      return Response.json({ error: "research_wallet_not_approved" }, { status: 503 });
    }
    if (error instanceof ResearchWalletNotFoundError) {
      return Response.json({ error: "wallet_not_found" }, { status: 404 });
    }
    if (error instanceof VerifiedMembershipRequiredForWalletError ||
      error instanceof InvalidWalletActivationConsentError ||
      error instanceof ResearchWalletNotOfferedError) {
      return Response.json({ error: "wallet_activation_not_allowed" }, { status: 409 });
    }
    throw error;
  }
}

export function POST(request: Request) {
  return withRequestContext(request, () => handlePost(request));
}
