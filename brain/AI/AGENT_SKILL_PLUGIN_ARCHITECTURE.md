# Res Publica — AI Capability Catalogue

**Status: discovery and classification only. Not a roadmap, not a governance layer, not a Foundation document, not an ADR, not a Product Blueprint, and not a replacement for any approved architecture.** Every capability below is either attached to an existing approved module/agent, or explicitly marked **Future Proposal**. Nothing here authorizes implementation.

---

# 1. Executive Summary

**Purpose.** Identify, classify, and document every AI Agent, Skill, MCP/Tool, Plugin, and Permission Layer Res Publica is likely to need across its approved execution model, and show how each attaches to already-approved architecture rather than inventing new architectural concepts.

**Scope.** Discovery and classification only. No implementation, no package installation, no code changes.

**Limitations.** This catalogue is a planning artifact, not a commitment — every "Future Proposal" item requires its own ADR and Human Approval Authority sign-off before any design work begins, per `../00_constitution/00_constitution.md` §6 and §18. Where no approved module can reasonably own a capability, that is stated explicitly rather than inventing a new one to fit it.

**Relationship with Foundation Architecture.** Extends `../BLUEPRINTS/foundation-architecture.md` §3's 8-agent conceptual roster (`ADR-004`) and §1 (Plugin Architecture, `ADR-003`) with a fuller capability catalogue. Does not alter either.

**Relationship with Constitution.** Operates entirely within `../00_constitution/00_constitution.md` §12 (AI Governance), §16 (Human Approval Authority), and §18 (Plugin Governance) — every agent/plugin/tool below is scoped against those rules, not around them.

**Relationship with Master Product Blueprint.** Capabilities are attached to the 20 approved modules (`../BLUEPRINTS/master-product-blueprint.md`) wherever a reasonable owner exists.

**Relationship with ADRs.** No new ADR is created by this document. `ADR-002` (domain model), `ADR-003` (plugin architecture), `ADR-004` (agent system), `ADR-007` (knowledge graph), `ADR-008` (AI layer) are the load-bearing references throughout.

**Relationship with `EXECUTION_ALIGNMENT.md`.** Uses that document's approved-vs-Future-Proposal classification of the 40 execution steps as the baseline for which modules exist now versus later.

---

# 2. AI Capability Taxonomy

| Category | Grounding |
|---|---|
| Governance Agents | Responsibility Agent, Review & Validation Agent (`ADR-004`) |
| Architecture Agents | Plugin Architect Agent (`ADR-004`) |
| Engineering Agents | CLI Agent, Local Dev Agent (`ADR-004`); existing generic reviewers (`foundation-architecture.md` §3) |
| Security Agents | Existing generic security reviewer already available (`foundation-architecture.md` §3) — no Res Publica-specific security agent yet identified as necessary |
| Product Agents | Design System Agent (`ADR-004`) |
| Community Agents | Future Proposal, tied to Community module |
| Research Agents | Future Proposal, tied to Research Lab (V2) |
| Learning Agents | Future Proposal, tied to Academy (V2) |
| Publishing Agents | Future Proposal, tied to Publishing module |
| Translation Agents | Future Proposal, tied to Core Principle 7 (trilingual discipline) and Knowledge Graph/AI Layer |
| Knowledge Graph Agents | Future Proposal, tied to Knowledge Graph module (`ADR-007`) |
| Environmental Agents | Eco Accountability Agent (`ADR-004`) |
| Business Agents | Future Proposal, tied to Business Blueprint (itself Future Proposal per `EXECUTION_ALIGNMENT.md`) |
| Sponsor Agents | Future Proposal, tied to Sponsor Marketplace (itself Future Proposal) |
| Responsibility Evidence Agents *(historical term — superseded by Responsibility Evidence; previously "Contribution Credit Agents")* | Future Proposal — **flagged**, see §3 and §11 for Core Principle 2 gamification risk |
| Impact Agents | Impact Agent (`ADR-004`) |
| Analytics Agents | Future Proposal, tied to Analytics module |

No category was forced where no plausible owner exists.

---

