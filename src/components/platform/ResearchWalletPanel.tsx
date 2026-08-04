"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import {
  loadBrowserWallet,
  prepareBrowserWallet,
  removeBrowserWallet,
  saveBrowserWallet,
  verifyRecoveryPackage,
} from "@/domain/research-wallet/browser-vault";
import { generateLocalDeviceMaterial, type WalletRecoveryPackage } from "@/domain/research-wallet/local-wallet";
import { signProjectChallenge, type ProjectChallenge } from "@/domain/research-wallet/local-wallet";

type Wallet = {
  id: string;
  status: "offered" | "active" | "suspended" | "revoked";
  protocolProfile: string;
  activeDeviceBindingId: string | null;
};

const copy = {
  de: {
    label: "Forschungs-Wallet", title: "Pseudonyme, datensparsame Forschungsbeteiligung",
    offered: "Die Wallet wurde angeboten, ist aber nicht aktiviert.",
    active: "Die Wallet ist auf diesem Konto aktiviert.",
    local: "Der private Geräteschlüssel liegt ausschließlich in diesem Browser.",
    absent: "Auf diesem Gerät wurde kein lokaler Schlüssel gefunden.",
    consent: "Ich möchte die lokale Wallet bewusst einrichten und habe die Sicherheits- und Wiederherstellungshinweise verstanden.",
    activate: "Wallet lokal einrichten", activating: "Sicherer Schlüssel wird erzeugt …",
    blocked: "Die technische Funktion ist vorbereitet. Reale Credentials und Forschungsdaten bleiben bis zur externen Datenschutz- und Sicherheitsfreigabe deaktiviert.",
    recoveryTitle: "Wiederherstellung", recoveryText: "Speichern Sie Paket und Code getrennt. Der Code wird nur jetzt angezeigt und nicht an Res Publica übertragen.",
    download: "Verschlüsseltes Recovery-Paket herunterladen", code: "Recovery-Code",
    recover: "Auf diesem Gerät wiederherstellen", recoveryCode: "Recovery-Code eingeben",
    recoveryFile: "Recovery-Paket auswählen", revoke: "Wallet sperren",
    success: "Die lokale Wallet wurde eingerichtet.", recovered: "Das neue Gerät wurde gebunden und das alte gesperrt.",
    revoked: "Die Wallet und alle gebundenen Geräte wurden gesperrt.", error: "Der Vorgang konnte nicht sicher abgeschlossen werden.",
  },
  en: {
    label: "Research wallet", title: "Pseudonymous, data-minimising research participation",
    offered: "The wallet has been offered but is not activated.", active: "The wallet is active for this account.",
    local: "The private device key exists only in this browser.", absent: "No local key was found on this device.",
    consent: "I intentionally want to set up the local wallet and understand the security and recovery information.",
    activate: "Set up local wallet", activating: "Generating a secure key …",
    blocked: "The technical capability is prepared. Real credentials and research data remain disabled until external privacy and security approval.",
    recoveryTitle: "Recovery", recoveryText: "Store the package and code separately. The code is shown only now and is never sent to Res Publica.",
    download: "Download encrypted recovery package", code: "Recovery code", recover: "Recover on this device",
    recoveryCode: "Enter recovery code", recoveryFile: "Choose recovery package", revoke: "Revoke wallet",
    success: "The local wallet has been set up.", recovered: "The new device was bound and the old one revoked.",
    revoked: "The wallet and all bound devices were revoked.", error: "The operation could not be completed safely.",
  },
  fa: {
    label: "کیف پول پژوهشی", title: "مشارکت پژوهشی با نام مستعار و حداقل‌سازی داده‌ها",
    offered: "کیف پول پیشنهاد شده، اما فعال نیست.", active: "کیف پول برای این حساب فعال است.",
    local: "کلید خصوصی دستگاه فقط در همین مرورگر نگهداری می‌شود.", absent: "در این دستگاه کلید محلی پیدا نشد.",
    consent: "می‌خواهم آگاهانه کیف پول محلی را راه‌اندازی کنم و اطلاعات امنیت و بازیابی را درک کرده‌ام.",
    activate: "راه‌اندازی کیف پول محلی", activating: "در حال ساخت کلید امن…",
    blocked: "قابلیت فنی آماده است. اعتبارنامه‌های واقعی و داده‌های پژوهشی تا تأیید بیرونی حفاظت از داده و امنیت غیرفعال می‌مانند.",
    recoveryTitle: "بازیابی", recoveryText: "بسته و کد را جداگانه نگهداری کنید. کد فقط اکنون نمایش داده می‌شود و برای Res Publica ارسال نمی‌شود.",
    download: "دانلود بسته رمزگذاری‌شده بازیابی", code: "کد بازیابی", recover: "بازیابی در این دستگاه",
    recoveryCode: "کد بازیابی را وارد کنید", recoveryFile: "بسته بازیابی را انتخاب کنید", revoke: "مسدودکردن کیف پول",
    success: "کیف پول محلی راه‌اندازی شد.", recovered: "دستگاه جدید متصل و دستگاه قبلی مسدود شد.",
    revoked: "کیف پول و همه دستگاه‌های متصل مسدود شدند.", error: "عملیات به‌صورت امن کامل نشد.",
  },
} as const;

