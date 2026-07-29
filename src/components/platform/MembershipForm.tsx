"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/Button";
import { actionStateFromResponse, type ActionState } from "./ActionStatus";

const tiers = ["basic", "supporter", "volunteer", "research", "institutional"] as const;

export function MembershipForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.platform.membership;
  const [tier, setTier] = useState<(typeof tiers)[number]>("basic");
  const [state, setState] = useState<ActionState>("idle");
  const [dataProtectionConsent, setDataProtectionConsent] = useState(false);
  const [programmeParticipationConsent, setProgrammeParticipationConsent] =
    useState(false);
  const [dataProtectionTouched, setDataProtectionTouched] = useState(false);
  const [programmeParticipationTouched, setProgrammeParticipationTouched] =
    useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dataProtectionConsent || !programmeParticipationConsent) {
      setDataProtectionTouched(true);
      setProgrammeParticipationTouched(true);
      return;
    }
    setState("submitting");
    try {
      const response = await fetch("/api/membership/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tier,
          profileConsents: {
            dataProtection: dataProtectionConsent,
            programmeParticipation: programmeParticipationConsent,
            locale,
          },
        }),
      });
      setState(await actionStateFromResponse(response));
    } catch {
      setState("error");
    }
  }

  const message = state === "success" ? t.success
    : state === "duplicate" ? t.duplicate
    : state === "unavailable" ? t.unavailable
    : state === "error" ? t.error
    : null;

  return (
    <form
      onSubmit={submit}
      className="glass-panel max-w-2xl rounded-2xl p-6 sm:p-8"
      aria-busy={state === "submitting"}
      noValidate
    >
      <p className="civic-label">{t.processLabel}</p>
      <ol className="mt-5 grid gap-px rounded-xl border border-border bg-border sm:grid-cols-2">
        <li className="bg-surface p-4">
          <span className="editorial-index text-xs text-accent">01</span>
          <span className="ms-3 text-sm font-semibold">{t.processSelect}</span>
        </li>
        <li className="bg-surface p-4">
          <span className="editorial-index text-xs text-muted">02</span>
          <span className="ms-3 text-sm font-semibold">{t.processReview}</span>
        </li>
      </ol>
      <label htmlFor="membership-tier" className="mt-8 block text-sm font-semibold">{t.tierLabel}</label>
      <select id="membership-tier" value={tier} onChange={(event) => setTier(event.target.value as typeof tier)} className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 py-3 text-ink focus:border-accent">
        {tiers.map((value) => <option key={value} value={value}>{t.tiers[value]}</option>)}
      </select>
      <p className="mt-4 text-sm leading-relaxed text-muted">{t.accountableNotice}</p>
      <fieldset className="mt-6 space-y-4" aria-describedby="profile-consents-requirement">
        <legend className="text-base font-semibold">{t.profileConsentsTitle}</legend>
        <p id="profile-consents-requirement" className="text-sm leading-relaxed text-muted">
          {t.profileConsentsRequired}
        </p>
        <div className="rounded-xl bg-bg p-4">
          <div className="grid grid-cols-[auto_1fr] gap-3">
            <input
              id="data-protection-consent"
              type="checkbox"
              checked={dataProtectionConsent}
              onChange={(event) => setDataProtectionConsent(event.target.checked)}
              onBlur={() => setDataProtectionTouched(true)}
              aria-invalid={dataProtectionTouched && !dataProtectionConsent}
              aria-describedby={
                dataProtectionTouched && !dataProtectionConsent
                  ? "data-protection-consent-error"
                  : undefined
              }
              className="mt-1 h-5 w-5 accent-accent"
            />
            <div>
              <label
                htmlFor="data-protection-consent"
                className="cursor-pointer"
              >
                <span className="block text-sm font-semibold">{t.dataProtectionTitle}</span>
                <span className="mt-1 block text-sm leading-relaxed">
                  {t.dataProtectionConsent}
                </span>
              </label>
              <Link
                href={`/${locale}/datenschutz`}
                className="mt-2 inline-flex text-sm font-semibold text-accent underline underline-offset-4"
              >
                {dict.footer.privacy}
              </Link>
            </div>
          </div>
          {dataProtectionTouched && !dataProtectionConsent && (
            <p id="data-protection-consent-error" role="alert" className="mt-2 text-sm text-critical">
              {t.dataProtectionConsentRequired}
            </p>
          )}
        </div>
        <div className="rounded-xl bg-bg p-4">
          <label className="grid cursor-pointer grid-cols-[auto_1fr] gap-3">
            <input
              type="checkbox"
              checked={programmeParticipationConsent}
              onChange={(event) =>
                setProgrammeParticipationConsent(event.target.checked)
              }
              onBlur={() => setProgrammeParticipationTouched(true)}
              aria-invalid={
                programmeParticipationTouched && !programmeParticipationConsent
              }
              aria-describedby={
                programmeParticipationTouched && !programmeParticipationConsent
                  ? "programme-participation-consent-error"
                  : undefined
              }
              className="mt-1 h-5 w-5 accent-accent"
            />
            <span>
              <span className="block text-sm font-semibold">{t.consentTitle}</span>
              <span className="mt-1 block text-sm leading-relaxed">
                {t.programmeParticipationConsent}
              </span>
            </span>
          </label>
          {programmeParticipationTouched && !programmeParticipationConsent && (
            <p id="programme-participation-consent-error" role="alert" className="mt-2 text-sm text-critical">
              {t.programmeParticipationConsentRequired}
            </p>
          )}
        </div>
      </fieldset>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button
          type="submit"
          disabled={
            state === "submitting" ||
            state === "success" ||
            !dataProtectionConsent ||
            !programmeParticipationConsent
          }
        >
          {state === "submitting" ? t.submitting : t.submit}
        </Button>
        {state === "forbidden" && (
          <a className="text-sm text-accent underline underline-offset-4" href={`/api/auth/login?returnTo=/${locale}/membership`}>
            {t.login}
          </a>
        )}
      </div>
      {message && <p role="status" aria-live="polite" className={`mt-4 rounded-xl p-4 text-sm ${state === "success" ? "bg-verdigris/10 text-verdigris" : "bg-bg text-muted"}`}>{message}</p>}
    </form>
  );
}
