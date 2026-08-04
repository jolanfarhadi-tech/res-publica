import { z } from "zod";
import { createActorResolver } from "../../../../../auth/actor-resolver";
import { AuthorizationDeniedError } from "../../../../../auth/authorize";
import { getAuthRuntime } from "../../../../../auth/runtime";
import { rejectUntrustedWriteRequest } from "../../../../../auth/request-security";
import {
  ResearchWalletFeatureDisabledError,
  ResearchWalletNotFoundError,
  revokeResearchWallet,
} from "../../../../../application/research-wallet";
import { readResearchWalletFeatureGate } from "../../../../../application/research-wallet-gate";
import { rejectRateLimitedRequest, RESEARCH_WALLET_RECOVERY_RATE_LIMIT } from "../../../../../platform/rate-limit";
import { withRequestContext } from "../../../../../platform/request-context";

const bodySchema = z.object({ walletId: z.string().uuid(), confirmed: z.literal(true) }).strict();

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
    await revokeResearchWallet(runtime.db, actor, parsed.data.walletId, gate);
    return Response.json({ status: "revoked" });
  } catch (error) {
    if (error instanceof AuthorizationDeniedError) return Response.json({ error: "mfa_required_or_forbidden" }, { status: 403 });
    if (error instanceof ResearchWalletFeatureDisabledError) return Response.json({ error: "research_wallet_not_approved" }, { status: 503 });
    if (error instanceof ResearchWalletNotFoundError) return Response.json({ error: "wallet_not_found" }, { status: 404 });
    throw error;
  }
}

export function POST(request: Request) {
  return withRequestContext(request, () => handlePost(request));
}
