# EAO Permission and Human Approval Model (Proposal)

```
Status: Proposed — pending ADR-024 acceptance.
```

## Purpose

Defines exactly what any EAO role may and may not do, and every point at which a named human approver must sign off before an action proceeds. This model is a specialization of the same Human Approval discipline already established in `ADR-004`'s roster (Responsibility Agent, Eco Accountability Agent, etc. — each "Read Only + Suggest Only," each requiring human approval for any block/flag it issues).

## Permission Tiers

| Tier | What it allows | Applies to |
|---|---|---|
| **Read Only** | Reading repository files, git history, prior reports | All 22 EAO roles, always |
| **Suggest Only** | Producing an advisory finding, recommendation, or draft report | All 22 EAO roles, always |
| **Draft Proposal** | Producing a full draft document (e.g., a new ADR draft) for human review | CSO, CAO, CGO, CDO, CRO, CDO-Delivery only |
| **Modify Configuration** | Editing an existing, non-LOCKED file | **No EAO role has this tier by default.** Granted only per-instance, by explicit human instruction, exactly as this session's standing practice already requires. |
| **Commit / Push / Merge** | Git write operations | **No EAO role ever has this tier.** Remains human-executed always. |
| **Approve Architecture** | Ratifying an architecture decision as final | **No EAO role ever has this tier.** Reserved for `ecc:architect` (validation) and Human Approval Authority (acceptance) only. |

Every EAO role, at every tier it holds, is capped at **Suggest Only** unless a human explicitly elevates a specific action in a specific instance — never a standing elevation.

## Human Approval Gates (full list)

| Gate | Required before |
|---|---|
| ADR acceptance | Any ADR (including ADR-024 itself) moves from Proposed to Accepted |
| Agent registration | Any EAO role is added to `AGENT_SKILL_PLUGIN_ARCHITECTURE.md`'s roster |
| Agent activation | Any EAO role is added to `AGENT_ACTIVATION_ROADMAP.md`'s activation plan |
| Agent file creation | Any `.claude/agents/*.md` file is created for an EAO role |
| File modification | Any existing repository file is edited, by any EAO role |
| Roadmap binding | A Roadmap output (`EAO_REPORTING_TEMPLATES.md` #12) is treated as a committed plan rather than a suggestion |
| Reviewer override | Any EAO finding would supersede or contradict an existing `ecc:architect`/`ecc:code-reviewer`/`ecc:security-reviewer` finding |
| Git operation | Any commit, push, merge, or branch operation |
| Governance-sensitive finding | Any finding touching a LOCKED file, Constitution-adjacent principle, or GDPR/consent matter (auto-escalated per `EAO_ARCHITECTURE.md` §7) |

## Authority Boundaries (restated, binding)

- **The EAO never approves architecture.** `ecc:architect` validates; Human Approval Authority accepts.
- **The EAO never commits, merges, or pushes.** Git remains human-executed, per this session's standing practice throughout.
- **The EAO never makes legal, medical, ethical, or governance decisions.** It may flag that one is needed and route to the relevant existing governance document (`ETHICS_CHARTER.md`, `DPIA.md`, etc.) — it does not make the decision itself.
- **The EAO never activates an unapproved agent.** Registration and activation are separate, both human-gated steps (see `EAO_ACTIVATION_ROADMAP_PROPOSAL.md`).

## References

`architecture/adr/ADR-004-ecc-agent-system.md`; `brain/AI/AI_GOVERNANCE_HIERARCHY.md`

## Related Documents

`EAO_ARCHITECTURE.md` · `EAO_AGENT_REGISTRY.md` · `EAO_ACTIVATION_ROADMAP_PROPOSAL.md`
