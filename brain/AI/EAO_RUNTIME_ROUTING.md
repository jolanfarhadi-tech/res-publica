## EAO Runtime Routing (Proposal - Extension)

Status: Proposed - pending ADR-024 acceptance. Elaborates EAO_ARCHITECTURE.md sections 2-3; does not modify them.

### Purpose

Details how the Runtime Coordinator (CSO) decides which role answers a request, when cooperation is needed, and how conflicting or multiple findings become one recommendation.

### Which Advisor Should Answer

CSO matches the request's subject matter against EAO_AGENT_REGISTRY.md's Domain Advisor table (subject-matter documents) and Technical Advisor table (repository mechanics). A request naming a specific methodology document routes to that document's named Domain Advisor first; a request about repository state (git, links, ADR coverage) routes to the matching Technical Advisor.

### Which Executive Officer Should Answer

An Executive Board member answers only when a request is cross-cutting (spans more than one Domain/Technical Advisor's scope) or when it concerns planning/reporting rather than a single document's content. A request entirely within one Advisor's scope is answered by that Advisor directly, with the Board member (CSO) only routing, not re-answering.

### When Multiple Advisors Should Cooperate

Cooperation is triggered when a request's context_refs span more than one Advisor's named subject matter (for example, a question touching both the Evidence Model Advisor and the Structured Hearing Advisor). CSO issues parallel requests (per EAO_TASK_ORCHESTRATION.md's Parallel Tasks rule) to each relevant Advisor rather than picking one arbitrarily.

### How Conflicts Are Resolved

When two Advisors return contradictory findings, the Runtime does not pick a winner. Per EAO_ARCHITECTURE.md section 3, both findings are presented side by side, each attributed to its source, and the conflict itself is flagged in the Risk/Flag Register (EAO_REPORTING_TEMPLATES.md #7) for human resolution. Architecture-validation conflicts are always deferred to ecc:architect specifically, never resolved by any EAO role's own judgment.

### How Recommendations Are Merged

Non-conflicting findings from multiple Advisors are merged into a single report by concatenation with attribution, not by synthesis that could obscure which role said what. A CSO-authored summary paragraph may sit above the attributed findings, but the underlying detail is always retained beneath it - never a lossy summary presented alone.

### How Confidence Scores Are Produced

Confidence is qualitative, not a fabricated statistic - each Advisor's response includes a confidence_note (per EAO_COMMUNICATION_PROTOCOL.md's Response Model) stated as one of: Direct evidence found; Inferred from related documents; Incomplete - some sources unavailable; Contradicted by another source. No EAO role produces a numeric confidence percentage, since no real model-confidence signal exists to back one - inventing one would be the same fabrication this architecture's own no-fake-tools rule already forbids for plugins, applied here to advisory outputs.

### Relationship to Existing Documents

Does not modify EAO_ARCHITECTURE.md sections 2-3. Operationalizes them with concrete routing/merge rules.

## References

`brain/AI/EAO_ARCHITECTURE.md` sections 2-3; `brain/AI/EAO_AGENT_REGISTRY.md`; `brain/AI/EAO_COMMUNICATION_PROTOCOL.md`

### Related Documents

`EAO_COMMUNICATION_PROTOCOL.md`, `EAO_RUNTIME_ARCHITECTURE.md`, `EAO_EXECUTION_PIPELINES.md`
