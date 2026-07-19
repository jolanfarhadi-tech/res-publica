# Institutional Memory of the Digital Res Publica

> **Status: Founder Constitutional Decision.** This record was established
> on 2026-07-07 at the founder's explicit instruction: every significant
> constitutional, architectural, organizational, governance, and
> theoretical discovery, and every implementation milestone, is to be
> preserved here as permanent institutional memory — not a temporary
> implementation log. See **IM-2026-0017** for the instruction that
> created this document. Entry ID format and metadata schema
> (`IM-YYYY-NNNN`, Type, Status, Authority, Related Documents, Related
> ADRs, Related Books, Related Theory, Keywords, Cross-References) was
> introduced by the founder on 2026-07-08 and applied retroactively to
> entries 1–16.
>
> This is part of the Organizational Operating System of the Digital Res
> Publica, per [`ORGANIZATIONAL_ARCHITECTURE.md`](./ORGANIZATIONAL_ARCHITECTURE.md).

## Purpose

Future agents and contributors must be able to understand not only *what*
was built, but *why* it was built, *how the idea evolved*, *which
alternatives were rejected*, and *what constitutional reasoning* led to
each decision. Source code and even ADRs record outcomes; this record
preserves the reasoning that produced them.

## Categories

- **Constitutional Discovery** — a rule about how this project governs
  itself, or how its own historical/organizational record works.
- **Architectural Discovery** — a structural finding about the system
  being built (domain model, module boundaries, dependency graph, bugs
  with structural implications).
- **Organizational Discovery** — a clarification of how organizational
  concepts (Program, Domain, Milestone, Build Order) relate to each other.
- **Governance Discovery** — a decision about authority, execution
  boundaries, or process (stop conditions, review gates, ownership
  deferrals).
- **Theoretical Discovery** — a framing or thesis about the nature or
  purpose of the project itself.
- **Implementation Milestone** — a concrete, shipped unit of work.

## Entry metadata schema

Every entry carries: `ID` (`IM-YYYY-NNNN`, sequential by year), `Type`,
`Status` (`Active` / `Superseded` / `Deprecated`), `Authority` (who holds
constitutional authority for the entry — the founder, always, either
directly or via delegated execution authority established in
**IM-2026-0005**), `Related Documents`, `Related ADRs`, `Related Books`,
`Related Theory`, `Keywords`, `Cross-References`. `Related Books` and
`Related Theory` are marked "None identified" where no real citation
exists — these fields are never filled with invented references.

## How to use this record

Entries are chronological. When adding a new entry: state the
organizational problem it solved, the reasoning, any alternatives that
were rejected and why, and its implications for future architecture. Do
not compress this out for brevity — the reasoning *is* the asset.

---

## IM-2026-0001 — EAO Phase A completed and frozen

**Type:** Governance Discovery
**Status:** Active
**Authority:** Founder
**Related Documents:** `scripts/eao/*`
**Related ADRs:** None
**Related Books:** None identified
**Related Theory:** None identified
**Keywords:** EAO, phase freeze, scope boundary
**Cross-References:** IM-2026-0005

**Problem:** The Executive AI Office (EAO) tooling (`scripts/eao/`) had
grown across many sessions; without an explicit boundary, "EAO work"
could expand indefinitely alongside the Res Publica product work.

**Decision:** Two EAO script changes were committed (category registry
centralization, action-count-from-evidence fix), then the founder
declared EAO Phase A functionally complete and froze further EAO work
unless explicitly requested again.

**Implications:** Established the pattern of explicit phase boundaries
with an explicit unfreeze condition, later reused for the Foundation
Build Order's own stop conditions (IM-2026-0005).

**Produced:** commits `0b4dfb9`, `bdfd5f5`.

---

## IM-2026-0002 — "Nothing may be presented as discovered if it was intentionally introduced"

**Type:** Constitutional Discovery
**Status:** Active
**Authority:** Founder
**Related Documents:** `ORGANIZATIONAL_ARCHITECTURE.md`, `INSTITUTIONAL_MEMORY.md`
**Related ADRs:** None
**Related Books:** None identified
**Related Theory:** None identified
**Keywords:** discovery vs. introduction, founder decision marking, evidentiary discipline
**Cross-References:** IM-2026-0016, IM-2026-0017