# 3. Required Agents

## 3a. Approved, conceptual roster (Status: Planned — approved via `ADR-004`, not yet implemented as agent files)

| Name | Purpose | Responsibilities | Inputs | Outputs | Allowed | Forbidden | Human Approval | Module | Phase | Risk |
|---|---|---|---|---|---|---|---|---|---|---|
| Responsibility Agent | Constitutional-principle compliance | Reviews features/PRs against the 8 Core Principles | Feature description/diff | Pass/fail + named violated principle | Read, flag, block-recommend | Approve/merge unilaterally | Yes, for any block | Cross-cutting | All phases | Medium |
| Eco Accountability Agent | Cost/environmental proportionality | Flags oversized models, redundant rebuilds, disproportionate hosting | Infra/model-selection change | Proportionality review | Read, flag | Change infra unilaterally | Yes | Environmental Responsibility (Constitution §11) | All phases | Low |
| Impact Agent | Civic-effect measurement hook validation | Confirms Analytics hook exists; rejects vanity metrics | Feature reaching "done" | Confirms/rejects hook | Read, flag | Approve unilaterally | Yes | Analytics | MVP (9th module) | Low |
| Plugin Architect Agent | Manifest contract compliance | Reviews new module manifests | Module manifest | Structural-fit confirmation | Read, flag, reject non-conforming manifest | Register a module unilaterally | Yes | Plugin Architecture (`ADR-003`) | Foundation Build Order Step 2 | Medium |
| Design System Agent | Token/RTL/AI-attribution compliance | Enforces design discipline on new UI | New UI component | Compliance confirmation | Read, flag | Merge UI unilaterally | Yes | Website & CMS / Design System | Ongoing | Low |
| CLI Agent | CLI consistency | Adds/maintains `respublica` commands | Module operational need | New/updated CLI command | Propose command changes | Deploy unilaterally | Yes | CLI Architecture (`ADR-005`) | Foundation Build Order Step 3 | Low |
| Local Dev Agent | Offline/local dev fidelity | Keeps mocks/seed data current | Change to AI Layer/Tier 3 | Updated local dev workflow | Propose changes | Point local dev at production | Yes | Local Dev Workflow (`ADR-006`) | Foundation Build Order Step 4 | Low |
| Review & Validation Agent | Per-module validation checklist enforcement | Runs MVP checklist before "complete" | Module claiming complete | Checklist pass/fail | Read, run checklist | Mark complete unilaterally | Yes | Cross-cutting | All module completions | Medium |

## 3b. Already available, generic, reused as-is (Status: Existing)

| Name | Purpose | Module | Phase | Risk |
|---|---|---|---|---|
| General Code Reviewer (`ecc:code-reviewer`) | General code quality | Cross-cutting | Now | Low |
| Security Reviewer (`ecc:security-reviewer`) | Security review | Cross-cutting | Now | Low |
| Performance Reviewer (`ecc:performance-optimizer`) | Performance review | Cross-cutting | Now | Low |
| Architecture Reviewer (`ecc:architect`) | Architecture review | Cross-cutting | Now | Low |
| TypeScript/React Reviewers | Type/React-specific review | Cross-cutting | Now | Low |

These map onto `foundation-architecture.md` §3's own note that these roles "don't need new definitions" — no new agent invented here.

## 3c. Future Proposal (no approved counterpart — each requires its own ADR + Human Approval Authority sign-off before design)

