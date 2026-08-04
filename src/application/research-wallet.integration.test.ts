import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterEach, describe, expect, it } from "vitest";
import type { AuthenticatedActor, AuthorizationGrant } from "../auth/types";
import type { Database } from "../persistence";
import * as coreSchema from "../persistence/schema";
import * as moduleSchema from "../persistence/module-schema";
import { auditLog, people } from "../persistence/schema";
import {
  members,
  researchWalletActivationRecords,
  researchWalletDeviceBindings,
  researchWalletRecoveryEvents,
  researchWallets,
} from "../persistence/module-schema";
import {
  activateResearchWallet,
  createResearchWalletRecoveryChallenge,
  InvalidWalletActivationConsentError,
  ResearchWalletDeviceNotActiveError,
  ResearchWalletFeatureDisabledError,
  revokeResearchWallet,
  rotateResearchWalletDevice,
  VerifiedMembershipRequiredForWalletError,
} from "./research-wallet";
import { generateLocalDeviceMaterial, signProjectChallenge } from "../domain/research-wallet/local-wallet";

const schema = { ...coreSchema, ...moduleSchema };
const directories: string[] = [];

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true })
  ));
});

async function database() {
  const directory = await mkdtemp(join(tmpdir(), "res-publica-research-wallet-"));
  directories.push(directory);
  const client = new PGlite(directory);
  const db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
  return { client, db: db as unknown as Database };
}

function grant(personId: string, walletId: string): AuthorizationGrant {
  return {
    id: "grant-wallet",
    personId,
    domain: "civic",
    capability: "research.wallet.activate",
    target: walletId,
    assuranceRequired: "verified",
    validFrom: new Date("2026-08-01T00:00:00.000Z"),
    validUntil: null,
    revokedAt: null,
  };
}

function actor(personId: string, walletId: string): AuthenticatedActor {
  return {
    personId,
    sessionId: `session-${personId}`,
    assurance: "verified",
    authenticatedAt: new Date("2026-08-04T10:00:00.000Z"),
    grants: [grant(personId, walletId)],
  };
}

function recoveryActor(personId: string, walletId: string): AuthenticatedActor {
  return {
    personId,
    sessionId: `session-${personId}`,
    assurance: "mfa",
    authenticatedAt: new Date("2026-08-04T10:00:00.000Z"),
    grants: [{
      ...grant(personId, walletId),
      id: "grant-recovery",
      capability: "research.wallet.recover",
      assuranceRequired: "mfa",
    }],
  };
}

async function seedWallet(db: Database, status: "registered" | "verified") {
  await db.insert(people).values({
    id: "person-wallet",
    name: "Wallet Holder",
    contact: { email: "wallet@example.org" },
    locale: "de",
    rtlPreference: false,
    createdAt: new Date(),
  });
  await db.insert(members).values({
    id: "member-wallet",
    personId: "person-wallet",
    tier: "research",
    status,
    createdAt: new Date(),
  });
  await db.insert(researchWallets).values({
    id: "wallet-1",
    personId: "person-wallet",
    status: "offered",
    protocolProfile: "w3c-vc-bbs-2023-v1",
    createdAt: new Date(),
    activatedAt: null,
    suspendedAt: null,
    revokedAt: null,
  });
}