**Problem:** During early architecture discovery, a "Symbolic
Architecture" proposal was presented in a way that implied it was found
in the repository. It was not — it had zero repository evidence.

**Discovery:** When flagged, the founder did not argue the point — he
reclassified it explicitly as a **Founder Constitutional Decision**
rather than a discovery, and praised the distinction being caught.

**Rule established:** Nothing may ever be presented as discovered if it
was intentionally introduced. Founder decisions must be marked as such,
dated, and attributed — never implied to have pre-existed.

**Implications:** This rule governs every subsequent document produced
this session, including `ORGANIZATIONAL_ARCHITECTURE.md` (IM-2026-0016)
and this document itself (IM-2026-0017).

---

## IM-2026-0003 — The North Star question and Symbolic Architecture

**Type:** Theoretical Discovery
**Status:** Active
**Authority:** Founder
**Related Documents:** None committed (conversational record only)
**Related ADRs:** None
**Related Books:** None identified
**Related Theory:** None identified
**Keywords:** North Star, responsibility, Symbolic Architecture
**Cross-References:** IM-2026-0002

**Problem:** Before committing to a domain architecture, the project
needed a governing question to test proposals against.

**Discovery:** The question "How does responsibility become
undeniable?" was proposed as the North Star. The Symbolic Architecture
proposal that followed was tested against repository evidence and found
unsupported (IM-2026-0002) — reclassified rather than discarded, since
the founder judged the idea itself sound as an intentional decision.

**Implications:** Establishes that proposals are evaluated on evidentiary
grounds first, intent second — a proposal failing the evidence test is
not rejected, it is *correctly categorized*.

---

## IM-2026-0004 — Constitutional Domain Architecture (ADR-026)

**Type:** Architectural Discovery
**Status:** Active
**Authority:** Founder
**Related Documents:** None
**Related ADRs:** ADR-026, ADR-027, ADR-028, ADR-029, ADR-030, ADR-031
**Related Books:** None identified
**Related Theory:** None identified
**Keywords:** domain split, Civic, Governance, Shared Platform Services, ownership deferral
**Cross-References:** IM-2026-0005, IM-2026-0006

**Problem:** Res Publica needed a top-level domain split before any
module work could be scoped without ambiguity.

**Proposal:** Civic / Governance / Shared Platform Services.

**Critical review findings (rejected-as-is, not accepted blindly):**
RPCS/Academy ownership was ambiguous between Civic and Governance;
Person and AuditLog raised cross-domain ownership questions; Knowledge
Graph specialization conflicted across domains.

**Resolution:** ADR-026 was written in Draft status; rather than forcing
premature answers, five ownership questions were split into their own
stub ADRs (027–031) and deliberately left unresolved. ADR-026 was later
revised, at the founder's request, to be "constitutionally neutral"
(specifics removed), and the standalone Person ADR was folded into
ADR-027 and deleted.

**Implications:** Established the pattern of *deferring* unresolved
ownership questions into explicit stubs rather than resolving them
under pressure to keep moving — these five questions remain open by
constitutional design as of this entry, and resolving any one of them
is an explicit execution stop condition (IM-2026-0005).

**Produced:** `architecture/adr/ADR-026-constitutional-domain-architecture.md`,
`ADR-027`–`ADR-031` (all currently uncommitted, Draft status).

---

## IM-2026-0005 — Autonomous Execution Charter negotiation

**Type:** Governance Discovery
**Status:** Active
**Authority:** Founder
**Related Documents:** None formally committed
**Related ADRs:** None
**Related Books:** None identified
**Related Theory:** None identified
**Keywords:** execution boundaries, stop conditions, autonomy, delegated authority
**Cross-References:** IM-2026-0004, IM-2026-0007

**Problem:** The founder repeatedly proposed broader autonomous-execution
framings (commits without approval, autonomous agent creation). Each was
met with pushback citing hard operating constraints.

**Alternatives rejected:** Unlimited autonomy with no stop conditions;
session cost/length as an implicit throttle.

