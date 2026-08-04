import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterEach, describe, expect, it } from "vitest";
import type { AuthenticatedActor } from "../auth/types";
import {
  generateBbsIssuerKey,
  deriveResearchEligibilityPresentation,
  verifyResearchEligibilityPresentation,
} from "../domain/research-wallet/bbs-credential";
import {
  generateLocalDeviceMaterial,
  generateProjectKeyMaterial,
  signProjectChallenge,
} from "../domain/research-wallet/local-wallet";
import type { Database } from "../persistence";
import * as coreSchema from "../persistence/schema";
import * as moduleSchema from "../persistence/module-schema";
import { auditLog, people } from "../persistence/schema";
import {
  members,
  projectEligibilityRecords,
  projectResearchConsents,
  researchCredentialIssuanceChallenges,
  researchWalletDeviceBindings,
  researchWallets,
} from "../persistence/module-schema";
import {
  createCredentialIssuanceChallenge,
  InvalidCredentialIssuanceChallengeError,
  issueProjectResearchCredential,
  ResearchRealDataGateClosedError,
} from "./research-credential-issuer";

const directories: string[] = [];
const now = new Date("2026-08-04T12:07:30.000Z");

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true })
  ));
});

async function database() {
  const directory = await mkdtemp(join(tmpdir(), "res-publica-credential-issuer-"));
  directories.push(directory);
  const client = new PGlite(directory);
  const db = drizzle({ client, schema: { ...coreSchema, ...moduleSchema } });
  await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
  return { client, db: db as unknown as Database };
}

function actor(): AuthenticatedActor {
  return {
    personId: "person-holder",
    sessionId: "session-holder",
    assurance: "verified",
    authenticatedAt: now,
    grants: [{
      id: "grant-issue",
      personId: "person-holder",
      domain: "civic",
      capability: "research.wallet.credential.issue",
      target: "wallet-holder",
      assuranceRequired: "verified",
      validFrom: new Date("2026-08-01T00:00:00.000Z"),
      validUntil: null,
      revokedAt: null,
    }],
  };
}

async function seed(db: Database) {
  const device = await generateLocalDeviceMaterial();
  await db.insert(people).values({
    id: "person-holder", name: "Synthetic Holder",
    contact: { email: "synthetic-holder@example.invalid" },
    locale: "en", rtlPreference: false, createdAt: now,
  });
  await db.insert(members).values({
    id: "member-holder", personId: "person-holder", tier: "research",
    status: "verified", createdAt: now,
  });
  await db.insert(researchWallets).values({
    id: "wallet-holder", personId: "person-holder", status: "active",
    protocolProfile: "w3c-vc-bbs-2023-v1", createdAt: now,
    activatedAt: now, suspendedAt: null, revokedAt: null,
  });
  await db.insert(researchWalletDeviceBindings).values({
    id: "device-holder", walletId: "wallet-holder",
    holderKeyThumbprint: device.thumbprint, holderPublicKey: device.publicKey,
    boundAt: now, revokedAt: null,
  });
  await db.insert(projectResearchConsents).values({
    id: "consent-project", personId: "person-holder", projectRef: "project-alpha",
    purposeVersion: "purpose-v1", purpose: "Synthetic eligibility testing",
    dataCategories: ["age-group"], pseudonymization: "project-scoped BBS proof",
    recipients: ["isolated verifier"], retentionRule: "delete-after-test",
    status: "granted", grantedAt: now, withdrawnAt: null,
  });
  await db.insert(projectEligibilityRecords).values({
    id: "eligibility-project", personId: "person-holder", projectRef: "project-alpha",
    status: "eligible", basis: "project-specific-consent",
    projectConsentId: "consent-project", reasonCode: "synthetic-test",
    assessedAt: now, assessedByPersonId: "person-holder",
  });
  return device;
}

describe("research credential issuer boundary", () => {
  it("issues a project-scoped selective-disclosure credential after holder proof", async () => {
    const { client, db } = await database();
    try {
      const device = await seed(db);
      const projectKey = await generateProjectKeyMaterial();
      const issuer = await generateBbsIssuerKey();
      const issued = await createCredentialIssuanceChallenge(db, actor(), {
        walletId: "wallet-holder", projectRef: "project-alpha",
        projectPublicKey: projectKey.publicKey,
        audience: "https://verifier.example.invalid/present",
      }, { enabled: true }, now);
      const challenge = {
        ...issued,
        expiresAt: issued.expiresAt.toISOString(),
      };
      const credential = await issueProjectResearchCredential(db, actor(), {
        walletId: "wallet-holder", challenge,
        deviceSignature: await signProjectChallenge(device.privateKey, challenge),
      }, issuer, { enabled: true }, now);
      const presentation = await deriveResearchEligibilityPresentation(credential, issuer.publicKey);

      await expect(verifyResearchEligibilityPresentation(presentation, issuer.publicKey, now))
        .resolves.toMatchObject({ verified: true });
      expect(JSON.stringify(presentation)).not.toMatch(
        /Synthetic Holder|synthetic-holder|person-holder|member-holder|wallet-holder|project-alpha|consent-project/
      );
      expect(await db.select().from(researchCredentialIssuanceChallenges)).toHaveLength(0);
      expect((await db.select().from(auditLog)).map((row) => row.action)).toEqual([
        "research.wallet.project-credential-issued",
      ]);
    } finally {
      await client.close();
    }
  }, 30_000);

  it("rejects a closed gate and audience replay without persistence or audit mutation", async () => {
    const { client, db } = await database();
    try {
      const device = await seed(db);
      const projectKey = await generateProjectKeyMaterial();
      const issuer = await generateBbsIssuerKey();
      await expect(createCredentialIssuanceChallenge(db, actor(), {
        walletId: "wallet-holder", projectRef: "project-alpha",
        projectPublicKey: projectKey.publicKey, audience: "https://verifier.example.invalid/present",
      }, { enabled: false }, now)).rejects.toBeInstanceOf(ResearchRealDataGateClosedError);
      expect(await db.select().from(researchCredentialIssuanceChallenges)).toHaveLength(0);

      const issued = await createCredentialIssuanceChallenge(db, actor(), {
        walletId: "wallet-holder", projectRef: "project-alpha",
        projectPublicKey: projectKey.publicKey, audience: "https://verifier.example.invalid/present",
      }, { enabled: true }, now);
      const tampered = {
        ...issued,
        audience: "https://attacker.example.invalid/present",
        expiresAt: issued.expiresAt.toISOString(),
      };
      await expect(issueProjectResearchCredential(db, actor(), {
        walletId: "wallet-holder", challenge: tampered,
        deviceSignature: await signProjectChallenge(device.privateKey, tampered),
      }, issuer, { enabled: true }, now)).rejects.toBeInstanceOf(
        InvalidCredentialIssuanceChallengeError
      );
      expect(await db.select().from(researchCredentialIssuanceChallenges)).toHaveLength(1);
      expect(await db.select().from(auditLog)).toHaveLength(0);
    } finally {
      await client.close();
    }
  }, 30_000);
});
