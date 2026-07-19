"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/Button";
import { actionStateFromResponse, type ActionState } from "./ActionStatus";

export function EventRegistration({ locale, eventId, dict }: { locale: Locale; eventId: string; dict: Dictionary }) {
  const t = dict.platform.eventRegistration;
  const [state, setState] = useState<ActionState>("idle");

  async function register() {
    setState("submitting");
    try {
      const response = await fetch("/api/events/registration", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      setState(await actionStateFromResponse(response));
    } catch {
      setState("error");
    }
  }

  const message = state === "success" ? t.success
    : state === "waitlisted" ? t.waitlisted
    : state === "duplicate" ? t.duplicate
    : state === "unavailable" ? t.unavailable
    : state === "error" ? t.error
    : null;

  return (
    <aside className="mt-10 rounded-2xl border border-border bg-surface p-6" aria-labelledby="event-registration-title">
      <h2 id="event-registration-title" className="text-2xl">{t.title}</h2>
      <p className="mt-2 text-muted">{t.text}</p>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Button type="button" onClick={register} disabled={state === "submitting" || state === "success" || state === "waitlisted"}>
          {state === "submitting" ? t.submitting : t.submit}
        </Button>
        {state === "forbidden" && (
          <a className="text-sm text-accent underline underline-offset-4" href={`/api/auth/login?returnTo=/${locale}/events/${eventId}`}>
            {t.login}
          </a>
        )}
      </div>
      {message && <p role="status" className="mt-4 text-sm text-muted">{message}</p>}
    </aside>
  );
}
