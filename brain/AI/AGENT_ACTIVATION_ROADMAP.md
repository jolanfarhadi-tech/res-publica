# Res Publica — Agent Activation Roadmap

**Status: planning only. No new agents, skills, plugins, MCPs, or architecture are introduced.** This document defines *when* an already-approved agent becomes operational — not what it is. No approved document is modified.

---

## Mapping check — required before any activation planning

The 10 "Chief X Officer" roles named in this instruction were checked against the only approved agent roster that exists — the 8 conceptual agents in `ADR-004` / `AGENT_SKILL_PLUGIN_ARCHITECTURE.md` §3a. Only 3 have a genuine approved counterpart; one has a partial, multi-agent correspondence; the remaining 6 have none.

| Requested role | Approved counterpart | Status |
|---|---|---|
| Chief Accountability Officer | Responsibility Agent (`ADR-004`) | **Mapped — approved** |
| Chief Impact Officer | Impact Agent (`ADR-004`) | **Mapped — approved** |
| Chief Sustainability Officer | Eco Accountability Agent (`ADR-004`) | **Mapped — approved** |
| Chief Technology Officer | CLI Agent + Local Dev Agent + Plugin Architect Agent (`ADR-004`, combined) | **Partially mapped** — no single approved agent, but these three collectively cover the same ground |
| Chief Product Officer | *(none)* | **Not approved** — no ADR-004 agent covers general product-strategy oversight |
| Chief AI Officer | *(none — Eco Accountability Agent covers AI cost-proportionality only, not general AI oversight)* | **Not approved** |
| Chief Community Officer | *(none — a Community Moderation Agent exists only as Future Proposal, `AGENT_SKILL_PLUGIN_ARCHITECTURE.md` §3c)* | **Not approved** |
| Chief Learning Officer | *(none — Future Proposal only)* | **Not approved** |
| Chief Ethics Officer | *(none — Responsibility Agent covers constitutional compliance broadly, but no distinct Ethics Officer agent was ever approved; a standalone "Ethics Charter" was itself flagged Future Proposal with Constitution-overlap risk in `EXECUTION_ALIGNMENT.md`)* | **Not approved** |
| Chief Research Officer | *(none — Future Proposal only)* | **Not approved** |

The 6 "Not approved" roles below are given no activation phase, trigger, skills, plugins, or MCPs — inventing that detail for an agent that doesn't exist in approved architecture would itself be creating a new agent, which this task's own rules forbid. Each would require its own ADR before any activation planning is meaningful.

---

## Phase 1

**Responsibility Agent** *(mapped from Chief Accountability Officer)*
- **Activation Trigger:** Phase 1 start (already underway — Core Domain Model and Application Architecture are locked).
- **Required Skills:** none of the Required Skills in `AGENT_SKILL_PLUGIN_ARCHITECTURE.md` §4 are specific to this agent; it consumes feature/diff descriptions directly.
- **Required Plugins:** none — operates across all modules, not scoped to one plugin.
- **Required MCP Tools:** none beyond existing repository access already in use this session.
- **Human Approval:** Required for any block/reject decision it issues (Constitution §16).
- **Permission Level:** Read Only + Suggest Only (per the approved Permission Matrix).
- **Dependencies:** none — its function (checking proposed work against the 8 Core Principles) is available from Phase 1's first day.
- **Deactivation Conditions:** none defined; it is a standing, cross-cutting function for the life of the project.
- **Why not earlier:** Not applicable — Phase 1 is the earliest phase this document covers; nothing in Phase -1/0 (Brain migration, Constitution) required this agent's function, since no product feature existed yet to review.

