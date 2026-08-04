import { createHash, createHmac, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import {
  containsGenericDirectIdentifier,
} from "../domain/research-intake/redaction";
import {
  validateResearchContribution,
  type ApprovedResearchProtocol,
  type ResearchContributionInput,
} from "../domain/research-intake/protocol";
import {
  digestPresentation,
  jwkThumbprint,
  verifyProjectChallengeSignature,
  type ProjectChallenge,
} from "../domain/research-wallet/local-wallet";
import {
  readResearchCredentialSubject,
  verifyResearchEligibilityPresentation,
} from "../domain/research-wallet/bbs-credential";
import type { ResearchVerifierDatabase } from "../persistence/research-verifier-database";
import {
  anonymousResearchContributions,
  intakeTokens,
  researchProtocols,
  submissionNullifiers,
  verifierChallenges,
} from "../persistence/research-verifier-schema";

const CHALLENGE_LIFETIME_MS = 5 * 60 * 1000;
const INTAKE_TOKEN_LIFETIME_MS = 5 * 60 * 1000;

export async function registerResearchProtocol(
  db: ResearchVerifierDatabase,
  protocol: ApprovedResearchProtocol,
  now = new Date()
) {
  validateResearchContribution(protocol, {
    background: Object.fromEntries(protocol.backgroundCharacteristics.map((item) => [
      item.key,
      item.categories[0] ?? "",
    ])),
    contribution: "protocol-validation",
  });
  await db.insert(researchProtocols).values({
    projectDigest: protocol.projectDigest,
    protocolVersion: protocol.version,
    status: protocol.status,
    minimumCohortSize: protocol.minimumCohortSize,
    backgroundCharacteristics: protocol.backgroundCharacteristics,
    contributionMaxLength: protocol.contributionMaxLength,
    retentionRule: protocol.retentionRule,
    activatedAt: now,
  });
}

export async function createResearchVerifierChallenge(
  db: ResearchVerifierDatabase,
  input: { projectDigest: string; audience: string },
  now = new Date()
) {
  const protocol = await loadProtocol(db, input.projectDigest);
  const challenge = randomBytes(32).toString("base64url");
  const expiresAt = new Date(now.getTime() + CHALLENGE_LIFETIME_MS);
  await db.insert(verifierChallenges).values({
    challengeHash: sha256(challenge),
    projectDigest: protocol.projectDigest,
    audienceHash: sha256(input.audience),
    expiresAt,
  });
  return { challenge, projectDigest: protocol.projectDigest, audience: input.audience, expiresAt };
}

export async function verifyResearchPresentation(
  db: ResearchVerifierDatabase,
  input: {
    presentation: Record<string, unknown>;
    issuerPublicKey: Record<string, unknown>;
    challenge: ProjectChallenge;
    holderSignature: string;
  },
  pepper: string,
  now = new Date()
) {
  if (!pepper) throw new ResearchVerifierConfigurationError();
  const proof = await verifyResearchEligibilityPresentation(
    input.presentation,
    input.issuerPublicKey,
    now
  );
  if (!proof.verified) throw new InvalidResearchPresentationError(proof.reason);
  const subject = readResearchCredentialSubject(input.presentation);
  if (subject.projectDigest !== input.challenge.projectDigest ||
    input.challenge.presentationDigest !== await digestPresentation(input.presentation) ||
    now >= new Date(input.challenge.expiresAt)) {
    throw new InvalidResearchPresentationError("challenge_mismatch");
  }
  const publicKey = parseProjectPublicKey(subject.projectPublicKey);
  if (!await verifyProjectChallengeSignature(publicKey, input.challenge, input.holderSignature)) {
    throw new InvalidResearchPresentationError("holder_signature_invalid");
  }

  const challengeHash = sha256(input.challenge.challenge);
  const [storedChallenge] = await db.select().from(verifierChallenges).where(and(
    eq(verifierChallenges.challengeHash, challengeHash),
    eq(verifierChallenges.projectDigest, subject.projectDigest),
    eq(verifierChallenges.audienceHash, sha256(input.challenge.audience)),
    gt(verifierChallenges.expiresAt, now)
  )).limit(1);
  if (!storedChallenge) throw new InvalidResearchPresentationError("challenge_missing_or_replayed");

  const projectKeyThumbprint = await jwkThumbprint(publicKey);
  const nullifierHash = hmac(
    pepper,
    `nullifier\0${subject.projectDigest}\0${projectKeyThumbprint}`
  );
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hmac(pepper, `intake-token\0${token}`);
  const acceptedOn = utcDate(now);
  const expiresOn = new Date(Date.UTC(
    acceptedOn.getUTCFullYear() + 1,
    acceptedOn.getUTCMonth(),
    acceptedOn.getUTCDate()
  ));

  try {
    await db.transaction(async (transaction) => {
      const [deleted] = await transaction.delete(verifierChallenges)
        .where(eq(verifierChallenges.challengeHash, challengeHash))
        .returning({ challengeHash: verifierChallenges.challengeHash });
      if (!deleted) throw new InvalidResearchPresentationError("challenge_replayed");
      await transaction.insert(submissionNullifiers).values({
        projectDigest: subject.projectDigest,
        nullifierHash,
        acceptedOn,
        expiresOn,
      });
      await transaction.insert(intakeTokens).values({
        tokenHash,
        projectDigest: subject.projectDigest,
        expiresAt: new Date(now.getTime() + INTAKE_TOKEN_LIFETIME_MS),
      });
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw new DuplicateResearchSubmissionError();
    throw error;
  }
  return { intakeToken: token, expiresAt: new Date(now.getTime() + INTAKE_TOKEN_LIFETIME_MS) };
}

export async function submitAnonymousResearchContribution(
  db: ResearchVerifierDatabase,
  input: ResearchContributionInput & { intakeToken: string; projectDigest: string },
  pepper: string,
  now = new Date()
) {
  if (!pepper) throw new ResearchVerifierConfigurationError();
  if (containsGenericDirectIdentifier(input.contribution)) {
    throw new DirectIdentifierDetectedError();
  }
  const tokenHash = hmac(pepper, `intake-token\0${input.intakeToken}`);

  return db.transaction(async (transaction) => {
    const [token] = await transaction.delete(intakeTokens).where(and(
      eq(intakeTokens.tokenHash, tokenHash),
      eq(intakeTokens.projectDigest, input.projectDigest),
      gt(intakeTokens.expiresAt, now)
    )).returning();
    if (!token) throw new InvalidOrReplayedIntakeTokenError();
    const protocol = await loadProtocol(transaction, token.projectDigest);
    validateResearchContribution(protocol, input);
    const contribution = {
      id: crypto.randomUUID(),
      projectDigest: token.projectDigest,
      protocolVersion: protocol.version,
      background: input.background,
      contribution: input.contribution.trim(),
      submittedOn: utcDate(now),
    };
    await transaction.insert(anonymousResearchContributions).values(contribution);
    return contribution;
  });
}

export async function listCohortSafeContributions(
  db: ResearchVerifierDatabase,
  projectDigest: string
) {
  const protocol = await loadProtocol(db, projectDigest);
  const rows = await db.select().from(anonymousResearchContributions)
    .where(eq(anonymousResearchContributions.projectDigest, projectDigest));
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = canonicalBackground(row.background);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return rows.filter((row) =>
    (counts.get(canonicalBackground(row.background)) ?? 0) >= protocol.minimumCohortSize
  );
}

type ResearchVerifierQuery = Pick<ResearchVerifierDatabase, "select">;

async function loadProtocol(db: ResearchVerifierQuery, projectDigest: string) {
  const [record] = await db.select().from(researchProtocols)
    .where(eq(researchProtocols.projectDigest, projectDigest)).limit(1);
  if (!record) throw new ResearchProtocolNotFoundError();
  return {
    version: record.protocolVersion,
    projectDigest: record.projectDigest,
    status: record.status,
    minimumCohortSize: record.minimumCohortSize,
    backgroundCharacteristics: record.backgroundCharacteristics,
    contributionMaxLength: record.contributionMaxLength,
    retentionRule: record.retentionRule,
  } satisfies ApprovedResearchProtocol;
}

function parseProjectPublicKey(value: string): JsonWebKey {
  try {
    const parsed = JSON.parse(value) as JsonWebKey;
    if (parsed.kty !== "EC" || parsed.crv !== "P-256" || !parsed.x || !parsed.y || parsed.d) {
      throw new Error();
    }
    return parsed;
  } catch {
    throw new InvalidResearchPresentationError("project_key_invalid");
  }
}

function canonicalBackground(value: Record<string, string>) {
  return JSON.stringify(Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right))
  ));
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(pepper: string, value: string) {
  return createHmac("sha256", pepper).update(value).digest("hex");
}

function utcDate(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  if ("code" in error && (error as { code?: string }).code === "23505") return true;
  return "cause" in error && isUniqueViolation((error as { cause?: unknown }).cause);
}

export class ResearchVerifierConfigurationError extends Error {}
export class ResearchProtocolNotFoundError extends Error {}
export class InvalidResearchPresentationError extends Error {}
export class DuplicateResearchSubmissionError extends Error {}
export class InvalidOrReplayedIntakeTokenError extends Error {}
export class DirectIdentifierDetectedError extends Error {}
