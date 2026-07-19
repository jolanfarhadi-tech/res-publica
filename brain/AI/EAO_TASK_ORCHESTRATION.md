## EAO Task Orchestration (Proposal - Extension)

Status: Proposed - pending ADR-024 acceptance. No scheduler described here currently exists or runs.

### Purpose

Defines how EAO tasks (Requirements Backlog / Task Breakdown items, EAO_REPORTING_TEMPLATES.md #8-9) would be scheduled, queued, and executed once activated, extending EAO_ARCHITECTURE.md section 6's prioritization factors into concrete orchestration mechanics.

### Task Scheduler

Not a background daemon - the Scheduler runs only when the Runtime Coordinator (CSO, EAO_RUNTIME_ARCHITECTURE.md) processes a batch of requests. It orders pending tasks by the three priority factors (blocking status, risk severity, governance sensitivity) already defined in EAO_ARCHITECTURE.md section 6, then dispatches per the rules below.

### Task Queue

A single ordered list of pending tasks, each carrying: task_id, requirement_ref, priority_score, dependencies, status. Status is one of: Queued, In Progress, Blocked (on a dependency), Completed, Cancelled, Failed.

### Priority Queue

The Task Queue re-sorted by priority score whenever a new task is added or a dependency resolves - not a separate data structure, the same queue viewed in priority order.

### Parallel Tasks

Two tasks may run in parallel only if: (a) neither is a dependency of the other, (b) they target different Advisors (no single role handles two Active requests simultaneously, per the Runtime State Model's per-role Idle/Active/Failed states, EAO_RUNTIME_ARCHITECTURE.md). Parallelism is bounded by available distinct roles, not unbounded.

### Sequential Tasks

Tasks with a declared dependency always run sequentially - the dependent task remains Blocked until its dependency reaches Completed.

### Dependencies

Declared explicitly per task, citing the specific document/task it depends on (consistent with the Dependency Map, EAO_REPORTING_TEMPLATES.md #10) - never an implicit or inferred dependency.

### Retry

A Failed task (per Failure Handling, EAO_RUNTIME_ARCHITECTURE.md) is retried once, automatically, on the next Scheduler pass. A second failure marks it permanently Failed and reports it - no infinite retry loop, consistent with the "no long-running background state" principle.

### Cancellation

A human may cancel any Queued or In Progress task at any time - cancellation is immediate and does not require the task to reach a natural stopping point first, since no EAO role holds irreversible state mid-task (every action is advisory, nothing is committed until human-approved).

### Human Approval Checkpoints

- Before a task moves from the Requirements Backlog into the active Task Queue (confirms it's worth scheduling at all).
- Before any task whose completion would touch a LOCKED file, an ADR's status, or the real AGENT_ACTIVATION_ROADMAP.md / AGENT_SKILL_PLUGIN_ARCHITECTURE.md.
- Before the Roadmap (EAO_REPORTING_TEMPLATES.md #12) generated from completed tasks becomes binding.

### Relationship to Existing Documents

Does not modify EAO_ARCHITECTURE.md section 6 - operationalizes it. Does not modify EAO_PERMISSION_MODEL.md - reuses its existing gates.

## References

`brain/AI/EAO_ARCHITECTURE.md` section 6; `brain/AI/EAO_RUNTIME_ARCHITECTURE.md`; `brain/AI/EAO_PERMISSION_MODEL.md`

### Related Documents

`EAO_RUNTIME_ARCHITECTURE.md`, `EAO_EXECUTION_PIPELINES.md`, `EAO_SHARED_MEMORY_MODEL.md`
