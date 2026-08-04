import { z } from "zod";
import { parseIssuerPublicKeyEnvironment } from "../../../../../application/research-credential-issuer";
import { readResearchRealDataGate } from "../../../../../application/research-real-data-gate";
import { authorizeResearchVerifierClient } from "../../../../../application/research-verifier-access";
import {
  DuplicateResearchSubmissionError,
  InvalidResearchPresentationError,
  verifyResearchPresentation,
} from "../../../../../application/research-verifier";
import { consumeResearchVerifierRateLimit } from "../../../../../application/research-verifier-rate-limit";
import { getResearchVerifierRuntime } from "../../../../../persistence/research-verifier-runtime";
import { withRequestContext } from "../../../../../platform/request-context";

const bodySchema = z.object({
  presentation: z.record(z.unknown()),
  challenge: z.object({
    challenge: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    audience: z.string().url().max(512),
    projectDigest: z.string().regex(/^[0-9a-f]{64}$/),
    presentationDigest: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    expiresAt: z.string().datetime({ offset: true }),
  }).strict(),
  holderSignature: z.string().regex(/^[A-Za-z0-9_-]+$/).max(256),
}).strict();

async function handlePost(request: Request) {
  if (!readResearchRealDataGate().enabled) {
    return Response.json({ error: "research_real_data_gate_closed" }, { status: 503 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  const client = authorizeResearchVerifierClient(request, parsed.data.challenge.projectDigest);
  if (!client || client.audience !== parsed.data.challenge.audience) {
    return Response.json({ error: "verifier_client_forbidden" }, { status: 403 });
  }
  const runtime = getResearchVerifierRuntime();
  const pepper = process.env.RESEARCH_VERIFIER_PEPPER;
  const issuerPublicKey = parseIssuerPublicKeyEnvironment();
  if (!runtime || !pepper || !issuerPublicKey) {
    return Response.json({ error: "service_not_configured" }, { status: 503 });
  }
  const limit = await consumeResearchVerifierRateLimit(runtime.db, request, client.projectDigest, pepper);
  if (!limit.allowed) {
    return Response.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  }
  try {
    const grant = await verifyResearchPresentation(runtime.db, {
      ...parsed.data, issuerPublicKey,
    }, pepper);
    return Response.json(grant, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
  } catch (error) {
    if (error instanceof DuplicateResearchSubmissionError) {
      return Response.json({ error: "project_submission_already_used" }, { status: 409 });
    }
    if (error instanceof InvalidResearchPresentationError) {
      return Response.json({ error: "invalid_or_replayed_presentation" }, { status: 403 });
    }
    throw error;
  }
}

export function POST(request: Request) {
  return withRequestContext(request, () => handlePost(request));
}
