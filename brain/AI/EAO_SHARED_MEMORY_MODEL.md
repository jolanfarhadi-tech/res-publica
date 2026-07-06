# EAO Shared Memory Model (Proposal — Extension)

```
Status: Proposed — pending ADR-024 acceptance.
Reconciliation, stated up front: EAO_ARCHITECTURE.md SS4 already establishes "the EAO maintains no
independent, separate memory store -- it reads the repository itself... as its memory." This document
does not contradict that. The 8 "memory" categories below are classifications of already-existing
repository artifacts, not a new parallel data store -- consistent with this repository's standing
discipline (AuditLog, RESPONSIBILITY_EVIDENCE_MODEL.md SS7: "no second, independent logging mechanism").
```

## Purpose

Names 8 categories of "memory" the EAO reasons over, each mapped to real, already-existing repository state — not a new database.

## The 8 Memory Categories

| Memory | Purpose | Owner (real artifact) | Retention | Access | Lifecycle |
|---|---|---|---|---|---|
| **Project Memory** | What's been decided/done at the project level | Git commit history + `brain/PROJECT_MEMORY.md` (already exists) | Permanent (git history) | Read Only, all roles | Grows only via normal commits |
| **Architecture Memory** | Current state of every methodology/governance document | The documents themselves (`docs/source/`, `brain/FOUNDATION/`) | Permanent, version-controlled | Read Only, all roles | Grows via normal document edits |
| **Knowledge Memory** | Canonical term/concept definitions | `docs/source/glossary/TERMS.md`, `ACRONYMS.md` | Permanent | Read Only, all roles | Updated per that document's own Governance rule |
| **Decision Memory** | Formal architecture decisions | `architecture/adr/` directory | Permanent | Read Only, all roles | Grows via new ADRs; existing ADRs never rewritten, only addended (this session's own established discipline) |
| **Task Memory** | Current backlog/task state | `EAO_REPORTING_TEMPLATES.md` #8–9 outputs, held in git as generated Markdown | Per-run, superseded by the next run's output (git history retains prior runs) | Read Only, all roles; Suggest Only to propose changes | Regenerated each EAO run, not mutated in place |
| **Release Memory** | Release-readiness state | MVP Status sections across methodology documents | Permanent, version-controlled | Read Only, all roles | Updated as each document's own MVP Status changes |
| **Risk Memory** | Open risks/flags | `EAO_REPORTING_TEMPLATES.md` #7 outputs | Per-run (git history retains prior runs) | Read Only, all roles | Regenerated each run |
| **Conversation Memory** | Prior EAO run reports/session transcripts | Git history of generated reports, if committed; otherwise session-scoped only | Session-scoped unless explicitly committed | Read Only, all roles | Not persisted beyond the session unless a human explicitly commits a report |

## Binding Rule

No EAO role may introduce a second, EAO-only data store (a database, a cache, an external file format not already used by this repository) to hold any of the above — every memory category is a *view* over repository state that already exists or that the EAO itself writes as ordinary, git-tracked Markdown, exactly like `EAO_REPORTING_TEMPLATES.md`'s outputs. This is the same discipline as `AuditLog`'s "no parallel logging system" rule, applied to EAO memory specifically.

## Access Permissions

All 8 categories are Read Only to every EAO role by default, per `EAO_PERMISSION_MODEL.md`. No role writes directly to Decision Memory (ADRs) or Architecture Memory (methodology documents) — those changes remain human-approved file edits, exactly as this entire session has operated.

## Relationship to Existing Documents

Does not modify `EAO_ARCHITECTURE.md` §4 — this document is that section's detailed elaboration, explicitly reconciled rather than contradicting it.

## References

`brain/AI/EAO_ARCHITECTURE.md` §4; `brain/GOVERNANCE/RESPONSIBILITY_EVIDENCE_MODEL.md` §7

## Related Documents

`EAO_RUNTIME_ARCHITECTURE.md` · `EAO_TASK_ORCHESTRATION.md` · `EAO_PLATFORM_ARCHITECTURE.md`
