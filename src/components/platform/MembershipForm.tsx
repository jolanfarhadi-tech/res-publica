"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/Button";
import { actionStateFromResponse, type ActionState } from "./ActionStatus";

const tiers = ["basic", "supporter", "volunteer", "research", "institutional"] as const;

export function MembershipForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.platform.membership;
  const [tier, setTier] = useState<(typeof tiers)[number]>("basic");
  const [state, setState] = useState<ActionState>("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    try {
      const response = await fetch("/api/membership/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tier }),
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
    <form onSubmit={submit} className="max-w-xl rounded-2xl border border-border bg-surface p-6">
      <label htmlFor="membership-tier" className="block text-sm font-medium">{t.tierLabel}</label>
      <select id="membership-tier" value={tier} onChange={(event) => setTier(event.target.value as typeof tier)} className="mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3 text-ink">
        {tiers.map((value) => <option key={value} value={value}>{t.tiers[value]}</option>)}
      </select>
      <p className="mt-3 text-sm text-muted">{t.accountableNotice}</p>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={state === "submitting" || state === "success"}>
          {state === "submitting" ? t.submitting : t.submit}
        </Button>
        {state === "forbidden" && (
          <a className="text-sm text-accent underline underline-offset-4" href={`/api/auth/login?returnTo=/${locale}/membership`}>
            {t.login}
          </a>
        )}
      </div>
      {message && <p role="status" className="mt-4 text-sm text-muted">{message}</p>}
    </form>
  );
}