| Name | Purpose | Module tie-in | Phase | Risk | Note |
|---|---|---|---|---|---|
| Community Moderation Agent | Content moderation assist | Community | MVP (4th) | Medium | Content decisions need explicit human-sign-off scoping |
| Translation/Trilingual QA Agent | Cross-language fidelity check | Knowledge Graph / AI Layer (Core Principle 7) | MVP | Medium | Farsi diaspora safety stakes (`MISSION.md`) raise the bar |
| Knowledge Graph Entity-Resolution QA Agent | Entity-match quality | Knowledge Graph (`ADR-007`) | MVP (1st) | Medium | |
| Publishing Editorial Assist Agent | Draft-authoring assist | Publishing | MVP (3rd) | Medium | Must never bypass human sign-off (Constitution §1/§3) |
| Research/Fact-Synthesis Agent | Research synthesis assist | Research Lab | V2 | Medium | |
| Learning/Academy Content Agent | Course content assist | Academy | V2 | Low–Medium | |
| Business/Grant-Reporting Agent | Funder reporting assist | Business Blueprint (itself Future Proposal) | Future | Low | |
| Sponsor Relationship Agent | Sponsor relationship assist | Sponsor Marketplace (itself Future Proposal) | Future | Medium | Financial/partner sensitivity |
| **Responsibility Evidence Agent** *(historical term — superseded by Responsibility Evidence; previously "Contribution Credit Agent")* | Responsibility Evidence tracking, per `../GOVERNANCE/RESPONSIBILITY_EVIDENCE_MODEL.md` | *(none — no approved module)* | Future | **High** | **Flagged: adjacent to the Reputation/Leadership Engine gamification risk already raised in `EXECUTION_ALIGNMENT.md`. Must not be designed without an explicit Core Principle 2 (zero gamification) review first.** |
| Analytics/Civic-Effect Agent | Civic-effect metric assist | Analytics | MVP (9th) | Medium | Must never introduce attention metrics (Core Principle 4) |

## 3d. Executive AI Office (EAO) — Approved via `ADR-024` (Accepted)

Full specification: `brain/AI/EAO_AGENT_REGISTRY.md`, `EAO_ARCHITECTURE.md`, and companion documents. Registered here; **activated only where separately noted** — registration and activation are distinct steps (`EAO_ARCHITECTURE.md` §9, Platform Lifecycle Model).

| Name | Purpose | Real backing | Status |
|---|---|---|---|
| Chief Systems Officer (CSO) | Repository-wide coordination, routing, reporting; absorbs the former `ecc:program-orchestrator` concept | `program-orchestrator` (`.claude/agents/program-orchestrator.md`) — local project agent; `ecc:` is reserved for the installed ecc marketplace plugin, not available to local agents | **Registered and Activated** |
| Chief Architecture Officer, Chief Governance Officer, Chief Documentation Officer, Chief Research Officer, Chief Delivery Officer | See `EAO_AGENT_REGISTRY.md` §1 | None yet — conceptual | Registered, not yet Activated |
| 9 Domain Advisors, 7 Technical Advisors | See `EAO_AGENT_REGISTRY.md` §2–3 | Mostly none yet — conceptual (Documentation Advisor partially overlaps `ecc:doc-updater`) | Registered, not yet Activated |

All 22 roles are Read Only + Suggest Only by default (`EAO_PERMISSION_MODEL.md`); none may modify a file, commit, push, or approve architecture. `ecc:architect` remains the sole architecture-validation authority for all 22.

---

# 4. Required Skills

| Skill | Used By | Purpose | Allowed | Forbidden | Required Evidence | Validation | Human Approval |
|---|---|---|---|---|---|---|---|
| `validate-content` | CLI Agent, Publishing | Zod frontmatter + Knowledge Graph reference validation | Read content, report errors | Auto-fix content | Validation report | CLI run output | No (read-only) |
| `validate-module` | Review & Validation Agent | Run a module's MVP checklist | Read module spec/code, report | Mark module complete | Checklist result | CLI run output | Yes, before "complete" |
| `graph-rebuild` | Knowledge Graph Agent, CLI Agent | Rebuild entity/relationship graph from MDX | Read content, regenerate graph artifact | Publish ungrounded relationships | Rebuild log | Deterministic extraction pipeline output (`ADR-007`) | No (deterministic, no AI inference) |
| `publish-draft` | Publishing Editorial Assist Agent | CLI entry into sign-off/commit flow | Draft, stage for review | Publish without sign-off | Sign-off record | `AuditLog` entry (once implemented) | Yes, always |
| `translate-content` | Translation/Trilingual QA Agent | Draft translation for editor review | Draft translation | Publish translation directly | Editor sign-off | Human review | Yes, always |
| `seed-local` | Local Dev Agent, CLI Agent | Populate local fixture data | Write to local disposable DB | Touch production data | N/A | Local-only execution check | No |

