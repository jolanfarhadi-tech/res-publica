import { createHash, timingSafeEqual } from "node:crypto";

type VerifierClient = {
  tokenHash: string;
  allowedOrigin: string;
  audience: string;
};

export type AuthorizedVerifierClient = VerifierClient & { projectDigest: string };

export function authorizeResearchVerifierClient(
  request: Request,
  projectDigest: string,
  environment: Record<string, string | undefined> = process.env
): AuthorizedVerifierClient | null {
  const clients = parseVerifierClients(environment.RESEARCH_VERIFIER_CLIENTS_JSON);
  const client = clients?.[projectDigest];
  const origin = request.headers.get("origin");
  const authorization = request.headers.get("authorization");
  if (!client || !origin || origin !== client.allowedOrigin ||
    !authorization?.startsWith("Bearer ")) return null;
  const received = sha256(authorization.slice("Bearer ".length));
  if (!safeEqual(received, client.tokenHash)) return null;
  return { ...client, projectDigest };
}

function parseVerifierClients(value: string | undefined): Record<string, VerifierClient> | null {
  try {
    const parsed = JSON.parse(value ?? "") as Record<string, VerifierClient>;
    for (const [projectDigest, client] of Object.entries(parsed)) {
      if (!/^[0-9a-f]{64}$/.test(projectDigest) ||
        !/^[0-9a-f]{64}$/.test(client.tokenHash) ||
        new URL(client.allowedOrigin).origin !== client.allowedOrigin ||
        new URL(client.audience).protocol !== "https:") return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export class ResearchVerifierAccessDeniedError extends Error {}
