# Architecture Memory — Cross-Cutting Summary

*Status labels used throughout: **ACCEPTED** (an ADR/decision exists, formally approved) · **IMPLEMENTED** (repository code directly proves the decision is realized) · **PARTIALLY IMPLEMENTED** (some but not all of the decision is realized in code) · **PROPOSED** (drafted, not yet accepted) · **SUPERSEDED** (a later decision replaced it) · **RESERVED** (explicitly reserved for a future decision, no content yet) · **UNVERIFIED** (this compilation found no direct code evidence either way). An accepted ADR is never treated as implemented without a code citation.*

See `INDEX.md` for how this file relates to the others. Full ADR text lives in `architecture/adr/`; do not treat this summary as a replacement.

---

## Constitutional / domain architecture

**Constitutional Domain Architecture** — Civic Domain / Governance Domain / Shared Platform Services separation.
Status: **ACCEPTED**. Evidence: `architecture/adr/ADR-026-constitutional-domain-architecture.md`; commit `8b55778` "Accept constitutional domain architecture"; preceded by `f31adb0` "Resolve cross-domain architecture boundaries" and `7ba7fd1` "Enforce M4 domain boundaries".
Implementation status: **PARTIALLY IMPLEMENTED / UNVERIFIED** at the enforcement-mechanism level — module folder separation exists (`src/modules/*`, one manifest per module, `src/modules/registry.ts` + `bootstrap.ts`), but this compilation found no automated lint/CI check specifically enforcing cross-domain boundaries (distinct from `scripts/check-structure.mjs`, which checks for duplicate `app/`/`content/` roots, not domain boundaries). Evidence: `scripts/check-structure.mjs` (content confirmed unrelated to domain boundaries); no `domain-boundary`-named script found under `scripts/`.

**Documentation architecture** — three-layer system, one now-superseded.
Status: **ACCEPTED, then SUPERSEDED at the "canonical" designation level**. `architecture/adr/` (ADRs) never superseded. `brain/` was originally canonical (tag `foundation-v1.0`), then explicitly superseded by `docs/source/` as the canonical documentation location — evidence: `docs/source/DECISION_LOG.md` item 6 ("`docs/source/` is now canonical; `brain/` is retained as historical source material, not deleted"), cross-referenced in `docs/source/COMPATIBILITY_MAP.md`. `brain/DECISIONS.md` remains the authoritative ADR index specifically (not duplicated into `docs/source/`).

## Domain model

**Canonical domain entities** (Person, ConsentRecord, Payment, Organization, Notification, AuditLog).
Status: **ACCEPTED**; ADR-002 (`architecture/adr/ADR-002-domain-model.md`), amended to add `Notification` as a sixth entity.
Implementation: **IMPLEMENTED**. Evidence: `src/persistence/schema.ts` — `people` (L13), `consentRecords` (L22), `payments` (L38), `organizations` (L56), `notifications` (L65), `auditLog` (L81) all defined as `pgTable`s (directly verified this session via `grep "pgTable" src/persistence/schema.ts`). Domain-layer wrappers exist at `src/domain/{person,consent,payment,organization,notification,audit-log}/`.

## Plugin / module architecture

**Module manifest contract instead of hard-coded integration.**
Status: **ACCEPTED**; ADR-003 (`architecture/adr/ADR-003-plugin-architecture.md`).
Implementation: **IMPLEMENTED**. Evidence: `src/modules/manifest.ts` (the `ModuleManifest` type), `src/modules/registry.ts` + `src/modules/registry.test.ts`, `src/modules/bootstrap.ts` + `src/modules/bootstrap.test.ts`, and one `manifest.ts` per module confirmed present in `ai-layer`, `analytics`, `community`, `crm`, `dashboard`, `events`, `harm-governance`, `knowledge-graph`, `membership`, `publishing` (directly enumerated this session via `find src/modules -type f`).

## Identity, authentication, and authorization

**Identity/session/auth boundaries.**
Status: **ACCEPTED** — `architecture/adr/ADR-027-identity-authentication-authorization.md` §Status: *"Accepted — explicitly approved by the Founder on 2026-07-19."* (directly read this session).
Implementation: **IMPLEMENTED**. Evidence: `src/auth/{oidc.ts, actor-resolver.ts, authorize.ts, request-security.ts, crypto.ts, runtime.ts, store.ts, types.ts}`; persistence tables `authIdentities`, `authSessions`, `authFlows`, `authorizationGrants` in `src/persistence/schema.ts` (L99, L115, L132, L146); commits `a9fac9c` (M2 auth foundation), `e31ca3c` (OIDC flows), `770857e` (authenticated session controls); tests `src/auth/authorize.test.ts`, `src/auth/config.test.ts`, `src/app/api/auth/routes.test.ts`.
**Known documentation drift:** `src/modules/membership/README.md` (as currently committed) states *"This module does not define, implement, or own Authentication; `ADR-027` remains unresolved"* — this predates the 2026-07-19 auth-implementation commits above and is now stale relative to the accepted, implemented ADR-027. See `WARNINGS_AND_DEBT.md`.

