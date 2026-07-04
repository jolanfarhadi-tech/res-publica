"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/Button";

/**
 * ContactForm — Milestone 2 delivers the accessible form UI:
 * labels tied to inputs, errors announced to screen readers,
 * and a honeypot field against simple spam bots.
 *
 * There is no backend yet — submissions show a success state
 * locally. Wiring to email/API happens in a later milestone.
 */
export function ContactForm({ dict }: { dict: Dictionary }) {
  const t = dict.contact.form;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    // Honeypot: real people never fill this hidden field.
    if (form.get("website")) return;

    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    const next: Record<string, string> = {};
    if (!name) next.name = t.errorRequired;
    if (!email) next.email = t.errorRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t.errorEmail;
    if (!message) next.message = t.errorRequired;

    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  }

  if (sent) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-border bg-surface p-8"
      >
        <h2 className="text-2xl">{t.success}</h2>
        <p className="mt-2 text-muted">{t.successText}</p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-surface px-4 py-3 text-ink " +
    "placeholder:text-muted focus:border-accent";

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-xl space-y-5">
      {/* Honeypot — visually hidden, ignored by people. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium">
          {t.name}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          className={inputClass}
        />
        {errors.name && (
          <p id="contact-name-error" className="mt-1.5 text-sm text-gold">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium">
          {t.email}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          dir="ltr"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          className={inputClass}
        />
        {errors.email && (
          <p id="contact-email-error" className="mt-1.5 text-sm text-gold">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium">
          {t.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={inputClass}
        />
        {errors.message && (
          <p id="contact-message-error" className="mt-1.5 text-sm text-gold">
            {errors.message}
          </p>
        )}
      </div>

      <Button type="submit">{t.submit}</Button>
    </form>
  );
}
