"use client";

import { useEffect, useState } from "react";
import type { getSecurityOperationsOverview } from "@/application/security-attribution";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/i18n/config";
import { securityOperationsCopy } from "@/i18n/security-operations";

type Payload = Awaited<ReturnType<typeof getSecurityOperationsOverview>>;
type State =
  | { kind: "loading" }
  | { kind: "anonymous" }
  | { kind: "forbidden" }
  | { kind: "unavailable" }
  | { kind: "ready"; payload: Payload };

function Message({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return <section className="rounded-2xl border border-border bg-surface p-7 sm:p-9"><h2 className="text-2xl">{title}</h2><p className="mt-3 max-w-3xl leading-relaxed text-muted">{text}</p>{action ? <div className="mt-6">{action}</div> : null}</section>;
}

export function SecurityOperationsClient({ locale }: { locale: Locale }) {
  const copy = securityOperationsCopy[locale];
  const [state, setState] = useState<State>({ kind: "loading" });
  useEffect(() => {
    let active = true;
    fetch("/api/operations/security", { cache: "no-store", credentials: "same-origin" })
      .then(async (response): Promise<State> => response.ok
        ? { kind: "ready", payload: (await response.json()) as Payload }
        : response.status === 401 ? { kind: "anonymous" }
          : response.status === 403 ? { kind: "forbidden" } : { kind: "unavailable" })
      .then((next) => { if (active) setState(next); })
      .catch(() => { if (active) setState({ kind: "unavailable" }); });
    return () => { active = false; };
  }, []);

  if (state.kind === "loading") return <p role="status" className="text-muted">{copy.loading}</p>;
  if (state.kind === "anonymous") return <Message title={copy.loginTitle} text={copy.loginText} action={<Button href={`/api/auth/login?returnTo=/${locale}/operations/security`}>{copy.loginAction}</Button>} />;
  if (state.kind === "forbidden") return <Message title={copy.forbiddenTitle} text={copy.forbiddenText} />;
  if (state.kind === "unavailable") return <Message title={copy.unavailableTitle} text={copy.unavailableText} />;

  const { incidents, observations, claims, correlations } = state.payload;
  return <div className="space-y-10">
    <div className="grid gap-4 md:grid-cols-2"><p className="rounded-2xl border border-border bg-surface p-5 text-sm leading-relaxed text-muted">{copy.identityBoundary}</p><p className="rounded-2xl border border-border bg-surface p-5 text-sm leading-relaxed text-muted">{copy.passiveBoundary}</p></div>
    <section aria-labelledby="security-incidents"><h2 id="security-incidents" className="text-3xl">{copy.incidents}</h2>{!incidents.length ? <p className="mt-4 text-muted">{copy.empty}</p> : <ul className="mt-5 grid gap-4 lg:grid-cols-2">{incidents.map((item) => <li key={item.id} className="rounded-2xl border border-border bg-surface p-6"><p className="civic-label">{item.id}</p><h3 className="mt-2 text-xl">{item.title}</h3><p className="mt-3 text-sm text-muted">{copy.severity}: {item.severity} · {copy.status}: {item.status}</p><p className="mt-2 text-sm">{copy.affectedAssets}: {item.affectedAssets.join(", ")}</p></li>)}</ul>}</section>
    <section aria-labelledby="security-observations"><h2 id="security-observations" className="text-3xl">{copy.observations}</h2><ul className="mt-5 space-y-4">{observations.map((item) => <li key={item.id} className="rounded-2xl border border-border p-6 text-sm"><strong>{item.incidentId}</strong><dl className="mt-4 grid gap-3 md:grid-cols-2"><div><dt className="text-muted">{copy.technicalSource}</dt><dd className="break-all">{item.sourceHandle ?? "—"}</dd></div><div><dt className="text-muted">{copy.routes}</dt><dd>{item.routeSequence.join(" → ") || "—"}</dd></div><div><dt className="text-muted">{copy.techniques}</dt><dd>{item.techniques.join(", ") || "—"}</dd></div><div><dt className="text-muted">{copy.evidenceHash}</dt><dd className="break-all font-mono text-xs">{item.evidenceHash}</dd></div></dl></li>)}</ul></section>
    <section aria-labelledby="security-claims"><h2 id="security-claims" className="text-3xl">{copy.claims}</h2><ul className="mt-5 space-y-4">{claims.map((item) => <li key={item.id} className="rounded-2xl border border-border bg-surface p-6"><p className="text-sm font-semibold">{copy.level}: {item.level} · {copy.confidence}: {item.confidence}</p><p className="mt-3">{item.claim}</p><dl className="mt-4 grid gap-3 text-sm md:grid-cols-2"><div><dt className="font-semibold">{copy.evidence}</dt><dd className="text-muted">{item.observedEvidence.join(", ")}</dd></div><div><dt className="font-semibold">{copy.inferences}</dt><dd className="text-muted">{item.inferences.join(" · ")}</dd></div><div><dt className="font-semibold">{copy.contradictions}</dt><dd className="text-muted">{item.contradictoryEvidence.join(" · ")}</dd></div><div><dt className="font-semibold">{copy.alternatives}</dt><dd className="text-muted">{item.alternativeExplanations.join(" · ")}</dd></div></dl></li>)}</ul></section>
    <section aria-labelledby="security-correlations"><h2 id="security-correlations" className="text-3xl">{copy.correlations}</h2><ul className="mt-5 space-y-4">{correlations.map((item) => <li key={item.id} className="rounded-2xl border border-border p-6"><strong>{item.leftIncidentId} ↔ {item.rightIncidentId}</strong><p className="mt-2 text-sm">{copy.relation}: {item.relation}</p><p className="mt-3 text-sm text-muted">{copy.alternatives}: {item.alternativeExplanations.join(" · ")}</p></li>)}</ul></section>
  </div>;
}
