"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/i18n/config";
import { operationsCopy } from "@/i18n/operations";
import {
  operationsStateFromResponse,
  type OperationsMembershipDetail,
  type OperationsViewState,
  type PublishingWorkspacePayload,
} from "./operations-state";
import { PublishingWorkflowControls } from "./PublishingWorkflowControls";

type Decision = "approved" | "rejected";
type DetailState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "ready"; detail: OperationsMembershipDetail };
type PublishingState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "ready"; workspace: PublishingWorkspacePayload };

function formatDate(value: Date | string | null, locale: Locale) {
  if (!value) return "—";
  const dateLocale =
    locale === "de" ? "de-DE" : locale === "fa" ? "fa-IR" : "en-GB";
  return new Intl.DateTimeFormat(dateLocale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatePanel({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-7 sm:p-9">
      <p className="civic-label">Res Publica</p>
      <h2 className="mt-3 text-3xl">{title}</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">{text}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  );
}

function MembershipDetail({
  locale,
  state,
  onClose,
  onDecided,
}: {
  locale: Locale;
  state: DetailState;
  onClose: () => void;
  onDecided: () => Promise<void>;
}) {
  const copy = operationsCopy[locale];
  const [confirmation, setConfirmation] = useState<Decision | null>(null);
  const [decisionState, setDecisionState] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");

  if (state.kind === "loading") {
    return <p role="status" className="text-muted">{copy.detailLoading}</p>;
  }
  if (state.kind === "error") {
    return <p role="alert" className="text-critical">{copy.detailError}</p>;
  }
  if (state.kind !== "ready") return null;

  const { detail } = state;
  const application = detail.application;
  const submitDecision = async () => {
    if (!confirmation) return;
    setDecisionState("pending");
    const response = await fetch(
      `/api/membership/applications/${encodeURIComponent(application.id)}/decision`,
      {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ decision: confirmation }),
      }
    ).catch(() => null);
    if (!response?.ok) {
      setDecisionState("error");
      return;
    }
    setDecisionState("success");
    setConfirmation(null);
    await onDecided();
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="civic-label">{copy.exactAuthority}</p>
          <h3 className="mt-2 text-2xl">
            {application.givenName} {application.familyName}
          </h3>
          <p className="mt-2 text-sm text-muted">
            {copy.status}: {copy.statuses[application.status]}
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={onClose}>
          {copy.cancel}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="operations-contact">
          <h4 id="operations-contact" className="text-xl">{copy.contactTitle}</h4>
          <p className="mt-3 break-all text-sm">{application.email}</p>
        </section>
        <section aria-labelledby="operations-address">
          <h4 id="operations-address" className="text-xl">{copy.addressTitle}</h4>
          <address className="mt-3 text-sm not-italic leading-relaxed">
            {application.address.line1}
            {application.address.line2 ? <><br />{application.address.line2}</> : null}
            <br />
            {application.address.postalCode} {application.address.city}
            <br />
            {application.address.countryCode}
          </address>
        </section>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{copy.requestedTier}</dt>
          <dd className="mt-2 font-semibold">{copy.tiers[application.requestedTier]}</dd>
        </div>
        <div className="rounded-xl border border-border p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{copy.submittedAt}</dt>
          <dd className="mt-2 font-semibold">{formatDate(application.submittedAt, locale)}</dd>
        </div>
        <div className="rounded-xl border border-border p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{copy.assignedAt}</dt>
          <dd className="mt-2 font-semibold">{formatDate(detail.authority.assignedAt, locale)}</dd>
        </div>
        <div className="rounded-xl border border-border p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{copy.validUntil}</dt>
          <dd className="mt-2 font-semibold">
            {detail.authority.validUntil
              ? formatDate(detail.authority.validUntil, locale)
              : copy.unlimited}
          </dd>
        </div>
      </dl>

      <section aria-labelledby="operations-acknowledgements">
        <h4 id="operations-acknowledgements" className="text-xl">{copy.acknowledgementsTitle}</h4>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {detail.acknowledgements.map((acknowledgement) => (
            <li key={acknowledgement.documentType} className="grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:gap-6">
              <div>
                <p className="font-semibold">{copy.documents[acknowledgement.documentType]}</p>
                <p className="mt-1 break-all text-sm text-muted">{acknowledgement.documentVersion}</p>
              </div>
              <time className="text-sm text-muted" dateTime={new Date(acknowledgement.acknowledgedAt).toISOString()}>
                {formatDate(acknowledgement.acknowledgedAt, locale)}
              </time>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="operations-decision-history">
        <h4 id="operations-decision-history" className="text-xl">{copy.decisionHistoryTitle}</h4>
        {detail.decisionHistory.length ? (
          <ul className="mt-4 space-y-3">
            {detail.decisionHistory.map((event) => (
              <li key={event.id} className="rounded-xl border border-border p-4 text-sm">
                <p className="font-semibold">{event.action}</p>
                <p className="mt-2 text-muted">{copy.decidedBy}: {event.actorPersonId ?? "—"}</p>
                <p className="mt-1 text-muted">{formatDate(event.timestamp, locale)}</p>
                <p className="mt-1 break-all text-muted">{copy.auditReference}: {event.id}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">{copy.decisionHistoryEmpty}</p>
        )}
      </section>

      {detail.canDecide ? (
        <section className="rounded-xl border border-border bg-bg p-5" aria-labelledby="operations-decision">
          <h4 id="operations-decision" className="text-xl">{copy.decision}</h4>
          {!confirmation ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="button" onClick={() => setConfirmation("approved")}>{copy.approve}</Button>
              <Button type="button" variant="secondary" onClick={() => setConfirmation("rejected")}>{copy.reject}</Button>
            </div>
          ) : (
            <div className="mt-4" role="alert">
              <p className="max-w-2xl leading-relaxed">
                {confirmation === "approved" ? copy.confirmApprove : copy.confirmReject}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button type="button" disabled={decisionState === "pending"} onClick={() => void submitDecision()}>
                  {decisionState === "pending" ? copy.decisionPending : copy.confirmDecision}
                </Button>
                <Button type="button" variant="ghost" disabled={decisionState === "pending"} onClick={() => setConfirmation(null)}>
                  {copy.cancel}
                </Button>
              </div>
            </div>
          )}
          {decisionState === "success" ? <p role="status" className="mt-4 text-sm text-verdigris">{copy.decisionSuccess}</p> : null}
          {decisionState === "error" ? <p role="alert" className="mt-4 text-sm text-critical">{copy.decisionError}</p> : null}
        </section>
      ) : null}
    </div>
  );
}

function PublishingWorkspace({
  locale,
  state,
  onChanged,
}: {
  locale: Locale;
  state: PublishingState;
  onChanged: () => Promise<void>;
}) {
  const copy = operationsCopy[locale];
  if (state.kind === "idle" || state.kind === "loading") {
    return <p role="status" className="mt-5 text-muted">{copy.workspaceLoading}</p>;
  }
  if (state.kind === "error") {
    return <p role="alert" className="mt-5 text-critical">{copy.workspaceError}</p>;
  }
  const { workspace } = state;
  const counts = [
    [copy.submissions, workspace.submissions.length],
    [copy.drafts, workspace.drafts.length],
    [copy.moderation, workspace.moderation.length],
    [copy.translations, workspace.translations.length],
    [copy.signOffs, workspace.signOffs.length],
    [copy.readiness, workspace.readiness.length],
  ] as const;

  return (
    <div className="mt-6 space-y-7">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {counts.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border p-4">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <PublishingWorkflowControls locale={locale} workspace={workspace} onChanged={onChanged} />

      <section aria-labelledby="publishing-submissions">
        <h3 id="publishing-submissions" className="text-xl">{copy.submissions}</h3>
        {workspace.submissions.length ? (
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {workspace.submissions.map((submission) => (
              <li key={submission.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:gap-6">
                <div>
                  <p className="font-semibold">{submission.title}</p>
                  <p className="mt-1 text-sm text-muted">{submission.status}</p>
                </div>
                <time className="text-sm text-muted" dateTime={new Date(submission.submittedAt).toISOString()}>
                  {formatDate(submission.submittedAt, locale)}
                </time>
              </li>
            ))}
          </ul>
        ) : <p className="mt-3 text-sm text-muted">{copy.noRecords}</p>}
      </section>

      <div className="grid gap-7 lg:grid-cols-2">
        <section aria-labelledby="publishing-moderation">
          <h3 id="publishing-moderation" className="text-xl">{copy.moderation}</h3>
          {workspace.moderation.length ? (
            <ul className="mt-3 space-y-3">
              {workspace.moderation.map((item) => (
                <li key={item.id} className="rounded-xl border border-border p-4 text-sm">
                  <p className="font-semibold">{copy.decision}: {item.decision}</p>
                  <p className="mt-2 break-all text-muted">{copy.assignedReviewer}: {item.assignedReviewerPersonId ?? "—"}</p>
                  <p className="mt-1 text-muted">{formatDate(item.assignedAt, locale)}</p>
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 text-sm text-muted">{copy.noRecords}</p>}
        </section>

        <section aria-labelledby="publishing-readiness">
          <h3 id="publishing-readiness" className="text-xl">{copy.readiness}</h3>
          {workspace.readiness.length ? (
            <ul className="mt-3 space-y-3">
              {workspace.readiness.map((item) => (
                <li key={item.id} className="rounded-xl border border-border p-4 text-sm">
                  <p className="font-semibold">{item.status === "ready" ? copy.readyBoundary : item.status}</p>
                  <p className="mt-2 break-all text-muted">{item.id}</p>
                  <p className="mt-1 text-muted">{formatDate(item.createdAt, locale)}</p>
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 text-sm text-muted">{copy.noRecords}</p>}
        </section>
      </div>
      <p className="border-t border-border pt-5 text-sm leading-relaxed text-muted">{copy.noAutoPublish}</p>
    </div>
  );
}

export function OperationsConsoleClient({ locale }: { locale: Locale }) {
  const copy = operationsCopy[locale];
  const [state, setState] = useState<OperationsViewState>({ kind: "loading" });
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [detailState, setDetailState] = useState<DetailState>({ kind: "idle" });
  const [selectedScope, setSelectedScope] = useState("");
  const [publishingState, setPublishingState] = useState<PublishingState>({ kind: "idle" });

  const loadOverview = async () => {
    const next = await fetch("/api/operations", {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then(operationsStateFromResponse)
      .catch(() => ({ kind: "error" }) as OperationsViewState);
    setState(next);
    if (next.kind === "ready" && !selectedScope && next.overview.publishingScopes.length) {
      setSelectedScope(next.overview.publishingScopes[0].scope);
    }
  };

  const loadDetail = async (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setDetailState({ kind: "loading" });
    const response = await fetch(
      `/api/operations/membership/${encodeURIComponent(applicationId)}`,
      { cache: "no-store", credentials: "same-origin" }
    ).catch(() => null);
    if (!response?.ok) {
      setDetailState({ kind: "error" });
      return;
    }
    setDetailState({
      kind: "ready",
      detail: (await response.json()) as OperationsMembershipDetail,
    });
  };

  const reloadPublishing = async () => {
    if (!selectedScope) return;
    setPublishingState({ kind: "loading" });
    const response = await fetch(`/api/publishing/workspace?scope=${encodeURIComponent(selectedScope)}`, {
      cache: "no-store", credentials: "same-origin",
    }).catch(() => null);
    if (!response?.ok) { setPublishingState({ kind: "error" }); return; }
    setPublishingState({ kind: "ready", workspace: (await response.json()) as PublishingWorkspacePayload });
  };

  useEffect(() => {
    void loadOverview();
    // Initial private projection only; subsequent refreshes follow explicit actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedScope) {
      setPublishingState({ kind: "idle" });
      return;
    }
    let active = true;
    setPublishingState({ kind: "loading" });
    fetch(`/api/publishing/workspace?scope=${encodeURIComponent(selectedScope)}`, {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("workspace_unavailable");
        return (await response.json()) as PublishingWorkspacePayload;
      })
      .then((workspace) => active && setPublishingState({ kind: "ready", workspace }))
      .catch(() => active && setPublishingState({ kind: "error" }));
    return () => {
      active = false;
    };
  }, [selectedScope]);

  if (state.kind === "loading") {
    return <p role="status" className="rounded-2xl border border-border bg-surface p-7 text-muted">{copy.loading}</p>;
  }
  if (state.kind === "anonymous") {
    return (
      <StatePanel
        title={copy.loginTitle}
        text={copy.loginText}
        action={<Button href={`/api/auth/login?returnTo=/${locale}/operations`}>{copy.loginAction}</Button>}
      />
    );
  }
  if (state.kind === "mfa-required") return <StatePanel title={copy.mfaTitle} text={copy.mfaText} />;
  if (state.kind === "forbidden") return <StatePanel title={copy.forbiddenTitle} text={copy.forbiddenText} />;
  if (state.kind === "unavailable") return <StatePanel title={copy.unavailableTitle} text={copy.unavailableText} />;
  if (state.kind === "error") return <StatePanel title={copy.errorTitle} text={copy.errorText} />;

  const { overview } = state;
  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="civic-label">{copy.exactAuthority}</p>
          <p className="mt-2 text-sm text-muted">{copy.assuranceLabel}: {overview.account.assurance}</p>
        </div>
        <p className="text-sm text-muted">{formatDate(overview.account.authenticatedAt, locale)}</p>
      </div>

      <section aria-labelledby="operations-membership-title">
        <h2 id="operations-membership-title" className="text-3xl">{copy.membershipTitle}</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted">{copy.membershipLede}</p>
        {overview.membershipApplications.length ? (
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {overview.membershipApplications.map((application) => (
              <li key={application.id} className="grid gap-4 py-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted">{copy.applicant}</p>
                    <p className="mt-1 font-semibold">{application.givenName} {application.familyName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">{copy.status}</p>
                    <p className="mt-1 font-semibold">{copy.statuses[application.status]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">{copy.requestedTier}</p>
                    <p className="mt-1 font-semibold">{copy.tiers[application.requestedTier]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">{copy.submittedAt}</p>
                    <p className="mt-1 font-semibold">{formatDate(application.submittedAt, locale)}</p>
                  </div>
                </div>
                <Button type="button" variant="secondary" onClick={() => void loadDetail(application.id)}>
                  {copy.reviewAction}
                </Button>
              </li>
            ))}
          </ul>
        ) : <p className="mt-5 text-muted">{copy.membershipEmpty}</p>}
      </section>

      {selectedApplicationId ? (
        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8" aria-live="polite">
          <MembershipDetail
            key={selectedApplicationId}
            locale={locale}
            state={detailState}
            onClose={() => {
              setSelectedApplicationId(null);
              setDetailState({ kind: "idle" });
            }}
            onDecided={async () => {
              await Promise.all([loadOverview(), loadDetail(selectedApplicationId)]);
            }}
          />
        </section>
      ) : null}

      <section className="border-t border-border pt-10" aria-labelledby="operations-publishing-title">
        <h2 id="operations-publishing-title" className="text-3xl">{copy.publishingTitle}</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted">{copy.publishingLede}</p>
        {overview.publishingScopes.length ? (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,22rem)_1fr] sm:items-end">
              <label className="grid gap-2 text-sm font-semibold">
                {copy.publicationScope}
                <select
                  className="min-h-11 rounded-xl border border-border bg-surface px-4 py-2 text-ink"
                  value={selectedScope}
                  onChange={(event) => setSelectedScope(event.target.value)}
                >
                  {overview.publishingScopes.map(({ scope }) => <option key={scope} value={scope}>{scope}</option>)}
                </select>
              </label>
              <p className="text-sm text-muted">
                {copy.roles}: {overview.publishingScopes.find((item) => item.scope === selectedScope)?.roles.map((role) => copy.rolesMap[role]).join(", ")}
              </p>
            </div>
            <PublishingWorkspace locale={locale} state={publishingState} onChanged={reloadPublishing} />
          </>
        ) : <p className="mt-5 text-muted">{copy.publishingEmpty}</p>}
      </section>
    </div>
  );
}
