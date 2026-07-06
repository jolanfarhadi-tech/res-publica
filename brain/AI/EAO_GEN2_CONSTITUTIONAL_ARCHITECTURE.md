# EAO Generation 2 Constitutional Architecture

```
Status: Approved (Generation 2 planning). Transition Phase artifact - persisted verbatim
from the approved planning conversation. This is the authoritative top-level architectural
document for the EAO execution platform's Generation 2.
```

Faithful transcription of the approved "EAO Generation 2 Constitutional Architecture" design. No content redesigned during persistence.

## 1. Architectural Foundations

Generation 1 established eight principles, applied consistently across all 9 pipelines without exception: **Single Source of Truth, Extend at the Source, Composition over Duplication, Explicit Ownership, Traceability, Deterministic Behavior, Backward Compatibility, Disclosure over Fabrication.**

These are constitutional, not implementation detail, for one concrete reason: every subsequent layer described in this document — the Canonical Action Model, the Registries, the Schema, the Pipeline Architecture — is a specific application of these eight principles to one particular concern. The principles themselves predate every field, pipeline, and registry, and were shown to hold across nine independently-scoped sprints with materially different requirements each time. A field can be added or deprecated; a pipeline can be replaced; the principle that "one fact has one producer" cannot be revised without the entire execution architecture losing its meaning. The test for constitutional status used throughout this document: **if changing it would invalidate every layer built on top of it, it is constitutional; if it only changes what one layer produces, it is implementation.**

## 2. Constitutional Layers

| Layer | Established In | Role |
|---|---|---|
| **Execution Architecture** | Gen1 Assessment; Gen2 Blueprint SS5 | The `lib/*` -> first-order pipelines -> `project-health.mjs` -> second-order pipelines chain. The sole producer of repository truth. |
| **Canonical Action Model** | Gen2 Blueprint SS1 | The single contract (12 fields) through which all findings cross pipeline boundaries. |
| **Registry Architecture** | Gen2 Blueprint SS2-3 | The Category Registry and Risk Domain Registry - the closed vocabularies the Canonical Model's `category`/`riskDomain` fields draw from. |
| **Schema Architecture** | Gen2 Blueprint SS4 | `schemaVersion` and the additive/behavioral/breaking compatibility policy governing how the Canonical Model and Registries may change. |
| **Pipeline Architecture** | Gen2 Blueprint SS5 | The registration/discovery model governing how new pipelines join the Execution Architecture. |
| **Governance Architecture** | Governance Framework SS1-8 | The process by which every layer above may change: proposal, review, ADR, validation, approval, release. |
| **Validation Architecture** | Gen2 Blueprint SS6 | Regression, golden-output, schema, contract, and compatibility testing - the mechanisms that check conformance to the layers above. |
| **Fitness Function Layer** | Refinement SS1 | The permanent, continuously-run form of Validation Architecture - checks that hold not just at merge time but on a standing basis. |
| **Exception Governance** | Refinement SS2 | The narrow, time-boxed, auditable release valve within Governance Architecture - never a parallel path around it. |
| **Architecture Constitution** | This document; Refinement SS5 | The layer that declares all of the above authoritative and defines how it may itself evolve (SS8, below). |

**How the layers relate:** Execution Architecture produces truth. Canonical Action Model, Registry Architecture, and Schema Architecture formalize and version the vocabulary used to describe that truth across pipeline boundaries. Pipeline Architecture governs how new producers/consumers join the Execution layer under that vocabulary. Governance Architecture is the process that authorizes any change to any of the preceding five layers. Validation Architecture and the Fitness Function Layer are how that process's outcomes are checked - one at the moment of change, one continuously afterward. Exception Governance is the controlled, expiring exception to that checking, never a substitute for it. The Constitution sits above all of them, asserting that this stack - not any single layer in isolation - is what "the architecture" means.

## 3. Constitutional Dependency Model

