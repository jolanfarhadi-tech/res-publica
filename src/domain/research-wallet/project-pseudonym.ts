const DOMAIN_SEPARATION_SALT = new TextEncoder().encode(
  "res-publica/research-wallet/project-pseudonym/v1"
);

export async function deriveProjectPseudonym(
  holderSecret: Uint8Array,
  projectContext: string
): Promise<string> {
  if (holderSecret.byteLength < 32) {
    throw new Error("A holder secret of at least 256 bits is required");
  }
  const normalizedProject = projectContext.trim();
  if (!normalizedProject) throw new Error("A project context is required");

  const key = await crypto.subtle.importKey(
    "raw",
    holderSecret.slice().buffer as ArrayBuffer,
    "HKDF",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: DOMAIN_SEPARATION_SALT,
      info: new TextEncoder().encode(normalizedProject),
    },
    key,
    256
  );
  return base64Url(new Uint8Array(bits));
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}
