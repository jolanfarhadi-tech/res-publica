"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { membershipApplicationCopy } from "@/i18n/membership-application";
import {
  MEMBERSHIP_APPLICATION_PROTOCOL_VERSION,
  MEMBERSHIP_PRIVACY_NOTICE_VERSION,
  MEMBERSHIP_STATUTES_VERSION,
  RESEARCH_READINESS_STATEMENT_VERSION,
} from "@/domain/membership-application/protocol";
import { Button } from "@/components/ui/Button";

const tiers = ["basic", "supporter", "volunteer", "research", "institutional"] as const;
type JourneyState = "loading" | "anonymous" | "form" | "unavailable";
type ApplicationStatus = "application_pending" | "approved" | "rejected" | "withdrawn";

export function MembershipForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const copy = membershipApplicationCopy[locale];
  const [journey, setJourney] = useState<JourneyState>("loading");
  const [status, setStatus] = useState<ApplicationStatus | "verified" | "suspended" | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
        const session = await sessionResponse.json() as { authenticated: boolean; available: boolean };
        if (!active) return;
        if (!session.available) return setJourney("unavailable");
        if (!session.authenticated) return setJourney("anonymous");
        const [applicationResponse, profileResponse] = await Promise.all([
          fetch("/api/membership/applications", { cache: "no-store" }),
          fetch("/api/membership/profile", { cache: "no-store" }),
        ]);
        const application = applicationResponse.ok
          ? await applicationResponse.json() as { application: { status: ApplicationStatus } | null }
          : { application: null };
        const profile = profileResponse.ok
          ? await profileResponse.json() as { enrolled: boolean; membership?: { currentStatus: string } }
          : { enrolled: false };
        if (!active) return;
        if (profile.enrolled) {
          setStatus(profile.membership?.currentStatus === "suspended" ? "suspended" : "verified");
        } else if (application.application) {
          setStatus(application.application.status);
        } else {
          setJourney("form");
        }
      } catch {
        if (active) setJourney("unavailable");
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  if (journey === "loading") {
    return <div className="glass-panel h-44 max-w-3xl animate-pulse rounded-2xl" aria-label={dict.account.loading} />;
  }
  if (journey === "unavailable") {
    return <p role="status" className="glass-panel max-w-3xl rounded-2xl p-6 text-muted">{copy.unavailable}</p>;
  }
  if (status) {
    const visibleStatus = status in copy.statuses ? copy.statuses[status as keyof typeof copy.statuses] : copy.statuses.verified;
    return (
      <section className="glass-panel max-w-3xl rounded-2xl p-6 sm:p-8" aria-labelledby="membership-status-title">
        <h2 id="membership-status-title" className="text-xl font-semibold">{copy.statusTitle}</h2>
        <p className="mt-4 text-lg leading-relaxed text-ink">{visibleStatus}</p>
      </section>
    );
  }
  if (journey === "anonymous") {
    return (
      <div className="grid max-w-4xl gap-5 md:grid-cols-2">
        <section className="glass-panel rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold">{copy.existingTitle}</h2>
          <p className="mt-3 leading-relaxed text-muted">{copy.existingText}</p>
          <a className="button-secondary mt-6" href={`/api/auth/login?returnTo=/${locale}/membership`}>{copy.existingAction}</a>
        </section>
        <section className="glass-panel rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold">{copy.newTitle}</h2>
          <p className="mt-3 leading-relaxed text-muted">{copy.newText}</p>
          <a className="button-primary mt-6" href={`/api/auth/login?mode=signup&returnTo=/${locale}/membership`}>{copy.newAction}</a>
        </section>
        <p className="md:col-span-2 text-sm leading-relaxed text-muted">{copy.credentialsNotice}</p>
      </div>
    );
  }
  return <ApplicationForm locale={locale} dict={dict} onSubmitted={() => setStatus("application_pending")} />;
}

