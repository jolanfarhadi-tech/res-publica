import { createHash } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterEach, describe, expect, it } from "vitest";
import type { ResearchVerifierDatabase } from "../persistence/research-verifier-database";
import * as verifierSchema from "../persistence/research-verifier-schema";
import {
  anonymousResearchContributions,
  intakeTokens,
  submissionNullifiers,
  verifierChallenges,
} from "../persistence/research-verifier-schema";
import {
  deriveResearchEligibilityPresentation,
  generateBbsIssuerKey,
  issueResearchEligibilityCredential,
} from "../domain/research-wallet/bbs-credential";
import {
  digestPresentation,
  generateProjectKeyMaterial,
  signProjectChallenge,
} from "../domain/research-wallet/local-wallet";
import {
  createResearchVerifierChallenge,
  DirectIdentifierDetectedError,
  DuplicateResearchSubmissionError,
  listCohortSafeContributions,
  registerResearchProtocol,
  submitAnonymousResearchContribution,
  verifyResearchPresentation,
} from "./research-verifier";

const directories: string[] = [];
const pepper = "synthetic-verifier-pepper-with-at-least-32-bytes";
const projectDigest = createHash("sha256").update("synthetic-project").digest("hex");
const consentDigest = createHash("sha256").update("synthetic-consent").digest("hex");
const audience = "https://respublica-ev.de/api/research/verifier/present";

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true })
  ));
});

async function database() {
  const directory = await mkdtemp(join(tmpdir(), "res-publica-verifier-"));
  directories.push(directory);
  const client = new PGlite(directory);
  const db = drizzle({ client, schema: verifierSchema });
  await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle-research") });
  const verifierDb = db as unknown as ResearchVerifierDatabase;
  await registerResearchProtocol(verifierDb, {
    version: "research-protocol-v1",
    projectDigest,
    status: "synthetic",
    minimumCohortSize: 10,
    backgroundCharacteristics: [{
      key: "ageGroup",
      label: { de: "Altersgruppe", en: "Age group", fa: "گروه سنی" },
      categories: ["30-44", "45-64"],
      required: true,
    }],
    contributionMaxLength: 2_000,
    retentionRule: "synthetic-delete-after-test",
  });
  return { client, db: verifierDb };
}

async function validPresentation(db: ResearchVerifierDatabase, now: Date) {
  const issuer = await generateBbsIssuerKey();
  const projectKey = await generateProjectKeyMaterial();
  const credential = await issueResearchEligibilityCredential(issuer.privateKey, {
    projectDigest,
    consentDigest,
    projectPublicKey: JSON.stringify(projectKey.publicKey),
    validFrom: new Date(now.getTime() - 60_000),
    validUntil: new Date(now.getTime() + 10 * 60_000),
    issuanceClass: "synthetic",
  });
  const presentation = await deriveResearchEligibilityPresentation(credential, issuer.publicKey);
  const issuedChallenge = await createResearchVerifierChallenge(db, { projectDigest, audience }, now);
  const challenge = {
    challenge: issuedChallenge.challenge,
    audience,
    projectDigest,
    presentationDigest: await digestPresentation(presentation),
    expiresAt: issuedChallenge.expiresAt.toISOString(),
  };
  return {
    issuer,
    projectKey,
    presentation,
    challenge,
    holderSignature: await signProjectChallenge(projectKey.privateKey, challenge),
  };
}

describe("isolated anonymous research verifier", () => {
  it("verifies eligibility and consumes an unlinkable one-time intake token", async () => {
    const { client, db } = await database();
    try {
      const now = new Date("2026-08-04T12:00:00.000Z");
      const proof = await validPresentation(db, now);
      const grant = await verifyResearchPresentation(db, {
        presentation: proof.presentation,
        issuerPublicKey: proof.issuer.publicKey,
        challenge: proof.challenge,
        holderSignature: proof.holderSignature,
      }, pepper, now);
      const contribution = await submitAnonymousResearchContribution(db, {
        intakeToken: grant.intakeToken,
        projectDigest,
        background: { ageGroup: "30-44" },
        contribution: "Synthetic account of an institutional procedure.",
      }, pepper, now);

      expect(contribution).not.toHaveProperty("personId");
      expect(contribution).not.toHaveProperty("walletId");
      expect(await db.select().from(verifierChallenges)).toHaveLength(0);
      expect(await db.select().from(intakeTokens)).toHaveLength(0);
      expect(await db.select().from(submissionNullifiers)).toHaveLength(1);
      const stored = await db.select().from(anonymousResearchContributions);
      expect(stored).toHaveLength(1);
      expect(JSON.stringify(stored)).not.toMatch(/member|person|email|auth0|wallet|credential|consent/i);
      expect(await listCohortSafeContributions(db, projectDigest)).toEqual([]);
    } finally {
      await client.close();
    }
  }, 30_000);

  it("rejects duplicate presentation, replay, and direct identifiers", async () => {
    const { client, db } = await database();
    try {
      const now = new Date("2026-08-04T12:00:00.000Z");
      const first = await validPresentation(db, now);
      const grant = await verifyResearchPresentation(db, {
        presentation: first.presentation,
        issuerPublicKey: first.issuer.publicKey,
        challenge: first.challenge,
        holderSignature: first.holderSignature,
      }, pepper, now);
      await expect(submitAnonymousResearchContribution(db, {
        intakeToken: grant.intakeToken,
        projectDigest,
        background: { ageGroup: "30-44" },
        contribution: "Contact me at synthetic@example.org",
      }, pepper, now)).rejects.toBeInstanceOf(DirectIdentifierDetectedError);
      expect(await db.select().from(anonymousResearchContributions)).toHaveLength(0);

      const second = await validPresentation(db, new Date(now.getTime() + 1_000));
      second.projectKey = first.projectKey;
      const credential = await issueResearchEligibilityCredential(second.issuer.privateKey, {
        projectDigest,
        consentDigest,
        projectPublicKey: JSON.stringify(first.projectKey.publicKey),
        validFrom: new Date(now.getTime() - 60_000),
        validUntil: new Date(now.getTime() + 10 * 60_000),
        issuanceClass: "synthetic",
      });
      second.presentation = await deriveResearchEligibilityPresentation(credential, second.issuer.publicKey);
      second.challenge.presentationDigest = await digestPresentation(second.presentation);
      second.holderSignature = await signProjectChallenge(first.projectKey.privateKey, second.challenge);
      await expect(verifyResearchPresentation(db, {
        presentation: second.presentation,
        issuerPublicKey: second.issuer.publicKey,
        challenge: second.challenge,
        holderSignature: second.holderSignature,
      }, pepper, new Date(now.getTime() + 1_000)))
        .rejects.toBeInstanceOf(DuplicateResearchSubmissionError);
    } finally {
      await client.close();
    }
  }, 30_000);
});
