# Res Publica — AI Governance Hierarchy

**Status: governance clarification only. Not a redesign, not new architecture, not a new AI system.** Defines the relationship between the Executive Layer and the Operational Layer — it does not define Skills, Plugins, or MCPs (those remain exactly as already specified in `AGENT_SKILL_PLUGIN_ARCHITECTURE.md`). No approved document is modified.

**Provenance note, stated for accuracy:** the 10 "Executive Role" names (Chief Accountability Officer, etc.) do not appear in any Brain document prior to this session — they were introduced in this session's own prior instruction (`AGENT_ACTIVATION_ROADMAP.md`'s request), not derived from a pre-existing "Res Publica governance model" artifact. This document organizes the relationship as instructed, using them as a working structure for this clarification — it does not itself grant them independent prior approval. If the Executive Layer is meant to become permanent Brain content, that would need its own ADR, separate from this clarification.

---

## Layer Diagram

```
Executive Layer
  (coordination and oversight only — no direct execution, no approval authority of its own)
  ↓ coordinates
Operational Layer
  (ADR-004's 8 agents — the only layer with any approved operational function)
  ↓ uses
Skills
  (already defined, AGENT_SKILL_PLUGIN_ARCHITECTURE.md §4 — not redefined here)
  ↓ operate within
Plugins
  (already defined, APPLICATION_ARCHITECTURE.md §2 — not redefined here)
  ↓ via
MCP Tools
  (already defined, AGENT_SKILL_PLUGIN_ARCHITECTURE.md §6 — not redefined here)
  ↓ produces
Execution
  (always gated by Human Approval Authority, Constitution §16 — no layer above bypasses this)
```

The Executive Layer and Operational Layer are **not merged and do not replace each other**: the Operational Layer is the only layer that touches Skills/Plugins/MCPs/Execution directly; the Executive Layer's role is purely to coordinate which Operational Agent(s) apply to a given concern and to carry any escalation to the Human Approval Authority. An Executive Role with no Operational Agent coordinates nothing and executes nothing.

---

## Standing rule — applies to every Executive Role, not repeated per-role

No Executive Role, regardless of which Operational Agent(s) it coordinates, may:
- Approve anything itself — only the Human Approval Authority approves (Constitution §16).
- Create or modify an ADR — only via the ADR Governance Workflow with Human Approval Authority sign-off (Constitution §17).
- Modify the Constitution, Foundation Architecture, Core Domain Model, or Application Architecture.
- Originate an institutional position (Core Principle 1) — an Executive Role's output is always a coordination/escalation, never a decision.
- Act outside its coordinated Operational Agent's own already-defined Allowed/Forbidden Actions (`AGENT_SKILL_PLUGIN_ARCHITECTURE.md` §3).

---

## Executive Roles

### Chief Accountability Officer
- **Purpose:** coordinate constitutional-principle and accountability oversight across the project.
- **Operational Agents coordinated:** Responsibility Agent (`ADR-004`).
- **Decisions it owns:** none — flags and escalates only; the Human Approval Authority decides.
- **Cannot do:** approve its own escalations; override Responsibility Agent's flags unilaterally; act without a live diff/feature to review.
- **Human approval:** required for every escalation before any resulting action (Constitution §16).

### Chief Product Officer
- **Operational Agents coordinated:** **Operational mapping not yet approved.**
- **Purpose, decisions, cannot-do:** not defined — no approved Operational Agent exists for general product-strategy oversight; defining these without one would be inventing an operational mechanism, which this task forbids.
- **Human approval:** not applicable until an operational mapping is approved via ADR.

### Chief AI Officer
- **Operational Agents coordinated:** Eco Accountability Agent, **partially** — limited to AI cost/model-tier proportionality (`ADR-004`). **Operational mapping not yet approved** for general AI-governance oversight beyond cost.
- **Decisions it owns:** none — cost-proportionality flags only, escalated per the standing rule.
- **Cannot do:** approve AI Layer cost-ceiling changes itself; expand AI capabilities without a new ADR; act on anything beyond cost/model-tier proportionality.
- **Human approval:** required for any AI Layer cost/governance change (Constitution §12/§16).

