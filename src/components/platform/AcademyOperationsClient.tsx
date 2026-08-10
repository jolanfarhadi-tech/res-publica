"use client";

import { useEffect, useState } from "react";
import { academyCopy } from "@/i18n/academy";
import type { Locale } from "@/i18n/config";

type Overview = {
  courses: Array<{ id: string; slug: string; state: string; enrollmentPolicy: string; version: number }>;
  enrollmentApplications: Array<{ id: string; courseId: string; status: string }>;
  assessmentSubmissions: Array<{ id: string; assessmentId: string; status: string }>;
};

export function AcademyOperationsClient({ locale }: { locale: Locale }) {
  const copy = academyCopy[locale];
  const [overview, setOverview] = useState<Overview | null>(null);
  const [state, setState] = useState<"loading" | "denied" | "unavailable" | "ready">("loading");
  const stateLabel = (state: string) => state === "draft" ? copy.stateDraft
    : state === "review" ? copy.stateReview
      : state === "approved" ? copy.stateApproved
        : state === "published" ? copy.statePublished
          : copy.stateArchived;
  useEffect(() => {
    let active = true;
    fetch("/api/academy/operations/courses", { cache: "no-store", credentials: "same-origin" })
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
  return <div className="grid gap-6 lg:grid-cols-3">
    <section className="glass-panel rounded-3xl p-6"><h2 className="text-2xl">{copy.coursesTitle}</h2><ul className="mt-4 space-y-3">{overview.courses.map((course) => <li key={course.id} className="rounded-xl bg-bg/70 p-3"><p className="font-semibold">{course.slug}</p><p className="text-sm text-muted">{copy.lifecycle}: {stateLabel(course.state)}</p></li>)}</ul></section>
    <section className="glass-panel rounded-3xl p-6"><h2 className="text-2xl">{copy.policyApplication}</h2><p className="mt-4 text-4xl">{overview.enrollmentApplications.length}</p></section>
    <section className="glass-panel rounded-3xl p-6"><h2 className="text-2xl">{copy.assessmentsTitle}</h2><p className="mt-4 text-4xl">{overview.assessmentSubmissions.length}</p></section>
  </div>;
}