**Eco Accountability Agent** *(mapped from Chief Sustainability Officer)*
- **Activation Trigger:** Phase 1 start, alongside Responsibility Agent.
- **Required Skills:** none specific; reads infrastructure/model-selection decisions directly.
- **Required Plugins:** none — cross-cutting.
- **Required MCP Tools:** none beyond existing repository/infra visibility.
- **Human Approval:** Required for any infrastructure-proportionality flag it raises (Constitution §16).
- **Permission Level:** Read Only + Suggest Only.
- **Dependencies:** none — proportionality review is meaningful from the first infrastructure decision onward.
- **Deactivation Conditions:** none defined; standing function.
- **Why not earlier:** Not applicable — Phase 1 is the first phase with any real infrastructure/model-tier decisions to review; Phase 0's four P0 fixes were security/routing fixes with no model-selection or infra-scaling decisions for this agent to assess.

**CLI Agent / Local Dev Agent / Plugin Architect Agent** *(collectively, partial mapping from Chief Technology Officer)*
- **Activation Trigger:** CLI Agent and Local Dev Agent activate at Foundation Build Order Steps 3–4 (`foundation-architecture.md` §9); Plugin Architect Agent activates at Step 2, once the Core Domain Model (Step 1, now locked) exists for a manifest to reference.
- **Required Skills:** `validate-content`, `seed-local`, `graph-rebuild` — all already named in `AGENT_SKILL_PLUGIN_ARCHITECTURE.md` §4.
- **Required Plugins:** none of their own — they operate on other modules' manifests/CLI needs, not a plugin of their own.
- **Required MCP Tools:** none beyond existing repository/local-dev tooling.
- **Human Approval:** Required for manifest-acceptance decisions (Plugin Architect Agent) and CLI command changes (CLI Agent), per Constitution §16/§18.
- **Permission Level:** Suggest Only → Modify Configuration (for CLI/local-dev tooling changes specifically).
- **Dependencies:** Plugin Architect Agent depends on the Core Domain Model (locked) and the Plugin Architecture manifest contract (`ADR-003`) both existing first — both are satisfied now.
- **Deactivation Conditions:** none defined; standing functions for the life of Phase 1 module-building.
- **Why not earlier:** These three agents review manifests, CLI commands, and local-dev tooling that don't exist before Phase 1's Core Domain Model and Plugin Architecture steps — there was nothing for them to operate on during Phase -1/0.

**Chief Systems Officer (CSO)** *(Executive AI Office, `ADR-024`, Accepted)*
- **Activation Trigger:** ADR-024 acceptance (now).
- **Required Skills:** Repository Health, Project Health (`EAO_SKILL_LIBRARY.md`).
- **Required Plugins:** none — cross-cutting, per `EAO_PLUGIN_MCP_ARCHITECTURE.md` Phase 1 native capabilities only (Git, filesystem, ripgrep, Markdown).
- **Required MCP Tools:** none beyond existing repository access already in use this session.
- **Human Approval:** Required for any file modification, ADR-status change, or roadmap-becomes-binding decision (`EAO_PERMISSION_MODEL.md`).
- **Permission Level:** Read Only + Suggest Only — no elevation.
- **Dependencies:** none beyond ADR-024 itself.
- **Deactivation Conditions:** none defined; standing function for the life of the EAO.
- **Why not earlier:** The EAO did not exist as an approved architecture before `ADR-024`; this is its first day.
- **Real backing:** `.claude/agents/program-orchestrator.md` (renamed from `ecc-program-orchestrator.md` — `ecc:` is the reserved namespace of the installed ecc marketplace plugin, not available to local project agents; corrected name has no namespace prefix). **Known limitation, disclosed:** the current session's actual invokable-agent list (harness-enumerated at session start) does not yet include this role regardless of the naming fix — a new session is required for pickup; this session runs its defined procedure directly rather than falsely claiming a successful subagent invocation.
- **Remaining 21 EAO roles:** Registered (`AGENT_SKILL_PLUGIN_ARCHITECTURE.md` §3d) but **not yet Activated** — no activation trigger has been set for them; each awaits a separate instruction, consistent with `EAO_ACTIVATION_ROADMAP_PROPOSAL.md`'s phased order.

