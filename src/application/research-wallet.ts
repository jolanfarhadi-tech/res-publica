import { and, eq, gt, isNull } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import { requireAuthorization } from "../auth/authorize";
import type { AuthenticatedActor } from "../auth/types";
import { createId } from "../domain/shared";
import type { Database } from "../persistence";
import { auditLog } from "../persistence/schema";
import {
  members,
  researchWalletActivationRecords,
  researchWalletDeviceBindings,
  researchWalletRecoveryEvents,
  researchWalletRecoveryChallenges,
  researchWallets,
} from "../persistence/module-schema";
import {
  digestPresentation,
  jwkThumbprint,
  verifyProjectChallengeSignature,
  type ProjectChallenge,
} from "../domain/research-wallet/local-wallet";

export const RESEARCH_WALLET_ACTIVATION_VERSION = "research-wallet-activation-v1";

export type ResearchWalletFeatureGate = { enabled: boolean };

export type ResearchWalletActivationInput = {
  walletId: string;
  holderKeyThumbprint: string;
  holderPublicKey: JsonWebKey;
  recoveryPublicKey: JsonWebKey;
  activationConsent: { accepted: boolean; version: string };
};

export async function activateResearchWallet(
  db: Database,
  actor: AuthenticatedActor | null,
  input: ResearchWalletActivationInput,
  gate: ResearchWalletFeatureGate,
  now = new Date()
) {
  if (!gate.enabled) throw new ResearchWalletFeatureDisabledError();
  requireAuthorization(actor, {
    domain: "civic",
    capability: "research.wallet.activate",
    target: input.walletId,
    requireExactTarget: true,
  });
  if (!input.activationConsent.accepted ||
    input.activationConsent.version !== RESEARCH_WALLET_ACTIVATION_VERSION ||
    !/^[A-Za-z0-9_-]{43}$/.test(input.holderKeyThumbprint)) {
    throw new InvalidWalletActivationConsentError();
  }
  const calculatedThumbprint = await jwkThumbprint(input.holderPublicKey);
  if (calculatedThumbprint !== input.holderKeyThumbprint) {
    throw new InvalidWalletActivationConsentError();
  }
  assertPublicRecoveryKey(input.recoveryPublicKey);

  const [wallet] = await db.select().from(researchWallets)
    .where(eq(researchWallets.id, input.walletId)).limit(1);
  if (!wallet || wallet.personId !== actor.personId) {
    throw new ResearchWalletNotFoundError();
  }
  const [member] = await db.select({ status: members.status }).from(members)
    .where(eq(members.personId, actor.personId)).limit(1);
  if (!member || !["verified", "active"].includes(member.status)) {
    throw new VerifiedMembershipRequiredForWalletError();
  }
  if (wallet.status !== "offered") throw new ResearchWalletNotOfferedError();

  return db.transaction(async (transaction) => {
    const [activated] = await transaction.update(researchWallets).set({
      status: "active",
      activatedAt: now,
      recoveryPublicKey: input.recoveryPublicKey,
    }).where(and(
      eq(researchWallets.id, input.walletId),
      eq(researchWallets.status, "offered")
    )).returning();
    if (!activated) throw new ResearchWalletNotOfferedError();
    await transaction.insert(researchWalletDeviceBindings).values({
      id: createId(),
      walletId: input.walletId,
      holderKeyThumbprint: input.holderKeyThumbprint,
      holderPublicKey: input.holderPublicKey,
      boundAt: now,
      revokedAt: null,
    });
    await transaction.insert(researchWalletActivationRecords).values({
      id: createId(),
      walletId: input.walletId,
      personId: actor.personId,
      consentVersion: input.activationConsent.version,
      grantedAt: now,
      withdrawnAt: null,
    });
    await transaction.insert(auditLog).values({
      id: createId(),
      actorPersonId: actor.personId,
      action: "research.wallet.activated",
      target: input.walletId,
      timestamp: now,
      pseudonymized: false,
    });
    return activated;
  });
}