**Capability-based authorization primitive** — grants as `{domain, capability, target, minimumAssurance}` tuples, reused across governance domains.
Status: **IMPLEMENTED** (not a separate ADR; a design pattern realized identically in two independent modules). Evidence: `src/auth/authorize.ts` (core primitive); `src/modules/publishing/authority.ts` and `src/modules/harm-governance/authority.ts` (both call `requireAuthorization`/equivalent with `domain`/`capability`/`target`/`minimumAssurance:"mfa"`, directly read this session).

## Audit and event-bus boundary

Status: **ACCEPTED** — `architecture/adr/ADR-029-audit-and-event-bus-boundary.md`.
Implementation, split:
- **Append-only audit log: IMPLEMENTED.** Evidence: `auditLog` table (`src/persistence/schema.ts` L81); every mutating action in `src/application/publishing.ts`, `src/application/publishing-authority.ts`, and (by module pattern) `src/modules/membership/lifecycle.ts`, `src/modules/events/registration.ts` writes an `auditLog` row in the same transaction (directly read this session for publishing; membership/events READMEs assert the same pattern for their own modules, not independently re-verified line-by-line).
- **No domain-event bus in M1: ACCEPTED DECISION.** ADR-029 explicitly states that M1 does not introduce an event bus. The absence of a message-queue/pub-sub mechanism is therefore conformant, not an implementation gap. The canonical append-only audit repository is the required M1 boundary and is used by Publishing.

## Knowledge Graph boundary

Status: **ACCEPTED** — `architecture/adr/ADR-007-knowledge-graph.md` (deterministic extraction, never AI-invented) and `architecture/adr/ADR-028-knowledge-graph-boundary.md` (generic graph mechanism → Shared Platform Services; graph semantics → owning domains), with `architecture/adr/ADR-019-civic-intelligence-layer-and-knowledge-graph-relationship.md` accepting the HARM-specific specialization under ADR-007/026/028.
Implementation: **IMPLEMENTED** (deterministic extraction + basic graph API confirmed; semantic/domain-specific graph rules beyond the basics not assessed). Evidence: `src/modules/knowledge-graph/{build.ts, api.ts, types.ts, manifest.ts, graph-rebuild-cli-entry.ts, extractors/frontmatter-extractor.ts}`; persistence tables `kgEntities`/`kg_entities` and `kgRelationships`/`kg_relationships` (`src/persistence/module-schema.ts` L203, L212, directly grepped this session); test `src/modules/knowledge-graph/knowledge-graph.test.ts`. Note: `src/modules/knowledge-graph/manifest.ts`'s own comment states the manifest file itself "declaratively" lists routes/tables it does not wire up — the tables are nonetheless separately implemented in `module-schema.ts`, confirmed by direct grep, so this is not a contradiction, just two different files with different jobs.
**Reserved extension:** ADR-019 explicitly reserves "Innovations 6/7 and new operational graph rules" for **ADR-035 — RESERVED, no ADR file exists yet** (`brain/DECISIONS.md` row for ADR-035, confirmed no `architecture/adr/ADR-035-*.md` file exists via directory listing this session).

## AI-runtime boundary

Status: **ACCEPTED** — `architecture/adr/ADR-008-ai-layer.md` (one shared grounded RAG service, citation-or-refuse, cost ceiling) and `architecture/adr/ADR-030-ai-runtime-boundary.md` (shared runtime mechanism, domain decisions stay domain-owned).
Implementation: **PARTIALLY IMPLEMENTED**. Evidence, direct quote from `src/modules/ai-layer/README.md` (read in full this session): *"Local provider implemented and tested. Real external provider (grounded RAG, embeddings, LLM calls) is separate, later, infrastructure-dependent work — not started."* Code: `src/modules/ai-layer/{query.ts, cost-governance.ts, types.ts, manifest.ts, providers/local-provider.ts}`; persistence tables `aiQueryLog`/`ai_query_log` and `aiCostLedger`/`ai_cost_ledger` (`src/persistence/module-schema.ts` L224, L238); test `src/modules/ai-layer/ai-layer.test.ts`. The local provider does deterministic Knowledge Graph keyword search only — no LLM call exists in this repository as of this compilation.

## Persistence architecture

Status: **ACCEPTED** implicitly via ADR-002 (domain model) and ADR-010 (offline-first); no single "persistence architecture" ADR exists separately.
Implementation: **IMPLEMENTED**. Evidence: Drizzle ORM over Postgres (`pg`) in production, `@electric-sql/pglite` for offline-first local dev (`package.json` dependencies, ADR-010: `architecture/adr/ADR-010-offline-first-development.md`); two schema files (`src/persistence/schema.ts` and `src/persistence/module-schema.ts`); 14 committed migrations through `0013_notification-delivery-attempts`, all applied in Production, creating 55 public tables.

## Project ownership and cross-domain collaboration

