## EAO Platform Architecture (Proposal - Top-Level)

Status: Proposed - pending ADR-024 acceptance. This is the top-level map over all other EAO documents; it does not replace EAO_ARCHITECTURE.md's own structural/operational-model detail, it situates it among the other layers added since.

### Purpose

Unifies every EAO layer into one coherent platform view, and states explicitly how each layer interacts with the others - completing the transformation from "a document collection" into a described platform architecture.

### The Layers

```
Executive Board (6) --- Domain Advisors (9) --- Technical Advisors (7)
        |                                              |
        +-------------------- routes via --------------+
                              |
                      Skill Library (7 categories, EAO_SKILL_LIBRARY.md)
                              |
                    Plugin Layer (EAO_PLUGIN_MCP_ARCHITECTURE.md -
                    Phase 1 native only; Phase 2-3 not installed)
                              |
                      Runtime Layer (EAO_RUNTIME_ARCHITECTURE.md,
                      EAO_COMMUNICATION_PROTOCOL.md, EAO_RUNTIME_ROUTING.md,
                      EAO_TASK_ORCHESTRATION.md)
                              |
                      Memory Layer (EAO_SHARED_MEMORY_MODEL.md -
                      a view over existing repository state, no new store)
                              |
                      Planning Layer (Roadmap/Gantt/Task Breakdown generation,
                      EAO_REPORTING_TEMPLATES.md #8-15)
                              |
              Dashboard Layer (EAO_DASHBOARD_SPEC.md)  Reporting Layer (EAO_REPORTING_TEMPLATES.md)
                              |
                      Knowledge Graph Layer (conceptual only - no Neo4j
                      installed; degrades to manual Markdown tables)
```

### Repository Intelligence Engine

Not a new file or tool - this is the name for the composed function of the Technical Advisors (Git, Documentation, Repository Health, Dependency, Knowledge Graph) plus their skills, operating over native Git/filesystem/ripgrep access (Phase 1, EAO_PLUGIN_MCP_ARCHITECTURE.md). Its job: turn raw repository state into the Repository Status, Architecture Health, and Documentation Health Reports (#1, #3, #4).

### Project Intelligence Engine

Also not a new file or tool - the composed function of the Chief Systems Officer's planning skills (Progress Analysis, Risk Analysis, Requirement Extraction, Roadmap Planning, Gantt Generation, Critical Path, Dependency Mapping, Sprint/Milestone Planning) operating on the Repository Intelligence Engine's output. Its job: turn repository state into the Requirements Backlog, Task Breakdown, Roadmap, Gantt Chart, and Next Action Plan (#8, #9, #12, #13, #15).

### How Every Layer Interacts

1. A human or a scheduled request enters at the Runtime Layer, which routes it (per EAO_RUNTIME_ROUTING.md) to the Executive Board and/or the relevant Domain/Technical Advisors.
2. Advisors invoke Skill Library entries relevant to the request, which in turn use only Plugin Layer capabilities actually available (Phase 1 native; Phase 2-3 explicitly marked unavailable, never assumed).
3. Findings are read against the Memory Layer (existing repository state, not a new store) and written back only as ordinary Reporting Layer outputs (Markdown files, per EAO_REPORTING_TEMPLATES.md) - never into a parallel database.
4. The Repository Intelligence Engine's outputs feed the Project Intelligence Engine, which produces Planning Layer artifacts (Roadmap, Gantt, Backlog).
5. The Dashboard Layer renders the current Reporting Layer outputs as the 20 metrics (EAO_DASHBOARD_SPEC.md) - a presentation view, not a separate computation.
6. The Knowledge Graph Layer, where invoked, degrades gracefully to manual Markdown tables (no Neo4j installed) - it never claims graph-query capability that doesn't exist.
7. Every layer's output that could affect governance, architecture, or repository state routes through the Human Approval Gates (EAO_PERMISSION_MODEL.md) before anything is acted upon - the Platform Architecture does not create a bypass around any gate already established in the other 16 documents.

### Relationship to Existing Documents

Sits above, and cross-references, all other EAO documents without modifying any of them. EAO_ARCHITECTURE.md remains the canonical source for the 9 original operational models (communication, routing, aggregation, memory, skill usage, prioritization, escalation, approval gates, lifecycle) - this document is the map of how those models, plus the newer Runtime/Memory/Pipeline extensions, compose into one platform.

### References

All 16 other EAO documents; architecture/adr/ADR-024-executive-ai-office.md

### Related Documents

EAO_ARCHITECTURE.md, EAO_RUNTIME_ARCHITECTURE.md, EAO_SYSTEM_SEQUENCE.md, EAO_EXECUTION_PIPELINES.md
