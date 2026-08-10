"use client";

import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { knowledgeGraphCopy } from "@/i18n/knowledge-graph";

type Build = {
  id: string;
  commitSha: string;
  extractorName: string;
  contentDigest: string;
  candidateCount: number;
  createdAt: string;
};

type Candidate = {
  id: string;
  candidateKey: string;
  kind: "entity" | "relationship";
  status: "pending" | "approved" | "rejected";
  sources: Array<{ locale: string; publicEligible: boolean }>;
};

type Overview = { builds: Build[]; candidates: Candidate[] };

export function KnowledgeGraphOperationsClient({ locale }: { locale: Locale }) {
  const copy = knowledgeGraphCopy[locale];
  const [overview, setOverview] = useState<Overview | null>(null);
  const [state, setState] = useState<"loading" | "denied" | "unavailable" | "ready">("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const response = await fetch("/api/knowledge-graph/operations", {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (response.status === 401 || response.status === 403) {
      setState("denied");
      return;
    }
    if (!response.ok) throw new Error("unavailable");
    setOverview(await response.json() as Overview);
    setState("ready");
  }, []);

  useEffect(() => {
    load().catch(() => setState("unavailable"));
  }, [load]);

  async function rebuild() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/knowledge-graph/operations/rebuilds", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("rebuild_failed");
      await load();
      setMessage(copy.saved);
    } catch {
      setMessage(copy.failed);
    } finally {
      setBusy(false);
    }
  }

  async function decide(candidateId: string, decision: "approve" | "reject") {
    const reason = reasons[candidateId]?.trim() ?? "";
    if (!reason) {
      setMessage(copy.failed);
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/knowledge-graph/operations/candidates/${candidateId}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, reason }),
      });
      if (!response.ok) throw new Error("decision_failed");
      await load();
      setMessage(copy.saved);
    } catch {
      setMessage(copy.failed);
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading") return <p className="glass-panel rounded-2xl p-6 text-muted" role="status">{copy.loading}</p>;
  if (state === "denied") return <p className="glass-panel rounded-2xl p-6 text-muted">{copy.denied}</p>;
  if (state === "unavailable" || !overview) return <p className="glass-panel rounded-2xl p-6 text-muted">{copy.unavailable}</p>;

  return (
    <div className="space-y-8">
      <div className="glass-panel flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-relaxed text-muted">{copy.boundary}</p>
        <button type="button" className="button-primary" disabled={busy} onClick={rebuild}>
          {busy ? copy.rebuilding : copy.rebuild}
        </button>
      </div>
      {message && <p role="status" aria-live="polite" className="text-sm text-muted">{message}</p>}
      <section className="glass-panel rounded-3xl p-6">
        <h2 className="text-2xl">{copy.builds}</h2>
        {overview.builds.length === 0 ? <p className="mt-4 text-muted">{copy.noBuilds}</p> : (
          <ul className="mt-4 space-y-3">
            {overview.builds.map((build) => (
              <li key={build.id} className="rounded-xl bg-bg/70 p-4">
                <p className="font-mono text-sm">{build.commitSha.slice(0, 12)} · {build.extractorName}</p>
                <p className="mt-1 text-sm text-muted">{build.candidateCount} · {build.contentDigest.slice(0, 16)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="glass-panel rounded-3xl p-6">
        <h2 className="text-2xl">{copy.candidates}</h2>
        {overview.candidates.length === 0 ? <p className="mt-4 text-muted">{copy.noCandidates}</p> : (
          <ul className="mt-4 space-y-4">
            {overview.candidates.map((candidate) => (
              <li key={candidate.id} className="rounded-xl bg-bg/70 p-4">
                <p className="font-semibold">{candidate.kind === "entity" ? copy.entity : copy.relationship}</p>
                <p className="mt-1 break-all font-mono text-xs text-muted">{candidate.candidateKey}</p>
                <p className="mt-2 text-sm text-muted">{copy[candidate.status]}</p>
                {candidate.status === "pending" && (
                  <div className="mt-4 grid gap-3">
                    <label className="text-sm" htmlFor={`reason-${candidate.id}`}>{copy.reason}</label>
                    <textarea
                      id={`reason-${candidate.id}`}
                      value={reasons[candidate.id] ?? ""}
                      onChange={(event) => setReasons((current) => ({ ...current, [candidate.id]: event.target.value }))}
                      rows={3}
                      maxLength={10_000}
                      className="rounded-xl border border-border bg-bg px-3 py-2"
                    />
                    <div className="flex flex-wrap gap-3">
                      <button type="button" className="button-primary" disabled={busy} onClick={() => decide(candidate.id, "approve")}>{copy.approve}</button>
                      <button type="button" className="button-secondary" disabled={busy} onClick={() => decide(candidate.id, "reject")}>{copy.reject}</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
