# Res Publica — Execution Model Reconciliation (DRAFT — NOT CANONICAL)

**Status: DRAFT ANALYSIS ONLY. Neither the approved Master Product Blueprint nor the proposed 40-step execution model is declared canonical by this document. No approved Brain document is modified. This is not a roadmap and does not authorize any implementation.**

*Purpose: compare the approved Master Product Blueprint / Foundation Architecture (frozen in Project Brain v1.1) against the proposed 40-command execution model, to surface overlap, conflicts, gaps, and naming/phase/implementation differences — so a future, explicitly-scoped ADR can reconcile them deliberately, rather than either model being adopted by default or by accident.*

---

## 1. The two models being compared

**A — Approved (frozen in Project Brain v1.1):** 20 modules across 4 tiers (Core: 2, MVP: 9, V2: 8, V3: 1), per `brain/MODULE_INDEX.md` and `brain/BLUEPRINTS/master-product-blueprint.md`, built in the ratified order in `brain/BLUEPRINTS/foundation-architecture.md` §9 (as corrected by `ADR-012`): Knowledge Graph → AI Layer → Publishing → Community → Membership → Events → Dashboard → CRM → Analytics (MVP), then V2, then V3.

**B — Proposed:** 40 commands across 7 phases (Phase -1 Brain, Phase 0 Constitution ×5, Phase 1 Strategy ×5, Phase 2 Products ×10, Phase 3 AI ×8, Phase 4 Human Engine ×7, Phase 5 Platform ×5), as specified in this session's instruction.

## 2. Overlap (commands with a plausible corresponding approved module)

| Model B command | Model A module | Note |
|---|---|---|
| Command 11: Community OS | Community (MVP) | Name differs (`-OS` suffix), scope appears equivalent |
| Command 12: Membership OS | Membership System (MVP) | Same |
| Command 13: Fellowship OS | Fellowship System (V2) | Same |
| Command 14: Academy OS | Academy (V2) | Model A splits this into 3 modules — see §4 |
| Command 15: Research OS | Research Lab (V2) | Name differs |
| Command 16: Publishing OS | Publishing (MVP) | Name differs |
| Command 17: Store OS | Store (V2) | Name differs |
| Command 18: Events OS | Events (MVP) | Name differs |
| Command 21: AI Architecture | AI Layer (MVP) | Name differs |
| Command 22: Knowledge Graph | Knowledge Graph (MVP) | Same name |
| Command 24: Recommendation Engine | `operating-system.md` §7 (Recommendation Engine) | Already exists as an approved *subsystem*, never promoted to a top-level module — see §5 |
| Command 36: Dashboard | Dashboard (MVP) | Same name |
| Command 37: CRM | CRM (MVP) | Same name |
| Command 38: Analytics | Analytics (MVP) | Same name |
| Command 39: Public API | Public API (V3) | Same name |

14 of 40 commands have a plausible direct correspondence. The remaining 26 are either genuinely new (§4) or represent a different phase/sequencing philosophy (§6).

## 3. Conflicts

