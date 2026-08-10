"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { fellowshipCopy } from "@/i18n/fellowship";
import type { Locale } from "@/i18n/config";

type RoleScope = { id: string; label: string; responsibilities: string[] };

export function FellowshipApplicationClient({ locale, enabled }: { locale: Locale; enabled: boolean }) {
  const copy = fellowshipCopy[locale];
  const [roles, setRoles] = useState<RoleScope[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "submitting" | "success" | "error">("loading");

  useEffect(() => {
    let active = true;
    fetch(`/api/fellowship/role-scopes?locale=${locale}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("unavailable");
        return response.json() as Promise<RoleScope[]>;
      })
      .then((data) => { if (active) { setRoles(data); setState("ready"); } })
      .catch(() => active && setState("error"));
    return () => { active = false; };
  }, [locale]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState("submitting");
    const response = await fetch("/api/fellowship/applications", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        roleScopeId: form.get("roleScopeId"),
        rationale: form.get("rationale"),
        evidence: [{
          kind: "contribution",
          sourceRef: form.get("sourceRef"),
          description: form.get("description"),
        }],
      }),
    });
    setState(response.ok ? "success" : "error");
  }

  if (!enabled) return <p className="glass-panel rounded-2xl p-6 text-muted">{copy.applicationClosed}</p>;
  if (state === "loading") return <p className="glass-panel rounded-2xl p-6 text-muted" role="status">{copy.loading}</p>;
  if (state === "success") return <p className="glass-panel rounded-2xl p-6 text-verdigris" role="status">{copy.applicationSubmitted}</p>;
  if (!roles.length) return <p className="glass-panel rounded-2xl p-6 text-muted">{state === "error" ? copy.unavailable : copy.applicationClosed}</p>;

  return <form className="glass-panel grid gap-5 rounded-3xl p-7" onSubmit={submit} aria-describedby="fellowship-application-note">
    <div>
      <label className="font-semibold" htmlFor="fellowship-role">{copy.roleLabel}</label>
      <select id="fellowship-role" name="roleScopeId" required className="mt-2 w-full rounded-xl border border-border bg-bg p-3">
        {roles.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
      </select>
    </div>
    <div>
      <label className="font-semibold" htmlFor="fellowship-rationale">{copy.rationaleLabel}</label>
      <textarea id="fellowship-rationale" name="rationale" required maxLength={4000} rows={5} className="mt-2 w-full rounded-xl border border-border bg-bg p-3" />
    </div>
    <div>
      <label className="font-semibold" htmlFor="fellowship-source">{copy.evidenceSourceLabel}</label>
      <input id="fellowship-source" name="sourceRef" required maxLength={500} className="mt-2 w-full rounded-xl border border-border bg-bg p-3" />
    </div>
    <div>
      <label className="font-semibold" htmlFor="fellowship-description">{copy.evidenceDescriptionLabel}</label>
      <textarea id="fellowship-description" name="description" required maxLength={2000} rows={4} className="mt-2 w-full rounded-xl border border-border bg-bg p-3" />
    </div>
    <p id="fellowship-application-note" className="text-sm leading-relaxed text-muted">{copy.applicationLede}</p>
    {state === "error" && <p className="text-sm text-red-700" role="alert">{copy.applicationError}</p>}
    <Button type="submit" disabled={state === "submitting"}>{copy.submitApplication}</Button>
  </form>;
}