export function ResearchWalletPanel({ locale, wallet }: { locale: Locale; wallet: Wallet }) {
  const t = copy[locale];
  const [local, setLocal] = useState<boolean | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryPackage, setRecoveryPackage] = useState<WalletRecoveryPackage | null>(null);
  const importedPackage = useRef<WalletRecoveryPackage | null>(null);

  useEffect(() => {
    loadBrowserWallet(wallet.id).then((record) => setLocal(Boolean(record))).catch(() => setLocal(false));
  }, [wallet.id]);

  async function activate() {
    setBusy(true); setMessage(null);
    try {
      const prepared = await prepareBrowserWallet(wallet.id);
      const response = await fetch("/api/research/wallet/activate", {
        method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          walletId: wallet.id, holderKeyThumbprint: prepared.device.thumbprint,
          holderPublicKey: prepared.device.publicKey,
          recoveryPublicKey: prepared.recoveryPublicKey,
          activationConsent: { accepted: true, version: "research-wallet-activation-v1" },
        }),
      });
      if (!response.ok) throw new Error();
      await saveBrowserWallet({
        walletId: wallet.id, version: "research-wallet-local-v1", device: prepared.device,
        recoveryPackage: prepared.recoveryPackage, createdAt: new Date().toISOString(),
      });
      setRecoveryCode(prepared.recoveryCode);
      setRecoveryPackage(prepared.recoveryPackage);
      setLocal(true); setMessage(t.success);
    } catch { setMessage(t.blocked); }
    finally { setBusy(false); }
  }

  async function recover() {
    if (!importedPackage.current || !wallet.activeDeviceBindingId) return;
    setBusy(true); setMessage(null);
    try {
      const recoveryPrivateKey = await verifyRecoveryPackage(importedPackage.current, recoveryCode, wallet.id);
      const device = await generateLocalDeviceMaterial();
      const challengeResponse = await fetch("/api/research/wallet/recover/challenge", {
        method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" },
        body: JSON.stringify({ walletId: wallet.id }),
      });
      if (!challengeResponse.ok) throw new Error();
      const { challenge } = await challengeResponse.json() as { challenge: ProjectChallenge & { expiresAt: string } };
      const recoverySignature = await signProjectChallenge(recoveryPrivateKey, challenge);
      const response = await fetch("/api/research/wallet/recover", {
        method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          walletId: wallet.id, previousDeviceBindingId: wallet.activeDeviceBindingId,
          newHolderPublicKey: device.publicKey, recoveryChallenge: challenge, recoverySignature,
        }),
      });
      if (!response.ok) throw new Error();
      await saveBrowserWallet({
        walletId: wallet.id, version: "research-wallet-local-v1", device,
        recoveryPackage: importedPackage.current, createdAt: new Date().toISOString(),
      });
      setLocal(true); setMessage(t.recovered);
    } catch { setMessage(t.error); }
    finally { setBusy(false); }
  }

  async function revoke() {
    setBusy(true); setMessage(null);
    try {
      const response = await fetch("/api/research/wallet/revoke", {
        method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" },
        body: JSON.stringify({ walletId: wallet.id, confirmed: true }),
      });
      if (!response.ok) throw new Error();
      await removeBrowserWallet(wallet.id); setLocal(false); setMessage(t.revoked);
    } catch { setMessage(t.error); }
    finally { setBusy(false); }
  }

  function downloadRecovery() {
    if (!recoveryPackage) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(recoveryPackage)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "res-publica-wallet-recovery.json"; anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="glass-panel rounded-3xl p-7 sm:p-9 lg:col-span-2" aria-labelledby="research-wallet-title">
      <p className="civic-label">{t.label}</p>
      <h2 id="research-wallet-title" className="mt-4 text-3xl">{t.title}</h2>
      <p className="mt-3 text-muted">{wallet.status === "active" ? t.active : t.offered}</p>
      <p className="mt-2 text-sm text-muted">{local ? t.local : t.absent}</p>
      {wallet.status === "offered" && (
        <div className="mt-6 rounded-2xl border border-border bg-bg/70 p-5">
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1" />
            <span>{t.consent}</span>
          </label>
          <button type="button" disabled={!accepted || busy} onClick={activate} className="mt-5 rounded-full bg-accent px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
            {busy ? t.activating : t.activate}
          </button>
        </div>
      )}
      {recoveryPackage && recoveryCode && (
        <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/5 p-5" role="status">
          <h3 className="text-xl">{t.recoveryTitle}</h3><p className="mt-2 text-sm text-muted">{t.recoveryText}</p>
          <p className="mt-4 break-all font-mono text-sm"><strong>{t.code}:</strong> {recoveryCode}</p>
          <button type="button" onClick={downloadRecovery} className="mt-4 underline underline-offset-4">{t.download}</button>
        </div>
      )}
      {wallet.status === "active" && !local && wallet.activeDeviceBindingId && (
        <div className="mt-6 grid gap-4 rounded-2xl border border-border bg-bg/70 p-5">
          <h3 className="text-xl">{t.recoveryTitle}</h3>
          <label>{t.recoveryFile}<input className="mt-2 block w-full" type="file" accept="application/json" onChange={async (event) => {
            const file = event.target.files?.[0];
            if (file) importedPackage.current = JSON.parse(await file.text()) as WalletRecoveryPackage;
          }} /></label>
          <label>{t.recoveryCode}<input className="mt-2 block w-full rounded-xl border border-border bg-bg px-4 py-3" value={recoveryCode} onChange={(event) => setRecoveryCode(event.target.value)} /></label>
          <button type="button" disabled={busy || !recoveryCode} onClick={recover} className="w-fit rounded-full bg-accent px-5 py-3 font-semibold text-white disabled:opacity-50">{t.recover}</button>
        </div>
      )}
      {wallet.status === "active" && (
        <button type="button" disabled={busy} onClick={revoke} className="mt-6 text-sm font-semibold text-red-700 underline underline-offset-4">{t.revoke}</button>
      )}
      <p className="mt-6 border-t border-border pt-4 text-sm leading-relaxed text-muted">{t.blocked}</p>
      {message && <p className="mt-4 font-semibold" role="status" aria-live="polite">{message}</p>}
    </section>
  );
}
