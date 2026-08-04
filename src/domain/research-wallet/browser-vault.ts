import {
  generateLocalDeviceMaterial,
  generateRecoveryCode,
  generateProjectKeyMaterial,
  LOCAL_WALLET_VERSION,
  openWalletRecoveryPackage,
  sealWalletRecoveryPackage,
  type LocalDeviceMaterial,
  type WalletRecoveryPackage,
} from "./local-wallet";

const DATABASE_NAME = "res-publica-research-wallet";
const STORE_NAME = "wallets";

export type BrowserWalletRecord = {
  walletId: string;
  version: typeof LOCAL_WALLET_VERSION;
  device: LocalDeviceMaterial;
  recoveryPackage: WalletRecoveryPackage;
  createdAt: string;
};

export async function prepareBrowserWallet(walletId: string) {
  const device = await generateLocalDeviceMaterial();
  const recoveryKey = await generateProjectKeyMaterial();
  const recoveryCode = generateRecoveryCode();
  const recoveryPackage = await sealWalletRecoveryPackage({
    version: LOCAL_WALLET_VERSION,
    walletId,
    recoveryPrivateKey: recoveryKey.privateKey,
  }, recoveryCode);
  return {
    device,
    recoveryCode,
    recoveryPackage,
    recoveryPublicKey: recoveryKey.publicKey,
  };
}

export async function verifyRecoveryPackage(
  recoveryPackage: WalletRecoveryPackage,
  recoveryCode: string,
  expectedWalletId: string
): Promise<JsonWebKey> {
  const payload = await openWalletRecoveryPackage<{
    version: string;
    walletId: string;
    recoveryPrivateKey: JsonWebKey;
  }>(recoveryPackage, recoveryCode);
  if (payload.version !== LOCAL_WALLET_VERSION || payload.walletId !== expectedWalletId ||
    payload.recoveryPrivateKey.kty !== "EC" || payload.recoveryPrivateKey.crv !== "P-256" ||
    !payload.recoveryPrivateKey.d) {
    throw new BrowserWalletRecoveryMismatchError();
  }
  return payload.recoveryPrivateKey;
}

export async function saveBrowserWallet(record: BrowserWalletRecord) {
  const db = await openVault();
  await requestAsPromise(db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(record));
  db.close();
}

export async function loadBrowserWallet(walletId: string): Promise<BrowserWalletRecord | null> {
  const db = await openVault();
  const record = await requestAsPromise<BrowserWalletRecord | undefined>(
    db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(walletId)
  );
  db.close();
  return record ?? null;
}

export async function removeBrowserWallet(walletId: string) {
  const db = await openVault();
  await requestAsPromise(db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(walletId));
  db.close();
}

function openVault(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "walletId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new BrowserWalletStorageError());
  });
}

function requestAsPromise<T = undefined>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new BrowserWalletStorageError());
  });
}

export class BrowserWalletStorageError extends Error {}
export class BrowserWalletRecoveryMismatchError extends Error {}
