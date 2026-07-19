## EAO Execution Pipelines (Proposal - Extension)

Status: Proposed - pending ADR-024 acceptance. No pipeline below has executed; each composes already-defined roles, skills, and plugins from the other EAO documents.

### Purpose

Defines 9 complete, end-to-end pipelines, each a concrete composition of existing EAO parts - no new role, skill, or plugin is introduced here.

### 1. Repository Health Pipeline

- Inputs: current working tree state
- Agents: Git Advisor, Repository Health Advisor
- Skills: Repository Health, Project Health
- Plugins: Native Git, Filesystem (Phase 1 only)
- Outputs: Repository Status Report (#1)
- Human approval points: none required to generate the report; required only if any finding recommends a file change

### 2. Architecture Review Pipeline

- Inputs: a methodology document or set of documents
- Agents: Chief Architecture Officer, relevant Domain Advisor(s), ecc:architect (real, existing - final validation)
- Skills: Architecture Consistency, Layer Validation, Domain Validation, Boundary Analysis
- Plugins: Native Filesystem, Ripgrep
- Outputs: Architecture Health Report (#3)
- Human approval points: before any recommended change is applied; ecc:architect's validation is never bypassed

### 3. Documentation Review Pipeline

- Inputs: one or more documents' cross-reference sets
- Agents: Chief Documentation Officer, Documentation Advisor
- Skills: Broken Link Detection, Duplicate Detection, Missing References, Cross Reference Validation, Glossary Validation
- Plugins: Native Ripgrep, Filesystem
- Outputs: Documentation Health Report (#4)
- Human approval points: before any correction is applied

### 4. ADR Review Pipeline

- Inputs: architecture/adr/ directory, plus the document/decision under review
- Agents: ADR Advisor
- Skills: ADR Review
- Plugins: Native Filesystem
- Outputs: ADR Recommendation List (#11)
- Human approval points: before drafting a new ADR; before any ADR's status changes

### 5. Dependency Analysis Pipeline

- Inputs: a set of documents or tasks
- Agents: Dependency Advisor
- Skills: Dependency Mapping, Concept Dependency Mapping
- Plugins: Native Filesystem, Ripgrep; Graphviz (Phase 2, not installed - degrades to Mermaid)
- Outputs: Dependency Map (#10), Critical Path (#14)
- Human approval points: none to generate; required before treating the Critical Path as a binding schedule

### 6. Project Health Pipeline

- Inputs: outputs of pipelines 1-5
- Agents: Chief Systems Officer (aggregator)
- Skills: Project Health, Progress Analysis
- Plugins: none beyond native
- Outputs: Project Health Report (#2)
- Human approval points: none to generate; required to act on any recommendation within it

### 7. Roadmap Generation Pipeline

- Inputs: Requirements Backlog (#8), Task Breakdown (#9), Dependency Map (#10)
- Agents: Chief Delivery Officer, Chief Systems Officer
- Skills: Roadmap Planning, Gantt Generation, Milestone Planning, Sprint Planning
- Plugins: native Markdown/Mermaid generation only
- Outputs: Roadmap (#12), Mermaid Gantt Chart (#13)
- Human approval points: mandatory before the Roadmap is treated as binding (EAO_PERMISSION_MODEL.md)

### 8. Risk Analysis Pipeline

- Inputs: outputs of pipelines 1-5
- Agents: Chief Systems Officer, relevant Domain/Technical Advisors
- Skills: Risk Analysis
- Plugins: none beyond native
- Outputs: Risk / Flag Register (#7)
- Human approval points: mandatory, immediately, for any Critical-severity finding (escalation path, EAO_COMMUNICATION_PROTOCOL.md)

### 9. Release Readiness Pipeline

- Inputs: MVP Status sections across methodology documents
- Agents: Release Advisor, Chief Delivery Officer
- Skills: Release Readiness, Change Impact Review
- Plugins: GitHub (Phase 2, not installed - degrades to gh CLI via Bash)
- Outputs: a Release Readiness section within the Project Health Report
- Human approval points: mandatory before any release is declared ready; Git operations (tagging, releasing) remain human-executed always

### Relationship to Existing Documents

Composes EAO_AGENT_REGISTRY.md, EAO_SKILL_LIBRARY.md, EAO_PLUGIN_MCP_ARCHITECTURE.md, and EAO_REPORTING_TEMPLATES.md - introduces no new role, skill, plugin, or template.

## References

`brain/AI/EAO_AGENT_REGISTRY.md`; `brain/AI/EAO_SKILL_LIBRARY.md`; `brain/AI/EAO_PLUGIN_MCP_ARCHITECTURE.md`; `brain/AI/EAO_REPORTING_TEMPLATES.md`

### Related Documents

`EAO_PLATFORM_ARCHITECTURE.md`, `EAO_SYSTEM_SEQUENCE.md`, `EAO_RUNTIME_ROUTING.md`
