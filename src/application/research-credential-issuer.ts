import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { requireAuthorization } from "../auth/authorize";
import type { AuthenticatedActor } from "../auth/types";
import { createId } from "../domain/shared";
import {
  digestPresentation,
  verifyProjectChallengeSignature,
  type ProjectChallenge,
} from "../domain/research-wallet/local-wallet";
import {
  issueResearchEligibilityCredential,
  type BbsIssuerKey,
} from "../domain/research-wallet/bbs-credential";
import type { Database } from "../persistence";
import {
  assertPrivilegedActionContext,
  type PrivilegedActionContext,
} from "../platform/privileged-access";
import { auditLog } from "../persistence/schema";
import {
  members,
  projectEligibilityRecords,
  projectResearchConsents,
  researchCredentialIssuanceChallenges,
  researchWalletDeviceBindings,
  researchWallets,
} from "../persistence/module-schema";
import type { ResearchRealDataGate } from "./research-real-data-gate";

const ISSUER_CHALLENGE_LIFETIME_MS = 5 * 60 * 1000;
const PROJECT_CREDENTIAL_LIFETIME_MS = 15 * 60 * 1000;

export async function createCredentialIssuanceChallenge(
  db: Database,
  actor: AuthenticatedActor | null,
  input: {
    walletId: string;
    projectRef: string;
    projectPublicKey: JsonWebKey;
    audience: string;
  },
  gate: ResearchRealDataGate,
  now = new Date()
) {
  if (!gate.enabled) throw new ResearchRealDataGateClosedError();
  requireAuthorization(actor, {
    domain: "civic",
    capability: "research.wallet.credential.issue",
    target: input.walletId,
    requireExactTarget: true,
    minimumAssurance: "recent-mfa",
    now,
  });
  assertPublicProjectKey(input.projectPublicKey);
  const [wallet] = await db.select().from(researchWallets).where(and(
    eq(researchWallets.id, input.walletId),
    eq(researchWallets.personId, actor.personId),
    eq(researchWallets.status, "active")
  )).limit(1);
  if (!wallet) throw new ResearchWalletNotEligibleForIssuanceError();
  const [member] = await db.select({ status: members.status }).from(members)
    .where(eq(members.personId, actor.personId)).limit(1);
  if (!member || !["verified", "active"].includes(member.status)) {
    throw new ResearchWalletNotEligibleForIssuanceError();
  }
  const [device] = await db.select().from(researchWalletDeviceBindings).where(and(
    eq(researchWalletDeviceBindings.walletId, input.walletId),
    isNull(researchWalletDeviceBindings.revokedAt)
  )).limit(1);
  if (!device) throw new ResearchWalletDeviceUnavailableError();

  const [eligibility] = await db.select().from(projectEligibilityRecords).where(and(
    eq(projectEligibilityRecords.personId, actor.personId),
    eq(projectEligibilityRecords.projectRef, input.projectRef),
    eq(projectEligibilityRecords.status, "eligible")
  )).limit(1);
  if (!eligibility) throw new ResearchProjectEligibilityRequiredError();
  const consentDigest = await resolveConsentDigest(db, actor.personId, input.projectRef, eligibility);
  const projectDigest = sha256(input.projectRef);
  const challenge = randomBytes(32).toString("base64url");
  const expiresAt = new Date(now.getTime() + ISSUER_CHALLENGE_LIFETIME_MS);

  await db.insert(researchCredentialIssuanceChallenges).values({
    challengeHash: sha256(challenge),
    walletId: input.walletId,
    deviceBindingId: device.id,
    projectRef: input.projectRef,
    projectDigest,
    audienceHash: sha256(input.audience),
    projectPublicKey: input.projectPublicKey,
    consentDigest,
    expiresAt,
  });
  return {
    challenge,
    audience: input.audience,
    projectDigest,
    presentationDigest: await digestPresentation(input.projectPublicKey),
    expiresAt,
  };
}

