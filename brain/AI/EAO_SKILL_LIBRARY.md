# EAO Skill Library (Proposal)

```
Status: Proposed — pending ADR-024 acceptance. No skill below is active tooling; each is a procedural
checklist any Board member or Advisor may follow using native repository access
(Bash/git, Read, Glob, Grep) unless otherwise noted.
```

## Purpose

Catalogues every skill named in the EAO requirement, organized by category, with its owning role type and what it concretely does. Per the Shared Skill Library Usage Model (`EAO_ARCHITECTURE.md` §5), no skill is owned exclusively by one role.

## CSO Skills

| Skill | What it does |
|---|---|
| Repository Health | Counts files, checks working-tree cleanliness, staleness signals |
| Project Health | Aggregates architecture/documentation/governance health into one summary |
| Progress Analysis | Compares completed vs. planned work by architecture area |
| Risk Analysis | Populates the Risk/Flag Register |
| Requirement Extraction | Derives backlog items from open ADR items, flagged gaps, TODOs |
| Roadmap Planning | Sequences backlog items into a phased, non-binding roadmap |
| Gantt Generation | Renders the Roadmap as a Mermaid `gantt` block |
| Critical Path | Identifies the longest dependency chain in the Roadmap |
| Dependency Mapping | Maps which documents/tasks block which others |
| Sprint Planning | Groups Task Breakdown items into time-boxed batches (advisory only — no calendar system exists to bind this to) |
| Milestone Planning | Groups Roadmap items into named milestones |

## Architecture Skills

| Skill | What it does |
|---|---|
| ADR Review | Checks whether a decision is covered by an existing ADR |
| Architecture Consistency | Cross-checks terminology/ownership across methodology documents (the discipline already applied manually throughout this session) |
| Layer Validation | Checks a document stays within its declared architectural layer (methodology vs. governance vs. project) |
| Domain Validation | Checks a document doesn't redefine Core Domain Model entities |
| Boundary Analysis | Checks a document's stated non-responsibilities are actually honored elsewhere |

**All five route to `ecc:architect` for final validation — they are pre-checks, not a substitute for it.**

## Documentation Skills

| Skill | What it does |
|---|---|
| Broken Link Detection | Greps cross-reference paths against actual file existence |
| Duplicate Detection | Finds near-identical definitions across documents |
| Missing References | Finds a concept used but never cross-referenced to its owning document |
| Cross Reference Validation | Confirms bidirectional links exist where claimed |
| Glossary Validation | Checks new canonical terms against `TERMS.md`/`ACRONYMS.md` |

## Governance Skills

| Skill | What it does |
|---|---|
| Policy Consistency | Checks a document against `DATA_POLICY.md`/`DPIA.md`/`AI_POLICY.md` |
| Responsibility Mapping | Checks a role/document's stated responsibilities don't overlap another's |
| Governance Boundary Review | Checks the "advisory, not decision-making" boundary is honored |
| Human Approval Review | Confirms a proposal states its required approval gates |
| Lifecycle Validation | Checks a proposed lifecycle doesn't conflict with an existing one (the exact check applied to Membership vs. Contribution lifecycles in `MEMBER_PROFILE.md`) |

## Research Skills

| Skill | What it does |
|---|---|
| Source Mapping | Traces a claim back to its originating document |
| Research Gap Detection | Flags a referenced-but-unspecified concept (the "Evidence Standards Annex" pattern) |
| Conceptual Consistency Review | Checks a concept means the same thing everywhere it's used |
| Citation Need Detection | Flags an assertion lacking a supporting reference |
| Knowledge Synthesis | Summarizes findings across multiple documents into one narrative |

## Delivery Skills

| Skill | What it does |
|---|---|
| Task Breakdown | Decomposes a requirement into concrete steps |
| Release Readiness | Checklist against MVP Status sections across methodology documents |
| Commit Planning | Proposes logical commit batches (the exact discipline used throughout this session's Batch 1–5 commits) |
| Milestone Tracking | Tracks Roadmap milestone completion |
| Change Impact Review | Flags what else a proposed change would touch |

## Knowledge Skills

| Skill | What it does | Tooling note |
|---|---|---|
| Knowledge Graph Builder | Would construct an entity/relationship graph from documents | **Requires a graph store (Neo4j) — not installed; degrades to a manual Markdown table today** |
| Ontology Checker | Checks term definitions against `TERMS.md` | Native (Grep/Read) |
| Domain Model Validator | Checks a document doesn't redefine `CORE_DOMAIN_MODEL.md` entities | Native |
| Concept Dependency Mapping | Maps which concepts depend on which others being defined first | Native |
| Terminology Drift Detection | Flags when a term's meaning has shifted across documents (the exact check applied to "Validation Framework"'s retirement this session) | Native |

## References

`brain/AI/EAO_ARCHITECTURE.md` §5

## Related Documents

`EAO_ARCHITECTURE.md` · `EAO_AGENT_REGISTRY.md` · `EAO_PLUGIN_MCP_ARCHITECTURE.md`
