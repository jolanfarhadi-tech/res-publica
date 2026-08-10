"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { academyCopy } from "@/i18n/academy";
import type { Locale } from "@/i18n/config";

type Course = {
  id: string;
  slug: string;
  enrollmentPolicy: "public" | "member-only" | "invitation" | "application";
  title: string;
  summary: string;
  description: string;
  learningOutcomes: string[];
  sourceRefs: string[];
  publishedAt: string;
};
type Program = { id: string; slug: string; title: string; summary: string; body: string; sourceRefs: string[] };
type Cohort = {
  id: string; courseId: string; startsAt: string; endsAt: string;
  enrollmentOpensAt: string; enrollmentClosesAt: string; capacity: number; status: string;
};
type Catalog = {
  courses: Course[];
  programs: Program[];
  cohorts: Cohort[];
  instructors: Array<{ courseId: string; name: string; role: string }>;
  modules: Array<{ id: string; courseId: string; position: number; required: boolean; title: string; summary: string }>;
  lessons: Array<{ id: string; moduleId: string; position: number; required: boolean; title: string; content: string; sourceRefs: string[] }>;
  resources: Array<{ id: string; lessonId: string; kind: string; uri: string; label: string; accessibilityLabel: string; position: number }>;
  assessments: Array<{ id: string; courseId: string; moduleId: string | null; required: boolean; title: string; prompt: string }>;
};

function policyLabel(course: Course, locale: Locale) {
  const copy = academyCopy[locale];
  return course.enrollmentPolicy === "member-only" ? copy.policyMember
    : course.enrollmentPolicy === "invitation" ? copy.policyInvitation
      : course.enrollmentPolicy === "application" ? copy.policyApplication
        : copy.policyPublic;
}