- **Build-order philosophy conflict.** Model A's ratified MVP order deliberately *interleaves* AI/knowledge-graph work with product modules (AI Layer is 2nd, ahead of Community, Membership, Events, Dashboard, CRM, Analytics) because later modules depend on it. Model B separates "Products" (Phase 2, all 10 commands) entirely from "AI" (Phase 3, all 8 commands) as later, sequential phases. Taken literally, Model B would have Community/Membership/Events/etc. (Phase 2) built *before* AI Architecture and Knowledge Graph (Phase 3) — the reverse of Model A's own ratified dependency order, which exists specifically because the Foundation Review caught and fixed dependency-ordering errors once already (`FOUNDATION_REVIEW.md` Weaknesses #4–5).
- **Phase 1 "Strategy" commands (Vision, Mission, Master Product Blueprint, Experience Blueprint, Business Blueprint) name artifacts that already exist, approved and frozen, from *before* Model A's own Foundation Architecture phase — not future work.** Per `brain/CHANGELOG.md`, Vision/Mission/Product Vision/Master Product Blueprint were produced first, then Foundation Architecture, then (this session) the Constitution. Model B's Phase 1 sits *after* Phase 0 (Constitution) chronologically — the reverse of what actually happened. If "Command 6: Vision" etc. were ever executed literally as new work, it would mean redoing or overwriting `brain/VISION.md`, `brain/MISSION.md`, and `brain/BLUEPRINTS/master-product-blueprint.md` — documents this entire session has treated as frozen and off-limits. This is the single highest-stakes ambiguity in Model B: is Phase 1 meant as *retroactive relabeling* of already-completed work, or as *new work to redo it*? As written, it is not clear, and the difference matters enormously.
- **Possible Constitution overlap/duplication.** Model B's Phase 0 commands 2–5 (HARM Operating System, Contribution & Impact Framework, Ethics Charter, Governance Charter) sit alongside Command 1 (Accountability Constitution, already delivered as `brain/00_constitution/00_constitution.md`). The approved Constitution already has 19 sections covering accountability, rights, responsibilities, transparency, trust, AI governance, and ecosystem accountability. Commands 3–5 in particular (Contribution & Impact Framework, Ethics Charter, Governance Charter) risk substantial content overlap with Constitution §§3, 4, 5, 7, 10, 12, 15–19 unless their scope is deliberately narrowed against what already exists.
- **Potential Core Principle 2 (zero gamification) conflict.** Model B's Phase 4 "Human Engine" includes a Reputation Engine (Command 33) and a Leadership Engine (Command 35). `brain/CONSTITUTION.md` Core Principle 2 states: "No points, badges, streaks, leaderboards, or progress bars framed as scores... not anywhere else, present or future." A "Reputation Engine" is architecturally adjacent to exactly the pattern this principle forbids, depending on implementation. This doesn't mean Phase 4 is invalid — it means these two specific commands would need explicit design scrutiny against Core Principle 2 before or during implementation, not silent adoption.

## 4. Missing from Model B (present in approved Model A, no corresponding command)

- **Core Platform** and **Website & CMS** (Core tier) — no explicit command; implicitly assumed as substrate.
- **Speech Academy** and **Writing Academy** — Model A treats these as 2 distinct modules alongside Academy; Model B's "Academy OS" (Command 14) doesn't indicate whether it absorbs both or only general Academy scope.
- **News Analysis Lab** (V2) — no corresponding command anywhere in Model B.
- **Admin Portal** (V2) — no corresponding command; unclear whether folded into Dashboard (36) or CRM (37).

## 5. Missing from Model A (new in Model B, never approved anywhere in Brain)

Entirely new, with no prior approval anywhere in Project Brain: HARM Operating System (2), Contribution & Impact Framework (3), Ethics Charter (4), Governance Charter (5), Experience Blueprint as a *command* rather than the already-existing gap-flagged artifact (9), Business Blueprint (10), Sponsor Marketplace (19), Environmental Impact Platform (20), Memory Architecture (23), AI Mentor (25), AI Civic Companion (26), Contribution Intelligence (27), Impact Intelligence (28), and the entire Phase 4 Human Engine (Identity, Learning, Contribution, Validation, Reputation, Opportunity, Leadership Engines — 29–35), and Development Blueprint (40).

Recommendation Engine (24) is a partial exception — see §2, it already exists as an approved *subsystem* of `operating-system.md`, just never promoted to a top-level module.

## 6. Naming differences

Model B applies a consistent `<Name> OS` suffix to most Phase 2 commands (Community OS, Membership OS, Fellowship OS, Academy OS, Research OS, Publishing OS, Store OS, Events OS) where Model A uses the bare module name. This reads as a branding/naming-convention choice rather than a scope difference, for the 8 modules where a direct correspondence exists (§2) — but should be an explicit decision if Model B is ever formally adopted, not an incidental rename.

## 7. Phase-structure differences

| | Model A | Model B |
|---|---|---|
| Phase count | 4 (Phase 0 hardening → MVP → V2 → V3) | 7 (Brain, Constitution, Strategy, Products, AI, Human Engine, Platform) |
| Sequencing basis | Real module dependencies, reconciled through 3 review passes | Category grouping (all Products, then all AI, then all "Human Engine") |
| Team-size framing | Explicit FTE ramp per phase (`ROADMAP.md`: 0.5 → 1–2 → 3–5 → 6–8) | Not stated per phase |
| Total discrete items | 20 modules | 40 commands (includes governance/strategy artifacts as "commands," which Model A treats as one-time completed planning phases, not recurring build units) |

## 8. Implementation differences

- Model A's build order is justified by validated cross-module dependencies (`foundation-architecture.md` §7 integration map, corrected twice via Foundation Review and `ADR-012`). Model B's phase order is not yet justified against that same dependency map — see the build-order conflict in §3.
- Model A's "what must NOT be built now" discipline appears at every module's own spec. Model B's instruction includes execution rules (one deliverable per command, ADR required for architecture changes, human approval for phase transitions) but no per-command "must not build" scoping yet.
- Model B's own "drift prevention rules" (agents must reference this file before planning; new modules must map to one of the 40 commands) would, if adopted, make Model B binding on all future work by its own design — which is exactly why this document does not adopt it, per this session's explicit instruction.

## 9. Recommended reconciliation path

This document recommends, but does not itself execute, the following — all as a future, explicitly-scoped decision:

1. **Resolve the Phase 1 "Strategy" ambiguity first** (§3) — confirm whether Commands 6–10 mean retroactive relabeling of already-completed, frozen work, or new work. This is a prerequisite to evaluating anything else about Model B, since the answer changes whether Model B is compatible with Project Brain's freeze discipline at all.
2. **If Model B is to be adopted in any form, it should happen via a dedicated ADR** (per Constitution §6 — this is squarely an architecture/domain-model matter) that explicitly states: which of the 26 non-overlapping commands are net-new scope vs. renames of existing modules; how the build-order conflict (§3) is resolved; how Constitution-overlap risk (§3) is scoped against `00_constitution.md`'s existing 19 sections; and how the Reputation/Leadership Engine gamification risk (§3) is addressed before those two commands are ever implemented.
3. **Until that ADR exists, neither model should be treated as sole authority.** Model A remains the only Foundation-Review-validated, frozen roadmap. Model B remains a proposal.

---

*This document does not modify `brain/MODULE_INDEX.md`, `brain/BLUEPRINTS/master-product-blueprint.md`, `brain/BLUEPRINTS/foundation-architecture.md`, `brain/00_constitution/00_constitution.md`, or any ADR. It creates no new governance layer and authorizes no implementation.*
