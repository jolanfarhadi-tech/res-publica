# Res Publica — Execution Alignment

**Status: mapping document only. Not a roadmap, not an ADR, not a new governance layer.** The 40-step execution model is treated purely as a scheduling overlay answering *when* and *in what order* already-approved work happens, plus which reviews/approvals gate each step. It does not redefine, rename, or replace any approved module, document, or ADR. Every step below is mapped onto Project Brain's existing, frozen architecture; anything with no approved counterpart is marked **Future Proposal (not approved)** rather than treated as real scope.

*Sources: `../MODULE_INDEX.md`, `../BLUEPRINTS/master-product-blueprint.md`, `../BLUEPRINTS/foundation-architecture.md` §9 (Foundation Build Order, as corrected by `ADR-012`), `../KNOWLEDGE/operating-system.md`, `../00_constitution/00_constitution.md`, `ADR-002`, `ADR-004`. No source is modified by this document.*

**Standard human approval gate**, referenced throughout rather than repeated per row: a Review Gate (Constitution §9) with explicit Human Approval Authority sign-off (§16) is required before any module is marked complete or any phase transition occurs. For anything marked Future Proposal, the gate is stricter: a new ADR (Constitution §6, since scoping net-new architecture is an architecture/domain-model matter) plus Human Approval Authority sign-off is required *before design work begins*, not just before completion.

---

## Phase -1 / Phase 0 (Commands 1–10): governance, strategy, and planning artifacts

