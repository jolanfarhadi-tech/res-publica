# Executive AI Office (EAO) — Architecture Specification

```
Status: Proposed — pending ADR-024 acceptance. Not activated. Advisory only.
Alternative name: Res Publica Executive Intelligence System (RPEIS)
Authorized by (pending): ADR-024
```

## Purpose

The EAO is a repository-wide AI advisory and project-intelligence layer for governance, architecture, delivery, documentation, research, and planning. It is designed as a **living platform**, not static documentation — it defines how its parts communicate, route work, aggregate results, share memory, prioritize tasks, escalate, gate on human approval, and evolve over time.

**The EAO does not replace human decision-making. It does not approve architecture. It does not commit, merge, push, or modify files without explicit human approval. It does not make legal, medical, ethical, or governance decisions. Every output is advisory.**

## Core Principles

1. **Advisory, never authoritative** — every EAO output is a recommendation, not a decision.
2. **Architecture Reviewer independence** — `ecc:architect` remains the sole architecture-validation authority; the EAO recommends invoking it, never substitutes for it.
3. **No fabrication** — the EAO never reports a tool, agent, or data source as available when it is not (see `EAO_PLUGIN_MCP_ARCHITECTURE.md`).
4. **Read-only by default** — no EAO role modifies a file without explicit human instruction.
5. **Traceable routing** — every advisory output states which role produced it and why, never an anonymous aggregate.

## Structure

```
Executive Board (6)
    ↓ coordinates
Domain Advisors (9)          Technical Advisors (7)
    ↓ both report findings to Executive Board
Shared Skill Library (7 categories)
    ↓ invoked by any Board member or Advisor
Plugin / MCP Layer (Phase 1 available; Phase 2–3 not installed)
```

Full roster: `EAO_AGENT_REGISTRY.md`. Full skill catalogue: `EAO_SKILL_LIBRARY.md`.

## 1. Agent-to-Agent Communication Protocol

Communication is **request/response, not persistent chat.** A Board member or Advisor issues a structured request (question + relevant context) to another role; the receiving role returns a structured finding (per `EAO_REPORTING_TEMPLATES.md`'s formats) plus a confidence/completeness note. No role silently acts on another's output without attribution — every aggregated report cites which role contributed which finding. There is no agent-to-agent file modification: any role recommending a change routes that recommendation to the Human Approval Gate (below), never directly to another role for execution.

## 2. Advisor Invocation and Routing Model

The Chief Systems Officer (CSO) is the default entry point and router. On receiving a request, the CSO: (a) classifies it by domain (governance, architecture, documentation, research, delivery, knowledge), (b) selects the narrowest relevant Advisor(s) — never invokes the whole roster for a single question, (c) if the question is architecture-validation (not just architecture-*awareness*), routes to `ecc:architect` directly rather than answering via the Chief Architecture Officer alone. Domain Advisors (Harm Codex, Evidence Model, Membership, etc.) are invoked when a request concerns their named subject matter specifically; Technical Advisors (Git, Documentation, ADR, Repository Health, Dependency, Knowledge Graph, Release) are invoked when a request concerns repository mechanics rather than subject-matter content.

## 3. Result Aggregation Model

Findings from multiple Advisors are aggregated by the CSO into one of the 17 templates in `EAO_REPORTING_TEMPLATES.md`. Aggregation rules: conflicting findings are presented side by side with both sources named, never silently resolved by the aggregator; every finding retains its originating role's name; severity/priority levels are never averaged across roles — the highest-severity finding for a given item wins the displayed severity, with dissent noted.

## 4. Shared Memory / Project Memory Model

The EAO maintains no independent, separate memory store — it reads the repository itself (git history, ADRs, methodology documents, prior reports) as its memory. Where a report references a "prior finding," it must cite the specific prior report/commit/document, never an unstated recollection. This avoids inventing a new persistence mechanism outside the repository's own version-controlled state — consistent with this repository's standing "no parallel logging/state system" discipline (`AuditLog`, `RESPONSIBILITY_EVIDENCE_MODEL.md` §7).

## 5. Shared Skill Library Usage Model

Skills (`EAO_SKILL_LIBRARY.md`) are not owned by a single role — any Board member or Advisor may invoke a listed skill relevant to the request at hand (e.g., the CDO-Delivery may invoke a Documentation skill when checking release readiness). Each skill's output format is fixed regardless of which role invokes it, so aggregation (above) remains consistent. Skills are conceptual/procedural at this stage — none is backed by a dedicated tool beyond the native Git/filesystem/grep/markdown capabilities documented in `EAO_PLUGIN_MCP_ARCHITECTURE.md`.

## 6. Task Prioritization Model

Tasks surfaced in a Requirements Backlog or Task Breakdown are prioritized on three factors, never a single automated score: (a) **blocking status** — does this block other work (highest priority), (b) **risk severity** — per the Risk/Flag Register's Critical/High/Medium/Low bands, (c) **governance sensitivity** — anything touching LOCKED files, Constitution-adjacent principles, or GDPR/consent is flagged for priority human review regardless of technical urgency. Prioritization output is a recommended order, not a binding schedule — the Roadmap remains non-binding until human-approved (`EAO_PERMISSION_MODEL.md`).

## 7. Escalation Model

Any finding classified Critical, any finding touching a LOCKED file, and any finding where an Advisor's recommendation would require overriding `ecc:architect`'s prior finding is escalated immediately to a named human approver — it is never queued at normal priority or silently resolved by another EAO role. Escalation is a report action (surface clearly, flag prominently), never an autonomous action (the EAO cannot pause a build, block a merge, or notify third parties on its own).

## 8. Human Approval Gates

See `EAO_PERMISSION_MODEL.md` for the full model. Summary: gates exist before (a) any file modification, (b) any ADR moving from Proposed to Accepted, (c) any Roadmap becoming binding, (d) any new agent registration or activation, (e) any override of an existing reviewer's (`ecc:architect`, `ecc:code-reviewer`, etc.) finding.

## 9. Platform Lifecycle Model

```
Proposed (this state) → Reviewed → Accepted (ADR-024) → Registered (roster entries added to
AGENT_SKILL_PLUGIN_ARCHITECTURE.md) → Activated (entries added to AGENT_ACTIVATION_ROADMAP.md,
per-role, per that document's existing phased-trigger discipline) → Operating → Reviewed periodically →
Deprecated/Retired (if ever)
```

No role in this document is past "Proposed" today. Movement between states requires the Human Approval Gate applicable to that transition (§8) — no self-promotion between lifecycle states.

## Relationship to Existing Architecture

Does not modify, redefine, or gain authority over: `ADR-004`'s existing roster, `ecc:architect`/`ecc:code-reviewer`/`ecc:security-reviewer`/`ecc:performance-optimizer` (remain the real, existing reviewers), `AGENT_ACTIVATION_ROADMAP.md`'s existing phase entries, or any LOCKED file. The EAO is additive and currently inactive.

## References

`architecture/adr/ADR-024-executive-ai-office.md`; `brain/AI/AGENT_SKILL_PLUGIN_ARCHITECTURE.md`; `brain/AI/AGENT_ACTIVATION_ROADMAP.md`

## Related Documents

`EAO_AGENT_REGISTRY.md` · `EAO_SKILL_LIBRARY.md` · `EAO_PLUGIN_MCP_ARCHITECTURE.md` · `EAO_PERMISSION_MODEL.md` · `EAO_REPORTING_TEMPLATES.md` · `EAO_DASHBOARD_SPEC.md` · `EAO_ACTIVATION_ROADMAP_PROPOSAL.md`
