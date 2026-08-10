"use client";

import { useEffect, useState } from "react";
import { fellowshipCopy } from "@/i18n/fellowship";
import type { Locale } from "@/i18n/config";

type Overview = {
  roleScopes: Array<{ id: string; slug: string; state: string }>;
  candidacies: Array<{ id: string; candidateName: string; sourceType: "nomination" | "application"; status: string }>;
  assignments: Array<{ id: string; candidacyId: string; reviewerPersonId: string; status: string }>;
  records: Array<{ id: string; personId: string; status: string }>;
};

export function FellowshipOperationsClient({ locale }: { locale: Locale }) {
  const copy = fellowshipCopy[locale];
  const [overview, setOverview] = useState<Overview | null>(null);
  const [state, setState] = useState<"loading" | "denied" | "unavailable" | "ready">("loading");
  useEffect(() => {
    let active = true;
    fetch("/api/fellowship/operations/candidacies", { cache: "no-store", credentials: "same-origin" })
      .then(async (response) => {
        if (response.status === 401 || response.status === 403) return { kind: "denied" as const };
        if (!response.ok) throw new Error("unavailable");
        return { kind: "ready" as const, overview: await response.json() as Overview };
      })
      .then((result) => {
        if (!active) return;
        if (result.kind === "denied") setState("denied");
        else { setOverview(result.overview); setState("ready"); }
      })
      .catch(() => active && setState("unavailable"));
    return () => { active = false; };
  }, []);
  if (state === "loading") return <p className="glass-panel rounded-2xl p-6 text-muted" role="status">{copy.loading}</p>;
  if (state === "denied") return <p className="glass-panel rounded-2xl p-6 text-muted">{copy.operationsDenied}</p>;
  if (state === "unavailable" || !overview) return <p className="glass-panel rounded-2xl p-6 text-muted">{copy.unavailable}</p>;
  return <div className="grid gap-6 lg:grid-cols-2">
    <section className="glass-panel rounded-3xl p-6"><h2 className="text-2xl">{copy.rolesTitle}</h2><ul className="mt-4 space-y-3">{overview.roleScopes.map((role) => <li key={role.id} className="rounded-xl bg-bg/70 p-3"><p className="font-semibold">{role.slug}</p><p className="text-sm text-muted">{role.state}</p></li>)}</ul></section>
    <section className="glass-panel rounded-3xl p-6"><h2 className="text-2xl">{copy.candidaciesTitle}</h2><ul className="mt-4 space-y-3">{overview.candidacies.map((item) => <li key={item.id} className="rounded-xl bg-bg/70 p-3"><p className="font-semibold">{item.candidateName}</p><p className="text-sm text-muted">{item.sourceType === "nomination" ? copy.sourceNomination : copy.sourceApplication} · {item.status}</p></li>)}</ul></section>
    <section className="glass-panel rounded-3xl p-6"><h2 className="text-2xl">{copy.assignmentsTitle}</h2><p className="mt-4 text-4xl">{overview.assignments.length}</p></section>
    <section className="glass-panel rounded-3xl p-6"><h2 className="text-2xl">{copy.fellowshipsTitle}</h2><p className="mt-4 text-4xl">{overview.records.length}</p></section>
    <p className="text-sm leading-relaxed text-muted lg:col-span-2">{copy.humanOnly}</p>
  </div>;
}