**Resolution:** Objective-driven execution — once given an explicit
objective, execute fully without per-step approval — bounded by exactly
six exclusive stop conditions: (1) constitutional contradiction, (2) an
ADR-027–031 ownership decision, (3) LOCKED document modification, (4)
external infrastructure provisioning, (5) destructive operations, (6)
commit/push approval. Cost and pacing were explicitly and repeatedly
excluded as a stop condition by the founder's direct override, even
after being raised multiple times.

**Implications:** This is the operating boundary under which the entire
Foundation Build Order implementation (IM-2026-0008 through 0014) and
the middleware investigation (IM-2026-0015) were executed. All AI-agent
technical discoveries in this record operate under this delegated
authority — the founder retains final constitutional authority.

---

## IM-2026-0006 — Program ≈ Constitutional Business Domain reconciliation

**Type:** Organizational Discovery
**Status:** Active
**Authority:** Founder
**Related Documents:** None
**Related ADRs:** None
**Related Books:** None identified
**Related Theory:** None identified
**Keywords:** Program, Domain, Build Order, Milestone
**Cross-References:** IM-2026-0004

**Problem:** "Phase 2," "Execution Programs," "Build Orders,"
"Milestones," and "Constitutional Business Domains" had been used
somewhat interchangeably across proposals, risking structural ambiguity.

**Resolution:** Program ≈ Constitutional Business Domain (Civic,
Governance) + Shared Platform Services (cross-cutting, non-domain). The
Foundation Build Order is specifically the Civic Domain Program's own
Build Order — not a separate concept.

**Implications:** Gave the Foundation Build Order a precise place in the
larger organizational structure, avoiding a category error where
"build order" and "program" would otherwise be conflated.

---

## IM-2026-0007 — Constitutional Readiness Assessment

**Type:** Governance Discovery
**Status:** Active
**Authority:** Founder
**Related Documents:** None
**Related ADRs:** ADR-002
**Related Books:** None identified
**Related Theory:** None identified
**Keywords:** readiness, Step 1, unblocked objective
**Cross-References:** IM-2026-0005, IM-2026-0008

**Problem:** With domain architecture and execution boundaries settled,
the project needed its first genuinely unblocked executable objective.

**Discovery:** Foundation Build Order Step 1 (Core Domain Model — the
six ADR-002-approved canonical entities) was identified as unblocked by
any of the five deferred ownership questions.

**Decision:** The founder approved this exact objective verbatim:
"Implement the `domain/` layer for the six canonical entities already
approved by ADR-002," with explicit boundaries — do not resolve
ADR-027–031, do not touch LOCKED docs, do not commit without approval,
defer AuditLog's GDPR-erasure activation pending legal sign-off.

**Implications:** This is the objective that began the implementation
phase (IM-2026-0008 through 0014).

---

## IM-2026-0008 — Foundation Build Order Step 1: Core Domain Model

**Type:** Implementation Milestone
**Status:** Active
**Authority:** Founder (delegated execution, IM-2026-0005)
**Related Documents:** `src/domain/*`
**Related ADRs:** ADR-002
**Related Books:** None identified
**Related Theory:** None identified
**Keywords:** domain entities, Person, ConsentRecord, Payment, Organization, Notification, AuditLog
**Cross-References:** IM-2026-0007

Six canonical entities (Person, ConsentRecord, Payment, Organization,
Notification, AuditLog) implemented as pure, functional, immutable-once-
settled domain logic in `src/domain/`. GDPR-erasure pseudonymization
implemented but structurally gated behind `AUDIT_LOG_ERASURE_LEGALLY_APPROVED
= false`, pending legal sign-off — a deliberate incomplete-activation
pattern, not an oversight.

---

## IM-2026-0009 — Foundation Build Order Steps 2–4: Plugin Architecture, CLI, Local Dev Workflow

**Type:** Implementation Milestone
**Status:** Active
**Authority:** Founder (delegated execution, IM-2026-0005)
**Related Documents:** `src/modules/manifest.ts`, `src/modules/registry.ts`, `scripts/cli.mjs`, `src/local-dev/*`
**Related ADRs:** ADR-003
**Related Books:** None identified
**Related Theory:** None identified
**Keywords:** plugin architecture, CLI, local dev workflow, tsx
**Cross-References:** IM-2026-0008

