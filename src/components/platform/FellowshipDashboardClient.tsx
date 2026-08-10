"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { fellowshipCopy } from "@/i18n/fellowship";
import type { Locale } from "@/i18n/config";

type Dashboard = {
  candidacies: Array<{ id: string; sourceType: "nomination" | "application"; status: string; roleLabel: string; memberFacingReason: string | null }>;
  records: Array<{ id: string; status: string; roleLabel: string }>;
};

export function FellowshipDashboardClient({ locale }: { locale: Locale }) {
  const copy = fellowshipCopy[locale];
  const [state, setState] = useState<"loading" | "anonymous" | "unavailable" | "ready">("loading");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const statusLabel = (status: string) => status === "submitted" ? copy.statusSubmitted
    : status === "under-review" ? copy.statusUnderReview
      : status === "more-information-required" ? copy.statusMoreInformation
        : status === "approved" ? copy.statusApproved
          : status === "rejected" ? copy.statusRejected
            : status === "withdrawn" ? copy.statusWithdrawn
              : status === "active" ? copy.statusActive
                : status === "suspended" ? copy.statusSuspended : copy.statusEnded;
  useEffect(() => {
    let active = true;
    fetch(`/api/fellowship/dashboard?locale=${locale}`, { cache: "no-store", credentials: "same-origin" })
      .then(async (response) => {
        if (response.status === 401) return { kind: "anonymous" as const };
        if (!response.ok) throw new Error("unavailable");
        return { kind: "ready" as const, dashboard: await response.json() as Dashboard };
      })
      .then((result) => {
        if (!active) return;
        if (result.kind === "anonymous") setState("anonymous");
        else { setDashboard(result.dashboard); setState("ready"); }
      })
      .catch(() => active && setState("unavailable"));
    return () => { active = false; };
  }, [locale]);
  if (state === "loading") return <p className="glass-panel rounded-2xl p-6 text-muted" role="status">{copy.loading}</p>;
  if (state === "anonymous") return <div className="glass-panel rounded-2xl p-6"><p>{copy.loginRequired}</p><div className="mt-5"><Button href={`/api/auth/login?returnTo=/${locale}/dashboard/fellowship`}>{copy.signIn}</Button></div></div>;
  if (state === "unavailable" || !dashboard) return <p className="glass-panel rounded-2xl p-6 text-muted">{copy.unavailable}</p>;
  return <div className="grid gap-6 lg:grid-cols-2">
    <section className="glass-panel rounded-3xl p-7"><h2 className="text-3xl">{copy.candidaciesTitle}</h2>{dashboard.candidacies.length ? <ul className="mt-5 space-y-3">{dashboard.candidacies.map((item) => <li key={item.id} className="rounded-2xl bg-bg/70 p-4"><p className="font-semibold">{item.roleLabel}</p><p className="mt-1 text-sm text-muted">{item.sourceType === "nomination" ? copy.sourceNomination : copy.sourceApplication} · {statusLabel(item.status)}</p>{item.memberFacingReason && <p className="mt-2 text-sm">{item.memberFacingReason}</p>}</li>)}</ul> : <p className="mt-4 text-muted">{copy.noCandidacies}</p>}</section>
    <section className="glass-panel rounded-3xl p-7"><h2 className="text-3xl">{copy.recordsTitle}</h2>{dashboard.records.length ? <ul className="mt-5 space-y-3">{dashboard.records.map((item) => <li key={item.id} className="rounded-2xl bg-bg/70 p-4"><p className="font-semibold">{item.roleLabel}</p><p className="mt-1 text-sm text-muted">{statusLabel(item.status)}</p></li>)}</ul> : <p className="mt-4 text-muted">{copy.noRecords}</p>}</section>
    <p className="text-sm leading-relaxed text-muted lg:col-span-2">{copy.humanOnly}</p>
  </div>;
}
