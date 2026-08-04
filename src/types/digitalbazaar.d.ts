declare module "@digitalbazaar/bls12-381-multikey" {
  export const ALGORITHMS: { BBS_BLS12381_SHA256: string };

  export type BbsKeyPair = {
    id?: string;
    controller?: string;
    signer(): unknown;
    verifier(): unknown;
    export(options: { publicKey: boolean; secretKey?: boolean }): Promise<Record<string, unknown>>;
  };

  export function generateBbsKeyPair(options: {
    algorithm: string;
    id?: string;
    controller?: string;
  }): Promise<BbsKeyPair>;

  export function from(key: Record<string, unknown>): Promise<BbsKeyPair>;
}

declare module "@digitalbazaar/bbs-2023-cryptosuite" {
  export function createSignCryptosuite(options?: {
    mandatoryPointers?: string[];
  }): unknown;
  export function createDiscloseCryptosuite(options: {
    selectivePointers: string[];
  }): unknown;
  export function createVerifyCryptosuite(options?: {
    expectedPresentationHeader?: Uint8Array;
  }): unknown;
}

declare module "@digitalbazaar/data-integrity" {
  export class DataIntegrityProof {
    constructor(options: {
      signer?: unknown;
      cryptosuite: unknown;
    });
  }
}

declare module "@digitalbazaar/vc" {
  export const defaultDocumentLoader: (url: string) => Promise<{
    contextUrl: string | null;
    documentUrl: string;
    document: unknown;
  }>;

  export function issue(options: {
    credential: Record<string, unknown>;
    suite: unknown;
    documentLoader: (url: string) => Promise<unknown>;
  }): Promise<Record<string, unknown>>;

  export function derive(options: {
    verifiableCredential: Record<string, unknown>;
    suite: unknown;
    documentLoader: (url: string) => Promise<unknown>;
  }): Promise<Record<string, unknown>>;

  export function verifyCredential(options: {
    credential: Record<string, unknown>;
    suite: unknown;
    documentLoader: (url: string) => Promise<unknown>;
    now?: Date;
  }): Promise<{ verified: boolean; error?: Error & { errors?: Error[] }; results?: unknown[] }>;
}

declare module "@digitalbazaar/multikey-context" {
  export const CONTEXT_URL: string;
  export const CONTEXT: Record<string, unknown>;
}

declare module "did-context" {
  export const DID_CONTEXT_URL: string;
  export const CONTEXT: Record<string, unknown>;
}