---

## Phase 2 and beyond

**Impact Agent** *(mapped from Chief Impact Officer)*
- **Activation Trigger:** Not at Phase 1 start — activates once the Analytics module is reached in the ratified MVP build order (`foundation-architecture.md` §9: Knowledge Graph → AI Layer → Publishing → Community → Membership → Events → Dashboard → CRM → **Analytics**, last of 9).
- **Required Skills:** none specific; reads feature-completion claims and Analytics' civic-effect hook definitions.
- **Required Plugins:** Analytics (its owning module, per `APPLICATION_ARCHITECTURE.md` §2).
- **Required MCP Tools:** none beyond Analytics' own data access.
- **Human Approval:** Required for any "feature lacks a civic-effect hook" block it issues (Constitution §16).
- **Permission Level:** Read Only + Suggest Only.
- **Dependencies:** Analytics module and the `Impact` domain entity (`CORE_DOMAIN_MODEL.md` §3b) must exist first.
- **Deactivation Conditions:** none defined.
- **Why not earlier:** Its entire function — confirming a civic-effect measurement hook exists and rejecting vanity metrics — has nothing to check against until Analytics itself is being built, which is deliberately the *last* MVP module in the ratified build order. Activating it in Phase 1 would mean it has no work to do.

---

## Not approved — no activation plan (would require a new ADR)

Chief Product Officer, Chief AI Officer, Chief Community Officer, Chief Learning Officer, Chief Ethics Officer, Chief Research Officer.

For each: no phase, trigger, skills, plugins, MCPs, or permission level is assigned. The only honest answer to "why not activate earlier" is that none of these agents exist in approved architecture at any phase — activation planning for something not yet approved would itself be inventing the agent under the label of scheduling it, which this task's rules explicitly forbid.

---

## Dependency Graph

```
Project Phase
  ↓
Activated Agents (only where an approved counterpart exists)
  ↓
Activated Skills (validate-content, seed-local, graph-rebuild — per AGENT_SKILL_PLUGIN_ARCHITECTURE.md §4)
  ↓
Activated Plugins (the owning module each agent is scoped to, per APPLICATION_ARCHITECTURE.md §2)
  ↓
Activated MCPs (only those already in use — no new tool activation implied by this document)
```

Phase 1 → Responsibility Agent, Eco Accountability Agent, CLI Agent, Local Dev Agent, Plugin Architect Agent → validate-content / seed-local / graph-rebuild → (respective owning modules) → existing repository/CLI tooling only.

Phase 2+ (Analytics reached) → Impact Agent → (none of the 3 named skills apply directly) → Analytics → Analytics' existing data access only.

No MCP tool activation beyond what is already approved and in use is implied anywhere in this graph.

---

## Validation

- **Compatible with Constitution:** Yes — every Human Approval reference traces to §16/§18; no new gate invented.
- **Compatible with Foundation:** Yes — activation triggers use the existing Foundation Build Order (`foundation-architecture.md` §9) exactly, no reordering.
- **Compatible with locked Core Domain Model:** Yes — Impact Agent's dependency on the `Impact` entity, Plugin Architect Agent's dependency on the domain model being locked first, both consistent with `CORE_DOMAIN_MODEL.md` as written; neither document was modified.
- **Compatible with locked Application Architecture:** Yes — plugin/module scoping for each agent matches `APPLICATION_ARCHITECTURE.md` §2's service-to-module mapping exactly.
- **Compatible with AI Capability Architecture:** Yes — all activation detail for the 4 mapped agents is drawn directly from `AGENT_SKILL_PLUGIN_ARCHITECTURE.md` §3a/§4, nothing added.

**No architectural drift introduced.** The 6 unmapped "Chief Officer" roles are explicitly left unplanned rather than resolved by invention — this is the same discipline applied throughout this Phase, not a new one.

---

Not committed. Stopping here for review.
