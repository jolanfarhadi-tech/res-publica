# EAO Runtime Architecture (Proposal — Extension)

```
Status: Proposed — pending ADR-024 acceptance. Extends EAO_ARCHITECTURE.md; does not modify it.
No runtime described here currently exists or is executing. This document specifies what would run
once ADR-024 is accepted and agents are activated per EAO_ACTIVATION_ROADMAP_PROPOSAL.md — it does
not simulate, imply, or claim a currently-active system.
```

## Purpose

Defines how the EAO would operate at runtime, once activated — the mechanics beneath the static structure already defined in `EAO_ARCHITECTURE.md`.

## Runtime Lifecycle

```
Dormant (current state — this document's status) → Starting → Running → Degraded (partial failure) →
Stopping → Dormant
```

The EAO is Dormant today. No transition beyond this state occurs without ADR-024 acceptance.

## Startup Sequence

1. Verify ADR-024 is Accepted (not Proposed) — refuse to start otherwise.
2. Load the Agent Registry (`EAO_AGENT_REGISTRY.md`) and cross-check against `AGENT_SKILL_PLUGIN_ARCHITECTURE.md`'s actual roster — only roles present in *both* may start.
3. Runtime Coordinator (below) initializes, holding no state from any prior run beyond what the repository itself records (per the Shared Memory Model's no-parallel-store principle, `EAO_SHARED_MEMORY_MODEL.md`).
4. Chief Systems Officer (CSO) comes online first, always — every other role depends on it as router.
5. Remaining roles come online per `EAO_ACTIVATION_ROADMAP_PROPOSAL.md`'s proposed order, each verified against its own dependency list before starting.
6. Runtime enters Running only once CSO and at least one Advisor are confirmed online.

## Shutdown Sequence

1. Runtime Coordinator signals all active roles to complete in-flight requests (no mid-request termination).
2. Each role flushes any in-progress finding to its designated Reporting Template (`EAO_REPORTING_TEMPLATES.md`) before stopping — no unwritten, unrecoverable advisory state.
3. CSO stops last, after confirming all other roles have stopped.
4. Runtime returns to Dormant. No memory persists beyond what was already written to the repository as ordinary files (again, no parallel store).

## Runtime Coordinator

The Chief Systems Officer *is* the Runtime Coordinator — no separate coordinating process exists. It performs discovery, registration-verification, loading, and routing (below) as one function, consistent with `EAO_ARCHITECTURE.md` §2's existing CSO-as-router model.

## Runtime State Model

Three states only, per role: **Idle** (registered, not currently handling a request), **Active** (handling a request), **Failed** (see Failure Handling). No role holds a "long-running background" state — every EAO interaction is request/response (`EAO_ARCHITECTURE.md` §1), so a role is never "running" between requests, only Idle.

## Agent Discovery

The Runtime Coordinator discovers available roles by reading `EAO_AGENT_REGISTRY.md`'s roster **intersected with** whatever subset has actually been added to `AGENT_SKILL_PLUGIN_ARCHITECTURE.md` (real roster) at the time — a role listed only in the EAO's own proposal documents but never added to the real roster is not discoverable. This prevents the runtime from ever treating a merely-proposed role as available.

## Agent Registration

Registration is the human-gated step already defined in `EAO_PERMISSION_MODEL.md`'s Human Approval Gates — a role is "registered" only once its row exists in `AGENT_SKILL_PLUGIN_ARCHITECTURE.md`. The Runtime Architecture does not introduce a second, informal registration path.

## Agent Loading

"Loading" a role means the Runtime Coordinator has confirmed: (a) it is registered, (b) its stated dependencies (`EAO_ACTIVATION_ROADMAP_PROPOSAL.md`) are satisfied, (c) any real backing agent it maps to (e.g., `ecc:architect` for CAO's validation routing) is genuinely invokable in the current session. A role that fails any of these three checks does not load — it remains Idle-unavailable, and the Runtime reports this honestly rather than silently proceeding.

## Runtime Permissions

Identical to `EAO_PERMISSION_MODEL.md` — the runtime introduces no new permission tier and cannot elevate a role's tier beyond what that document defines. Runtime existing does not imply Modify Configuration, Commit/Push/Merge, or Approve Architecture becomes available to any role.

## Failure Handling

If a role fails to respond, times out, or errors: the Runtime Coordinator marks it Failed, logs the failure into the current run's report (not a silent retry-forever loop), and continues serving other roles' Idle/Active state normally. A Failed role does not block CSO or unrelated Advisors.

## Recovery

A Failed role recovers only on the *next* discrete request routed to it — there is no background health-check loop running independently (consistent with "no long-running background state," above). If it fails again, it remains Failed and is reported as such in the Repository/Project Health Reports.

## Health Monitoring

Health is reported, not continuously monitored in the background — each run's Repository Status Report / Project Health Report (`EAO_REPORTING_TEMPLATES.md` #1–2) includes a per-role Idle/Active/Failed status snapshot as of that run only.

## Relationship to Existing Documents

Does not modify `EAO_ARCHITECTURE.md`, `EAO_AGENT_REGISTRY.md`, `EAO_PERMISSION_MODEL.md`, or `EAO_ACTIVATION_ROADMAP_PROPOSAL.md` — this document operationalizes them, citing rather than restating their content.

## References

`brain/AI/EAO_ARCHITECTURE.md`; `brain/AI/EAO_PERMISSION_MODEL.md`; `brain/AI/EAO_ACTIVATION_ROADMAP_PROPOSAL.md`

## Related Documents

`EAO_PLATFORM_ARCHITECTURE.md` · `EAO_COMMUNICATION_PROTOCOL.md` · `EAO_SHARED_MEMORY_MODEL.md` · `EAO_TASK_ORCHESTRATION.md`
