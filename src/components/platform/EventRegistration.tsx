"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/Button";
import {
  actionStateFromResponse,
  cancellationStateFromResponse,
  type ActionState,
} from "./ActionStatus";

export function EventRegistration({ locale, eventId, dict }: { locale: Locale; eventId: string; dict: Dictionary }) {
  const t = dict.platform.eventRegistration;
  const [state, setState] = useState<ActionState>("idle");
  const [available, setAvailable] = useState(false);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [activeRegistration, setActiveRegistration] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/events/capacity?eventId=${encodeURIComponent(eventId)}`, { cache: "no-store" })
      .then((response) => {
        if (active) setAvailable(response.ok);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [eventId]);

  async function register() {
    if (!consent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);
    setState("submitting");
    try {
      const response = await fetch("/api/events/registration", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const nextState = await actionStateFromResponse(response);
      setState(nextState);
      if (nextState === "success" || nextState === "waitlisted") {
        setActiveRegistration(true);
      }
    } catch {
      setState("error");
    }
  }

  async function cancel() {
    setState("cancelling");
    try {
      const response = await fetch("/api/events/registration", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const nextState = await cancellationStateFromResponse(response);
      setState(nextState);
      if (nextState === "cancelled") setActiveRegistration(false);
    } catch {
      setState("error");
    }
  }

  const message = state === "success" ? t.success
    : state === "waitlisted" ? t.waitlisted
    : state === "cancelled" ? t.cancelled
    : state === "duplicate" ? t.duplicate
    : state === "unavailable" ? t.unavailable
    : state === "error" ? t.error
    : null;

  if (!available) return null;

  return (
    <aside className="glass-panel mt-12 rounded-2xl p-6 sm:p-8" aria-labelledby="event-registration-title">
      <h2 id="event-registration-title" className="text-2xl">{t.title}</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">{t.text}</p>
      <label className="mt-6 grid cursor-pointer grid-cols-[auto_1fr] gap-3 rounded-xl bg-bg p-4">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => {
            setConsent(event.target.checked);
            if (event.target.checked) setConsentError(false);
          }}
          aria-invalid={consentError}
          aria-describedby={consentError ? "event-consent-error" : undefined}
          className="mt-1 h-5 w-5 accent-accent"
        />
        <span className="text-sm leading-relaxed">
          {t.consent}{" "}
          <Link href={`/${locale}/datenschutz`} className="font-semibold text-accent underline underline-offset-4">
            {dict.footer.privacy}
          </Link>
        </span>
      </label>
      {consentError && <p id="event-consent-error" role="alert" className="mt-2 text-sm text-critical">{t.consentRequired}</p>}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button
          type="button"
          onClick={register}
          disabled={
            state === "submitting" ||
            state === "cancelling" ||
            activeRegistration
          }
        >
          {state === "submitting" ? t.submitting : t.submit}
        </Button>
        {activeRegistration && (
          <Button
            type="button"
            variant="secondary"
            onClick={cancel}
            disabled={state === "cancelling"}
          >
            {state === "cancelling" ? t.cancelling : t.cancel}
          </Button>
        )}
        {state === "forbidden" && (
          <a className="text-sm text-accent underline underline-offset-4" href={`/api/auth/login?returnTo=/${locale}/events/${eventId}`}>
            {t.login}
          </a>
        )}
      </div>
      {message && <p role="status" aria-live="polite" className="mt-4 rounded-xl bg-bg p-4 text-sm text-muted">{message}</p>}
    </aside>
  );
}