### Chief Community Officer
- **Operational Agents coordinated:** **Operational mapping not yet approved** (a Community Moderation Agent exists only as Future Proposal, `AGENT_SKILL_PLUGIN_ARCHITECTURE.md` §3c).
- **Purpose, decisions, cannot-do:** not defined for the same reason as Chief Product Officer.
- **Human approval:** not applicable until an operational mapping is approved.

### Chief Learning Officer
- **Operational Agents coordinated:** **Operational mapping not yet approved** (Future Proposal only).
- **Purpose, decisions, cannot-do:** not defined.
- **Human approval:** not applicable.

### Chief Impact Officer
- **Operational Agents coordinated:** Impact Agent (`ADR-004`).
- **Purpose:** coordinate civic-effect measurement oversight.
- **Decisions it owns:** none — flags missing civic-effect hooks or vanity-metric risk only.
- **Cannot do:** introduce a new metric type itself; mark a feature "impact-complete" without human sign-off.
- **Human approval:** required for any flag it raises (Constitution §16).

### Chief Sustainability Officer
- **Operational Agents coordinated:** Eco Accountability Agent (`ADR-004`).
- **Purpose:** coordinate environmental/cost proportionality oversight (full scope, not limited to AI as with Chief AI Officer's partial mapping).
- **Decisions it owns:** none — proportionality flags only.
- **Cannot do:** change infrastructure or model tier itself.
- **Human approval:** required for any proportionality flag (Constitution §16).

### Chief Ethics Officer
- **Operational Agents coordinated:** **Operational mapping not yet approved.** Responsibility Agent covers constitutional-principle compliance broadly, but was never approved specifically as an "ethics" function, and this document does not merge the two concepts per the standing instruction not to merge Executive and Operational roles into one.
- **Purpose, decisions, cannot-do:** not defined.
- **Human approval:** not applicable.

### Chief Technology Officer
- **Operational Agents coordinated:** CLI Agent, Local Dev Agent, Plugin Architect Agent (`ADR-004`, coordinated collectively — no single Operational Agent covers this role alone).
- **Purpose:** coordinate technical/engineering architecture oversight (CLI consistency, local-dev fidelity, manifest compliance).
- **Decisions it owns:** none — coordinates the three agents' flags/proposals only.
- **Cannot do:** approve a manifest, CLI change, or ADR itself; merge or deploy anything.
- **Human approval:** required for manifest acceptance and CLI command changes (Constitution §16/§18).

### Chief Research Officer
- **Operational Agents coordinated:** **Operational mapping not yet approved** (a Research/Fact-Synthesis Agent exists only as Future Proposal).
- **Purpose, decisions, cannot-do:** not defined.
- **Human approval:** not applicable.

---

## Validation

- **Compatible with Constitution:** Yes — every Executive Role is explicitly barred from approval authority, ADR creation, and institutional-position origination, consistent with §§1, 16, 17. No Executive Role is treated as a substitute for the Human Approval Authority.
- **Compatible with Foundation:** Yes — no module, tier, or architecture layer is touched or redefined.
- **Compatible with `ADR-004`:** Yes — the 8 Operational Agents are reused exactly as approved, with no redefinition, renaming, or duplication; Executive Roles only coordinate them.
- **Compatible with AI Capability Architecture:** Yes — Skills, Plugins, and MCPs are explicitly not redefined here, per instruction; all references point to `AGENT_SKILL_PLUGIN_ARCHITECTURE.md`/`APPLICATION_ARCHITECTURE.md` as the sole source.

**No architectural drift introduced.** 6 of 10 Executive Roles have no operational mapping and are left explicitly unresolved, per instruction, rather than invented.

---

Not committed. Stopping here for review.
