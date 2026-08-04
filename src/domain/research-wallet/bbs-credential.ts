import * as BbsCryptosuite from "@digitalbazaar/bbs-2023-cryptosuite";
import * as Bls12381Multikey from "@digitalbazaar/bls12-381-multikey";
import { DataIntegrityProof } from "@digitalbazaar/data-integrity";
import {
  CONTEXT as MULTIKEY_CONTEXT,
  CONTEXT_URL as MULTIKEY_CONTEXT_URL,
} from "@digitalbazaar/multikey-context";
import * as vc from "@digitalbazaar/vc";
import {
  CONTEXT as DID_CONTEXT,
  DID_CONTEXT_URL,
} from "did-context";

export const RESEARCH_CREDENTIAL_CONTEXT =
  "https://respublica-ev.de/contexts/research-eligibility-v1";
export const RESEARCH_CREDENTIAL_ISSUER =
  "https://respublica-ev.de/credentials/research-eligibility";
export const RESEARCH_CREDENTIAL_KEY_ID =
  `${RESEARCH_CREDENTIAL_ISSUER}#bbs-2023-1`;
export const RESEARCH_CREDENTIAL_PROTOCOL = "w3c-vc-bbs-2023-v1";

const REQUIRED_DISCLOSURES = [
  "/issuer",
  "/validFrom",
  "/validUntil",
  "/credentialSubject/projectDigest",
  "/credentialSubject/eligible",
  "/credentialSubject/consentDigest",
  "/credentialSubject/projectPublicKey",
] as const;

const researchContext = {
  "@context": {
    "@protected": true,
    rp: "https://respublica-ev.de/vocabulary/research#",
    ResearchEligibilityCredential: "rp:ResearchEligibilityCredential",
    projectDigest: "rp:projectDigest",
    eligible: {
      "@id": "rp:eligible",
      "@type": "http://www.w3.org/2001/XMLSchema#boolean",
    },
    consentDigest: "rp:consentDigest",
    projectPublicKey: "rp:projectPublicKey",
    issuanceClass: "rp:issuanceClass",
    protocol: "rp:protocol",
  },
};

export type BbsIssuerKey = {
  publicKey: Record<string, unknown>;
  privateKey: Record<string, unknown>;
};

export type ResearchEligibilityCredentialInput = {
  projectDigest: string;
  consentDigest: string;
  projectPublicKey: string;
  validFrom: Date;
  validUntil: Date;
  issuanceClass: "synthetic" | "real-gated";
};

export async function generateBbsIssuerKey(): Promise<BbsIssuerKey> {
  const keyPair = await Bls12381Multikey.generateBbsKeyPair({
    algorithm: Bls12381Multikey.ALGORITHMS.BBS_BLS12381_SHA256,
    id: RESEARCH_CREDENTIAL_KEY_ID,
    controller: RESEARCH_CREDENTIAL_ISSUER,
  });
  return {
    publicKey: await keyPair.export({ publicKey: true }),
    privateKey: await keyPair.export({ publicKey: true, secretKey: true }),
  };
}

export async function issueResearchEligibilityCredential(
  issuerPrivateKey: Record<string, unknown>,
  input: ResearchEligibilityCredentialInput
): Promise<Record<string, unknown>> {
  assertCredentialInput(input);
  const keyPair = await Bls12381Multikey.from(issuerPrivateKey);
  const suite = new DataIntegrityProof({
    signer: keyPair.signer(),
    cryptosuite: BbsCryptosuite.createSignCryptosuite({
      mandatoryPointers: [...REQUIRED_DISCLOSURES],
    }),
  });
  const credential = {
    "@context": ["https://www.w3.org/ns/credentials/v2", RESEARCH_CREDENTIAL_CONTEXT],
    type: ["VerifiableCredential", "ResearchEligibilityCredential"],
    issuer: RESEARCH_CREDENTIAL_ISSUER,
    validFrom: input.validFrom.toISOString(),
    validUntil: input.validUntil.toISOString(),
    credentialSubject: {
      projectDigest: input.projectDigest,
      eligible: true,
      consentDigest: input.consentDigest,
      projectPublicKey: input.projectPublicKey,
      issuanceClass: input.issuanceClass,
      protocol: RESEARCH_CREDENTIAL_PROTOCOL,
    },
  };
  return vc.issue({
    credential,
    suite,
    documentLoader: createResearchDocumentLoader(
      await keyPair.export({ publicKey: true })
    ),
  });
}

