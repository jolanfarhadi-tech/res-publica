"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { dashboardCopy } from "@/i18n/dashboard";
import type { Locale } from "@/i18n/config";
import { membershipStatusLabels } from "@/i18n/member-profile";
import {
  dashboardStateFromResponse,
  type DashboardViewState,
} from "./dashboard-state";

function formatDate(value: Date | string, locale: Locale): string {
  const dateLocale =
    locale === "de" ? "de-DE" : locale === "fa" ? "fa-IR" : "en-GB";
  return new Intl.DateTimeFormat(dateLocale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StateMessage({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="glass-panel rounded-3xl p-7 sm:p-10">
      <p className="civic-label">Res Publica</p>
      <h2 className="mt-4 text-3xl">{title}</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </section>
  );
}

export function DashboardClient({ locale }: { locale: Locale }) {
  const [state, setState] = useState<DashboardViewState>({ kind: "loading" });
  const copy = dashboardCopy[locale];

  useEffect(() => {
    let active = true;
    fetch("/api/dashboard", {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then(dashboardStateFromResponse)
      .then((next) => active && setState(next))
      .catch(() => active && setState({ kind: "error" }));
    return () => {
      active = false;
    };
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
    return (
      <StateMessage
        title={copy.loginTitle}
        text={copy.loginText}
        action={
          <Button href={`/api/auth/login?returnTo=/${locale}/dashboard`}>
            {copy.loginAction}
          </Button>
        }
      />
    );
  }
  if (state.kind === "unavailable") {
    return <StateMessage title={copy.unavailableTitle} text={copy.unavailableText} />;
  }
  if (state.kind === "error") {
    return <StateMessage title={copy.errorTitle} text={copy.errorText} />;
  }

  const dashboard = state.dashboard;
  const assurance =
    dashboard.account.assurance === "recent-mfa"
      ? copy.assuranceRecentMfa
      : dashboard.account.assurance === "mfa"
        ? copy.assuranceMfa
        : copy.assuranceVerified;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="glass-panel rounded-3xl p-7 sm:p-9" aria-labelledby="dashboard-account">
        <p className="civic-label">{copy.accountAuthenticated}</p>
        <h2 id="dashboard-account" className="mt-4 text-3xl">{copy.accountTitle}</h2>
        <dl className="mt-6 grid gap-4">
          <div className="rounded-2xl bg-bg/70 p-4">
            <dt className="text-sm text-muted">{copy.assuranceLabel}</dt>
            <dd className="mt-1 font-semibold">{assurance}</dd>
          </div>
          <div className="rounded-2xl bg-bg/70 p-4">
            <dt className="text-sm text-muted">{copy.authenticatedAtLabel}</dt>
            <dd className="mt-1 font-semibold">
              {formatDate(dashboard.account.authenticatedAt, locale)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="glass-panel rounded-3xl p-7 sm:p-9" aria-labelledby="dashboard-membership">
        <p className="civic-label">
          {dashboard.membership.enrolled
            ? copy.membershipActive
            : copy.membershipMissing}
        </p>
        <h2 id="dashboard-membership" className="mt-4 text-3xl">{copy.membershipTitle}</h2>
        {dashboard.membership.enrolled && (
          <p className="mt-4 font-semibold text-verdigris">
            {
              membershipStatusLabels[locale][
                dashboard.membership.membership.currentStatus
              ]
            }
          </p>
        )}
      </section>

      <section className="glass-panel rounded-3xl p-7 sm:p-9" aria-labelledby="dashboard-consent">
        <h2 id="dashboard-consent" className="text-3xl">{copy.consentTitle}</h2>
        {dashboard.consents.length ? (
          <ul className="mt-5 space-y-3">
            {dashboard.consents.map((consent) => {
              const label = consent.purpose.includes("data-protection")
                ? copy.consentDataProtection
                : consent.purpose.includes("programme-participation")
                  ? copy.consentProgramme
                  : copy.consentOther;
              return (
                <li key={consent.id} className="rounded-2xl bg-bg/70 p-4">
                  <p className="font-semibold">{label}</p>
                  <p className="mt-1 text-sm text-muted">
                    {consent.revokedAt
                      ? copy.consentRevoked
                      : copy.consentGranted}{" "}
                    · {formatDate(consent.revokedAt ?? consent.grantedAt, locale)}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 text-muted">{copy.consentEmpty}</p>
        )}
        <p className="mt-5 border-t border-border pt-4 text-sm leading-relaxed text-muted">
          {copy.consentReadOnly}
        </p>
      </section>

      <section className="glass-panel rounded-3xl p-7 sm:p-9" aria-labelledby="dashboard-events">
        <h2 id="dashboard-events" className="text-3xl">{copy.eventsTitle}</h2>
        {dashboard.eventRegistrations.length ? (
          <ul className="mt-5 space-y-3">
            {dashboard.eventRegistrations.map((registration) => (
              <li key={registration.id} className="rounded-2xl bg-bg/70 p-4">
                <p className="font-semibold">{registration.title}</p>
                <p className="mt-1 text-sm text-muted">
                  {formatDate(registration.startTime, locale)} ·{" "}
                  {registration.status === "confirmed"
                    ? copy.eventConfirmed
                    : registration.status === "waitlisted"
                      ? copy.eventWaitlisted
                      : copy.eventCancelled}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-muted">{copy.eventsEmpty}</p>
        )}
      </section>

      <section className="glass-panel rounded-3xl p-7 sm:p-9 lg:col-span-2" aria-labelledby="dashboard-actions">
        <h2 id="dashboard-actions" className="text-3xl">{copy.actionsTitle}</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {dashboard.permittedActions.viewProfile && (
            <Button href={`/${locale}/profile`} variant="secondary">
              {copy.profileAction}
            </Button>
          )}
          {dashboard.permittedActions.applyForMembership && (
            <Button href={`/${locale}/membership`} variant="secondary">
              {copy.membershipAction}
            </Button>
          )}
          {dashboard.permittedActions.registerForEvents && (
            <Button href={`/${locale}/events`} variant="secondary">
              {copy.eventsAction}
            </Button>
          )}
        </div>
      </section>

      <section className="glass-panel rounded-3xl p-7 sm:p-9 lg:col-span-2" aria-labelledby="dashboard-notifications">
        <h2 id="dashboard-notifications" className="text-3xl">{copy.notificationsTitle}</h2>
        {dashboard.notifications.length ? (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {dashboard.notifications.map((notification) => (
              <li key={notification.id} className="rounded-2xl bg-bg/70 p-4">
                <p className="font-semibold">
                  {notification.template === "waitlist-promoted"
                    ? copy.notificationWaitlist
                    : notification.template === "event-outcome-published"
                      ? copy.notificationOutcome
                      : copy.notificationGeneric}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {notification.status === "pending"
                    ? copy.notificationPending
                    : notification.status === "sent"
                      ? copy.notificationSent
                      : copy.notificationFailed}{" "}
                  · {formatDate(notification.createdAt, locale)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-muted">{copy.notificationsEmpty}</p>
        )}
        <p className="mt-6 border-t border-border pt-5 text-sm leading-relaxed text-muted">
          {copy.privacyNotice}
        </p>
      </section>
    </div>
  );
}
