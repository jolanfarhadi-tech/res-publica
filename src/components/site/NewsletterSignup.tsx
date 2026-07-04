"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * NewsletterSignup — posts to /api/newsletter. Status messages
 * come from the server response: success, invalid email, or
 * "currently unavailable" (e.g. provider not configured).
 */
export function NewsletterSignup({ dict }: { dict: Dictionary }) {
  const t = dict.newsletter;
  const [email, setEmail] = useState("");
  const [state, setState] = useState<
    "idle" | "sending" | "success" | "invalid" | "error"
  >("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setState("invalid");
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
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-gold">
        {t.title}
      </p>
      <p className="mb-4 max-w-xs text-sm leading-relaxed text-muted">
        {t.text}
      </p>
      {state === "success" ? (
        <p role="status" className="text-sm font-medium text-accent">
          {t.success}
        </p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex max-w-xs gap-2">
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
              state === "invalid" || state === "error"
                ? "newsletter-message"
                : undefined
            }
            className="min-w-0 flex-1 rounded-full border border-border bg-bg px-4 py-2 text-sm text-ink placeholder:text-muted focus:border-accent"
          />
          <button
            type="submit"
            disabled={state === "sending"}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {t.button}
          </button>
        </form>
      )}
      {(state === "invalid" || state === "error") && (
        <p id="newsletter-message" role="status" className="mt-2 text-sm text-gold">
          {state === "invalid" ? t.invalid : t.error}
        </p>
      )}
    </div>
  );
}
