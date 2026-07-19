"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { germanMemberProfileCopy } from "@/i18n/member-profile";

type SessionState = "loading" | "anonymous" | "authenticated" | "unavailable";

export function AccountControl({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [state, setState] = useState<SessionState>("loading");
  const [busy, setBusy] = useState(false);
  const t = dict.account;

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) => response.json() as Promise<{ authenticated: boolean; available: boolean }>)
      .then((session) => {
        if (!active) return;
        setState(!session.available ? "unavailable" : session.authenticated ? "authenticated" : "anonymous");
      })
      .catch(() => active && setState("unavailable"));
    return () => { active = false; };
  }, []);

  async function logout() {
    setBusy(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        setState("anonymous");
        window.location.assign(`/${locale}`);
        return;
      }
    } finally {
      setBusy(false);
    }
  }

  const classes = "inline-flex h-9 items-center justify-center rounded-full border border-border px-3 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-wait disabled:opacity-60";

  if (state === "loading") return <span className="h-9 w-16 animate-pulse rounded-full bg-border" aria-label={t.loading} />;
  if (state === "unavailable") return null;
  if (state === "authenticated") {
    return (
      <div className="flex items-center gap-2">
        {locale === "de" && <a className={classes} href="/de/profile">{germanMemberProfileCopy.profileLink}</a>}
        <button type="button" className={classes} onClick={logout} disabled={busy}>{busy ? t.loggingOut : t.logout}</button>
      </div>
    );
  }
  return <a className={classes} href={`/api/auth/login?returnTo=/${locale}`}>{t.login}</a>;
}
