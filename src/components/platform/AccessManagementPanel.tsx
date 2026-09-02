"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  accessManagementCopy,
  governanceDelegableRoles,
  publishingDelegableRoles,
} from "@/i18n/access-management";
import type { Locale } from "@/i18n/config";
import type { OperationsOverviewPayload } from "./operations-state";

type Administration = OperationsOverviewPayload["authorityAdministration"];
type ManagedDomain = "governance" | "publishing";
type MutationState = "idle" | "pending" | "success" | "error" | "mfa";

export function AccessManagementPanel({
  locale,
  administration,
  onChanged,
}: {
  locale: Locale;
  administration: Administration;
  onChanged: () => Promise<void>;
}) {
  const copy = accessManagementCopy[locale];
  const availableDomains = useMemo(() => {
    const domains: ManagedDomain[] = [];
    if (administration.governanceInstitutions.length) domains.push("governance");
    if (administration.publishingScopes.length) domains.push("publishing");
    return domains;
  }, [administration]);
  const [domain, setDomain] = useState<ManagedDomain>(availableDomains[0] ?? "governance");
  const scopes = domain === "governance"
    ? administration.governanceInstitutions
    : administration.publishingScopes;
  const roles = domain === "governance"
    ? governanceDelegableRoles
    : publishingDelegableRoles;
  const [target, setTarget] = useState("");
  const [role, setRole] = useState<string>("");
  const [granteePersonId, setGranteePersonId] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [mutationState, setMutationState] = useState<MutationState>("idle");
  const selectedTarget = scopes.includes(target) ? target : (scopes[0] ?? "");
  const selectedRole = roles.some((candidate) => candidate === role)
    ? role
    : (roles[0] ?? "");

  if (!availableDomains.length) return null;

  const submitGrant = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTarget || !selectedRole || !granteePersonId.trim()) return;
    setMutationState("pending");
    const body = domain === "governance"
      ? {
          granteePersonId: granteePersonId.trim(),
          institutionId: selectedTarget,
          role: selectedRole,
          validUntil: validUntil ? new Date(validUntil).toISOString() : null,
          reasonCode: "operational-role-assignment",
        }
      : {
          granteePersonId: granteePersonId.trim(),
          publicationScope: selectedTarget,
          role: selectedRole,
          validUntil: validUntil ? new Date(validUntil).toISOString() : null,
          reasonCode: "operational-role-assignment",
        };
    const endpoint = domain === "governance"
      ? "/api/governance/grants"
      : "/api/publishing/grants";
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    if (response?.status === 403) {
      setMutationState("mfa");
      return;
    }
    if (!response?.ok) {
      setMutationState("error");
      return;
    }
    setMutationState("success");
    setGranteePersonId("");
    setValidUntil("");
    await onChanged();
  };

  const revoke = async (delegation: Administration["activeDelegations"][number]) => {
    setMutationState("pending");
    const endpoint = delegation.domain === "governance"
      ? "/api/governance/grants"
      : "/api/publishing/grants";
    const body = delegation.domain === "governance"
      ? {
          grantId: delegation.grantId,
          institutionId: delegation.target,
          reasonCode: "scheduled-access-review",
        }
      : {
          grantId: delegation.grantId,
          publicationScope: delegation.target,
          reasonCode: "scheduled-access-review",
        };
    const response = await fetch(endpoint, {
      method: "DELETE",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    if (response?.status === 403) {
      setMutationState("mfa");
      return;
    }
    if (!response?.ok) {
      setMutationState("error");
      return;
    }
    setMutationState("success");
    await onChanged();
  };

  return (
    <section
      id="operations-access-management"
      className="rounded-3xl border border-border bg-surface p-6 sm:p-8"
      aria-labelledby="operations-access-management-title"
    >
      <p className="civic-label">{copy.eyebrow}</p>
      <h2 id="operations-access-management-title" className="mt-3 text-3xl">
        {copy.title}
      </h2>
      <p className="mt-3 max-w-3xl leading-relaxed text-muted">{copy.lede}</p>
      <p className="mt-4 rounded-xl border border-border bg-bg/70 p-4 text-sm leading-relaxed text-muted">
        {copy.foundationalBoundary}
      </p>

      <form className="mt-7 grid gap-5 lg:grid-cols-2" onSubmit={submitGrant}>
        {availableDomains.length > 1 ? (
          <label className="grid gap-2 text-sm font-semibold">
            {copy.role}
            <select
              className="min-h-11 rounded-xl border border-border bg-bg px-4 py-2"
              value={domain}
              onChange={(event) => {
                setDomain(event.target.value as ManagedDomain);
                setTarget("");
                setRole("");
              }}
            >
              <option value="governance">{copy.governanceTitle}</option>
              <option value="publishing">{copy.publishingTitle}</option>
            </select>
          </label>
        ) : null}
        <label className="grid gap-2 text-sm font-semibold">
          {copy.scope}
          <select
            className="min-h-11 rounded-xl border border-border bg-bg px-4 py-2"
            value={selectedTarget}
            onChange={(event) => setTarget(event.target.value)}
          >
            {scopes.map((scope) => <option key={scope} value={scope}>{scope}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          {copy.role}
          <select
            className="min-h-11 rounded-xl border border-border bg-bg px-4 py-2"
            value={selectedRole}
            onChange={(event) => setRole(event.target.value)}
          >
            {roles.map((candidate) => (
              <option key={candidate} value={candidate}>{copy.roles[candidate]}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold lg:col-span-2">
          {copy.granteePersonId}
          <input
            className="min-h-11 rounded-xl border border-border bg-bg px-4 py-2"
            value={granteePersonId}
            maxLength={200}
            autoComplete="off"
            required
            onChange={(event) => setGranteePersonId(event.target.value)}
          />
          <span className="font-normal leading-relaxed text-muted">{copy.granteeHelp}</span>
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          {copy.validUntil} <span className="font-normal text-muted">({copy.optional})</span>
          <input
            className="min-h-11 rounded-xl border border-border bg-bg px-4 py-2"
            type="datetime-local"
            value={validUntil}
            onChange={(event) => setValidUntil(event.target.value)}
          />
        </label>
        <div className="flex items-end">
          <Button type="submit" disabled={mutationState === "pending"}>
            {mutationState === "pending" ? copy.granting : copy.grant}
          </Button>
        </div>
      </form>

      {mutationState === "success" ? <p role="status" className="mt-5 text-sm text-verdigris">{copy.success}</p> : null}
      {mutationState === "error" ? <p role="alert" className="mt-5 text-sm text-critical">{copy.error}</p> : null}
      {mutationState === "mfa" ? (
        <div role="alert" className="mt-5 flex flex-wrap items-center gap-4 text-sm text-critical">
          <p>{copy.recentMfaRequired}</p>
          <Button
            href={`/api/auth/login?stepUp=recent-mfa&returnTo=${encodeURIComponent(`/${locale}/operations`)}`}
            variant="secondary"
          >
            {copy.refreshMfa}
          </Button>
        </div>
      ) : null}

      <div className="mt-9 border-t border-border pt-7">
        <h3 className="text-2xl">{copy.activeDelegations}</h3>
        {administration.activeDelegations.length ? (
          <ul className="mt-5 space-y-3">
            {administration.activeDelegations.map((delegation) => (
              <li
                key={delegation.grantId}
                className="grid gap-4 rounded-xl border border-border bg-bg/60 p-4 lg:grid-cols-[1fr_auto] lg:items-center"
              >
                <div className="min-w-0 text-sm">
                  <p className="font-semibold">{copy.roles[delegation.role]}</p>
                  <p className="mt-1 break-all text-muted">{delegation.personId}</p>
                  <p className="mt-1 text-muted">{copy.scope}: {delegation.target}</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={mutationState === "pending"}
                  onClick={() => void revoke(delegation)}
                >
                  {mutationState === "pending" ? copy.revoking : copy.revoke}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">{copy.noDelegations}</p>
        )}
      </div>
    </section>
  );
}
