const RECOVERY_KDF_ITERATIONS = 600_000;
const RECOVERY_ADDITIONAL_DATA = new TextEncoder().encode(
  "res-publica/research-wallet/recovery/v1"
);

export const LOCAL_WALLET_VERSION = "research-wallet-local-v1";

export type ProjectKeyMaterial = {
  publicKey: JsonWebKey;
  privateKey: JsonWebKey;
  thumbprint: string;
};

export type LocalDeviceMaterial = {
  publicKey: JsonWebKey;
  privateKey: CryptoKey;
  thumbprint: string;
};

export type WalletRecoveryPackage = {
  version: typeof LOCAL_WALLET_VERSION;
  kdf: "PBKDF2-HMAC-SHA-256";
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
  createdAt: string;
};

export type ProjectChallenge = {
  challenge: string;
  audience: string;
  projectDigest: string;
  presentationDigest: string;
  expiresAt: string;
};

export async function generateLocalDeviceMaterial(): Promise<LocalDeviceMaterial> {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign", "verify"]
  ) as CryptoKeyPair;
  const publicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  return {
    publicKey,
    privateKey: keyPair.privateKey,
    thumbprint: await jwkThumbprint(publicKey),
  };
}

export async function generateProjectKeyMaterial(): Promise<ProjectKeyMaterial> {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  ) as CryptoKeyPair;
  const [publicKey, privateKey] = await Promise.all([
    crypto.subtle.exportKey("jwk", keyPair.publicKey),
    crypto.subtle.exportKey("jwk", keyPair.privateKey),
  ]);
  return {
    publicKey,
    privateKey,
    thumbprint: await jwkThumbprint(publicKey),
  };
}

export function generateRecoveryCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return base64Url(bytes).match(/.{1,8}/g)?.join(".") ?? base64Url(bytes);
}

export async function sealWalletRecoveryPackage(
  payload: unknown,
  recoveryCode: string,
  now = new Date()
): Promise<WalletRecoveryPackage> {
  assertRecoveryCode(recoveryCode);
  const salt = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveRecoveryKey(recoveryCode, salt, RECOVERY_KDF_ITERATIONS);
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: RECOVERY_ADDITIONAL_DATA },
    key,
    plaintext
  );
  return {
    version: LOCAL_WALLET_VERSION,
    kdf: "PBKDF2-HMAC-SHA-256",
    iterations: RECOVERY_KDF_ITERATIONS,
    salt: base64Url(salt),
    iv: base64Url(iv),
    ciphertext: base64Url(new Uint8Array(ciphertext)),
    createdAt: now.toISOString(),
  };
}

export async function openWalletRecoveryPackage<T>(
  recoveryPackage: WalletRecoveryPackage,
  recoveryCode: string
): Promise<T> {
  assertRecoveryPackage(recoveryPackage);
  assertRecoveryCode(recoveryCode);
  const salt = fromBase64Url(recoveryPackage.salt);
  const iv = fromBase64Url(recoveryPackage.iv);
  const ciphertext = fromBase64Url(recoveryPackage.ciphertext);
  const key = await deriveRecoveryKey(
    recoveryCode,
    salt,
    recoveryPackage.iterations
  );
  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv, additionalData: RECOVERY_ADDITIONAL_DATA },
      key,
      ciphertext
    );
    return JSON.parse(new TextDecoder().decode(plaintext)) as T;
  } catch {
    throw new WalletRecoveryAuthenticationError();
  }
}

export async function signProjectChallenge(
  privateKey: CryptoKey | JsonWebKey,
  challenge: ProjectChallenge
): Promise<string> {
  assertProjectChallenge(challenge);
  const key = isCryptoKey(privateKey)
    ? privateKey
    : await crypto.subtle.importKey(
      "jwk",
      privateKey,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"]
    );
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    encodeChallenge(challenge)
  );
  return base64Url(new Uint8Array(signature));
}

export async function verifyProjectChallengeSignature(
  publicKey: JsonWebKey,
  challenge: ProjectChallenge,
  signature: string
): Promise<boolean> {
  assertProjectChallenge(challenge);
  try {
    const key = await crypto.subtle.importKey(
      "jwk",
      publicKey,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"]
    );
    return crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      key,
      fromBase64Url(signature),
      encodeChallenge(challenge)
    );
  } catch {
    return false;
  }
}

export async function jwkThumbprint(publicKey: JsonWebKey): Promise<string> {
  if (publicKey.kty !== "EC" || publicKey.crv !== "P-256" ||
    !publicKey.x || !publicKey.y) {
    throw new InvalidWalletPublicKeyError();
  }
  const canonical = JSON.stringify({
    crv: publicKey.crv,
    kty: publicKey.kty,
    x: publicKey.x,
    y: publicKey.y,
  });
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonical)
  );
  return base64Url(new Uint8Array(digest));
}

export async function digestPresentation(value: unknown): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(stableJson(value))
  );
  return base64Url(new Uint8Array(digest));
}

function encodeChallenge(challenge: ProjectChallenge) {
  return new TextEncoder().encode([
    "res-publica-research-presentation-v1",
    challenge.challenge,
    challenge.audience,
    challenge.projectDigest,
    challenge.presentationDigest,
    challenge.expiresAt,
  ].join("\n"));
}

async function deriveRecoveryKey(
  recoveryCode: string,
  salt: Uint8Array,
  iterations: number
) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(normalizeRecoveryCode(recoveryCode)),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: new Uint8Array(salt), iterations },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function assertRecoveryCode(value: string) {
  const normalized = normalizeRecoveryCode(value);
  if (!/^[A-Za-z0-9_-]{43}$/.test(normalized)) {
    throw new InvalidWalletRecoveryCodeError();
  }
}

function assertRecoveryPackage(value: WalletRecoveryPackage) {
  if (value.version !== LOCAL_WALLET_VERSION ||
    value.kdf !== "PBKDF2-HMAC-SHA-256" ||
    value.iterations !== RECOVERY_KDF_ITERATIONS ||
    !value.salt || !value.iv || !value.ciphertext) {
    throw new InvalidWalletRecoveryPackageError();
  }
}

function assertProjectChallenge(value: ProjectChallenge) {
  if (!value.challenge || !value.audience ||
    !/^[0-9a-f]{64}$/i.test(value.projectDigest) ||
    !/^[A-Za-z0-9_-]{43}$/.test(value.presentationDigest) ||
    Number.isNaN(new Date(value.expiresAt).getTime())) {
    throw new InvalidProjectChallengeError();
  }
}

function normalizeRecoveryCode(value: string) {
  return value.trim().replaceAll(".", "");
}

function isCryptoKey(value: CryptoKey | JsonWebKey): value is CryptoKey {
  return typeof CryptoKey !== "undefined" && value instanceof CryptoKey;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(",")}}`;
  }
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new InvalidWalletEncodingError();
  return serialized;
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new InvalidWalletEncodingError();
  const padded = value.replaceAll("-", "+").replaceAll("_", "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

export class InvalidWalletPublicKeyError extends Error {}
export class InvalidWalletRecoveryCodeError extends Error {}
export class InvalidWalletRecoveryPackageError extends Error {}
export class WalletRecoveryAuthenticationError extends Error {}
export class InvalidProjectChallengeError extends Error {}
export class InvalidWalletEncodingError extends Error {}
