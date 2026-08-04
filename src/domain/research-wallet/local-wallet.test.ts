import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  digestPresentation,
  generateLocalDeviceMaterial,
  generateProjectKeyMaterial,
  generateRecoveryCode,
  openWalletRecoveryPackage,
  sealWalletRecoveryPackage,
  signProjectChallenge,
  verifyProjectChallengeSignature,
  WalletRecoveryAuthenticationError,
} from "./local-wallet";

const projectDigest = createHash("sha256").update("synthetic-project").digest("hex");

describe("holder-local research wallet", () => {
  it("generates a non-exportable device key and unlinkable project keys", async () => {
    const device = await generateLocalDeviceMaterial();
    const first = await generateProjectKeyMaterial();
    const second = await generateProjectKeyMaterial();

    expect(device.privateKey.extractable).toBe(false);
    expect(device.publicKey).not.toHaveProperty("d");
    expect(first.privateKey.d).toBeTruthy();
    expect(first.thumbprint).not.toBe(second.thumbprint);
    expect(first.thumbprint).not.toBe(device.thumbprint);
  });

  it("seals recovery material and rejects the wrong recovery code", async () => {
    const code = generateRecoveryCode();
    const payload = {
      projectKeys: [await generateProjectKeyMaterial()],
      credentials: [{ type: "synthetic" }],
    };
    const sealed = await sealWalletRecoveryPackage(
      payload,
      code,
      new Date("2026-08-04T12:00:00.000Z")
    );

    expect(JSON.stringify(sealed)).not.toContain(payload.projectKeys[0].privateKey.d);
    await expect(openWalletRecoveryPackage<typeof payload>(sealed, code))
      .resolves.toEqual(payload);
    await expect(openWalletRecoveryPackage(sealed, generateRecoveryCode()))
      .rejects.toBeInstanceOf(WalletRecoveryAuthenticationError);
  }, 30_000);

  it("binds a challenge to audience, project, presentation, and expiry", async () => {
    const projectKey = await generateProjectKeyMaterial();
    const challenge = {
      challenge: "challenge-value",
      audience: "https://respublica-ev.de/api/research/verifier",
      projectDigest,
      presentationDigest: await digestPresentation({ proof: "synthetic-proof" }),
      expiresAt: "2026-08-04T12:05:00.000Z",
    };
    const signature = await signProjectChallenge(projectKey.privateKey, challenge);

    await expect(verifyProjectChallengeSignature(
      projectKey.publicKey,
      challenge,
      signature
    )).resolves.toBe(true);
    await expect(verifyProjectChallengeSignature(
      projectKey.publicKey,
      { ...challenge, audience: "https://attacker.example" },
      signature
    )).resolves.toBe(false);
    await expect(verifyProjectChallengeSignature(
      projectKey.publicKey,
      { ...challenge, challenge: "replayed-challenge" },
      signature
    )).resolves.toBe(false);
  });
});