export async function createResearchWalletRecoveryChallenge(
  db: Database,
  actor: AuthenticatedActor | null,
  input: { walletId: string; audience: string },
  gate: ResearchWalletFeatureGate,
  now = new Date()
) {
  if (!gate.enabled) throw new ResearchWalletFeatureDisabledError();
  requireAuthorization(actor, {
    domain: "civic", capability: "research.wallet.recover",
    target: input.walletId, requireExactTarget: true, minimumAssurance: "mfa",
  });
  const [wallet] = await db.select().from(researchWallets).where(and(
    eq(researchWallets.id, input.walletId),
    eq(researchWallets.personId, actor.personId),
    eq(researchWallets.status, "active")
  )).limit(1);
  if (!wallet?.recoveryPublicKey) throw new ResearchWalletNotFoundError();
  const challenge = randomBytes(32).toString("base64url");
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
  await db.insert(researchWalletRecoveryChallenges).values({
    challengeHash: sha256(challenge), walletId: input.walletId,
    audienceHash: sha256(input.audience), expiresAt,
  });
  return {
    challenge,
    audience: input.audience,
    projectDigest: sha256(input.walletId),
    presentationDigest: await digestPresentation(wallet.recoveryPublicKey),
    expiresAt,
  };
}

export async function rotateResearchWalletDevice(
  db: Database,
  actor: AuthenticatedActor | null,
  input: {
    walletId: string;
    previousDeviceBindingId: string;
    newHolderPublicKey: JsonWebKey;
    recoveryChallenge: ProjectChallenge;
    recoverySignature: string;
  },
  gate: ResearchWalletFeatureGate,
  now = new Date()
) {
  if (!gate.enabled) throw new ResearchWalletFeatureDisabledError();
  requireAuthorization(actor, {
    domain: "civic",
    capability: "research.wallet.recover",
    target: input.walletId,
    requireExactTarget: true,
    minimumAssurance: "mfa",
  });
  const [wallet] = await db.select().from(researchWallets)
    .where(eq(researchWallets.id, input.walletId)).limit(1);
  if (!wallet || wallet.personId !== actor.personId || wallet.status !== "active" ||
    !wallet.recoveryPublicKey) {
    throw new ResearchWalletNotFoundError();
  }
  const [recoveryChallenge] = await db.select().from(researchWalletRecoveryChallenges).where(and(
    eq(researchWalletRecoveryChallenges.challengeHash, sha256(input.recoveryChallenge.challenge)),
    eq(researchWalletRecoveryChallenges.walletId, input.walletId),
    eq(researchWalletRecoveryChallenges.audienceHash, sha256(input.recoveryChallenge.audience)),
    gt(researchWalletRecoveryChallenges.expiresAt, now)
  )).limit(1);
  if (!recoveryChallenge ||
    input.recoveryChallenge.projectDigest !== sha256(input.walletId) ||
    input.recoveryChallenge.presentationDigest !== await digestPresentation(wallet.recoveryPublicKey) ||
    input.recoveryChallenge.expiresAt !== recoveryChallenge.expiresAt.toISOString() ||
    !await verifyProjectChallengeSignature(
      wallet.recoveryPublicKey, input.recoveryChallenge, input.recoverySignature
    )) throw new InvalidWalletRecoveryRequestError();
  const [previous] = await db.select().from(researchWalletDeviceBindings).where(and(
    eq(researchWalletDeviceBindings.id, input.previousDeviceBindingId),
    eq(researchWalletDeviceBindings.walletId, input.walletId)
  )).limit(1);
  if (!previous || previous.revokedAt) throw new ResearchWalletDeviceNotActiveError();
  const thumbprint = await jwkThumbprint(input.newHolderPublicKey);

  return db.transaction(async (transaction) => {
    const [consumed] = await transaction.delete(researchWalletRecoveryChallenges).where(
      eq(researchWalletRecoveryChallenges.challengeHash, sha256(input.recoveryChallenge.challenge))
    ).returning({ challengeHash: researchWalletRecoveryChallenges.challengeHash });
    if (!consumed) throw new InvalidWalletRecoveryRequestError();
    const [revoked] = await transaction.update(researchWalletDeviceBindings)
      .set({ revokedAt: now }).where(and(
        eq(researchWalletDeviceBindings.id, previous.id),
        eq(researchWalletDeviceBindings.walletId, input.walletId)
      )).returning();
    if (!revoked || revoked.revokedAt?.getTime() !== now.getTime()) {
      throw new ResearchWalletDeviceNotActiveError();
    }
    const newBindingId = createId();
    await transaction.insert(researchWalletDeviceBindings).values({
      id: newBindingId,
      walletId: input.walletId,
      holderKeyThumbprint: thumbprint,
      holderPublicKey: input.newHolderPublicKey,
      boundAt: now,
      revokedAt: null,
    });
    const eventId = createId();
    await transaction.insert(researchWalletRecoveryEvents).values({
      id: eventId,
      walletId: input.walletId,
      eventType: "device-rotated",
      previousDeviceBindingId: previous.id,
      newDeviceBindingId: newBindingId,
      performedByPersonId: actor.personId,
      occurredAt: now,
    });
    await transaction.insert(auditLog).values({
      id: createId(),
      actorPersonId: actor.personId,
      action: "research.wallet.device-rotated",
      target: input.walletId,
      timestamp: now,
      pseudonymized: false,
    });
    return { newDeviceBindingId: newBindingId, holderKeyThumbprint: thumbprint };
  });
}

