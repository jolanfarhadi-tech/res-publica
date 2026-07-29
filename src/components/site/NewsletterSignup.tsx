"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * NewsletterSignup — posts to /api/newsletter. Status messages
 * come from the server response: success, invalid email, or
 * "currently unavailable" (e.g. provider not configured).
 */
export function NewsletterSignup({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.newsletter;
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<
    "idle" | "sending" | "success" | "invalid" | "consent" | "error"
  >("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setState("invalid");
      return;
    }
    if (!consent) {
      setState("consent");
      return;
    }

    setState("sending");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (response.ok) {
        setState("success");
        setEmail("");
      } else if (response.status === 400) {
        setState("invalid");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  return (
    <div>
      <p className="civic-label mb-4 text-signal">
        {t.title}
      </p>
      <p className="mb-4 max-w-xs text-sm leading-relaxed text-paper/58">
        {t.text}
      </p>
      {state === "success" ? (
          <p role="status" className="text-sm font-medium text-signal">
          {t.success}
        </p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="grid max-w-md gap-3">
          <label htmlFor="newsletter-email" className="sr-only">
            {t.placeholder}
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t.placeholder}
            autoComplete="email"
            dir="ltr"
            required
            aria-invalid={state === "invalid"}
            aria-describedby={
              state === "invalid" || state === "consent" || state === "error"
                ? "newsletter-message"
                : undefined
            }
            className="min-h-11 min-w-0 rounded-xl border border-paper/22 bg-paper/8 px-4 py-2 text-sm text-paper placeholder:text-paper/42 focus:border-signal"
          />
          <label className="grid cursor-pointer grid-cols-[auto_1fr] gap-2 text-xs leading-relaxed text-paper/62">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => {
                setConsent(event.target.checked);
                if (event.target.checked && state === "consent") setState("idle");
              }}
              aria-invalid={state === "consent"}
              aria-describedby={state === "consent" ? "newsletter-message" : undefined}
              className="mt-0.5 h-4 w-4 accent-signal"
            />
            <span>
              {t.consent}{" "}
              <Link href={`/${locale}/datenschutz`} className="font-semibold text-paper underline underline-offset-4">
                {dict.footer.privacy}
              </Link>
            </span>
          </label>
          <button
            type="submit"
            disabled={state === "sending"}
            className="button-primary w-fit border-paper bg-paper text-night hover:bg-signal disabled:opacity-60"
          >
            {t.submit}
          </button>
        </form>
      )}
      {(state === "invalid" || state === "consent" || state === "error") && (
        <p id="newsletter-message" role="status" className="mt-2 text-sm text-signal">
          {state === "invalid"
            ? t.errorInvalid
            : state === "consent"
              ? t.consentRequired
              : t.errorServer}
        </p>
      )}
    </div>
  );
}
