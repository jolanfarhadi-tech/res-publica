## EAO System Sequence Diagrams (Proposal - Extension)

Status: Proposed - pending ADR-024 acceptance. Diagrams describe intended flow once activated; nothing here has executed.

### Purpose

Full end-to-end sequence diagrams composing roles already defined across the EAO document set - distinct from EAO_COMMUNICATION_PROTOCOL.md's two protocol-level diagrams (single request/response, and escalation), which these build on.

### Sequence 1: Full Advisory Request, Multi-Role

```mermaid
sequenceDiagram
    participant U as User (Human)
    participant RT as Runtime (CSO)
    participant CAO as Chief Architecture Officer
    participant AA as Architecture Advisor(s)
    participant DA as Documentation Advisor
    participant AG as Aggregation
    participant DB as Dashboard
    participant H as Human

    U->>RT: Request
    RT->>RT: Classify and route
    RT->>CAO: Architecture-scoped sub-request
    CAO->>AA: Delegate investigation
    AA-->>CAO: Finding plus confidence note
    RT->>DA: Documentation-scoped sub-request
    DA-->>RT: Finding plus confidence note
    CAO-->>RT: Architecture finding
    RT->>AG: Combine findings, attributed
    AG->>DB: Update relevant metrics
    AG-->>H: Final report, sources attributed
    H->>H: Review and decide, no auto-action taken
```

### Sequence 2: Repository Scan to Next Actions

```mermaid
sequenceDiagram
    participant RT as Runtime (CSO)
    participant RIE as Repository Intelligence Engine
    participant PIE as Project Intelligence Engine
    participant H as Human

    RT->>RIE: Trigger Repository Health Pipeline
    RIE-->>RT: Repository Status, Architecture Health, Documentation Health
    RT->>PIE: Risk Analysis Pipeline
    PIE-->>RT: Risk / Flag Register
    RT->>PIE: Requirement Extraction
    PIE-->>RT: Requirements Backlog
    RT->>PIE: Roadmap Generation Pipeline
    PIE-->>RT: Roadmap plus Mermaid Gantt Chart
    RT->>RT: Determine single Next Action
    RT-->>H: Next Action Plan, full backlog and roadmap available on request
    H->>H: Approve, modify, or reject
```

### Notes on Both Sequences

- No step in either diagram commits, merges, or pushes anything - both terminate in a human decision point, consistent with EAO_PERMISSION_MODEL.md.
- Any Critical-severity finding surfacing mid-sequence interrupts the normal flow and routes immediately via the Escalation Path (EAO_COMMUNICATION_PROTOCOL.md), not shown here for clarity but binding in all cases.
- Both sequences are examples of the Execution Pipelines (EAO_EXECUTION_PIPELINES.md) composed together, not new pipelines of their own.

### Relationship to Existing Documents

Composes EAO_COMMUNICATION_PROTOCOL.md's request/response and escalation diagrams, EAO_RUNTIME_ROUTING.md's routing rules, and EAO_EXECUTION_PIPELINES.md's named pipelines into two full system-level views. Introduces no new role, gate, or rule.

### References

brain/AI/EAO_COMMUNICATION_PROTOCOL.md; brain/AI/EAO_RUNTIME_ROUTING.md; brain/AI/EAO_EXECUTION_PIPELINES.md; brain/AI/EAO_PLATFORM_ARCHITECTURE.md

### Related Documents

EAO_PLATFORM_ARCHITECTURE.md, EAO_RUNTIME_ARCHITECTURE.md
