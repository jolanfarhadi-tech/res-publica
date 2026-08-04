import { createHash } from "node:crypto";
import {
  deriveResearchEligibilityPresentation,
  generateBbsIssuerKey,
  issueResearchEligibilityCredential,
  verifyResearchEligibilityPresentation,
} from "../domain/research-wallet/bbs-credential";
import { redactSubmitterIdentity } from "../domain/research-intake/redaction";
import {
  digestPresentation,
  generateProjectKeyMaterial,
  signProjectChallenge,
  verifyProjectChallengeSignature,
} from "../domain/research-wallet/local-wallet";

export async function runSyntheticResearchSmoke(now = new Date()) {
  const issuer = await generateBbsIssuerKey();
  const projectKey = await generateProjectKeyMaterial();
  const projectDigest = sha256("synthetic-project-only");
  const credential = await issueResearchEligibilityCredential(issuer.privateKey, {
    projectDigest,
    consentDigest: sha256("synthetic-consent-only"),
    projectPublicKey: JSON.stringify(projectKey.publicKey),
    validFrom: new Date(now.getTime() - 60_000),
    validUntil: new Date(now.getTime() + 10 * 60_000),
    issuanceClass: "synthetic",
  });
  const presentation = await deriveResearchEligibilityPresentation(credential, issuer.publicKey);
  const challenge = {
    challenge: crypto.randomUUID().replaceAll("-", "").padEnd(43, "x").slice(0, 43),
    audience: "https://synthetic.invalid/research-verifier",
    projectDigest,
    presentationDigest: await digestPresentation(presentation),
    expiresAt: new Date(now.getTime() + 5 * 60_000).toISOString(),
  };
  const signature = await signProjectChallenge(projectKey.privateKey, challenge);
  const redaction = redactSubmitterIdentity(
    "Synthetic Holder at Universität Berlin reported an institutional procedure. Contact synthetic@example.invalid.",
    {
      givenName: "Synthetic", familyName: "Holder",
      email: "synthetic@example.invalid", phone: null,
      addressLines: [], accountIdentifiers: ["auth0|synthetic-test-identity"],
    }
  );
  const proof = await verifyResearchEligibilityPresentation(presentation, issuer.publicKey, now);
  const holderProof = await verifyProjectChallengeSignature(projectKey.publicKey, challenge, signature);
  const identifiersRemoved = !/Synthetic Holder|synthetic@example\.invalid|auth0\|synthetic-test-identity/i
    .test(redaction.sanitizedText);
  const institutionPreserved = redaction.sanitizedText.includes("Universität Berlin");
  if (!proof.verified || !holderProof || !identifiersRemoved || !institutionPreserved) {
    throw new SyntheticResearchSmokeFailedError();
  }
  return {
    bbsSelectiveDisclosure: true,
    holderProof: true,
    submitterIdentityRemovedLocally: true,
    institutionalContextPreserved: true,
    persistentRecordsCreated: 0,
    syntheticOnly: true,
  } as const;
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export class SyntheticResearchSmokeFailedError extends Error {}