export async function deriveResearchEligibilityPresentation(
  credential: Record<string, unknown>,
  issuerPublicKey: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const suite = new DataIntegrityProof({
    cryptosuite: BbsCryptosuite.createDiscloseCryptosuite({
      selectivePointers: [...REQUIRED_DISCLOSURES],
    }),
  });
  return vc.derive({
    verifiableCredential: credential,
    suite,
    documentLoader: createResearchDocumentLoader(issuerPublicKey),
  });
}

export async function verifyResearchEligibilityPresentation(
  presentation: Record<string, unknown>,
  issuerPublicKey: Record<string, unknown>,
  now = new Date()
): Promise<{ verified: boolean; reason?: string }> {
  const suite = new DataIntegrityProof({
    cryptosuite: BbsCryptosuite.createVerifyCryptosuite(),
  });
  const result = await vc.verifyCredential({
    credential: presentation,
    suite,
    documentLoader: createResearchDocumentLoader(issuerPublicKey),
    now,
  });
  if (!result.verified) {
    return { verified: false, reason: "invalid_bbs_proof" };
  }

  const validFrom = readDate(presentation.validFrom);
  const validUntil = readDate(presentation.validUntil);
  if (!validFrom || !validUntil || now < validFrom || now >= validUntil) {
    return { verified: false, reason: "credential_not_current" };
  }
  const subject = presentation.credentialSubject;
  if (!isRecord(subject) || subject.eligible !== true ||
    !isDigest(subject.projectDigest) || !isDigest(subject.consentDigest) ||
    typeof subject.projectPublicKey !== "string") {
    return { verified: false, reason: "invalid_disclosure" };
  }
  return { verified: true };
}

export function readResearchCredentialSubject(
  presentation: Record<string, unknown>
): {
  projectDigest: string;
  consentDigest: string;
  projectPublicKey: string;
} {
  const subject = presentation.credentialSubject;
  if (!isRecord(subject) || !isDigest(subject.projectDigest) ||
    !isDigest(subject.consentDigest) || typeof subject.projectPublicKey !== "string") {
    throw new Error("Research presentation does not contain the required disclosure");
  }
  return {
    projectDigest: subject.projectDigest,
    consentDigest: subject.consentDigest,
    projectPublicKey: subject.projectPublicKey,
  };
}

function createResearchDocumentLoader(issuerPublicKey: Record<string, unknown>) {
  const controller = {
    "@context": DID_CONTEXT_URL,
    id: RESEARCH_CREDENTIAL_ISSUER,
    assertionMethod: [issuerPublicKey],
  };
  return async (url: string) => {
    if (url === RESEARCH_CREDENTIAL_CONTEXT) {
      return { contextUrl: null, documentUrl: url, document: researchContext };
    }
    if (url === MULTIKEY_CONTEXT_URL) {
      return {
        contextUrl: null,
        documentUrl: url,
        document: MULTIKEY_CONTEXT,
      };
    }
    if (url === DID_CONTEXT_URL) {
      return { contextUrl: null, documentUrl: url, document: DID_CONTEXT };
    }
    if (url === RESEARCH_CREDENTIAL_KEY_ID) {
      return { contextUrl: null, documentUrl: url, document: issuerPublicKey };
    }
    if (url === RESEARCH_CREDENTIAL_ISSUER) {
      return { contextUrl: null, documentUrl: url, document: controller };
    }
    return vc.defaultDocumentLoader(url);
  };
}

function assertCredentialInput(input: ResearchEligibilityCredentialInput) {
  if (!isDigest(input.projectDigest) || !isDigest(input.consentDigest) ||
    !input.projectPublicKey.trim() || input.validUntil <= input.validFrom) {
    throw new Error("Invalid research eligibility credential input");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDigest(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{64}$/i.test(value);
}

function readDate(value: unknown) {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