export async function issueProjectResearchCredential(
  db: Database,
  actor: AuthenticatedActor | null,
  input: {
    walletId: string;
    challenge: ProjectChallenge;
    deviceSignature: string;
  },
  issuer: BbsIssuerKey,
  gate: ResearchRealDataGate,
  context: PrivilegedActionContext,
  now = new Date()
) {
  if (!gate.enabled) throw new ResearchRealDataGateClosedError();
  assertPrivilegedActionContext(context, ["credential-issuance"]);
  requireAuthorization(actor, {
    domain: "civic",
    capability: "research.wallet.credential.issue",
    target: input.walletId,
    requireExactTarget: true,
    minimumAssurance: "recent-mfa",
    now,
  });
  const challengeHash = sha256(input.challenge.challenge);
  const [record] = await db.select().from(researchCredentialIssuanceChallenges).where(and(
    eq(researchCredentialIssuanceChallenges.challengeHash, challengeHash),
    eq(researchCredentialIssuanceChallenges.walletId, input.walletId),
    eq(researchCredentialIssuanceChallenges.projectDigest, input.challenge.projectDigest),
    eq(researchCredentialIssuanceChallenges.audienceHash, sha256(input.challenge.audience)),
    gt(researchCredentialIssuanceChallenges.expiresAt, now)
  )).limit(1);
  if (!record || record.expiresAt.toISOString() !== input.challenge.expiresAt ||
    input.challenge.presentationDigest !== await digestPresentation(record.projectPublicKey)) {
    throw new InvalidCredentialIssuanceChallengeError();
  }
  const [device] = await db.select().from(researchWalletDeviceBindings).where(and(
    eq(researchWalletDeviceBindings.id, record.deviceBindingId),
    eq(researchWalletDeviceBindings.walletId, input.walletId),
    isNull(researchWalletDeviceBindings.revokedAt)
  )).limit(1);
  if (!device?.holderPublicKey || !await verifyProjectChallengeSignature(
    device.holderPublicKey,
    input.challenge,
    input.deviceSignature
  )) {
    throw new InvalidCredentialIssuanceChallengeError();
  }

  return db.transaction(async (transaction) => {
    const [consumed] = await transaction.delete(researchCredentialIssuanceChallenges)
      .where(eq(researchCredentialIssuanceChallenges.challengeHash, challengeHash))
      .returning({ challengeHash: researchCredentialIssuanceChallenges.challengeHash });
    if (!consumed) throw new InvalidCredentialIssuanceChallengeError();
    const validFrom = floorToQuarterHour(now);
    const credential = await issueResearchEligibilityCredential(issuer.privateKey, {
      projectDigest: record.projectDigest,
      consentDigest: record.consentDigest,
      projectPublicKey: JSON.stringify(record.projectPublicKey),
      validFrom,
      validUntil: new Date(validFrom.getTime() + PROJECT_CREDENTIAL_LIFETIME_MS),
      issuanceClass: "real-gated",
    });
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: "research.wallet.project-credential-issued",
      target: input.walletId,
      timestamp: now, pseudonymized: false,
      sessionId: actor.sessionId,
      requestId: context.requestId,
      capability: "research.wallet.credential.issue",
      reasonCode: context.reasonCode,
    });
    return credential;
  });
}

export function parseIssuerKeyEnvironment(
  environment: Record<string, string | undefined> = process.env
): BbsIssuerKey | null {
  try {
    const privateKey = JSON.parse(environment.RESEARCH_WALLET_ISSUER_PRIVATE_KEY ?? "") as Record<string, unknown>;
    const publicKey = JSON.parse(environment.RESEARCH_WALLET_ISSUER_PUBLIC_KEY ?? "") as Record<string, unknown>;
    if (!privateKey.secretKeyMultibase || !publicKey.publicKeyMultibase || publicKey.secretKeyMultibase) return null;
    return { privateKey, publicKey };
  } catch {
    return null;
  }
}

export function parseIssuerPublicKeyEnvironment(
  environment: Record<string, string | undefined> = process.env
): Record<string, unknown> | null {
  try {
    const publicKey = JSON.parse(environment.RESEARCH_WALLET_ISSUER_PUBLIC_KEY ?? "") as Record<string, unknown>;
    if (!publicKey.publicKeyMultibase || publicKey.secretKeyMultibase) return null;
    return publicKey;
  } catch {
    return null;
  }
}

async function resolveConsentDigest(
  db: Database,
  personId: string,
  projectRef: string,
  eligibility: typeof projectEligibilityRecords.$inferSelect
) {
  if (eligibility.basis === "project-specific-consent") {
    if (!eligibility.projectConsentId) throw new ResearchProjectConsentRequiredError();
    const [consent] = await db.select().from(projectResearchConsents).where(and(
      eq(projectResearchConsents.id, eligibility.projectConsentId),
      eq(projectResearchConsents.personId, personId),
      eq(projectResearchConsents.projectRef, projectRef),
      eq(projectResearchConsents.status, "granted")
    )).limit(1);
    if (!consent) throw new ResearchProjectConsentRequiredError();
    return sha256(JSON.stringify({
      purposeVersion: consent.purposeVersion,
      purpose: consent.purpose,
      dataCategories: [...consent.dataCategories].sort(),
      recipients: [...consent.recipients].sort(),
      retentionRule: consent.retentionRule,
    }));
  }
  return sha256(JSON.stringify({
    basis: eligibility.basis,
    reasonCode: eligibility.reasonCode,
    projectRef,
  }));
}

function assertPublicProjectKey(key: JsonWebKey) {
  if (key.kty !== "EC" || key.crv !== "P-256" || !key.x || !key.y || key.d) {
    throw new InvalidProjectPublicKeyError();
  }
}

function floorToQuarterHour(value: Date) {
  const interval = 15 * 60 * 1000;
  return new Date(Math.floor(value.getTime() / interval) * interval);
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export class ResearchRealDataGateClosedError extends Error {}
export class ResearchWalletNotEligibleForIssuanceError extends Error {}
export class ResearchWalletDeviceUnavailableError extends Error {}
export class ResearchProjectEligibilityRequiredError extends Error {}
export class ResearchProjectConsentRequiredError extends Error {}
export class InvalidProjectPublicKeyError extends Error {}
export class InvalidCredentialIssuanceChallengeError extends Error {}