---

# 5. Plugin Architecture

All plugins here are modules under the existing manifest contract (`ADR-003`) — not a new plugin concept.

## Core (MVP tier — foundational, build-ready)

| Plugin | Owner | Dependencies | Risk | Approval | Activation Phase | Lifecycle | Retirement |
|---|---|---|---|---|---|---|---|
| Knowledge Graph | Knowledge Graph Agent (Future Proposal) | Core Domain Model | Medium | Standard Review Gate | MVP (1st) | Build → maintain → extend for V2/V3 | N/A — foundational |
| AI Layer | AI Router tool (§6), Eco Accountability Agent | Knowledge Graph | High (cost/trust chokepoint) | Standard + explicit cost-ceiling sign-off | MVP (2nd) | Build → maintain, revisit tiering periodically | N/A — foundational |
| Publishing | Publishing Editorial Assist Agent (Future Proposal) | Core Domain Model | Medium | Standard | MVP (3rd) | Build → maintain | N/A |
| Community | Community Moderation Agent (Future Proposal) | Core Domain Model | Medium | Standard | MVP (4th) | Build → maintain | N/A |
| Membership System | — | Core Domain Model, Payment provider | High (financial) | Standard + Payment gate (§8) | MVP (5th) | Build → maintain | N/A |
| Events | — | Core Domain Model | Medium | Standard | MVP (6th) | Build → maintain | N/A |
| Dashboard | — | Most MVP modules | Low | Standard | MVP (7th) | Build → maintain | N/A |
| CRM | — | Core Domain Model | Medium (donor data) | Standard | MVP (8th) | Build → maintain | N/A |
| Analytics | Impact Agent, Analytics/Civic-Effect Agent (Future Proposal) | All MVP modules | Medium | Standard | MVP (9th, last) | Build → maintain | N/A |

## Optional (V2 tier — deferred, not yet detailed to build-ready depth)

Fellowship System, Academy, Speech Academy, Writing Academy, News Analysis Lab, Research Lab, Store, Admin Portal — each per `master-product-blueprint.md`, activation deferred until V2 resourcing (`ROADMAP.md`: 3–5 FTE).

## Future (V3 + Future Proposal items from `EXECUTION_ALIGNMENT.md`)

Public API (V3, approved); Sponsor Marketplace, Environmental Impact Platform, Memory Architecture, AI Mentor, AI Civic Companion, Contribution/Impact Intelligence, the 7 "Human Engine" capabilities, Development Blueprint — all Future Proposal, each requiring its own ADR before any design work.

---

# 6. MCP / Tool Registry

| Tool | Purpose | Data Access | Permission | Human Approval | Risk | Activation Phase |
|---|---|---|---|---|---|---|
| GitHub | Repo hosting, PRs | Source code | Read/write via existing git flow | Yes, for merges (already established this session) | Low | Now (in use) |
| Vercel | Deployment | Env vars, deploy config | Deploy | Yes, for production deploy | Medium | Now (in use) |
| Playwright | E2E testing | Test fixtures | Read/execute | No (test-only) | Low | MVP (ties to Implementation Plan P1 test-suite item) |
| Lighthouse | Perf/accessibility audit | Public pages only | Read | No | Low | MVP, before public launch |
| Figma | Design handoff | Design assets | Read | No | Low | As needed for Design System Agent work |
| Sentry | Error monitoring | Error payloads (may include partial user context) | Read | Yes, before enabling (may touch user data) | Medium | Before public launch |
| Supabase | Tier 3 backing store | `Person`/`ConsentRecord`/`Payment`/etc. | Read/write | Yes, always | High (PII) | Core Domain Model phase (Foundation Build Order Step 1) |
| PostgreSQL | Tier 3 database | Same as Supabase | Read/write | Yes, always | High | Same as Supabase |
| CMS | — | — | — | — | — | **Not applicable — explicitly rejected alternative, `ADR-001`** |
| Email | Transactional notification | `Notification` entity | Send | Yes, for new notification types | Medium | Membership/Events module phase |
| Newsletter | Subscriber signup | Email addresses | Write (subscribe) | No (existing, already rate-limited per Phase 0) | Medium | Now (in use) |
| Calendar | Event scheduling | Event data | Read/write | No | Low | Events module phase |
| Analytics | Civic-effect measurement | Aggregated civic-effect metrics only, never attention metrics (Core Principle 4) | Read/write | Yes, for new metric types | Medium | MVP (9th) |
| Search | Site search | Public content index | Read | No (existing, already implemented) | Low | Now (in use) |
| Knowledge Graph | Entity/relationship data | Public content-derived graph | Read/write | Standard Review Gate | Medium | MVP (1st) |
| AI Router | Model-tier routing | Query text, cost ledger | Read/write | Yes, cost-ceiling changes | Medium–High | MVP (2nd) |
| Payment | Transaction processing | `Payment` entity, provider API | Write | Yes, always | High | Membership module phase |
| Donation | Same as Payment | Same as Payment | Write | Yes, always | High | Membership module phase |
| CRM | Donor/partner relationship data | `Organization`, donor records | Read/write | Yes, for data-sharing changes | Medium | MVP (8th) |