export async function revokeResearchWallet(
  db: Database,
  actor: AuthenticatedActor | null,
  walletId: string,
  gate: ResearchWalletFeatureGate,
  now = new Date()
) {
  if (!gate.enabled) throw new ResearchWalletFeatureDisabledError();
  requireAuthorization(actor, {
    domain: "civic",
    capability: "research.wallet.recover",
    target: walletId,
    requireExactTarget: true,
    minimumAssurance: "mfa",
  });
  const [wallet] = await db.select().from(researchWallets)
    .where(eq(researchWallets.id, walletId)).limit(1);
  if (!wallet || wallet.personId !== actor.personId || wallet.status === "revoked") {
    throw new ResearchWalletNotFoundError();
  }
  return db.transaction(async (transaction) => {
    await transaction.update(researchWallets).set({
      status: "revoked", revokedAt: now,
    }).where(eq(researchWallets.id, walletId));
    await transaction.update(researchWalletDeviceBindings).set({ revokedAt: now })
      .where(and(
        eq(researchWalletDeviceBindings.walletId, walletId),
        isNull(researchWalletDeviceBindings.revokedAt)
      ));
    await transaction.insert(researchWalletRecoveryEvents).values({
      id: createId(), walletId, eventType: "wallet-revoked",
      previousDeviceBindingId: null, newDeviceBindingId: null,
      performedByPersonId: actor.personId, occurredAt: now,
    });
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: "research.wallet.revoked", target: walletId,
      timestamp: now, pseudonymized: false,
    });
  });
}

export class ResearchWalletFeatureDisabledError extends Error {}
export class InvalidWalletActivationConsentError extends Error {}
export class ResearchWalletNotFoundError extends Error {}
export class VerifiedMembershipRequiredForWalletError extends Error {}
export class ResearchWalletNotOfferedError extends Error {}
export class InvalidWalletRecoveryRequestError extends Error {}
export class ResearchWalletDeviceNotActiveError extends Error {}

function assertPublicRecoveryKey(key: JsonWebKey) {
  if (key.kty !== "EC" || key.crv !== "P-256" || !key.x || !key.y || key.d) {
    throw new InvalidWalletActivationConsentError();
  }
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
