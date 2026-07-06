# EAO Agent Registry (Proposal)

```
Status: Proposed — pending ADR-024 acceptance. No role in this document is registered or activated.
```

## Purpose

Registers all 22 proposed EAO roles, honestly distinguishing which have a real backing agent available today versus which are conceptual only. **No role below is invokable as a distinct agent until this ADR is accepted and it is added to `AGENT_SKILL_PLUGIN_ARCHITECTURE.md`'s roster and `AGENT_ACTIVATION_ROADMAP.md`'s activation plan.**

## 1. Executive Board (6)

| Role | Purpose | Real backing today | Reports to |
|---|---|---|---|
| **Chief Systems Officer (CSO)** | Default entry point and router; repository-wide status, coordination, risk detection, planning-artifact generation. Absorbs the former `ecc:program-orchestrator` concept. | None — conceptual only; when invoked, uses the primary assistant's own repository access (Bash/Read/Grep/Glob), not a distinct model. | Human Approval Authority directly |
| **Chief Architecture Officer (CAO)** | Architecture-awareness summarization and routing to validation. **Does not itself validate architecture.** | Partial — routes to `ecc:architect` (real, existing) for any actual validation; CAO itself has no independent backing. | CSO; escalates to `ecc:architect` for validation |
| **Chief Governance Officer (CGO)** | Governance-boundary and policy-consistency awareness across Constitution-adjacent documents. | None — conceptual only. | CSO |
| **Chief Documentation Officer (CDO)** | Documentation quality, cross-reference, glossary consistency oversight. | Closest existing analogue: `ecc:doc-updater` (real, available) — not identical, CDO's scope is broader (advisory aggregation, not direct editing). | CSO |
| **Chief Research Officer (CRO)** | Research-gap detection, conceptual consistency, citation-need flagging. | None — conceptual only. | CSO |
| **Chief Delivery Officer (CDO-Delivery)** | Task breakdown, release readiness, milestone tracking, commit-batch planning. | None — conceptual only. | CSO |

## 2. Domain Advisors (9)

Each Domain Advisor's subject matter is an already-existing methodology document; **none of these advisors redefines that document's architecture** — they read and report on it.

| Role | Subject matter document |
|---|---|
| Harm Codex Advisor | `docs/source/methodology/HARM_CODEX.md` |
| Evidence Model Advisor | `docs/source/methodology/EVIDENCE_MODEL.md` |
| Membership Advisor | `docs/source/projects/MEMBER_PROFILE.md` (Membership System itself not yet written) |
| Grammar of Repair Advisor | `docs/source/methodology/REPAIR_FRAMEWORK.md` (the "Grammar of Repair" alias) |
| Structured Hearing Advisor | `docs/source/methodology/STRUCTURED_HEARINGS.md` |
| AI Facilitator Advisor | `docs/source/methodology/AI_HEARING_FACILITATOR.md` |
| Data Governance Advisor | `docs/source/governance/DATA_POLICY.md` |
| GDPR Advisor | `docs/source/governance/DPIA.md` |
| Ontology Advisor | `docs/source/glossary/TERMS.md`, `brain/DOMAIN/CORE_DOMAIN_MODEL.md` (LOCKED — read-only reference, never modifies) |

None of the 9 has a distinct real backing agent today — each is conceptual, intended to be a scoped-context invocation of the primary assistant (or, later, `ecc:architect`/`ecc:doc-updater` where relevant) against its named document.

## 3. Technical Advisors (7)

| Role | Purpose | Real backing today |
|---|---|---|
| Git Advisor | Git status, history, branch health reporting | Native (Bash running `git`) — already how this session operates; not a distinct MCP or agent |
| Documentation Advisor | Broken links, missing references, duplicate concepts | `ecc:doc-updater` (real, existing), partial overlap |
| ADR Advisor | ADR coverage, missing-ADR detection | None — conceptual; reads `architecture/adr/` directly |
| Repository Health Advisor | File count, scope, staleness signals | Native (Glob/Grep/Bash) — no dedicated tool |
| Dependency Advisor | Cross-document dependency mapping | None — conceptual |
| Knowledge Graph Advisor | Ontology/entity-relationship consistency | None — conceptual; no Knowledge Graph tool installed (see `EAO_PLUGIN_MCP_ARCHITECTURE.md`) |
| Release Advisor | Release-readiness checklist | None — conceptual |

## Registration Rule

A role moves from "conceptual only" to "registered" only when: (1) ADR-024 is accepted, (2) a corresponding row is added to `AGENT_SKILL_PLUGIN_ARCHITECTURE.md`, (3) if it is to become a real, separately-invokable agent (rather than a scoped-context role the primary assistant plays), a `.claude/agents/*.md` file is created for it — a distinct, later decision, not implied by registration alone.

## References

`architecture/adr/ADR-024-executive-ai-office.md`; `brain/AI/AGENT_SKILL_PLUGIN_ARCHITECTURE.md`

## Related Documents

`EAO_ARCHITECTURE.md` · `EAO_SKILL_LIBRARY.md` · `EAO_ACTIVATION_ROADMAP_PROPOSAL.md`
