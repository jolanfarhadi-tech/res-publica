"use client";

import { useEffect, useState } from "react";
import {
  memberProfileCopy,
  membershipStatusLabels,
  membershipTierLabels,
  type MemberProfileLocale,
} from "@/i18n/member-profile";
import { Button } from "@/components/ui/Button";
import {
  memberProfileStateFromResponse,
  type MemberProfileViewState,
} from "./member-profile-state";

function formatDate(value: string | null, locale: MemberProfileLocale): string {
  if (!value) return "—";
  const dateLocale = locale === "de" ? "de-DE" : locale === "fa" ? "fa-IR" : "en-GB";
  return new Intl.DateTimeFormat(dateLocale, { dateStyle: "long" }).format(new Date(value));
}

function MessageCard({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <section className="glass-panel relative overflow-hidden rounded-3xl p-7 sm:p-10" aria-labelledby="profile-message-title">
      <div className="absolute -end-12 -top-12 h-36 w-36 rounded-full border border-accent/15" aria-hidden="true" />
      <p className="civic-label">Res Publica</p>
      <h2 id="profile-message-title" className="mt-4 max-w-2xl text-3xl">{title}</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </section>
  );
}

export function MemberProfileDashboard({ locale }: { locale: MemberProfileLocale }) {
  const [state, setState] = useState<MemberProfileViewState>({ kind: "loading" });
  const copy = memberProfileCopy[locale];
  const statusLabels = membershipStatusLabels[locale];
  const tierLabels = membershipTierLabels[locale];

  useEffect(() => {
    let active = true;
    fetch("/api/membership/profile", { cache: "no-store", credentials: "same-origin" })
      .then(memberProfileStateFromResponse)
      .then((next) => active && setState(next))
      .catch(() => active && setState({ kind: "error" }));
    return () => { active = false; };
  }, []);

  if (state.kind === "loading") {
    return (
      <div className="glass-panel rounded-3xl p-8" role="status" aria-live="polite">
        <div className="h-2 w-24 animate-pulse rounded-full bg-accent/20" aria-hidden="true" />
        <p className="mt-5 text-muted">{copy.loading}</p>
      </div>
    );
  }
  if (state.kind === "anonymous") {
    return <MessageCard title={copy.loginTitle} text={copy.loginText} action={<Button href={`/api/auth/login?returnTo=/${locale}/profile`}>{copy.loginAction}</Button>} />;
  }
  if (state.kind === "unavailable") {
    return <MessageCard title={copy.unavailableTitle} text={copy.unavailableText} />;
  }
  if (state.kind === "error") {
    return <MessageCard title={copy.errorTitle} text={copy.errorText} />;
  }
  if (!state.profile.enrolled) {
    return <MessageCard title={copy.notEnrolledTitle} text={copy.notEnrolledText} action={<Button href={`/${locale}/membership`}>{copy.membershipAction}</Button>} />;
  }

  const membership = state.profile.membership;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="glass-panel rounded-3xl p-7 sm:p-9" aria-labelledby="membership-overview-title">
        <p className="civic-label">{copy.currentStatusLabel}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <h2 id="membership-overview-title" className="text-3xl">{copy.overviewTitle}</h2>
          <span className="rounded-full border border-verdigris/30 bg-verdigris/10 px-4 py-2 text-sm font-semibold text-verdigris">
            {statusLabels[membership.currentStatus]}
          </span>
        </div>
        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl bg-bg/70 p-4"><dt className="text-sm text-muted">{copy.typeLabel}</dt><dd className="mt-1 font-semibold">{tierLabels[membership.tier]}</dd></div>
          <div className="rounded-2xl bg-bg/70 p-4"><dt className="text-sm text-muted">{copy.registeredAtLabel}</dt><dd className="mt-1 font-semibold">{formatDate(membership.registeredAt, locale)}</dd></div>
        </dl>
      </section>

      <section className="glass-panel rounded-3xl p-7 sm:p-9" aria-labelledby="membership-journey-title">
        <p className="civic-label">{copy.statusChangeDateLabel}</p>
        <h2 id="membership-journey-title" className="mt-4 text-3xl">{copy.journeyTitle}</h2>
        <dl className="mt-6 grid gap-5">
          <div className="border-s-2 border-accent/25 ps-4"><dt className="text-sm text-muted">{copy.previousStatusLabel}</dt><dd className="mt-1 font-medium">{membership.previousStatus ? statusLabels[membership.previousStatus] : copy.noPreviousStatus}</dd></div>
          <div className="border-s-2 border-accent/25 ps-4"><dt className="text-sm text-muted">{copy.statusChangeDateLabel}</dt><dd className="mt-1 font-medium">{formatDate(membership.statusChangeDate, locale)}</dd></div>
          {membership.triggeringActivity && <div className="border-s-2 border-accent/25 ps-4"><dt className="text-sm text-muted">{copy.triggeringActivityLabel}</dt><dd className="mt-1 font-medium">{copy.triggeringActivityValue}</dd></div>}
        </dl>
      </section>

      <section className="glass-panel rounded-3xl p-7 sm:p-9 lg:col-span-2" aria-labelledby="next-statuses-title">
        <h2 id="next-statuses-title" className="text-3xl">{copy.nextStatusesTitle}</h2>
        {membership.nextAvailableStatuses.length ? (
          <ul className="mt-5 flex flex-wrap gap-3">
            {membership.nextAvailableStatuses.map((status) => <li key={status} className="rounded-full border border-accent/20 bg-accent/5 px-4 py-2 text-sm font-medium">{statusLabels[status]}</li>)}
          </ul>
        ) : <p className="mt-3 text-muted">{copy.noNextStatuses}</p>}
        <p className="mt-6 border-t border-border pt-5 text-sm leading-relaxed text-muted">{copy.privacyNotice}</p>
      </section>
    </div>
  );
}
