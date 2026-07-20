# Open Work — Evidence-Based Register

*Only items with direct evidence of being unfinished. Aspirational ideas and reserved ADRs are listed separately (§"Reserved decisions") and are explicitly **not** active engineering tasks.*

---

## Active worktree work

### OPEN-001 — Publishing-authority implementation is entirely uncommitted
- **Task:** decide the fate of the uncommitted publishing-authority/persistence/API layer (ADR-036 realization).
- **Evidence:** `git status --short` (this session) shows `src/modules/publishing/authority.ts`, `src/application/publishing.ts`, `src/application/publishing-authority.ts`, `src/app/api/publishing/`, `drizzle/0011_publishing-authority.sql` all untracked; `drizzle/meta/_journal.json` and `src/persistence/module-schema.ts` unstaged. `git log main..HEAD` empty — no commit anywhere captures this work.
- **Prerequisite:** none technical; a human decision to keep or discard is needed first.
- **Blocker:** none identified in code; blocked only on verification (tests/typecheck/db:check have not been run against this exact tree by any session that produced this documentation).
- **Safe next action:** run `npm test`, `npm run typecheck`, `npm run db:check`, `npm run db:check:fresh` against the current working tree; only after that, decide to commit or discard. **Do not commit blindly on the assumption that a previous agent's report of passing tests still holds** — no such report from an accessible session exists, and even if one did, the working tree may have changed since.
- **Non-goals:** this task does not include applying the migration to a real database, does not include modifying the publishing code, and does not include choosing between "committed" vs. "uncommitted" as competing implementations — there is only one publishing-authority implementation in this repository; it is simply not yet committed.

## Documentation gaps

### OPEN-002 — Two Foundation-era source artifacts have no surviving original text
- **Task:** none actionable without new information — this is a documented, accepted content gap, not a task to "fix" by writing replacement text.
- **Evidence:** `brain/PROJECT_BRAIN_STATUS.md` §3 (read in full, prior session): neither the original Engineering/Security Audit report nor the original 9-stage Experience Blueprint survives anywhere in this repository; only compressed summaries in `brain/CHANGELOG.md` and `FOUNDATION_REVIEW_FINAL.md` remain.
- **Prerequisite:** locating the original text externally, or an explicit stakeholder decision to accept the compressed summary as the permanent record.
- **Blocker:** no such decision or located text exists in this repository as of this compilation.
- **Safe next action:** do nothing without a human decision. **Do not regenerate this content from scratch and present it as the migrated original** — `brain/PROJECT_BRAIN_STATUS.md` §3 explicitly calls this "regeneration, not migration."
- **Non-goals:** writing a new audit report or a new experience-journey narrative under either document's name.