function ApplicationForm({ locale, dict, onSubmitted }: { locale: Locale; dict: Dictionary; onSubmitted: () => void }) {
  const copy = membershipApplicationCopy[locale];
  const [tier, setTier] = useState<(typeof tiers)[number]>("basic");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [statutes, setStatutes] = useState(false);
  const [protocol, setProtocol] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [researchReadiness, setResearchReadiness] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const ready = statutes && protocol && privacy;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    if (!ready) return;
    setBusy(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/membership/applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          givenName: form.get("givenName"), familyName: form.get("familyName"), email: form.get("email"),
          address: {
            line1: form.get("addressLine1"), line2: String(form.get("addressLine2") || "").trim() || null,
            postalCode: form.get("postalCode"), city: form.get("city"), countryCode: form.get("countryCode"),
          },
          requestedTier: tier,
          acknowledgements: {
            statutes: { accepted: statutes, version: MEMBERSHIP_STATUTES_VERSION },
            technicalProtocol: { accepted: protocol, version: MEMBERSHIP_APPLICATION_PROTOCOL_VERSION },
            privacyNotice: { acknowledged: privacy, version: MEMBERSHIP_PRIVACY_NOTICE_VERSION },
          },
          ...(researchReadiness ? { researchReadiness: { willing: true, statementVersion: RESEARCH_READINESS_STATEMENT_VERSION } } : {}),
        }),
      });
      if (response.ok) return onSubmitted();
      setMessage(response.status === 409 ? copy.duplicate : response.status === 503 ? copy.unavailable : copy.error);
    } catch {
      setMessage(copy.error);
    } finally {
      setBusy(false);
    }
  }

  const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 py-3 text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";
  return (
    <form onSubmit={submit} className="glass-panel max-w-3xl rounded-2xl p-6 sm:p-8" aria-busy={busy}>
      <h2 className="text-xl font-semibold">{copy.fieldsTitle}</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {([['givenName', copy.givenName, 'text'], ['familyName', copy.familyName, 'text'], ['email', copy.email, 'email'], ['addressLine1', copy.addressLine1, 'text'], ['addressLine2', copy.addressLine2, 'text'], ['postalCode', copy.postalCode, 'text'], ['city', copy.city, 'text'], ['countryCode', copy.countryCode, 'text']] as const).map(([name, label, type]) => (
          <label key={name} className={name === "addressLine1" ? "sm:col-span-2 text-sm font-semibold" : "text-sm font-semibold"}>
            {label}
            <input className={inputClass} name={name} type={type} required={name !== "addressLine2"} maxLength={name === "email" ? 254 : 200} autoComplete={name === "givenName" ? "given-name" : name === "familyName" ? "family-name" : name === "email" ? "email" : undefined} />
          </label>
        ))}
        <label className="sm:col-span-2 text-sm font-semibold">
          {dict.platform.membership.tierLabel}
          <select className={inputClass} value={tier} onChange={(event) => setTier(event.target.value as typeof tier)}>
            {tiers.map((value) => <option key={value} value={value}>{dict.platform.membership.tiers[value]}</option>)}
          </select>
        </label>
      </div>

      <fieldset className="mt-10 space-y-4">
        <legend className="text-lg font-semibold">{copy.confirmationsTitle}</legend>
        <p className="text-sm leading-relaxed text-muted">{copy.confirmationsHelp}</p>
        <Confirmation id="statutes-ack" checked={statutes} setChecked={setStatutes} invalid={attempted && !statutes} label={copy.statutes} error={copy.required}>
          <a href="/documents/satzung-res-publica-ev.docx" className="text-sm font-semibold text-accent underline underline-offset-4">{copy.statutesLink}</a>
        </Confirmation>
        <Confirmation id="protocol-ack" checked={protocol} setChecked={setProtocol} invalid={attempted && !protocol} label={copy.protocol} error={copy.required}>
          <Link href={`/${locale}/membership/protocol`} className="text-sm font-semibold text-accent underline underline-offset-4">{copy.protocolLink}</Link>
        </Confirmation>
        <Confirmation id="privacy-ack" checked={privacy} setChecked={setPrivacy} invalid={attempted && !privacy} label={copy.privacy} error={copy.required}>
          <Link href={`/${locale}/datenschutz`} className="text-sm font-semibold text-accent underline underline-offset-4">{copy.privacyLink}</Link>
        </Confirmation>
      </fieldset>

      <fieldset className="mt-8 rounded-xl bg-bg p-4">
        <legend className="px-1 text-base font-semibold">{copy.researchTitle}</legend>
        <label className="mt-2 grid cursor-pointer grid-cols-[auto_1fr] gap-3 text-sm leading-relaxed">
          <input type="checkbox" checked={researchReadiness} onChange={(event) => setResearchReadiness(event.target.checked)} className="mt-1 h-5 w-5 accent-accent" />
          <span>{copy.researchText}</span>
        </label>
      </fieldset>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={busy || !ready}>{busy ? copy.submitting : copy.submit}</Button>
      </div>
      {message && <p role="alert" className="mt-4 rounded-xl bg-bg p-4 text-sm text-critical">{message}</p>}
    </form>
  );
}

function Confirmation({ id, checked, setChecked, invalid, label, error, children }: { id: string; checked: boolean; setChecked: (value: boolean) => void; invalid: boolean; label: string; error: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-bg p-4">
      <label className="grid cursor-pointer grid-cols-[auto_1fr] gap-3">
        <input id={id} type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} aria-invalid={invalid} aria-describedby={invalid ? `${id}-error` : undefined} className="mt-1 h-5 w-5 accent-accent" />
        <span className="text-sm leading-relaxed">{label}</span>
      </label>
      <div className="ms-8 mt-2">{children}</div>
      {invalid && <p id={`${id}-error`} role="alert" className="ms-8 mt-2 text-sm text-critical">{error}</p>}
    </div>
  );
}