describe("pseudonymous research wallet activation boundary", () => {
  it("is fail-closed while the production activation gate is disabled", async () => {
    const { client, db } = await database();
    try {
      await seedWallet(db, "verified");
      const device = await generateLocalDeviceMaterial();
      await expect(activateResearchWallet(
        db,
        actor("person-wallet", "wallet-1"),
        {
          walletId: "wallet-1",
          holderKeyThumbprint: device.thumbprint,
          holderPublicKey: device.publicKey,
          recoveryPublicKey: device.publicKey,
          activationConsent: { accepted: true, version: "research-wallet-activation-v1" },
        },
        { enabled: false }
      )).rejects.toBeInstanceOf(ResearchWalletFeatureDisabledError);
      expect((await db.select().from(researchWallets))[0].status).toBe("offered");
      expect(await db.select().from(researchWalletDeviceBindings)).toHaveLength(0);
      expect(await db.select().from(auditLog)).toHaveLength(0);
    } finally {
      await client.close();
    }
  }, 30_000);

  it("requires verified membership and explicit versioned opt-in", async () => {
    const { client, db } = await database();
    try {
      await seedWallet(db, "registered");
      const device = await generateLocalDeviceMaterial();
      const walletActor = actor("person-wallet", "wallet-1");
      await expect(activateResearchWallet(
        db,
        walletActor,
        {
          walletId: "wallet-1",
          holderKeyThumbprint: device.thumbprint,
          holderPublicKey: device.publicKey,
          recoveryPublicKey: device.publicKey,
          activationConsent: { accepted: true, version: "research-wallet-activation-v1" },
        },
        { enabled: true }
      )).rejects.toBeInstanceOf(VerifiedMembershipRequiredForWalletError);
      await db.update(members).set({ status: "verified" });
      await expect(activateResearchWallet(
        db,
        walletActor,
        {
          walletId: "wallet-1",
          holderKeyThumbprint: device.thumbprint,
          holderPublicKey: device.publicKey,
          recoveryPublicKey: device.publicKey,
          activationConsent: { accepted: false, version: "research-wallet-activation-v1" },
        },
        { enabled: true }
      )).rejects.toBeInstanceOf(InvalidWalletActivationConsentError);
      expect(await db.select().from(researchWalletActivationRecords)).toHaveLength(0);
      expect(await db.select().from(auditLog)).toHaveLength(0);
    } finally {
      await client.close();
    }
  }, 30_000);

  it("persists only public metadata and consent evidence when explicitly enabled", async () => {
    const { client, db } = await database();
    try {
      await seedWallet(db, "verified");
      const device = await generateLocalDeviceMaterial();
      const activatedAt = new Date("2026-08-04T12:00:00.000Z");
      const result = await activateResearchWallet(
        db,
        actor("person-wallet", "wallet-1"),
        {
          walletId: "wallet-1",
          holderKeyThumbprint: device.thumbprint,
          holderPublicKey: device.publicKey,
          recoveryPublicKey: device.publicKey,
          activationConsent: { accepted: true, version: "research-wallet-activation-v1" },
        },
        { enabled: true },
        activatedAt
      );

      expect(result.status).toBe("active");
      expect(await db.select().from(researchWalletDeviceBindings)).toEqual([
        expect.objectContaining({
          walletId: "wallet-1",
          holderKeyThumbprint: device.thumbprint,
          boundAt: activatedAt,
          revokedAt: null,
        }),
      ]);
      expect(await db.select().from(researchWalletActivationRecords)).toEqual([
        expect.objectContaining({
          walletId: "wallet-1",
          consentVersion: "research-wallet-activation-v1",
          grantedAt: activatedAt,
          withdrawnAt: null,
        }),
      ]);
      const serialized = JSON.stringify({
        wallet: await db.select().from(researchWallets),
        devices: await db.select().from(researchWalletDeviceBindings),
      });
      expect(serialized).not.toMatch(/private.?key|recovery.?secret/i);
      expect((await db.select().from(auditLog)).map((row) => row.action)).toEqual([
        "research.wallet.activated",
      ]);
    } finally {
      await client.close();
    }
  }, 30_000);

  it("rotates a recovered device and revokes the previous binding atomically", async () => {
    const { client, db } = await database();
    try {
      await seedWallet(db, "verified");
      const first = await generateLocalDeviceMaterial();
      await activateResearchWallet(db, actor("person-wallet", "wallet-1"), {
        walletId: "wallet-1", holderKeyThumbprint: first.thumbprint,
        holderPublicKey: first.publicKey,
        recoveryPublicKey: first.publicKey,
        activationConsent: { accepted: true, version: "research-wallet-activation-v1" },
      }, { enabled: true });
      const [previous] = await db.select().from(researchWalletDeviceBindings);
      const replacement = await generateLocalDeviceMaterial();
      const issuedRecovery = await createResearchWalletRecoveryChallenge(
        db, recoveryActor("person-wallet", "wallet-1"),
        { walletId: "wallet-1", audience: "https://respublica-ev.de/api/research/wallet/recover" },
        { enabled: true }
      );
      const recoveryChallenge = { ...issuedRecovery, expiresAt: issuedRecovery.expiresAt.toISOString() };
      const rotated = await rotateResearchWalletDevice(
        db,
        recoveryActor("person-wallet", "wallet-1"),
        {
          walletId: "wallet-1", previousDeviceBindingId: previous.id,
          newHolderPublicKey: replacement.publicKey,
          recoveryChallenge,
          recoverySignature: await signProjectChallenge(first.privateKey, recoveryChallenge),
        },
        { enabled: true },
        new Date("2026-08-04T13:00:00.000Z")
      );

      const bindings = await db.select().from(researchWalletDeviceBindings);
      expect(bindings).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: previous.id, revokedAt: expect.any(Date) }),
        expect.objectContaining({
          id: rotated.newDeviceBindingId,
          holderKeyThumbprint: replacement.thumbprint,
          revokedAt: null,
        }),
      ]));
      expect(await db.select().from(researchWalletRecoveryEvents)).toEqual([
        expect.objectContaining({
          eventType: "device-rotated",
          previousDeviceBindingId: previous.id,
          newDeviceBindingId: rotated.newDeviceBindingId,
        }),
      ]);
    } finally {
      await client.close();
    }
  }, 30_000);

  it("requires MFA recovery authority and revokes the wallet and devices together", async () => {
    const { client, db } = await database();
    try {
      await seedWallet(db, "verified");
      const first = await generateLocalDeviceMaterial();
      await activateResearchWallet(db, actor("person-wallet", "wallet-1"), {
        walletId: "wallet-1", holderKeyThumbprint: first.thumbprint,
        holderPublicKey: first.publicKey,
        recoveryPublicKey: first.publicKey,
        activationConsent: { accepted: true, version: "research-wallet-activation-v1" },
      }, { enabled: true });
      const [binding] = await db.select().from(researchWalletDeviceBindings);
      const issuedRecovery = await createResearchWalletRecoveryChallenge(
        db, recoveryActor("person-wallet", "wallet-1"),
        { walletId: "wallet-1", audience: "https://respublica-ev.de/api/research/wallet/recover" },
        { enabled: true }
      );
      const recoveryChallenge = { ...issuedRecovery, expiresAt: issuedRecovery.expiresAt.toISOString() };
      await expect(rotateResearchWalletDevice(db, recoveryActor("person-wallet", "wallet-1"), {
        walletId: "wallet-1", previousDeviceBindingId: "missing-binding",
        newHolderPublicKey: (await generateLocalDeviceMaterial()).publicKey,
        recoveryChallenge,
        recoverySignature: await signProjectChallenge(first.privateKey, recoveryChallenge),
      }, { enabled: true })).rejects.toBeInstanceOf(ResearchWalletDeviceNotActiveError);

      await revokeResearchWallet(
        db, recoveryActor("person-wallet", "wallet-1"), "wallet-1", { enabled: true },
        new Date("2026-08-04T14:00:00.000Z")
      );
      expect((await db.select().from(researchWallets))[0].status).toBe("revoked");
      expect((await db.select().from(researchWalletDeviceBindings))[0]).toMatchObject({
        id: binding.id, revokedAt: expect.any(Date),
      });
      expect((await db.select().from(researchWalletRecoveryEvents)).at(-1)).toMatchObject({
        eventType: "wallet-revoked",
      });
    } finally {
      await client.close();
    }
  }, 30_000);
});
