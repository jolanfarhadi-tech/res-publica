# ADR-030: AI Runtime Boundary

## Status

Accepted — explicitly approved by the Founder on 2026-07-19.

## Authorship

Prepared on 2026-07-19 by the implementation agent from the existing stub and
approved repository constraints. This is an authored decision record, not a
discovered fact. The Founder approved the recommendation in the explicit
approval quoted under Human Approval Record.

## Classification

Architectural runtime and policy-boundary decision. It does not authorize a
specific model/provider, invent a Governance AI use case, activate personal-data
processing, or weaken any human approval requirement.

## Context

ADR-008 defines one shared grounded RAG service for Civic products, with
citation-or-refuse and a hard cost ceiling. Governance workflows have higher
accountability requirements and may involve Evidence, Hearings, Scientific
Review, Harm classification, and Repair. ADR-026 permits shared mechanisms but
requires business policy to remain domain-owned.

Duplicating provider clients, model gateways, citation infrastructure, usage
accounting, and failure handling would increase cost and create inconsistent
safety controls. Applying one undifferentiated Civic policy to Governance work
would flatten the stronger human-review and admissibility requirements of that
domain.

## Decision

### 1. One shared AI runtime substrate

Shared Platform Services owns the reusable AI runtime mechanism:

- provider/model adapters and request execution;
- model-routing and fallback mechanics;
- prompt/input and output transport;
- citation-enforcement primitives;
- raw usage and cost ledger;
- spend-ceiling enforcement, refusal, and technical telemetry; and
- provider-neutral failure behavior.

Modules and domains may not bypass this runtime with independent AI calls.

### 2. Domain-owned policy layers

Civic Domain and Governance Domain independently own the policy applied to
their use cases, including:

- permitted purpose and data classes;
- approved sources and retrieval scope;
- prompt/instruction policy;
- required assurance, review, and sign-off;
- retention and disclosure rules;
- output status and publication eligibility; and
- fallback or refusal behavior beyond the shared minimum.

The runtime enforces the selected domain policy but does not author it.

### 3. Shared minimum controls

Citation-or-refuse, provenance retention, the hard spend ceiling, and explicit
provider-outage behavior are minimum controls for every domain. A domain may
impose stronger controls but may not weaken these shared guarantees.

AI output is advisory and never constitutes Evidence validation, Scientific
Review, Harm classification approval, institutional sign-off, or another
named-human decision.

### 4. Cost governance remains singular

The ADR-008 raw cost/usage ledger remains the only authoritative ledger.
Every request records its owning domain and use-case identifier so costs can be
allocated and audited. Analytics may aggregate these records but may not create
a competing ledger. Domain budgets may be stricter partitions under the shared
ceiling; they do not replace the platform ceiling.

### 5. Governance activation remains gated

This ADR establishes where a future Governance AI use case would execute. It
does not establish that any such use case is approved. Governance AI remains
disabled until its owning methodology/ADR defines purpose, permitted data,
human review, retention, failure behavior, and legal/privacy approval.

### 6. Deployment

One runtime boundary does not require one process, provider, or deployment.
The current modular monolith may implement it in-process. Future isolation for
risk, residency, or scale may occur behind the same contract without changing
domain ownership; a materially new workload-identity or trust boundary requires
its own ADR.

## Alternatives Considered

### One runtime with one global business policy

Rejected. It assigns domain semantics to Shared Platform Services and cannot
represent Governance's stronger accountability rules.

### Separate complete AI stacks per domain

Rejected. It duplicates cost governance and citation enforcement and creates a
high risk of inconsistent controls for the current team.

### Governance owns the complete runtime

Rejected. It would place Civic AI infrastructure under a peer business domain.

### Modules call providers directly

Rejected by ADR-008. It bypasses the citation and cost-governance chokepoint.

## Consequences

- Provider integration, cost control, and technical safeguards are reused.
- Domain policy is explicit and independently testable.
- Governance can require stronger review without forking infrastructure.
- Every AI request must identify one owning domain and use case.
- No Governance AI feature is authorized solely by accepting this ADR.
- Provider selection, DPIA, processing records, data residency, security review,
  and production activation remain operational/legal gates.

## Validation Criteria

- No module invokes a model provider outside the shared runtime.
- Every request has an owning domain and approved use-case policy.
- Unsupported or unapproved use cases fail closed.
- Every displayed answer satisfies citation-or-refuse.
- AI cannot mark its own output validated, reviewed, or signed off.
- Raw cost records exist in one ledger and enforce the platform ceiling before
  execution.
- A Governance policy can demand stronger review without changing Civic policy.
- Runtime/provider failure leaves non-AI and anonymous content paths available.

## Human Approval Record

Approved by the Founder on 2026-07-19:

> “Die empfohlenen Entscheidungen für ADR‑028, ADR‑030 und ADR‑031 sind als
> Founder-Entscheidung genehmigt. Die drei bestehenden Stubs dürfen zu
> vollständigen ADRs ausgearbeitet werden.”

The approved ADR-030 recommendation was: one shared AI runtime substrate, with
separate Civic and Governance policy and approval layers per use case.

## References

`architecture/adr/ADR-008-ai-layer.md`;
`architecture/adr/ADR-026-constitutional-domain-architecture.md`;
`architecture/adr/ADR-027-identity-authentication-authorization.md`;
`docs/source/foundation/01_HARM_OPERATING_SYSTEM.md`;
`docs/source/governance/AI_POLICY.md`;
`docs/source/governance/DPIA.md`.