export function AcademyCatalogClient({
  locale,
  view,
  slug,
  enrollmentEnabled = false,
}: {
  locale: Locale;
  view: "courses" | "programs" | "course" | "program";
  slug?: string;
  enrollmentEnabled?: boolean;
}) {
  const copy = academyCopy[locale];
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [applicationStatement, setApplicationStatement] = useState("");
  const [actionStatus, setActionStatus] = useState<"idle" | "busy" | "success" | "error">("idle");

  useEffect(() => {
    let active = true;
    fetch(`/api/academy/catalog?locale=${locale}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("catalog_unavailable");
        return response.json() as Promise<Catalog>;
      })
      .then((result) => active && setCatalog(result))
      .catch(() => active && setUnavailable(true));
    return () => { active = false; };
  }, [locale]);

  const course = useMemo(() => catalog?.courses.find((item) => item.slug === slug), [catalog, slug]);
  const program = useMemo(() => catalog?.programs.find((item) => item.slug === slug), [catalog, slug]);
  const cohort = useMemo(() => catalog?.cohorts.find((item) => item.courseId === course?.id), [catalog, course]);
  const instructors = useMemo(() => catalog?.instructors.filter((item) => item.courseId === course?.id) ?? [], [catalog, course]);
  const courseModules = useMemo(() => catalog?.modules.filter((item) => item.courseId === course?.id) ?? [], [catalog, course]);
  const courseAssessments = useMemo(() => catalog?.assessments.filter((item) => item.courseId === course?.id) ?? [], [catalog, course]);

  if (unavailable) return <p className="glass-panel rounded-2xl p-6 text-muted" role="status">{copy.unavailable}</p>;
  if (!catalog) return <p className="glass-panel rounded-2xl p-6 text-muted" role="status">{copy.loading}</p>;

  if (view === "courses") {
    if (!catalog.courses.length) return <p className="glass-panel rounded-2xl p-6 text-muted">{copy.noCourses}</p>;
    return <div className="grid gap-5 md:grid-cols-2">{catalog.courses.map((item) => (
      <article key={item.id} className="glass-panel rounded-2xl p-6">
        <p className="civic-label">{policyLabel(item, locale)}</p>
        <h2 className="mt-3 text-3xl">{item.title}</h2>
        <p className="mt-4 leading-relaxed text-muted">{item.summary}</p>
        <div className="mt-6"><Button href={`/${locale}/academy/courses/${item.slug}`} variant="secondary">{copy.coursesAction}</Button></div>
      </article>
    ))}</div>;
  }

  if (view === "programs") {
    if (!catalog.programs.length) return <p className="glass-panel rounded-2xl p-6 text-muted">{copy.noPrograms}</p>;
    return <div className="grid gap-5 md:grid-cols-2">{catalog.programs.map((item) => (
      <article key={item.id} className="glass-panel rounded-2xl p-6">
        <h2 className="text-3xl">{item.title}</h2>
        <p className="mt-4 leading-relaxed text-muted">{item.summary}</p>
        <div className="mt-6"><Button href={`/${locale}/academy/programs/${item.slug}`} variant="secondary">{copy.programsTitle}</Button></div>
      </article>
    ))}</div>;
  }

  if (view === "program") {
    if (!program) return <p className="glass-panel rounded-2xl p-6 text-muted">{copy.noPrograms}</p>;
    return <article className="glass-panel rounded-3xl p-7 sm:p-10">
      <h2 className="text-4xl">{program.title}</h2>
      <p className="mt-5 leading-relaxed text-muted">{program.body}</p>
      <h3 className="mt-8 text-xl">{copy.sources}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted">{program.sourceRefs.map((source) => <li key={source}>{source}</li>)}</ul>
    </article>;
  }

  if (!course) return <p className="glass-panel rounded-2xl p-6 text-muted">{copy.noCourses}</p>;

  async function enroll() {
    if (!course || !cohort) return;
    setActionStatus("busy");
    const response = await fetch("/api/academy/enrollments", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        courseId: course.id,
        cohortId: cohort.id,
        ...(course.enrollmentPolicy === "application" ? { applicationStatement } : {}),
      }),
    }).catch(() => null);
    setActionStatus(response?.ok ? "success" : "error");
  }

  const dateLocale = locale === "de" ? "de-DE" : locale === "fa" ? "fa-IR" : "en-GB";
  return <article className="grid gap-6 lg:grid-cols-[1fr_20rem]">
    <div className="glass-panel rounded-3xl p-7 sm:p-10">
      <p className="civic-label">{policyLabel(course, locale)}</p>
      <h2 className="mt-4 text-4xl">{course.title}</h2>
      <p className="mt-5 leading-relaxed text-muted">{course.description}</p>
      <h3 className="mt-8 text-2xl">{copy.outcomes}</h3>
      <ul className="mt-4 list-disc space-y-2 ps-6 text-muted">{course.learningOutcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
      <h3 className="mt-8 text-2xl">{copy.curriculum}</h3>
      <ol className="mt-4 space-y-5">{courseModules.map((moduleItem) => {
        const moduleLessons = catalog.lessons.filter((lesson) => lesson.moduleId === moduleItem.id);
        return <li key={moduleItem.id} className="rounded-2xl bg-bg/70 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2"><h4 className="text-xl">{moduleItem.title}</h4>{moduleItem.required && <span className="civic-label">{copy.required}</span>}</div>
          <p className="mt-2 text-muted">{moduleItem.summary}</p>
          <ol className="mt-4 space-y-3">{moduleLessons.map((lesson) => <li key={lesson.id} className="border-s-2 border-accent/30 ps-4"><p className="font-semibold">{lesson.title}</p><p className="mt-1 text-sm leading-relaxed text-muted">{lesson.content}</p>{catalog.resources.filter((resource) => resource.lessonId === lesson.id).map((resource) => <a key={resource.id} className="mt-2 block text-sm text-accent underline" href={resource.uri} aria-label={resource.accessibilityLabel}>{resource.label}</a>)}</li>)}</ol>
        </li>;
      })}</ol>
      {courseAssessments.length > 0 && <><h3 className="mt-8 text-2xl">{copy.assessmentsTitle}</h3><ul className="mt-4 space-y-3">{courseAssessments.map((assessment) => <li key={assessment.id} className="rounded-2xl bg-bg/70 p-4"><p className="font-semibold">{assessment.title}</p><p className="mt-2 text-sm text-muted">{assessment.prompt}</p></li>)}</ul></>}
      <h3 className="mt-8 text-xl">{copy.sources}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted">{course.sourceRefs.map((source) => <li key={source}>{source}</li>)}</ul>
      {instructors.length > 0 && <><h3 className="mt-8 text-xl">{copy.instructors}</h3><ul className="mt-3 space-y-2 text-muted">{instructors.map((instructor) => <li key={`${instructor.name}-${instructor.role}`}>{instructor.name}</li>)}</ul></>}
    </div>
    <aside className="glass-panel h-fit rounded-3xl p-6">
      <h3 className="text-xl">{copy.enrollmentPolicy}</h3>
      <p className="mt-3 text-muted">{policyLabel(course, locale)}</p>
      {cohort && <p className="mt-4 text-sm text-muted">{copy.cohort}: {new Intl.DateTimeFormat(dateLocale, { dateStyle: "medium" }).format(new Date(cohort.startsAt))}</p>}
      {course.enrollmentPolicy === "application" && enrollmentEnabled && (
        <label className="mt-5 block text-sm font-semibold">
          {copy.policyApplication}
          <textarea value={applicationStatement} onChange={(event) => setApplicationStatement(event.target.value)} className="mt-2 min-h-28 w-full rounded-xl border border-border bg-surface p-3" required />
        </label>
      )}
      <div className="mt-6">
        {enrollmentEnabled && cohort ? (
          <Button onClick={enroll} disabled={actionStatus === "busy" || (course.enrollmentPolicy === "application" && !applicationStatement.trim())}>{copy.enroll}</Button>
        ) : <p className="text-sm text-muted">{copy.enrollmentClosed}</p>}
      </div>
      {actionStatus === "success" && <p className="mt-4 text-sm text-verdigris" role="status">{course.enrollmentPolicy === "application" ? copy.applicationSuccess : copy.enrollmentSuccess}</p>}
      {actionStatus === "error" && <p className="mt-4 text-sm text-danger" role="alert">{copy.unavailable}</p>}
      <div className="mt-5"><Button href={`/api/auth/login?returnTo=/${locale}/academy/courses/${course.slug}`} variant="ghost">{copy.signIn}</Button></div>
    </aside>
  </article>;
}