Status: **ACCEPTED** — `architecture/adr/ADR-031-project-ownership-and-cross-domain-collaboration.md`.
Implementation: **CONFIRMED UNIMPLEMENTED**. Targeted schema, service, module,
route, and identifier searches found no Civic `Project` aggregate or Governance
reference contract. ADR-031 settles ownership but does not define the fields,
lifecycle, capabilities, persistence, or APIs required for implementation; see
`OPEN_WORK.md` OPEN-007.

## Delegation of authority

Status: **ACCEPTED** — `architecture/adr/ADR-033-delegation-of-authority.md` (Governance operational roles, powers, appointment, scope, revocation) and `architecture/adr/ADR-036-civic-editorial-delegation-of-authority.md` (scoped Civic editorial roles, separation of duties, human-only sign-off, no-auto-publish).
Implementation: **PARTIALLY IMPLEMENTED**, split by ADR:
- ADR-033 (governance authority generally): **IMPLEMENTED**. Evidence: `authorizationGrants` table, `src/application/governance-authority.ts`, `src/modules/harm-governance/authority.ts`.
- ADR-036 (civic editorial specifically): **IMPLEMENTED AND COMMITTED** at
  `09c160bb7e56a7bd9e5b9039e2f12de49ae727bf`. Later bounded workspace and
  shared rate-limit slices preserve exact scope, MFA, separation of duties,
  atomic audit, `commitHash: null` readiness, and no-auto-publish.

## Member Profile visibility and self-service authorization

Status: **ACCEPTED** — `architecture/adr/ADR-034-member-profile-visibility-and-self-service-authorization.md`.
Implementation: **PARTIALLY IMPLEMENTED** — protected Membership journey,
profile-creation consent receipts, private Dashboard, and self-only
Payments/Notifications views exist. Remaining Identity, Community,
application, contribution, recommendation, and Governance-disclosure slices
remain subject to the accepted projection and architecture gates. Evidence:
`docs/source/projects/MEMBER_PROFILE.md`, `src/application/{member-profile,dashboard}.ts`.

## Membership application and research wallet proposals

Status: **PROPOSED, NOT ACCEPTED** — ADR-037 and ADR-038. Implementation is
committed and deployed as reviewable evidence: verified Auth0 signup remains
separate from Membership; board decisions require exact scope, genuine MFA and
separation of duties; the BBS wallet/verifier path is synthetic-tested. This
does not change the ADR status. Real issuance and research intake remain
fail-closed while `RESEARCH_REAL_DATA_ACTIVATION_APPROVED` is absent/false.
Production main persistence is verified at 19 migrations/66 tables; the
separate anonymous-verifier runtime is not configured in Production.

## Executive AI Office (EAO)

Status: **ACCEPTED** — `architecture/adr/ADR-024-executive-ai-office.md`, amended/superseded in scope by `architecture/adr/ADR-025-eao-generation-2-constitutional-architecture-adoption.md` ("EAO Generation 2").
Implementation: **IMPLEMENTED**. Evidence: nine real, invokable pipelines under `scripts/eao/` (`repository-health.mjs`, `broken-links.mjs`, `terminology-drift.mjs`, `dependency-map.mjs`, `project-health.mjs` + `.test.mjs`, `roadmap.mjs`, `risk-analysis.mjs`, `adr-review.mjs`, `release-readiness.mjs`), wired to `npm run eao:*` scripts in `package.json`; agent identity registered at `.claude/agents/program-orchestrator.md` and `.codex/agents/program-orchestrator.toml` (both confirmed to exist this session; per this session's own system context, the `program-orchestrator` agent is scoped "Read Only + Suggest Only — never modifies files, never commits, never approves architecture"); commits `52773a1`→`627802c` (EAO establishment, ADR-024), `d8322a4`→`51e98e0` (pipeline implementation), tag `eao-bootstrap-v1` at `e0b54c9`.

## Decisions that superseded earlier decisions (terminology / naming)

- **"Validation Framework" terminology retired.** Commit `83cde16` "Retire Validation Framework terminology and synchronize repository architecture"; commit `dda929c` "Reinforce Reflection not Validation principle in Structured Hearings"; commit `d20c562` "Rename hearing_validated to hearing_documented across state machine references." **SUPERSEDED**: any reference to "Validation Framework" or `hearing_validated` predating these commits is stale terminology.
- **HARM Lifecycle step count.** Website's public "8 steps" vs. Brain's 12-stage cycle — resolved as one canonical cycle, not two competing versions. Evidence: `docs/source/DECISION_LOG.md` item 1.
- **Five Innovations naming.** Canonical names (Responsibility Biography Lab, Responsibility Mapping Lab, Responsibility Dashboard, Responsibility Annexes, Civic Intelligence Lab) vs. shorter website UI labels — resolved as one canonical set with UI labels never overriding source documentation. Evidence: `docs/source/DECISION_LOG.md` item 2.
- **Documentation canonical location.** `brain/` → `docs/source/`, per §"Documentation architecture" above.

---

*This file summarizes; it does not replace reading the cited ADRs, `docs/source/` documents, or code directly. Cross-reference `MODULES/*.md` for module-specific implementation detail and `CURRENT_STATE.md` for what is committed vs. uncommitted right now.*