Plugin Architecture manifest/registry (ADR-003) built with uniqueness
enforcement across module names and database tables. CLI baseline
established. Local Dev Workflow implemented as repository-local
fixtures/mocks only — no real database, no external API — resolved via
installing `tsx` as a devDependency to unify Node-ESM and tsc-bundler
module resolution, rather than repeating a temporary-extension
workaround for every future module.

---

## IM-2026-0010 — MVP Modules 1–9

**Type:** Implementation Milestone
**Status:** Active
**Authority:** Founder (delegated execution, IM-2026-0005)
**Related Documents:** `src/modules/{knowledge-graph,ai-layer,publishing,community,membership,events,dashboard,crm,analytics}/*`, `mvp-module-blueprint.md`
**Related ADRs:** ADR-003, ADR-007, ADR-008
**Related Books:** None identified
**Related Theory:** None identified
**Keywords:** knowledge graph, ai layer, publishing, community, membership, events, dashboard, crm, analytics
**Cross-References:** IM-2026-0011, IM-2026-0012, IM-2026-0013, IM-2026-0014

Knowledge Graph → AI Layer → Publishing → Community → Membership →
Events → Dashboard → CRM → Analytics, implemented in ratified dependency
order, each genuinely integrating with prior modules' real exported
functions rather than duplicating them (e.g., Publishing calls AI
Layer's `queryAILayer` directly; Community reuses `domain/consent`
rather than reimplementing it; Membership calls `domain/payment`'s
`settlePayment` directly).

---

## IM-2026-0011 — AI Layer cost-ceiling bug

**Type:** Architectural Discovery
**Status:** Active
**Authority:** Founder (delegated execution, IM-2026-0005)
**Related Documents:** `src/modules/ai-layer/query.ts`, `src/modules/ai-layer/ai-layer.test.ts`
**Related ADRs:** ADR-008
**Related Books:** None identified
**Related Theory:** None identified
**Keywords:** cost governance, spend ceiling, regression test, retroactive vs. prospective check
**Cross-References:** IM-2026-0010

**Problem:** `queryAILayer`'s spend-ceiling check was retroactive
(`if (isOverCeiling(ledger))`), true only once spend was *already* at or
over the ceiling — meaning exactly one query could push spend
arbitrarily far past the configured limit.

**Discovery method:** Caught by the module's own regression test, not
by inspection.

**Fix:** Made the check prospective — compare `totalSpend + estimatedCost`
against the ceiling *before* the query executes.

**Implications:** Directly validated the practice of writing tests
alongside each module rather than after — this was the first concrete
proof of that practice's value this session.

---

## IM-2026-0012 — Membership lifecycle bug

**Type:** Architectural Discovery
**Status:** Active
**Authority:** Founder (delegated execution, IM-2026-0005)
**Related Documents:** `src/modules/membership/community-integration.ts`, `src/modules/membership/membership.test.ts`, `MEMBER_PROFILE.md`
**Related ADRs:** None
**Related Books:** None identified
**Related Theory:** None identified
**Keywords:** lifecycle, sequential transition, regression test, status skip
**Cross-References:** IM-2026-0010

**Problem:** `reviewStatusFromCommunityStanding` allowed a direct
`registered` → `active` transition, skipping the documented mandatory
`verified` step.

**Discovery method:** Caught by a regression test asserting the
documented sequential lifecycle from `MEMBER_PROFILE.md`.

**Fix:** Restricted the community-standing-based promotion to
already-`verified` members only — the correct behavior per the
lifecycle's own sequential design, not merely a test-satisfying patch.

---

## IM-2026-0013 — MVP Architectural Review finding

**Type:** Governance Discovery
**Status:** Active
**Authority:** Founder (delegated execution, IM-2026-0005)
**Related Documents:** `src/modules/crm/membership-integration.ts`, `mvp-module-blueprint.md`
**Related ADRs:** None
**Related Books:** None identified
**Related Theory:** None identified
**Keywords:** architectural review, dependency gap, CRM, Membership, data siloing
**Cross-References:** IM-2026-0010

**Problem:** A full architectural review (constitutional compliance, ADR
compliance, module boundaries, duplication, dependency graph, manifest/
bootstrap consistency) was required before the MVP tier could be
considered complete.

