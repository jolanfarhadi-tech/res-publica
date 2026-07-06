# EAO Activation Roadmap (Proposal — Draft Only)

```
Status: Proposed — pending ADR-024 acceptance. NOT part of the real brain/AI/AGENT_ACTIVATION_ROADMAP.md.
That document's own rule is explicit: "The 6 'Not approved' roles below are given no activation phase...
Each would require its own ADR before any activation planning is meaningful." This document is that
future ADR's activation plan, held separately until ADR-024 is accepted — at which point its content
would be merged into the real roadmap, in that document's existing per-agent format.
```

## Purpose

Drafts what an activation entry for each EAO role would look like, without adding anything to the real activation roadmap yet.

## Proposed Activation Order

1. **Chief Systems Officer (CSO)** — first, since every other role routes through it. Trigger: ADR-024 acceptance. Permission: Read Only + Suggest Only. Dependencies: none beyond ADR acceptance itself.
2. **Chief Architecture Officer (CAO)** and the 5 Architecture Skills — second, since routing to `ecc:architect` (already real) requires CAO to exist first. Dependencies: CSO active.
3. **Technical Advisors (Git, Documentation, Repository Health)** — third, since they operate on already-available native tooling (Phase 1, `EAO_PLUGIN_MCP_ARCHITECTURE.md`) with no missing dependency.
4. **Chief Documentation Officer (CDO), Chief Governance Officer (CGO)** — fourth, once the Technical Advisors they lean on are active.
5. **Domain Advisors (all 9)** — fifth, activated together since each is scoped to one already-existing document and has no cross-dependency on the others.
6. **Chief Research Officer (CRO), Chief Delivery Officer (CDO-Delivery), remaining Technical Advisors (ADR, Dependency, Knowledge Graph, Release)** — last, since Knowledge Graph Advisor specifically has no real tooling yet (`EAO_PLUGIN_MCP_ARCHITECTURE.md` — Neo4j not installed) and would operate at reduced capability (manual tables only) until Phase 3 tooling exists.

## Per-Role Activation Fields (template, to be completed per role upon acceptance)

- **Activation Trigger:**
- **Required Skills:** (from `EAO_SKILL_LIBRARY.md`)
- **Required Plugins/MCPs:** (from `EAO_PLUGIN_MCP_ARCHITECTURE.md` — Phase 1 only unless explicitly noted as degraded)
- **Human Approval:** required for — (per `EAO_PERMISSION_MODEL.md`)
- **Permission Level:**
- **Dependencies:**
- **Deactivation Conditions:**
- **Why not earlier:**

This mirrors `AGENT_ACTIVATION_ROADMAP.md`'s existing per-agent format exactly, so merging is mechanical once approved.

## What Remains Unavailable Regardless of Activation

Knowledge Graph Advisor and the Knowledge Graph Builder skill activate at reduced capability (manual Markdown tables) until Neo4j (or an equivalent) is actually installed — activation does not manufacture missing tooling.

## References

`brain/AI/AGENT_ACTIVATION_ROADMAP.md`

## Related Documents

`EAO_ARCHITECTURE.md` · `EAO_AGENT_REGISTRY.md` · `EAO_PERMISSION_MODEL.md`