```
FOUNDATIONAL  ->  Execution Architecture
                  (owns truth: the sole producer of repository facts)

DERIVED       ->  Canonical Action Model, Registry Architecture, Schema Architecture
                  (interpret and formalize truth; produce facts ABOUT the model
                  itself - e.g. "this category exists" - never new repository facts)

              ->  Pipeline Architecture
                  (extends the foundational layer under the derived layers' rules)

GOVERNANCE    ->  Governance Architecture, Exception Governance
                  (own no repository truth and no model truth; govern the PROCESS
                  by which the foundational and derived layers may change)

VALIDATION    ->  Validation Architecture, Fitness Function Layer
                  (own no truth; verify that the foundational and derived layers
                  remain internally consistent with each other and with governance)

CONSTITUTIONAL ->  Architecture Constitution
                  (asserts the whole stack is authoritative; governs its own amendment)
```

**Which layers own truth vs. interpret it:** only the Execution Architecture owns truth - it is the sole producer of facts about the repository. Every other layer either formalizes that truth into a shared vocabulary (derived layers), governs the process of changing that vocabulary or its producers (governance layers), or checks that the whole stack remains internally consistent (validation layers). No layer above Execution Architecture may assert a new repository fact independently.

## 4. Constitutional Ownership Model

| Artifact | Owner | Notes |
|---|---|---|
| **Libraries** (`lib/git.mjs`, `lib/markdown.mjs`, `lib/graph.mjs`) | Architecture-wide - no single pipeline owns a shared utility | Consumed by every pipeline; any change ripples everywhere, so review scope is the whole Execution Architecture, not one pipeline |
| **Pipelines** | Each pipeline's own author (Governance Framework SS5) | Subject to Architecture Review for anything touching a shared layer |
| **Canonical Model** | The `project-health.mjs` maintainer - the sole aggregator role (Governance Framework SS2) | Not a personal title; an architectural role that follows whoever maintains the aggregator |
| **Registries** | Category Registry: per-entry, owned by the detecting pipeline. Risk Domain Registry: architecture-wide (Governance Framework SS3) | Mirrors the derived-layer distinction in SS3: categories are numerous and pipeline-specific; domains are few and cross-cutting |
| **Schema** | The Canonical Model owner (Governance Framework SS4) | `schemaVersion` and compatibility classification travel with the Canonical Model, not separately |
| **Governance** | Shared, collectively binding - no single actor owns "governance" itself | Enforced at its single point of authority: the Human Approval Authority |
| **Documentation** | Always mirrors the ownership of the artifact it describes | A registry's documentation is owned by the registry's owner; a pipeline's documentation by its author - documentation ownership is never separate from artifact ownership |

**Ownership, stewardship, consumption - distinguished:**
- **Ownership** is the authority to approve a change to an artifact.
- **Stewardship** is the shared, distributed responsibility to maintain an artifact's health day to day, independent of approval authority.
- **Consumption** is the right to read and depend on an artifact with no approval authority over it.

## 5. Constitutional Change Model

Schema Governance, ADR Governance, Registry Governance, Pipeline Governance, Quality Gates, Fitness Functions, and the Exception Policy are not seven separate mechanisms - they are checkpoints within one lifecycle, the Governance Lifecycle (Governance Framework SS8):

```
Proposal -> Architecture Review -> ADR (if required) -> Implementation -> Validation
(Quality Gates + Fitness Functions) -> Approval (Human Approval Authority) -> Release
-> Post-release Review (Exception Governance activates here if needed)
```

Every one of the seven named mechanisms is a specialization of a stage in this one lifecycle. There is one constitutional process.

## 6. Constitutional Invariants