**Discovery:** CRM's documented dependency on Membership System
(`mvp-module-blueprint.md` §8) had been implemented in every module
*except* CRM, which only referenced `Organization`/`Payment` directly.

**Fix:** Added `crm/membership-integration.ts` (`sharesOrganization()`),
closing the exact "data siloing" risk the module's own specification
named.

**Implications:** Confirms the review step itself found a real,
non-trivial gap — validating "architectural completeness" as a genuine
gate, not a formality.

---

## IM-2026-0014 — MVP milestone committed and pushed

**Type:** Implementation Milestone
**Status:** Active
**Authority:** Founder
**Related Documents:** commit `9f9ec5f`
**Related ADRs:** None
**Related Books:** None identified
**Related Theory:** None identified
**Keywords:** commit, push, scope verification, unrelated unpushed commits
**Cross-References:** IM-2026-0001, IM-2026-0010

Commit `9f9ec5f` (94 files, 5,266 insertions) — the full domain layer,
plugin architecture, CLI, local dev workflow, and 9 MVP modules.
Committed only after the review in IM-2026-0013, staged precisely
(verified no ADR file, no LOCKED document, no unrelated file included),
and pushed only after surfacing to the founder that local `main` was 11
commits ahead of `origin/main` from unrelated prior EAO work — the push
would publish all 12 commits together, not this milestone in isolation.
Explicit confirmation was obtained before pushing.

**Implications:** Established the practice of surfacing hidden scope
(unrelated unpushed commits) *before* an irreversible shared-state
action, rather than after.

---

## IM-2026-0015 — Middleware root-path 404 investigation

**Type:** Architectural Discovery
**Status:** Active
**Authority:** Founder
**Related Documents:** `middleware.ts`, `scripts/check-structure.mjs`, `AGENTS.md`
**Related ADRs:** ADR-012
**Related Books:** None identified
**Related Theory:** None identified
**Keywords:** middleware, matcher, Next.js, contradiction resolution, unresolved root cause
**Cross-References:** None

**Problem:** Production `/` returned 404 instead of redirecting to
`/de`.

**Investigation evolution (preserved in full, not summarized away):**

1. Initial diagnosis (**incorrect**): `middleware.ts` was at the project
   root; assumed Next.js's generic `src/` convention meant it needed to
   move to `src/middleware.ts`. Moved it.
2. **Contradiction surfaced by the founder:** the repository's own
   `scripts/check-structure.mjs` guard explicitly requires middleware at
   the project root and treats `src/middleware.ts` as a stray duplicate
   — directly contradicting step 1. The founder stopped implementation
   and demanded evidence-based resolution rather than either diagnosis
   being assumed correct.
3. **Resolution:** Direct inspection of this build's own compiled
   `node_modules/next/dist/lib/constants.js` showed
   `MIDDLEWARE_LOCATION_REGEXP = "(?:src/)?middleware"` — Next.js itself
   supports *both* locations natively. The repo's root-only requirement
   is a local policy choice (`check-structure.mjs`, tied to ADR-012 and
   the historical removal of `proxy.ts`), not a Next.js constraint. The
   original "wrong location" diagnosis was therefore incorrect on its
   own terms — root was already correct; something else explained the
   failure.
4. **Independently confirmed real bug:** the matcher's backslash-escaped
   dot (`.*\..*`, meant to exclude static-file paths) was silently
   unescaped by this build's path-to-regexp-based matcher compiler into
   a bare `.` wildcard, verified by direct execution of this build's own
   `tryToParsePath`. Fixed using a character class (`[.]`) instead,
   empirically validated against `/`, `/de`, `/en`, `/fa`, unprefixed
   paths, `api`, `_next/static`, `_next/image`, and extensioned files.
5. **Open finding, not yet resolved:** even with root placement, the
   fixed matcher, and a cleared `.next` cache — in both `next dev` and
   `next build` — `middleware-manifest.json` remains empty and `/`
   still 404s. The matcher fix is correct and committed (`972942b`), but
   does not by itself explain why middleware never registers as a build
   entry point at all. Suspected but unconfirmed cause: this installed
   Next.js build (`15.5.20`, not a real release line; `package.json`
   declares `^15.3.0`) may have middleware file-detection altered or
   disabled, consistent with `AGENTS.md`'s explicit warning that this is
   not the Next.js documented in training data.

