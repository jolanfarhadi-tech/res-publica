# Decision Log — Implementation Decisions with Rationale and Evidence

*Distinct from `docs/AI/ARCHITECTURE_INDEX.md` (which indexes ADRs as documents) and `docs/source/DECISION_LOG.md` (a different, pre-existing file — a build-judgment-call log for the `docs/source/` documentation restructuring specifically, not duplicated here). This file extracts decisions with their rationale, evidence, commit, and ADR cross-references, for both architectural and implementation-level decisions. All entries **Verified** against the cited source unless marked otherwise.*

---

## D-01: Three-tier platform architecture

**Decision:** Static Core (Tier 1, MDX-in-Git) / AI Retrieval (Tier 2, read-layer) / Personalization & Identity (Tier 3, opt-in, last) — Tier 1 must never be slowed or blocked by Tiers 2 or 3.
**Rationale** (`architecture/adr/ADR-001-core-platform.md`, read in full): the existing static site's Git-review trust model and SEO/speed strengths are genuine competitive assets for a civic-trust organization; a full rewrite would discard them for capabilities addable incrementally instead.
**Evidence:** `architecture/adr/ADR-001-core-platform.md` §Decision, §Alternatives Considered.
**Related commit:** documentation-only ADR; no single implementing commit — realized progressively across the whole build.
**Related ADR:** ADR-001.
**Rejected alternatives** (from the ADR's own §Alternatives Considered): a full CMS/dynamic-framework rewrite; AI embedded directly in Tier 1's render path; introducing the personalization database before the AI layer.

## D-02: Six canonical domain entities, not per-module duplicates

**Decision:** `Person`, `ConsentRecord`, `Payment`, `Organization`, `Notification`, `AuditLog` are the only canonical cross-module entities.
**Rationale:** stop the same real-world concept being independently defined more than once across module specs — per `brain/PROJECT_MEMORY.md`, this exact failure mode was caught multiple times during the Foundation Architecture's own reconciliation passes (five duplicated entities caught at one stage, two more independently re-duplicated at a later stage).
**Evidence:** `architecture/adr/ADR-002-domain-model.md`; `brain/PROJECT_MEMORY.md` §"Why three separate reconciliation passes happened."
**Related commit:** `9f9ec5f` (Foundation Build Order Steps 1-5 — first commit implementing the model in code).
**Related ADR:** ADR-002.

## D-03: Plugin/manifest architecture over hard-coded module integration

**Decision:** every module declares a `ModuleManifest` (entities, database tables, API routes, dashboard contribution, AI Layer capabilities) rather than being wired in by editing a central integration file.
**Rationale:** documented in ADR-003; not independently re-read in full this session — **Not Recoverable from the available evidence beyond the ADR title/decision summary** for this specific rationale text.
**Evidence:** `architecture/adr/ADR-003-plugin-architecture.md`; implementation confirmed directly: `src/modules/{manifest,registry,bootstrap}.ts`, one `manifest.ts` per module (10 modules confirmed).
**Related commit:** `9f9ec5f`.
**Related ADR:** ADR-003.

## D-04: Offline-first as a platform-wide principle

**Decision:** local development runs against `@electric-sql/pglite` (embedded Postgres), not a shared remote database, and this is treated as a platform-wide principle rather than a convenience.
**Rationale:** ADR-010's own framing (title: "platform-wide principle, not just a local-dev convenience") — full rationale text not re-read in full this session.
**Evidence:** `architecture/adr/ADR-010-offline-first-development.md`; `package.json` dependency `@electric-sql/pglite`; `src/local-dev/` directory.
**Related commit:** not individually isolated this session.
**Related ADR:** ADR-010.

## D-05: `docs/source/` supersedes `brain/` as the canonical documentation location

**Decision:** `docs/source/` is now canonical; `brain/` is retained as historical source material, not deleted or deprecated as a repository.
**Rationale, direct quote** (`docs/source/DECISION_LOG.md` item 6): "Per your explicit direction this turn: `docs/source/` is now canonical; `brain/` is retained as historical source material, not deleted." **Not Recoverable:** the specific conversational exchange ("your explicit direction this turn") that produced this decision — no transcript of it exists in this repository; only its recorded outcome survives.
**Evidence:** `docs/source/DECISION_LOG.md` item 6; `docs/source/COMPATIBILITY_MAP.md` (cross-reference table, confirms no contradiction found during migration).
**Related commit:** `5409cb9` ("Add canonical documentation system (docs/source/) and supporting brain updates").
**Related ADR:** none — this was a documentation-governance decision, not an ADR.

## D-06: HARM Lifecycle step count — 12-stage internal cycle is canonical, "8 steps" is a public simplification

**Decision:** the website's public "8 steps" and the Brain's 12-stage HARM Lifecycle are the same cycle, not two competing versions.
**Rationale, direct quote** (`docs/source/DECISION_LOG.md` item 1): "the 12-stage HARM Lifecycle is canonical; the website's '8 steps' is a simplified public presentation of the same cycle, not a distinct version."
**Evidence:** `docs/source/DECISION_LOG.md` item 1; `docs/source/foundation/01_HARM_OPERATING_SYSTEM.md` §Framework (states "Resolved" directly in the document).
**Related commit:** not individually isolated (part of the 2026-07-06 documentation buildout phase).
**Related ADR:** none directly; related to ADR-019/020/021 (HARM/Annex architecture).

## D-07: "Validation Framework" terminology retired in favor of "Reflection not Validation"

**Decision:** the term "Validation Framework" and the state name `hearing_validated` are retired repository-wide.
**Rationale:** **Not Recoverable from the available evidence** — the commit subjects state the change was made but do not state why in the commit message itself; no ADR or design document explaining the rationale was found this session.
**Evidence:** commit `83cde16` ("Retire Validation Framework terminology and synchronize repository architecture"); commit `dda929c` ("Reinforce Reflection not Validation principle in Structured Hearings"); commit `d20c562` ("Rename hearing_validated to hearing_documented across state machine references").
**Related commit:** `83cde16`, `dda929c`, `d20c562`.
**Related ADR:** none found directly attached to this specific rename.

## D-08: AGPL-3.0-only core licensing, CLA required, dual-licensing reserved

**Decision:** Res Publica's core software is licensed AGPL-3.0-only; contributions require a CLA (not yet published); the organization reserves the option to dual-license.
**Rationale:** not independently re-read in full from the ADR's own rationale text this session — **partially Not Recoverable** beyond the decision itself.
**Evidence:** `architecture/adr/ADR-032-license-strategy.md`; `LICENSE`; `README.md` §License; `CONTRIBUTING.md` (read in full: "contributions are accepted only by prior arrangement" until CLA text is published).
**Related commit:** `b900597` ("docs: accept AGPL license strategy").
**Related ADR:** ADR-032.

## D-09: Identity/Auth boundary — ADR-027 formally accepted by the Founder

**Decision:** identity, authentication, session, and authorization boundaries are formally defined and accepted.
**Rationale/evidence, direct quote from the ADR itself** (read in full this session): `## Status` → "Accepted — explicitly approved by the Founder on 2026-07-19." `## Authorship` → "Prepared on 2026-07-19 by the implementation agent after the Program Director approved preparation of the ADR. This is an authored proposal, not a discovered..." (text continues beyond what was read in full).
**Evidence:** `architecture/adr/ADR-027-identity-authentication-authorization.md` §Status, §Authorship.
**Related commit:** `a9fac9c` (M2 auth foundation), `e31ca3c` (OIDC flows), `770857e` (session controls) — all 2026-07-19, same day as the ADR's own approval date.
**Related ADR:** ADR-027.
**Note on process, directly evidenced:** this ADR's own `## Authorship` section names two internal roles — "implementation agent" and "Program Director" — as part of its approval chain. **Inferred:** this suggests a defined internal review process for ADRs in this repository (propose → Program Director approves preparation → draft → Founder approves), though this session did not read a document formally specifying that process end-to-end.

## D-10: Civic editorial delegation of authority (ADR-036) — separation of duties enforced in code

**Decision:** four editorial roles (`editor`, `reviewer`, `translator`, `publisher`), session-derived authority, strict separation of duties (author ≠ reviewer ≠ publisher, no self-assignment), human-only sign-off, no automatic publish action.
**Rationale:** directly evidenced in the implementing code's own logic (not a separately-read rationale document): `src/application/publishing.ts` (read in full) enforces `author_review_forbidden`, `publisher_separation_required`, and forbids self-assignment to translation/review at the function level, consistent with a deliberate anti-collusion/accountability design.
**Evidence:** `architecture/adr/ADR-036-civic-editorial-delegation-of-authority.md`; `src/modules/publishing/authority.ts`, `src/application/publishing.ts`, `src/application/publishing-authority.ts` (implemented, tested, and committed).
**Related commit:** ADR document `5212636`; complete backend implementation `09c160bb7e56a7bd9e5b9039e2f12de49ae727bf`.
**Related ADR:** ADR-036.
**Status caveat:** later workspace and rate-limit slices preserve the committed ADR-036 boundary; no-auto-publish remains in force.

## D-11: Member Profile — read-only, tri-tier visibility, "not a governance decision interface"

**Decision:** the Member Profile is a self-facing, read-only presentation layer with three architecturally-separated visibility tiers (member-facing / internal-administrative / governance-sensitive), enforced at the data-access layer, never merged into one queryable object.
**Rationale, direct quote** (`docs/source/projects/MEMBER_PROFILE.md`, read in full, stated as a repeated "Architectural Rule"): "the member profile is a transparency and participation interface. It is not a governance decision interface." Restated four separate times across the document for different subsections (Visibility, Purpose, Evidence Summary, Governance).
**Evidence:** `docs/source/projects/MEMBER_PROFILE.md` (full read); `architecture/adr/ADR-034-member-profile-visibility-and-self-service-authorization.md`.
**Related commit:** `3a75efd` (protected self-service), `a31afef` (trilingual interface).
**Related ADR:** ADR-034.
**Rejected alternatives, directly evidenced:** the Member Profile defining its own Contribution Record Lifecycle (deliberately not done — reserved for a future, unratified "Civic Contribution Framework"); social-media-style framing ("What do you think?", "React to this") — explicitly forbidden in favor of civic-action verbs (Register, Apply, Join, Complete, Continue, Renew, Learn, Volunteer, Mentor, Organize, Participate, Contribute).

## D-12: AI Layer — citation-or-refuse enforced regardless of provider; local provider only, no real LLM yet

**Decision:** `queryAILayer()` enforces cost governance and citation-or-refuse "regardless of provider" (i.e., any future real LLM-backed provider must preserve this behavior); the current, only-implemented provider is a deterministic, zero-cost, Knowledge-Graph keyword-search local provider.
**Rationale, direct quote** (`src/modules/ai-layer/README.md`, read in full): "Activating a real provider is a configuration change... not a redesign of this module." Status: "Local provider implemented and tested. Real external provider... not started."
**Evidence:** `architecture/adr/ADR-008-ai-layer.md`; `src/modules/ai-layer/README.md`, `types.ts` (`AIProvider` interface), `providers/local-provider.ts`.
**Related commit:** `9f9ec5f`.
**Related ADR:** ADR-008, ADR-030.

## D-13: Publishing domain logic deliberately excludes the actual Git commit/publish action

**Decision:** `publish.ts` marks a draft "ready to publish" but never writes a file or invokes Git.
**Rationale, direct quote** (`src/modules/publishing/README.md`, read in full): "The actual commit is a separate, explicitly-approved action outside this module's scope."
**Evidence:** `src/modules/publishing/README.md` §"Deliberately not implemented here".
**Related commit:** `9f9ec5f`, `7ba7fd1`.
**Related ADR:** ADR-036 (delegation of authority — the "no-auto-publish boundary" is this same principle, later formalized).

## D-14: Membership Lifecycle deliberately excludes "Deleted" as a state

**Decision:** Membership Lifecycle states are `REGISTERED → VERIFIED → ACTIVE → INACTIVE/PAUSED/SELF-ISOLATED/WITHDRAWN/RETIRED/SUSPENDED/TERMINATED` — "Deleted" is never a valid state.
**Rationale, direct quote** (`docs/source/projects/MEMBER_PROFILE.md`, read in full): "Membership represents civic participation and institutional memory, not a normal platform account. A person's membership state may change, but their documented contributions must not disappear from the civic record."
**Evidence:** `docs/source/projects/MEMBER_PROFILE.md` §"Membership Journey"; `src/modules/membership/lifecycle.ts` (existence confirmed; not read line-by-line this session, but its README independently confirms "Full lifecycle... implemented and tested").
**Related commit:** `2194b7e`, `a9fac9c`.
**Related ADR:** none directly; downstream of the domain-model/audit-log append-only principle (ADR-002, ADR-029).

## D-15: Knowledge Graph — deterministic extraction only, never AI-invented

**Decision:** entity/relationship extraction from MDX content must be deterministic; the graph is never populated by AI inference.
**Rationale:** stated in the ADR's own title framing; full rationale text not re-read in full this session — **Not Recoverable beyond the title/decision summary** in this pass.
**Evidence:** `architecture/adr/ADR-007-knowledge-graph.md`; `src/modules/knowledge-graph/extractors/frontmatter-extractor.ts` (existence confirmed, consistent with deterministic frontmatter-based extraction, not an LLM call).
**Related commit:** `9f9ec5f`.
**Related ADR:** ADR-007, ADR-019, ADR-028.

## D-16: EAO agent role is "Read Only + Suggest Only" — never modifies files, commits, or approves architecture

**Decision:** the `program-orchestrator` / Chief Systems Officer agent role is scoped to read-only repository inspection and advisory suggestions only.
**Rationale:** governance separation-of-concerns for an AI-driven coordination role — full rationale text from ADR-024/025 not re-read in full this session; the scope constraint itself is directly evidenced via this session's own system-provided agent-roster description.
**Evidence:** `architecture/adr/ADR-024-executive-ai-office.md`, `ADR-025-eao-generation-2-constitutional-architecture-adoption.md`; this session's system context describing the `program-orchestrator` agent's tool access as `Read, Grep, Bash, Glob` (no `Write`/`Edit`).
**Related commit:** `627802c` ("Register EAO roster and activate Chief Systems Officer per ADR-024").
**Related ADR:** ADR-024, ADR-025.

## D-17: Publishing readiness supersession is append-only

**Decision:** when a new draft version is created after an earlier version reached `ready`, the original ready record is retained and a new `superseded` event references it. Sign-off separately requires the exact latest draft to have its own approved moderation record.
**Rationale:** ADR-036 requires subsequent edits to invalidate prior readiness while also requiring historical editorial decisions to remain append-only. Updating or deleting the original ready record would satisfy invalidation but violate the historical-record boundary; an explicit supersession event satisfies both requirements.
**Evidence:** `src/application/publishing.ts`; `src/persistence/module-schema.ts`; `drizzle/0011_publishing-authority.sql`; `src/application/publishing.integration.test.ts` (verified passing 2026-07-24).
**Related commit:** none — implementation remains uncommitted.
**Related ADR:** ADR-036, ADR-029.
**Rejected alternative:** mutating the existing ready row in place, because that would rewrite the historical decision rather than append superseding evidence.

## D-18: Unknown legacy Publishing provenance remains explicitly unknown

**Decision:** migration `0011` leaves legacy draft authorship, reviewer assignment time, reviewed draft target, and translation content nullable when the historical value cannot be established. Current writes always persist this provenance, and sign-off rejects records whose required provenance remains incomplete.
**Rationale:** deterministic backfills would create plausible-looking but false authorship, timing, review-target, or content evidence. ADR-029 and ADR-036 require trustworthy canonical audit and named-human accountability, so explicit unknowns are safer than fabricated history.
**Evidence:** `drizzle/0011_publishing-authority.sql`; `src/persistence/module-schema.ts`; `src/application/publishing.ts`; `src/application/publishing.integration.test.ts` (verified passing 2026-07-24).
**Related commit:** none — implementation remains uncommitted.
**Related ADR:** ADR-029, ADR-036.
**Rejected alternative:** assigning submission timestamps/authors or a latest draft as migration defaults, because those values are not recoverable historical facts.

## D-19: Persian Open Graph uses a language-neutral static fallback

**Decision:** on the accepted Next 15 line, DE and EN retain localized generated Open Graph cards, while FA uses a prebuilt language-neutral Res Publica identity card. Persian title and description remain localized in HTML metadata; Persian text is not passed to ImageResponse/Satori.
**Rationale:** the bundled renderer fails on the Persian font's required OpenType substitution during static generation. A neutral identity card preserves a valid locale-specific image URL and Production prebuild without replacing Persian content with English or weakening Persian metadata support.
**Evidence:** `src/app/[locale]/opengraph-image.tsx`; `src/app/[locale]/layout.tsx`; `src/i18n/open-graph.ts`; `src/i18n/open-graph.test.ts`; successful 105-page Production build and local `200 image/png` checks on 2026-07-30.
**Related commit:** the atomic OPEN-019 resolution commit containing this entry.
**Related ADR:** none — this is a deployment-safe Experience/Localization implementation decision, not an architectural domain decision.
**Rejected alternatives:** rendering Persian through the unsupported Satori path; substituting English copy on the FA card; runtime-fetching an unproven font; removing localized Persian metadata.

---

## Decisions with rejected alternatives not otherwise itemized above

**Verified**, `docs/source/DECISION_LOG.md` (read in full), additional items not already covered by D-01–D-16:

- **Item 2** ("Five Innovations naming"): canonical names are Responsibility Biography Lab, Responsibility Mapping Lab, Responsibility Dashboard, Responsibility Annexes, Civic Intelligence Lab — shorter website UI labels retained as UI labels only, never overriding source documentation naming.
- **Item 4** (acronym expansion): explicitly declined to invent expansions for `AHIP`, `RPCS`, `SMHC` where none is confirmed anywhere in the repository — flagged unresolved instead, in `docs/source/glossary/ACRONYMS.md`.
- **Item 7** (terminology precedence rule): where `brain/` and website fragments disagreed on naming only (not substance), `brain/` documents were treated as more authoritative for internal/operating terminology, website fragments as authoritative for public-facing naming — a standing precedence rule for future conflicts, not a one-time judgment call.

## Not Recoverable from the available evidence

- The specific internal deliberation/conversation that produced most `docs/source/DECISION_LOG.md` judgment calls (only the outcome survives in that file, not a transcript).
- Full "Alternatives Considered" text for ADRs other than ADR-001 (not individually read in full this session for every ADR — see `docs/AI/ARCHITECTURE_INDEX.md`'s own equivalent disclosure).
- Rationale text explaining exactly why "Validation Framework" terminology was retired (D-07) — the commit messages record the change, not the reasoning.