| Invariant | Rationale | Affected Layers | Violation Impact |
|---|---|---|---|
| One fact has one producer | Prevents silent divergence between two "truths" | Execution, Validation | Confirmed near-miss: `walkScripts`/`findMarkdownFiles` independently implementing the same walk |
| The Canonical Action Model remains the single architectural contract | Enables composition without duplication | Canonical Model, Pipeline Architecture | A private finding-shape fragments the composition chain |
| Downstream pipelines never reconstruct upstream knowledge | Keeps the dependency chain a true DAG | Execution, Pipeline Architecture | Silent behavioral drift between the real answer and an approximation |
| Governance cannot bypass validation | Approval without verification is ceremony, not governance | Governance, Validation, Fitness Function Layer | Approval of a change that provably breaks integrity |
| Exceptions cannot become architecture | Stated explicitly in Refinement SS2 | Exception Governance, ADR Governance | Invisible architectural drift through indefinitely-renewed exceptions |
| Every canonical field, category, and registry entry has exactly one named owner | Explicit Ownership principle | Ownership Model, Canonical Model, Registry Architecture | Reintroduces the confirmed GOVERNANCE_DOCS/CORE_DOCS-style ambiguous-ownership problem |
| No pipeline performs a write or mutate operation | Read-only Execution is EAO's foundational safety property | Execution, Fitness Function Layer | Would change what EAO fundamentally is - the most severe possible violation; no exception path exists for this invariant |
| Every reported conclusion is traceable to evidence | Distinguishes EAO's outputs from unaccountable scoring | Canonical Model, Validation | Recommendations become unverifiable assertions |

## 7. Constitutional Maturity Model

| Level | Name | Objective Criteria | Status (at Transition) |
|---|---|---|---|
| 1 | Functional | Pipelines exist and produce correct, useful output on demand | Achieved in Gen1 |
| 2 | Compositional | At least two pipelines demonstrably import from a shared upstream compute function | Achieved in Gen1 |
| 3 | Canonical | Canonical Model spec + Registries exist as real artifacts, and at least one pipeline references them instead of raw strings | Spec persisted at Transition; code reference is Phase A work |
| 4 | Governed | At least one real architectural change processed through the full documented Governance Lifecycle, producing an auditable record | Process defined, not yet exercised |
| 5 | Self-validating | Fitness Functions execute automatically at least once without human intervention | Designed, not yet implemented |

## 8. Constitutional Review Model

| Change Type | Governance Threshold |
|---|---|
| Constitutional amendment (an Invariant, a Layer, the Maturity Model itself) | Full Governance Lifecycle plus ADR - the highest scrutiny this framework has |
| Architectural improvement (new registry, new Fitness Function, new layer) | ADR required or recommended per Governance Framework SS6's table |
| Implementation change (new pipeline, new category, additive field) | Pipeline/Registry Governance + Quality Gates; ADR usually unnecessary |
| Documentation update | Direct edit plus review, no ADR, subject to Documentation Validation |

## 9. Executive Constitutional Summary

Generation 1 built 9 working, composed pipelines through disciplined practice: search before building, extend at the source, verify before trusting output. That discipline caught and fixed real defects at every stage through manual vigilance alone.

Generation 2 formalizes exactly what Generation 1 practiced informally. The Canonical Action Model, the Registries, Schema Versioning, the Governance Lifecycle, the Fitness Function Layer, and the Exception Policy convert Generation 1's discipline into explicit, checkable, durable structure.

This constitutional layer exists because informal discipline does not scale past one attentive maintainer's memory. At 9 pipelines, manual vigilance was sufficient. At 20+, the same rigor must be enforced by structure, or it will erode silently.

Future generations preserve integrity while continuing to evolve by treating the Constitutional Invariants (SS6) as the one truly fixed layer, routing every other change through the unified Constitutional Change Model (SS5), and measuring progress honestly against the Maturity Model (SS7) rather than assuming a designed capability is an achieved one.

## References

`brain/AI/EAO_GEN2_GOVERNANCE_FRAMEWORK.md`; `brain/AI/EAO_CANONICAL_ACTION_MODEL_SPEC.md`; `brain/AI/EAO_CATEGORY_REGISTRY.md`; `brain/AI/EAO_RISK_DOMAIN_REGISTRY.md`; `brain/AI/EAO_SCHEMA_VERSIONING_SPEC.md`; `brain/AI/EAO_GEN2_READINESS_REVIEW.md`

## Related Documents

`EAO_GEN2_INDEX.md` · `EAO_ARCHITECTURE.md`
