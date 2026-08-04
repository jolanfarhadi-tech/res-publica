import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  deriveResearchEligibilityPresentation,
  generateBbsIssuerKey,
  issueResearchEligibilityCredential,
  readResearchCredentialSubject,
  verifyResearchEligibilityPresentation,
} from "./bbs-credential";

const digest = (value: string) => createHash("sha256").update(value).digest("hex");

describe("BBS research eligibility credentials", () => {
  it("issues, selectively derives, randomizes, and verifies a minimal presentation", async () => {
    const issuer = await generateBbsIssuerKey();
    const input = {
      projectDigest: digest("synthetic-project-a"),
      consentDigest: digest("synthetic-consent-v1"),
      projectPublicKey: JSON.stringify({ kty: "EC", crv: "P-256", x: "x", y: "y" }),
      validFrom: new Date("2026-08-04T12:00:00.000Z"),
      validUntil: new Date("2026-08-04T12:15:00.000Z"),
      issuanceClass: "synthetic" as const,
    };
    const credential = await issueResearchEligibilityCredential(issuer.privateKey, input);
    const first = await deriveResearchEligibilityPresentation(credential, issuer.publicKey);
    const second = await deriveResearchEligibilityPresentation(credential, issuer.publicKey);

    expect(first).not.toEqual(second);
    expect(first).not.toHaveProperty("id");
    expect(first).not.toHaveProperty("credentialSubject.issuanceClass");
    expect(first).not.toHaveProperty("credentialSubject.protocol");
    expect(JSON.stringify(first)).not.toMatch(
      /member|person|email|auth0|walletId|application|consentRecord/i
    );
    expect(readResearchCredentialSubject(first)).toEqual({
      projectDigest: input.projectDigest,
      consentDigest: input.consentDigest,
      projectPublicKey: input.projectPublicKey,
    });
    await expect(verifyResearchEligibilityPresentation(
      first,
      issuer.publicKey,
      new Date("2026-08-04T12:05:00.000Z")
    )).resolves.toEqual({ verified: true });
  }, 30_000);

  it("rejects tampering and expired presentations", async () => {
    const issuer = await generateBbsIssuerKey();
    const credential = await issueResearchEligibilityCredential(issuer.privateKey, {
      projectDigest: digest("synthetic-project-b"),
      consentDigest: digest("synthetic-consent-v2"),
      projectPublicKey: "synthetic-project-key",
      validFrom: new Date("2026-08-04T12:00:00.000Z"),
      validUntil: new Date("2026-08-04T12:15:00.000Z"),
      issuanceClass: "synthetic",
    });
    const presentation = await deriveResearchEligibilityPresentation(
      credential,
      issuer.publicKey
    );
    const tampered = structuredClone(presentation);
    const subject = tampered.credentialSubject as Record<string, unknown>;
    subject.projectDigest = digest("different-project");

    await expect(verifyResearchEligibilityPresentation(
      tampered,
      issuer.publicKey,
      new Date("2026-08-04T12:05:00.000Z")
    )).resolves.toEqual(expect.objectContaining({ verified: false }));
    await expect(verifyResearchEligibilityPresentation(
      presentation,
      issuer.publicKey,
      new Date("2026-08-04T12:15:00.000Z")
    )).resolves.toEqual({ verified: false, reason: "credential_not_current" });
  }, 30_000);
});