---

# 7. Permission Matrix

| Permission | Meaning | Approval gate |
|---|---|---|
| Read Only | View content/code/data, no changes | None |
| Suggest Only | Propose a change, cannot apply it | None |
| Draft | Produce unpublished draft content | None (publish still gated) |
| Modify Content | Edit published/publishable content | Human sign-off (Constitution §3) |
| Modify Configuration | Change env vars, feature config | Human Approval Authority |
| Modify Code | Change application source | Human Approval Authority + Review Gate |
| Run Tests | Execute test suite | None |
| Commit | Create a git commit | Human Approval Authority (per this session's established pattern) |
| Push | Push to remote | Human Approval Authority |
| Deploy | Ship to production | Human Approval Authority, explicit (Constitution §8) |
| Access User Data | Read `Person`/`ConsentRecord` | Human Approval Authority, explicit (Constitution §8) |
| Access Financial Data | Read `Payment` | Human Approval Authority, explicit (Constitution §8) |
| Delete Data | Remove any persisted record | Human Approval Authority, explicit |
| Create ADR | Draft a new ADR | Human Approval Authority sign-off before binding (`ADR Governance Workflow`, Constitution §17) |
| Modify ADR | Amend an existing ADR | Human Approval Authority + amendment-only discipline (never rewritten in place, Constitution §13/`brain-governance-rules.md` rule 1) |

---

# 8. Human Approval Gates

Per Constitution §8 (Human Approval Gates list) and §16, the following always require explicit Human Approval Authority sign-off, no exceptions:

Constitution changes · Foundation Architecture changes · ADR creation or modification · New dependencies · New/modified plugins · Database schema changes · Authentication changes · Payment processing changes · Responsibility Evidence logic (any form) · User data access changes · Public communication (anything published as Res Publica's voice) · Production deployment.

---

# 9. Phase Mapping

| Capability group | First possible activation | Maturity phase | Production phase |
|---|---|---|---|
| Planned agents (§3a) | Foundation Build Order Steps 1–4 | MVP | MVP |
| Existing generic reviewers (§3b) | Now | Now | Now |
| Future Proposal agents (§3c) | Not assigned — pending individual ADRs | Not assigned | Not assigned |
| Core plugins (MVP modules) | MVP, in `foundation-architecture.md` §9's ratified order | MVP | MVP |
| Optional plugins (V2 modules) | V2 (3–5 FTE) | V2 | V2 |
| Future plugins (V3 + Future Proposal) | Not assigned — pending individual ADRs | Not assigned | Not assigned |
| Existing tools (GitHub, Vercel, Newsletter, Search) | Now | Now | Now |
| Core Domain Model-dependent tools (Supabase/Postgres/Payment) | Foundation Build Order Step 1 onward | MVP | MVP |
| Pre-launch tools (Sentry, Lighthouse, Playwright) | MVP | MVP | Before public launch |

No phase was redefined; all mappings use the existing Foundation Build Order and `ROADMAP.md` phase structure.

---

# 10. Minimal Activation Plan

**Needed Now:** GitHub, Vercel, Newsletter, Search — already in production use.

**Needed During MVP:** Knowledge Graph tooling, AI Router, CLI Agent, Local Dev Agent, Plugin Architect Agent, Review & Validation Agent, Analytics tooling, Payment/Donation (once Membership is reached), CRM tooling — each tied to its module's place in the ratified MVP build order.

**Needed Before Public Launch:** Sentry, Lighthouse, Playwright, Email — hardening/observability, not core build-order dependencies, but real prerequisites to a public-facing launch.

**Needed Later (V2/V3):** Figma-dependent Design System work, Community Moderation Agent, Research/Learning Agents, Business/Sponsor Agents, Public API tooling — deferred with V2/V3 resourcing.

**Never Activate Too Early:**
- Responsibility Evidence Agent *(historical term — superseded by Responsibility Evidence; previously "Contribution Credit Agent")*, and any Reputation/Leadership-Engine-adjacent capability — explicit, unresolved Core Principle 2 (zero gamification) risk.
- Supabase/PostgreSQL and Payment/Donation — before the Core Domain Model is built *and* the GDPR/`AuditLog` legal sign-off (`../CONSTITUTION.md` §4 open dependency, still outstanding per `PROJECT_BRAIN_STATUS.md`) is resolved.

---

# 11. Drift Prevention

Every future agent, skill, plugin, or tool must do one of two things before design work begins:

1. **Attach to an approved module** (per `EXECUTION_ALIGNMENT.md`'s mapping) — in which case it inherits that module's existing Review Gate and Human Approval Authority requirements, with no new process needed.
2. **Require a new ADR** — if no approved module can reasonably own it (every Future Proposal item in this document falls here). The ADR must state which module boundary, Constitution section, and Foundation Architecture layer it operates within, per Constitution §6's classifying test.

No capability may be added by inference from this catalogue alone — this document classifies, it does not authorize.

---

# 12. Recommendations

| Classification | Capabilities |
|---|---|
| **Activate Now** | GitHub, Vercel, Newsletter, Search (already in use) |
| **Define Now, Activate Later** | The 8 planned ADR-004 agents (already defined, awaiting implementation at their Foundation Build Order step); Knowledge Graph, AI Router, Payment/Donation, CRM tooling (defined here, activate at their module's turn) |
| **Future Proposal** | All 10 Future Proposal agents in §3c except Responsibility Evidence Agent; all Future/Optional plugins in §5; Sentry, Lighthouse, Playwright, Figma, Email, Calendar tools |
| **Do Not Recommend (without prior resolution)** | Responsibility Evidence Agent *(historical term — superseded by Responsibility Evidence; previously "Contribution Credit Agent")* and any Reputation/Leadership-Engine-adjacent capability — not until Core Principle 2 (zero gamification) risk is explicitly reviewed and resolved; Supabase/Postgres/Payment activation before the GDPR/legal sign-off dependency closes |

---

# Final Validation

- No approved architecture was modified. ✅
- No approved module was renamed. ✅ (naming differences noted in `EXECUTION_ALIGNMENT.md` are not repeated as renames here)
- No governance layer was introduced. ✅
- No roadmap was replaced. ✅
- No ADR was created. ✅
- No architectural drift was introduced. ✅

**One conflict detected, reported here, not resolved:** the Responsibility Evidence Agent *(historical term — superseded by Responsibility Evidence; previously "Contribution Credit Agent")* (§3c) and the broader "Human Engine" capability group (§5, Future Plugins) both sit close to what Constitution Core Principle 2 (zero gamification) explicitly forbids. This is the same risk already surfaced in `EXECUTION_ALIGNMENT.md` for the Reputation and Leadership Engines — restated here because it recurs at the agent/tool layer, not just the module layer. This document does not resolve it; it requires explicit human review before any of these capabilities proceed past "Future Proposal."
