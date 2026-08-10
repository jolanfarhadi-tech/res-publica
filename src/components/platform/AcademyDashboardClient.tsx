"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { academyCopy } from "@/i18n/academy";
import type { Locale } from "@/i18n/config";

type Dashboard = {
  enrollments: Array<{ id: string; courseSlug: string; courseTitle: string; status: string; enrolledAt: string }>;
  applications: Array<{ id: string; courseId: string; status: string; submittedAt: string }>;
};

export function AcademyDashboardClient({ locale }: { locale: Locale }) {
  const copy = academyCopy[locale];
  const [state, setState] = useState<"loading" | "anonymous" | "unavailable" | "ready">("loading");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const statusLabel = (status: string) => status === "pending" ? copy.statusPending
    : status === "approved" ? copy.statusApproved
      : status === "rejected" ? copy.statusRejected
        : status === "enrolled" ? copy.statusEnrolled
          : status === "in-progress" ? copy.statusInProgress
            : status === "completed" ? copy.statusCompleted
              : copy.statusWithdrawn;
  useEffect(() => {
    let active = true;
    fetch(`/api/academy/enrollments?locale=${locale}`, { cache: "no-store", credentials: "same-origin" })
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
  if (state === "anonymous") return <div className="glass-panel rounded-2xl p-6"><p>{copy.loginRequired}</p><div className="mt-5"><Button href={`/api/auth/login?returnTo=/${locale}/dashboard/academy`}>{copy.signIn}</Button></div></div>;
  if (state === "unavailable" || !dashboard) return <p className="glass-panel rounded-2xl p-6 text-muted">{copy.unavailable}</p>;
  return <div className="grid gap-6 lg:grid-cols-2">
    <section className="glass-panel rounded-3xl p-7"><h2 className="text-3xl">{copy.coursesTitle}</h2>{dashboard.enrollments.length ? <ul className="mt-5 space-y-3">{dashboard.enrollments.map((item) => <li key={item.id} className="rounded-2xl bg-bg/70 p-4"><a className="font-semibold text-accent" href={`/${locale}/academy/courses/${item.courseSlug}`}>{item.courseTitle}</a><p className="mt-1 text-sm text-muted">{statusLabel(item.status)}</p></li>)}</ul> : <p className="mt-4 text-muted">{copy.noEnrollments}</p>}</section>
    <section className="glass-panel rounded-3xl p-7"><h2 className="text-3xl">{copy.policyApplication}</h2>{dashboard.applications.length ? <ul className="mt-5 space-y-3">{dashboard.applications.map((item) => <li key={item.id} className="rounded-2xl bg-bg/70 p-4"><p className="font-semibold">{statusLabel(item.status)}</p></li>)}</ul> : <p className="mt-4 text-muted">{copy.noApplications}</p>}</section>
    <p className="text-sm leading-relaxed text-muted lg:col-span-2">{copy.nonAccredited}</p>
  </div>;
}
