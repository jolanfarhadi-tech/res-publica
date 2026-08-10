"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/i18n/config";
import { publishingWorkflowCopy } from "@/i18n/publishing-workflow";
import type { PublishingWorkspacePayload } from "./operations-state";
import {
  buildPublishingWorkflowRequest,
  publishingActionsForRoles,
  type PublishingWorkflowAction,
  type PublishingWorkflowInput,
} from "./publishing-workflow-state";

const emptyInput: PublishingWorkflowInput = {
  targetId: "", title: "", content: "", citations: "", weakCitationFlags: "",
  personId: "", locale: "fa", decision: "approved", reason: "", confirmed: false,
};

const inputClass = "min-h-11 w-full rounded-xl border border-border bg-surface px-4 py-3 text-ink";

export function PublishingWorkflowControls({ locale, workspace, onChanged }: {
  locale: Locale;
  workspace: PublishingWorkspacePayload;
  onChanged: () => Promise<void>;
}) {
  const copy = publishingWorkflowCopy[locale];
  const actions = useMemo(() => publishingActionsForRoles(workspace.roles), [workspace.roles]);
  const [action, setAction] = useState<PublishingWorkflowAction | null>(actions[0] ?? null);
  const [input, setInput] = useState<PublishingWorkflowInput>(emptyInput);
  const [state, setState] = useState<"idle" | "pending" | "success" | "invalid" | "failed">("idle");
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (!action || !actions.includes(action)) setAction(actions[0] ?? null);
  }, [action, actions]);

  if (!action) return null;
  const update = <Key extends keyof PublishingWorkflowInput>(key: Key, value: PublishingWorkflowInput[Key]) => {
    setInput((current) => ({ ...current, [key]: value }));
    setState("idle");
  };
  const targetOptions = action === "create-draft"
    ? workspace.submissions.map((item) => ({ id: item.id, label: item.title }))
    : action === "decide-moderation"
      ? workspace.moderation.filter((item) => item.decision === "pending" && item.draftId).map((item) => ({ id: item.id, label: item.draftId! }))
      : action === "finalize-translation"
        ? workspace.translations.filter((item) => item.status !== "human-finalized").map((item) => ({ id: item.id, label: `${item.locale} · ${item.draftId}` }))
        : workspace.drafts.map((item) => ({ id: item.id, label: `v${item.version} · ${item.id}` }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const body = buildPublishingWorkflowRequest(action, input, workspace);
    if (!body) { setState("invalid"); return; }
    setState("pending"); setRequestId(null);
    const response = await fetch("/api/publishing/workflow", {
      method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    if (!response?.ok) {
      setRequestId(response?.headers.get("x-request-id") ?? null);
      setState("failed");
      return;
    }
    setInput(emptyInput); setState("success");
    await onChanged();
  };

  const needsTarget = action !== "create-submission";
  const needsContent = action === "create-submission" || action === "create-draft" || action === "finalize-translation";
  return (
    <section className="rounded-2xl border border-border bg-bg/60 p-5 sm:p-6" aria-labelledby="publishing-workflow-action">
      <h3 id="publishing-workflow-action" className="text-xl">{copy.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{copy.lede}</p>
      <form className="mt-5 grid gap-5" onSubmit={submit}>
        <label className="grid gap-2 text-sm font-semibold">{copy.action}
          <select className={inputClass} value={action} onChange={(event) => { setAction(event.target.value as PublishingWorkflowAction); setInput(emptyInput); setState("idle"); }}>
            {actions.map((item) => <option key={item} value={item}>{copy.actions[item]}</option>)}
          </select>
        </label>
        {action === "create-submission" ? <label className="grid gap-2 text-sm font-semibold">{copy.titleField}<input className={inputClass} value={input.title} onChange={(event) => update("title", event.target.value)} /></label> : null}
        {needsTarget ? <label className="grid gap-2 text-sm font-semibold">{copy.target}<select className={inputClass} value={input.targetId} onChange={(event) => update("targetId", event.target.value)}><option value="">—</option>{targetOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label> : null}
        {needsContent ? <label className="grid gap-2 text-sm font-semibold">{action === "create-submission" ? copy.sourceContent : copy.draftContent}<textarea className={`${inputClass} min-h-36`} value={input.content} onChange={(event) => update("content", event.target.value)} /></label> : null}
        {action === "create-draft" ? <><label className="grid gap-2 text-sm font-semibold">{copy.citations}<textarea className={`${inputClass} min-h-28`} value={input.citations} onChange={(event) => update("citations", event.target.value)} /><span className="font-normal text-muted">{copy.citationsHelp}</span></label><label className="grid gap-2 text-sm font-semibold">{copy.weakFlags}<textarea className={`${inputClass} min-h-24`} value={input.weakCitationFlags} onChange={(event) => update("weakCitationFlags", event.target.value)} /></label></> : null}
        {action === "assign-reviewer" || action === "assign-translation" ? <label className="grid gap-2 text-sm font-semibold">{copy.personId}<input className={inputClass} value={input.personId} onChange={(event) => update("personId", event.target.value)} /></label> : null}
        {action === "assign-translation" ? <label className="grid gap-2 text-sm font-semibold">{copy.locale}<select className={inputClass} value={input.locale} onChange={(event) => update("locale", event.target.value as "de" | "en" | "fa")}><option value="de">DE</option><option value="en">EN</option><option value="fa">FA</option></select></label> : null}
        {action === "decide-moderation" ? <><label className="grid gap-2 text-sm font-semibold">{copy.decision}<select className={inputClass} value={input.decision} onChange={(event) => update("decision", event.target.value as "approved" | "rejected")}><option value="approved">approved</option><option value="rejected">rejected</option></select></label><label className="grid gap-2 text-sm font-semibold">{copy.reason}<textarea className={`${inputClass} min-h-28`} value={input.reason} onChange={(event) => update("reason", event.target.value)} /></label></> : null}
        {action === "mark-ready" ? <label className="flex items-start gap-3 rounded-xl border border-border p-4"><input className="mt-1" type="checkbox" checked={input.confirmed} onChange={(event) => update("confirmed", event.target.checked)} /><span className="text-sm leading-relaxed">{copy.readyConfirm}</span></label> : null}
        <div><Button type="submit" disabled={state === "pending"}>{state === "pending" ? copy.pending : copy.submit}</Button></div>
      </form>
      {state === "success" ? <p role="status" className="mt-4 text-sm font-semibold text-verdigris">{copy.success}</p> : null}
      {state === "invalid" ? <p role="alert" className="mt-4 text-sm text-critical">{copy.invalid}</p> : null}
      {state === "failed" ? <p role="alert" className="mt-4 text-sm text-critical">{copy.failed}{requestId ? ` ${copy.requestId}: ${requestId}` : ""}</p> : null}
      <p className="mt-5 border-t border-border pt-4 text-sm leading-relaxed text-muted">{copy.sourceRule}</p>
    </section>
  );
}
