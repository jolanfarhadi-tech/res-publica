# ADR-024: Executive AI Office (EAO)

## Status
**Accepted.** Approved by the project's Human Approval Authority. Registration and activation proceed per the phased order in `brain/AI/EAO_ACTIVATION_ROADMAP_PROPOSAL.md`, starting with Chief Systems Officer (CSO) only — the remaining 21 roles remain Registered-but-not-yet-Activated until separately triggered.

## Context

This session repeatedly required ad hoc, manual project-status reporting (git state, architecture consistency, commit batching, ADR-coverage gaps) performed directly by the primary assistant, since no ECC agent exists for repository-wide coordination. A prior narrower proposal (`ecc:program-orchestrator`, drafted in chat, never written to disk) was superseded by a fuller requirement: a complete advisory and project-intelligence layer spanning governance, architecture, delivery, documentation, research, and planning — the **Executive AI Office (EAO)**, alternatively named the **Res Publica Executive Intelligence System (RPEIS)**.

A repository search confirmed: no "Executive AI Office," "RPEIS," Chief Officer role, or any of the proposed Domain/Technical Advisors exists anywhere in this repository. The only pre-existing, real agent roster is `AGENT_SKILL_PLUGIN_ARCHITECTURE.md` §3a/3b/3c (`ADR-004`). `.claude/agents/` is empty — every currently-invokable `ecc:*` subagent is defined by the harness, not by a repository file.

## Decision

Establish the EAO as a proposed, ADR-gated architecture, fully specified across 8 companion documents in `brain/AI/`:

- `EAO_ARCHITECTURE.md` — overall structure and the 9 required operational models (agent-to-agent communication, advisor invocation/routing, result aggregation, shared memory, shared skill-library usage, task prioritization, escalation, human approval gates, platform lifecycle).
- `EAO_AGENT_REGISTRY.md` — Executive Board (6), Domain Advisors (9), Technical Advisors (7).
- `EAO_SKILL_LIBRARY.md` — the full skill catalogue across 7 categories.
- `EAO_PLUGIN_MCP_ARCHITECTURE.md` — Phase 1–3 plugin/MCP layer, with an explicit honesty section on what is and is not actually installed.
- `EAO_PERMISSION_MODEL.md` — permission tiers and the Human Approval Model.
- `EAO_REPORTING_TEMPLATES.md` — the 17 required output templates.
- `EAO_DASHBOARD_SPEC.md` — the 20 dashboard metrics.
- `EAO_ACTIVATION_ROADMAP_PROPOSAL.md` — a draft activation plan, held separately from the real `AGENT_ACTIVATION_ROADMAP.md` until this ADR is accepted (that document's own existing rule: unapproved agents get no activation entry).

**Core purpose:** repository-wide project intelligence, advisory coordination, risk detection, requirements generation, roadmap/Gantt planning, architectural flagging, documentation quality review, dependency mapping, and specialist advisory routing. **The EAO does not replace human decision-making, does not approve architecture, does not commit/merge/push/modify files without explicit human approval, and does not make legal/medical/ethical/governance decisions. All outputs are advisory only.**

**Supersession:** the `ecc:program-orchestrator` concept from the prior chat-only draft is folded into the Executive Board's **Chief Systems Officer** role — no separate agent or ADR is created for it.

**Architecture Reviewer remains the sole validation authority.** The EAO's Chief Architecture Officer and Architecture Advisors *recommend* invoking `ecc:architect`; they do not substitute for it.

## Consequences

- Adds one large, entirely new, currently-inactive conceptual architecture layer — no LOCKED file is touched (`00_constitution.md`, `CONSTITUTION.md`, `CORE_DOMAIN_MODEL.md`, `APPLICATION_ARCHITECTURE.md`).
- No agent described here is registered or activated by this ADR alone — activation requires the separate steps in `EAO_ACTIVATION_ROADMAP_PROPOSAL.md`, applied to the real `AGENT_ACTIVATION_ROADMAP.md` only after acceptance.
- Several proposed MCP integrations (GitHub, SQLite, Graphviz, Neo4j, Notion, Linear/Jira) do not exist in this environment today — `EAO_PLUGIN_MCP_ARCHITECTURE.md` documents this honestly rather than assuming future installation.
- Overlaps in *reading* repository state with `ecc:architect`/`ecc:code-reviewer`, but not in *judgment* — the EAO aggregates and routes; existing reviewers validate.

## Alternatives Considered

- **Keep the narrower `ecc:program-orchestrator` proposal instead of a full Executive Office.** Rejected per explicit instruction — the requirement is now a complete advisory/intelligence layer, not a single coordination agent.
- **Implement all 22 named roles as real, separate `.claude/agents/*.md` files immediately.** Deferred — proliferating 22 near-identical agent-definition files before any of them is used risks unnecessary file sprawl; the registry documents each role's real-vs-conceptual backing so this can be decided deliberately later, not by default.

## Human Approval Required

Before: this ADR's acceptance; any `.claude/agents/*.md` file creation for any EAO role; any addition to `AGENT_ACTIVATION_ROADMAP.md` or `AGENT_SKILL_PLUGIN_ARCHITECTURE.md`; any real invocation of an EAO advisor in place of an existing reviewer.