### OPEN-003 — `docs/source/communication/` contents unexplained
- **Task:** determine the purpose and completeness of `brand-identity.md` and `pitch-arsenal.md`.
- **Evidence:** untracked (`git status --short`, this session); content not read by this compilation.
- **Prerequisite:** read the files; ask the repository owner if their purpose/relationship to the publishing-authority worktree changes is unclear.
- **Blocker:** none technical.
- **Safe next action:** read the two files before assuming they relate (or don't relate) to the publishing-authority work they were introduced alongside.
- **Non-goals:** none identified.

## Technical debt (see `WARNINGS_AND_DEBT.md` for the full risk register; cross-listed here only where it constitutes unfinished work, not merely risk)

### OPEN-004 — Member Profile: unchecked TODO items in the canonical spec
- **Task:** the specific unchecked items in `docs/source/projects/MEMBER_PROFILE.md`'s own TODO list.
- **Evidence:** direct quotes, read in full: unchecked items include the Codex Potential/Hearing Candidate approval workflow and consent-capture UX, integration with `RESPONSIBILITY_EVIDENCE_MODEL.md` §6, "Next Recommended Steps" generation logic, remaining Identity view fields, Community Participation/Systems views, Application History view, Payments/Notifications views.
- **Prerequisite:** the first slice (ADR-034) is checked done in the same document — this is additive work, not a fix.
- **Blocker:** one item is explicitly blocked in the source document itself: *"Blocking on the future Civic Contribution Framework (CCF), not on this document"* — CCF does not yet exist / is not yet ratified.
- **Safe next action:** pick the next unchecked item that is *not* CCF-blocked (e.g., Payments/Notifications views over the already-implemented `Payment`/`Notification` entities) if this becomes the task focus.
- **Non-goals:** defining a new Contribution Record Lifecycle, Membership taxonomy, or any of the six explicitly-unratified "Community Systems" wishlist items (AI Mentor, Skill Graph, etc.) — the source document explicitly forbids treating those as buildable without their own future ADR.

### OPEN-005 — AI Layer external provider not started
- **Task:** none active — explicitly deferred.
- **Evidence:** `src/modules/ai-layer/README.md`, direct quote: *"Real external provider (grounded RAG, embeddings, LLM calls) is separate, later, infrastructure-dependent work — not started."*
- **Prerequisite:** infrastructure decision (which LLM/embedding provider, cost model) not evidenced anywhere in this repository.
- **Blocker:** infrastructure dependency, per the module's own README.
- **Safe next action:** none until a provider decision is made; the `AIProvider` interface (`src/modules/ai-layer/types.ts`) is already the documented extension point.
- **Non-goals:** implementing a real LLM call without a prior infrastructure/cost decision.

### OPEN-006 — ADR-029's "event bus" half not confirmed implemented
- **Task:** none active — this compilation could not confirm whether an event-bus mechanism exists or was deliberately not yet built.
- **Evidence:** no message-queue dependency in `package.json`; no `event-bus`-named file found under `src/` this session. Audit-log half of ADR-029 is confirmed implemented (see `ARCHITECTURE_MEMORY.md`).
- **Prerequisite:** confirm with the repository owner or a deeper code search whether this is unbuilt or realized through a different mechanism (e.g., direct function calls) not recognized as "event bus" by this search.
- **Blocker:** none identified; this is a verification gap in this compilation, not a confirmed missing feature.
- **Safe next action:** search more specifically (e.g., grep for domain-event type names) before assuming this is unbuilt.
- **Non-goals:** building a new event-bus mechanism without first confirming one doesn't already exist under different naming.

### OPEN-007 — ADR-031 (Project ownership / cross-domain collaboration) implementation not confirmed
- **Task:** none active — verification gap, not a confirmed missing feature.
- **Evidence:** no `Project`-named entity found in `src/persistence/schema.ts` or `module-schema.ts` (both grepped for `pgTable` this session); no dedicated cross-domain-collaboration code path found distinct from the module manifest/registry system.
- **Prerequisite:** targeted search for "project ownership" concepts before concluding anything is missing.
- **Blocker:** none identified.
- **Safe next action:** if this becomes a task focus, search specifically for how ADR-031's concepts map to existing code before assuming greenfield work is needed.
- **Non-goals:** building new project-ownership infrastructure without first confirming none exists.

## Reserved decisions requiring a new ADR (explicitly not active engineering tasks)

### OPEN-008 — ADR-035 is reserved, not written
- **Evidence:** `architecture/adr/ADR-019-civic-intelligence-layer-and-knowledge-graph-relationship.md` reserves "Innovations 6/7 and new operational graph rules" for ADR-035; `brain/DECISIONS.md`'s ADR-035 row: *"no ADR file or decision exists yet... Status: Pending."* Directory listing confirms no `architecture/adr/ADR-035-*.md` file exists.
- **This is explicitly not a task.** Per the repository's own ADR Governance Workflow (Constitution §17, cited in `brain/DECISIONS.md`), building Innovations 6/7 or the reserved operational Governance/status/retention/withdrawal/deletion rules requires writing and accepting ADR-035 first — do not implement code against this reservation.

## Roadmap items not yet at build-ready depth (aspirational — not tasks)

Per `brain/ROADMAP.md` (read in full, prior session): Fellowship System, Academy, Speech Academy, Writing Academy, News Analysis Lab, Research Lab, Store, full Admin Portal (V2 tier), Public API (V3 tier) — explicitly deferred, no build-ready blueprint exists for any of these. **These are not active tasks** and should not be started without a scoping/blueprint pass first, per the roadmap's own explicit sequencing.

## CLA / contribution process

### OPEN-009 — CLA text not yet published
- **Evidence:** `CONTRIBUTING.md` (read in full): "The canonical CLA text will be published separately... contributions are accepted only by prior arrangement."
- **Safe next action:** none for an engineering agent — this is a legal/process artifact outside code scope.
- **Non-goals:** drafting CLA legal text as an engineering task.
