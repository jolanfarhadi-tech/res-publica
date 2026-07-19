"use client";

import { useEffect, useState } from "react";
import type { MembershipStatus, MembershipTier } from "@/modules/membership/types";
import {
  germanMemberProfileCopy as copy,
  germanMembershipStatusLabels as statusLabels,
  germanMembershipTierLabels as tierLabels,
} from "@/i18n/member-profile";
import { Button } from "@/components/ui/Button";

type ProfilePayload =
  | { enrolled: false }
  | {
      enrolled: true;
      membership: {
        memberId: string;
        tier: MembershipTier;
        currentStatus: MembershipStatus;
        registeredAt: string;
        previousStatus: MembershipStatus | null;
        statusChangeDate: string | null;
        triggeringActivity: string | null;
        nextAvailableStatuses: MembershipStatus[];
      };
    };

export type MemberProfileViewState =
  | { kind: "loading" }
  | { kind: "anonymous" }
  | { kind: "unavailable" }
  | { kind: "error" }
  | { kind: "ready"; profile: ProfilePayload };

export async function memberProfileStateFromResponse(response: Response): Promise<MemberProfileViewState> {
  if (response.status === 401) return { kind: "anonymous" };
  if (response.status === 503) return { kind: "unavailable" };
  if (!response.ok) return { kind: "error" };
  return { kind: "ready", profile: (await response.json()) as ProfilePayload };
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(value));
}

function MessageCard({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6" aria-labelledby="profile-message-title">
      <h2 id="profile-message-title" className="text-2xl">{title}</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </section>
  );
}

export function MemberProfileDashboard() {
  const [state, setState] = useState<MemberProfileViewState>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    fetch("/api/membership/profile", { cache: "no-store", credentials: "same-origin" })
      .then(memberProfileStateFromResponse)
      .then((next) => active && setState(next))
      .catch(() => active && setState({ kind: "error" }));
    return () => { active = false; };
  }, []);

  if (state.kind === "loading") {
    return <p role="status" aria-live="polite" className="text-muted">{copy.loading}</p>;
  }
  if (state.kind === "anonymous") {
    return <MessageCard title={copy.loginTitle} text={copy.loginText} action={<Button href="/api/auth/login?returnTo=/de/profile">{copy.loginAction}</Button>} />;
  }
  if (state.kind === "unavailable") {
    return <MessageCard title={copy.unavailableTitle} text={copy.unavailableText} />;
  }
  if (state.kind === "error") {
    return <MessageCard title={copy.errorTitle} text={copy.errorText} />;
  }
  if (!state.profile.enrolled) {
    return <MessageCard title={copy.notEnrolledTitle} text={copy.notEnrolledText} action={<Button href="/de/membership">{copy.membershipAction}</Button>} />;
  }

  const membership = state.profile.membership;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-border bg-surface p-6" aria-labelledby="membership-overview-title">
        <h2 id="membership-overview-title" className="text-2xl">{copy.overviewTitle}</h2>
        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          <div><dt className="text-sm text-muted">{copy.typeLabel}</dt><dd className="mt-1 font-medium">{tierLabels[membership.tier]}</dd></div>
          <div><dt className="text-sm text-muted">{copy.currentStatusLabel}</dt><dd className="mt-1 font-medium">{statusLabels[membership.currentStatus]}</dd></div>
          <div><dt className="text-sm text-muted">{copy.registeredAtLabel}</dt><dd className="mt-1">{formatDate(membership.registeredAt)}</dd></div>
        </dl>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6" aria-labelledby="membership-journey-title">
        <h2 id="membership-journey-title" className="text-2xl">{copy.journeyTitle}</h2>
        <dl className="mt-6 grid gap-5">
          <div><dt className="text-sm text-muted">{copy.previousStatusLabel}</dt><dd className="mt-1">{membership.previousStatus ? statusLabels[membership.previousStatus] : copy.noPreviousStatus}</dd></div>
          <div><dt className="text-sm text-muted">{copy.statusChangeDateLabel}</dt><dd className="mt-1">{formatDate(membership.statusChangeDate)}</dd></div>
          {membership.triggeringActivity && <div><dt className="text-sm text-muted">{copy.triggeringActivityLabel}</dt><dd className="mt-1">{copy.triggeringActivityValue}</dd></div>}
        </dl>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 lg:col-span-2" aria-labelledby="next-statuses-title">
        <h2 id="next-statuses-title" className="text-2xl">{copy.nextStatusesTitle}</h2>
        {membership.nextAvailableStatuses.length ? (
          <ul className="mt-5 flex flex-wrap gap-3">
            {membership.nextAvailableStatuses.map((status) => <li key={status} className="rounded-full border border-border px-4 py-2 text-sm">{statusLabels[status]}</li>)}
          </ul>
        ) : <p className="mt-3 text-muted">{copy.noNextStatuses}</p>}
        <p className="mt-6 border-t border-border pt-5 text-sm leading-relaxed text-muted">{copy.privacyNotice}</p>
      </section>
    </div>
  );
}