**Implications:** This entry is the clearest example this session of why
reasoning must be preserved rather than summarized to a conclusion — the
first diagnosis was wrong, was corrected only because the founder
demanded evidence over assumption, and the true root cause is still
open. A future agent reading only "middleware was fixed" would
mis-learn the wrong lesson.

**Produced:** commit `972942b` (matcher fix only, location reverted to
root).

---

## IM-2026-0016 — "Architecture of the Digital Res Publica"

**Type:** Theoretical Discovery
**Status:** Active
**Authority:** Founder
**Related Documents:** `ORGANIZATIONAL_ARCHITECTURE.md`
**Related ADRs:** None
**Related Books:** None identified
**Related Theory:** None identified
**Keywords:** organizational architecture, institutional memory, thesis, medium
**Cross-References:** IM-2026-0002, IM-2026-0004

**Problem:** After a large volume of both governance/constitutional
documentation and executable module code had accumulated, the project
needed a stated thesis for what the repository *is*.

**Discovery, authored by the founder:** the repository is not primarily
a software repository — it is an Organizational Architecture Repository.
Every instruction, ADR, specification, and governance rule is an
organizational distinction; together they form the architecture of a
digital institution; source code is the operational layer through which
that architecture is realized, not the architecture itself.

**Constitutional handling:** per the rule in IM-2026-0002, this was
recorded explicitly as a **Founder Constitutional Decision**, dated and
attributed — not presented as something discovered in pre-existing
evidence, since it did not exist in the repository before this session.

**Caveat recorded alongside it:** as of this entry, the thesis describes
an intended and partially realized condition — the organizational
distinctions in `brain/GOVERNANCE/` and the ADRs are encoded as tested,
internally consistent executable logic in `src/domain/` and
`src/modules/`, but that logic is not yet connected to any user-facing
surface, API, or persistence layer, and five ownership questions
(IM-2026-0004) remain deliberately open.

**Produced:** `brain/GOVERNANCE/ORGANIZATIONAL_ARCHITECTURE.md`.

---

## IM-2026-0017 — Institutional Memory itself established

**Type:** Constitutional Discovery
**Status:** Active
**Authority:** Founder
**Related Documents:** `INSTITUTIONAL_MEMORY.md`
**Related ADRs:** None
**Related Books:** None identified
**Related Theory:** None identified
**Keywords:** institutional memory, historical record, permanent asset, entry metadata schema
**Cross-References:** IM-2026-0002

**Problem:** Significant reasoning produced across this project's
history — architectural corrections, rejected alternatives, governance
negotiations — existed only in conversation, at risk of being lost to
summarization or session boundaries.

**Decision, by founder instruction:** every significant constitutional,
architectural, organizational, governance, or theoretical discovery, and
every implementation milestone, is to be recorded as permanent
institutional memory going forward — this document is the result,
governed by the same non-discovery rule (IM-2026-0002) as everything
else: this practice did not pre-exist; it is being introduced now,
explicitly, by founder instruction dated 2026-07-07.

**Schema addendum (2026-07-08):** the founder introduced the formal
entry metadata schema (`ID`, `Type`, `Status`, `Authority`, `Related
Documents`, `Related ADRs`, `Related Books`, `Related Theory`,
`Keywords`, `Cross-References`) and reclassified this entry's own Type
from Governance Discovery to **Constitutional Discovery** — correctly,
since this entry is a rule about how the project's own historical
record works, not an execution-boundary decision.

**Scope acknowledgment:** this document's entries are a first-pass
reconstruction from the working session's available context, not a
guaranteed-complete history — later, more granular discoveries not
captured here should be added as they are identified, rather than this
document being treated as closed.

**Implications:** Going forward, significant discoveries should be
appended here chronologically as they occur, each following the format
established in IM-2026-0001 through IM-2026-0016: ID, Type, Status,
Authority, Related Documents/ADRs/Books/Theory, Keywords,
Cross-References, then problem, discovery/decision, reasoning, rejected
alternatives where applicable, and implications.