| Execution step | Existing approved module/artifact | Already exists? | Future-only? | Dependency order | Approval gate | Remaining ambiguity |
|---|---|---|---|---|---|---|
| Phase -1: Project Brain | `brain/` (entire directory) | Yes — done, frozen `project-brain-v1.1` | No | Precedes everything | Done (Human Approval Authority, this session) | None |
| Command 1: Accountability Constitution | `00_constitution/00_constitution.md` | Yes — done, approved `constitution-v1.0` | No | After Brain, before Phase 0 implementation | Done | None |
| Command 2: HARM Operating System | *(none found)* | No | **Future Proposal (not approved)** | N/A — not part of approved Foundation Build Order | New ADR + Human Approval Authority required before any design work | What "HARM" refers to is not defined anywhere in Brain — needs definition before it can even be scoped |
| Command 3: Contribution & Impact Framework | Partial conceptual overlap: Impact Agent (`ADR-004`), Analytics' civic-effect measurement (Master Product Blueprint §18) | Partially (as concepts, not as a standalone framework) | **Future Proposal (not approved)** as a distinct artifact | N/A | New ADR required, explicitly scoped against existing overlap | Must clarify whether this is meant to consolidate existing concepts or add new ones |
| Command 4: Ethics Charter | Partial overlap: Constitution §§1, 4, 12 (AI governance, civic-effect measurement, human oversight) | Partially | **Future Proposal (not approved)** as a distinct document | N/A | New ADR + Constitutional amendment review (per Constitution §6, since it risks overlapping Constitution's own domain) | Real risk of duplicating the Constitution; needs explicit scoping before creation |
| Command 5: Governance Charter | Partial overlap: `GOVERNANCE/brain-governance-rules.md`, Constitution §§6, 13, 17 | Partially | **Future Proposal (not approved)** as a distinct document | N/A | Same as above | Same overlap risk as Command 4 |
| Command 6: Vision | `brain/VISION.md` | Yes — done, approved, frozen | No | Already completed *before* Foundation Architecture, not after Constitution | Done | Sequencing note: if this step is ever "executed," it must mean referencing the existing document, never redoing it |
| Command 7: Mission | `brain/MISSION.md` | Yes — done, approved, frozen | No | Same as above | Done | Same note as Command 6 |
| Command 8: Master Product Blueprint | `brain/BLUEPRINTS/master-product-blueprint.md` | Yes — done, approved, frozen | No | Same as above | Done | Same note as Command 6 |
| Command 9: Experience Blueprint | `brain/PRODUCTS/experience-blueprint.md` | **No — this file exists only as an explicit gap-notice** (`brain/RESEARCH`/`PRODUCTS` migration status); the real unabridged artifact was never captured | Partially Future — the *slot* is approved, the *content* is missing | N/A until source recovered or re-authored via proper process | Content gap, not a new-architecture decision — see `PROJECT_BRAIN_STATUS.md` §3 | This is a pre-existing Brain gap, not something this document resolves |
| Command 10: Business Blueprint | Partial overlap: `brain/PRODUCTS/product-vision.md` §14 (Business Model) | Partially (no standalone document by this name) | **Future Proposal (not approved)** as a distinct artifact | N/A | New ADR if a standalone document is wanted; otherwise reference §14 directly | Clarify whether this should just be a pointer to §14 rather than new content |

## Phase 2: Products (Commands 11–20)

| Execution step | Existing approved module | Already exists? | Future-only? | Dependency order (per Foundation Build Order) | Approval gate | Remaining ambiguity |
|---|---|---|---|---|---|---|
| 11: Community OS | Community (MVP) | Yes | No | 4th of 9 MVP modules | Standard | Naming only (`OS` suffix) |
| 12: Membership OS | Membership System (MVP) | Yes | No | 5th of 9 | Standard | Naming only |
| 13: Fellowship OS | Fellowship System (V2) | Yes | No | V2 tier, order not yet ratified in detail | Standard | Naming only |
| 14: Academy OS | Academy (V2) | Yes, partially | No | V2 tier | Standard | Model A also has *Speech Academy* and *Writing Academy* as separate modules — clarify whether Academy OS absorbs both or only general scope |
| 15: Research OS | Research Lab (V2) | Yes | No | V2 tier | Standard | Naming only |
| 16: Publishing OS | Publishing (MVP) | Yes | No | 3rd of 9 | Standard | Naming only |
| 17: Store OS | Store (V2) | Yes | No | V2 tier | Standard | Naming only |
| 18: Events OS | Events (MVP) | Yes | No | 6th of 9 | Standard | Naming only |
| 19: Sponsor Marketplace | *(none found)* | No | **Future Proposal (not approved)** | N/A | New ADR required | No approved concept resembles this; full scoping needed |
| 20: Environmental Impact Platform | Partial overlap: Eco Accountability Agent (`ADR-004`), Constitution §11 | Partially (as a review function, not a platform) | **Future Proposal (not approved)** as a product/module | N/A | New ADR required, scoped against existing Eco Accountability Agent role | Clarify whether this duplicates or extends the Agent's existing remit |

## Phase 3: AI (Commands 21–28)

| Execution step | Existing approved module | Already exists? | Future-only? | Dependency order | Approval gate | Remaining ambiguity |
|---|---|---|---|---|---|---|
| 21: AI Architecture | AI Layer (MVP) | Yes | No | 2nd of 9 — deliberately early, ahead of most product modules | Standard | Naming only |
| 22: Knowledge Graph | Knowledge Graph (MVP) | Yes | No | 1st of 9 | Standard | None |
| 23: Memory Architecture | *(none found)* | No | **Future Proposal (not approved)** | N/A | New ADR required | Unclear how this differs from Knowledge Graph or AI Layer's existing scope — needs definition |
| 24: Recommendation Engine | `operating-system.md` §7 (approved subsystem) | Yes, as a subsystem — never promoted to a top-level module | No, but not a standalone module either | Implicitly tied to AI Layer/Knowledge Graph | Standard, if promoted to module status; otherwise already covered | Decide whether this needs to become its own module or stays a subsystem of AI Layer |
| 25: AI Mentor | *(none found)* | No | **Future Proposal (not approved)** | N/A | New ADR required | Full scoping needed |
| 26: AI Civic Companion | Loose naming overlap: AI Layer's "Grounded Civic Copilot" branding (Master Product Blueprint §11) | Conceptually adjacent, not the same artifact | **Future Proposal (not approved)** as a distinct product | N/A | New ADR required if meant as something beyond the existing Copilot | Clarify whether this is a rename of the existing AI Layer/Copilot or a genuinely separate capability |
| 27: Contribution Intelligence | *(none found)* | No | **Future Proposal (not approved)** | N/A | New ADR required | Full scoping needed |
| 28: Impact Intelligence | Partial overlap: Analytics (MVP #18) civic-effect measurement | Partially | **Future Proposal (not approved)** as a distinct capability | N/A | New ADR required, scoped against Analytics' existing remit | Clarify relationship to Analytics before treating as separate |

## Phase 4: Human Engine (Commands 29–35)

| Execution step | Existing approved module | Already exists? | Future-only? | Dependency order | Approval gate | Remaining ambiguity |
|---|---|---|---|---|---|---|
| 29: Identity Engine | Partial overlap: Core Domain Model's `Person`/`ConsentRecord` entities (`ADR-002`) | Partially, as data entities, not an "engine" | **Future Proposal (not approved)** | N/A | New ADR required, scoped against Core Domain Model | Clarify whether this is new behavior on top of existing entities or a rename |
| 30: Learning Engine | Partial overlap: Academy (V2) | Partially | **Future Proposal (not approved)** | N/A | New ADR required | Clarify relationship to Academy |
| 31: Contribution Engine | Partial overlap: Community, Fellowship (contribution tracking already exists conceptually) | Partially | **Future Proposal (not approved)** | N/A | New ADR required | Clarify relationship to existing modules before treating as separate |
| 32: Validation Engine | Naming overlap only: Review & Validation Agent (`ADR-004`) — a reviewer role, not a product engine | No (different kind of thing) | **RESOLVED — see `ADR-017-scientific-review-validation-engine.md`** | `ADR-017` | Adopted as Scientific Review (`brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7), distinct from the `ADR-004` Agent role | Original analysis preserved above; resolution appended, not rewritten |
| 33: Reputation Engine | *(none found)* | No | **Future Proposal (not approved)** | N/A | New ADR required, **plus explicit design review against Constitution Core Principle 2 (zero gamification) before any implementation** | High ambiguity/risk — a "reputation" mechanic is architecturally adjacent to exactly what Core Principle 2 forbids; must not proceed without that review |
| 34: Opportunity Engine | *(none found)* | No | **Future Proposal (not approved)** | N/A | New ADR required | Full scoping needed |
| 35: Leadership Engine | Partial overlap: Fellowship System (facilitator/leader recognition), explicitly "human-gated, non-gamified, no leaderboard" | Partially, but under an explicitly anti-gamification design constraint | **Future Proposal (not approved)** | N/A | New ADR required, **plus the same Core Principle 2 review as Command 33** | Same high-ambiguity/risk flag as Reputation Engine |

## Phase 5: Platform (Commands 36–40)

| Execution step | Existing approved module | Already exists? | Future-only? | Dependency order | Approval gate | Remaining ambiguity |
|---|---|---|---|---|---|---|
| 36: Dashboard | Dashboard (MVP) | Yes | No | 7th of 9 | Standard | None |
| 37: CRM | CRM (MVP) | Yes | No | 8th of 9 | Standard | None |
| 38: Analytics | Analytics (MVP) | Yes | No | 9th of 9 (last MVP module) | Standard | None |
| 39: Public API | Public API (V3) | Yes | No | V3 tier, last overall | Standard | None |
| 40: Development Blueprint | Partial overlap: CLI Architecture (`foundation-architecture.md` §5), `implementation-plan.md` | Partially | **Future Proposal (not approved)** as a distinct artifact | N/A | New ADR if a standalone document is wanted; otherwise reference existing CLI Architecture/Implementation Plan | Clarify whether this is a rename of existing content or genuinely new |

---

## Summary

- **14 of 40 steps already exist as approved modules** — Commands 11, 12, 13, 14 (partial), 15, 16, 17, 18, 21, 22, 36, 37, 38, 39. These need no new approval beyond the standard Review Gate at their turn in the existing Foundation Build Order.
- **2 steps exist as approved concepts but not as standalone modules** — Command 24 (Recommendation Engine, an `operating-system.md` subsystem) and Command 9 (Experience Blueprint, an approved slot with missing content, a pre-existing gap).
- **24 steps are Future Proposal (not approved)** and require a new ADR plus Human Approval Authority sign-off before any design work begins — not merely before completion.
- **Two of those (Reputation Engine, Leadership Engine) carry an explicit Core Principle 2 gamification risk** and must not proceed to design without that review specifically.
- No approved document, ADR, or module was modified, renamed, or redefined to produce this mapping.

Stopping here for review. No files modified other than this one; nothing committed.
