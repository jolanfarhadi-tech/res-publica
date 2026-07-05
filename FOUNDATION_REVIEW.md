# Res Publica — Foundation Review

*Architecture Review Gate. Produced at the close of the Foundation Architecture phase, before any Phase 1 implementation begins. Scope: every artifact produced this session (Engineering Audit, Security Audit, Product Vision, Experience Blueprint, Operating System, Master Product Blueprint, MVP Module Blueprint, Foundation Architecture — including the ECC Agent System, Plugin Architecture, CLI Architecture, Local Development Workflow, Integration Map, Entity Model, Folder Structure, and Deployment Topology), validated across 20 dimensions. This is a review document. No source code, no implementation.*

---

## Executive Summary

The Foundation is coherent, internally disciplined, and unusually well cross-checked for a purely planning-stage effort — this is the third reconciliation pass this session (after the Master Product Blueprint's dependency-map correction and the Foundation Architecture document's domain-model unification), and each pass has caught real errors the previous one missed. This review continues that pattern rather than breaking it: validating across all 20 required dimensions surfaced **six concrete, fixable issues** — two newly-found entity/naming duplications, one ownership ambiguity, one directional error in this session's own integration map, one missing connection in that same map, and one folder-path inconsistency introduced by this very review's instructions. None require redesign. All are documentation-level corrections, estimated at a few hours of editing, not new architecture work.

**Recommendation: NO — requires additional architecture work**, narrowly scoped to the Approval Checklist below.

---

## Strengths

- **The domain model unification (Foundation Architecture, Section 2) caught real duplication before any code existed** — Person, Consent, Payment, and Organization had each been independently defined 2–4 times across the 9 MVP module specs, produced by five parallel drafting teams. Catching this at the planning stage, rather than after nine separate database schemas were built, is exactly what a Foundation phase is for.
- **Every module, at every level of detail (Master Blueprint, MVP Blueprint, Foundation Architecture), carries an explicit "what must NOT be built" section.** This is a genuinely uncommon discipline and is the main reason scope has stayed bounded across eight major documents.
- **The platform's standing principles are applied consistently, not just stated once and forgotten**: zero gamification, AI never originates institutional positions, nothing publishes without named human sign-off, personalization is opt-in with anonymous use always preserved, and success is measured by civic effect rather than attention — these appear, correctly applied to context, in every module's Risks and "must not build" sections.
- **The build order respects real dependencies**, not just stated priority labels — the MVP Module Blueprint's sequencing (Knowledge Graph → AI Layer → Publishing → Community → Membership → Events → Dashboard → CRM → Analytics) was checked against each module's actual `Dependencies` field, not assigned arbitrarily.
- **Security and engineering audit findings from earlier in this session are already reflected in later architectural decisions** — e.g., the Events module's risk list explicitly invokes the newsletter endpoint's prior lack of rate limiting as the reason its own registration form must be built with abuse-resistance from day one, rather than treating that lesson as isolated to the original finding.
- **Resourcing assumptions stay realistic throughout** — every document assumes a 1–3 engineer nonprofit team, not a well-funded startup, and several architectural choices (a single EU region rather than multi-region replication, a documented roster rather than an immediately-automated 8-agent CI gate) are explicitly justified by that constraint rather than defaulting to over-engineering.

---

## Weaknesses

1. **Moderation-queue entity duplicated across two modules.** Publishing owns `ModerationQueueEntry` (Operating System, Section 15; MVP Module Blueprint, Section 3) with its own "Moderation Queue" API. Admin Portal independently defines `ModerationQueueItem` (Operating System, Section 17) with its own, separately-named "Moderation Queue" API. These are the same real-world concept, drafted independently by two different parallel teams, with two different entity names and two modules each claiming ownership.
2. **Fellowship-nomination entity duplicated the same way.** Fellowship System owns `FellowNomination` (Master Product Blueprint, Section 5). Admin Portal independently defines `FellowshipNomination` (Operating System, Section 17; Master Product Blueprint, Section 17). Same pattern as (1): one real concept, two names, two claimed owners.
3. **AI cost-tracking ownership is not explicitly stated.** AI Layer owns `CostGovernanceLedger` (raw, per-query spend tracking). Analytics independently defines its own `Spend Ledger` and `AI Usage Record`. Nothing in either module's spec states that Analytics should *read* AI Layer's data rather than maintaining a second, independent ledger — as currently written, both modules could plausibly be implemented as separate sources of truth for the same number.
4. **A directional error in this session's own integration map.** Foundation Architecture, Section 7, states: "Community → Events: Real-world-touchpoint triggers (a registration is a ladder signal)." This is backwards. A registration is created *in* Events; the signal should flow *from* Events *to* Community, not the reverse as currently written. This is a genuine error in a document this session itself produced and is exactly the kind of thing a review gate exists to catch.
5. **A missing connection in the same integration map.** Analytics' own `Dependencies` field (MVP Module Blueprint, Section 9; Master Product Blueprint, Section 18) names Membership System as a dependency, but no Membership → Analytics row exists in Foundation Architecture's Section 7 integration table. The dependency is declared but the actual data flow was never drawn.
6. **A folder-path inconsistency, introduced by this review's own instructions.** Foundation Architecture's proposed folder structure (Section 1) placed this kind of documentation under `docs/architecture/`. This review's instructions specify `architecture/adr/` at repo root instead. This document adopts the repo-root convention as authoritative going forward; Foundation Architecture's folder-structure section should be updated to match in the next documentation pass, so the two documents don't silently disagree.

---

## Architectural Risks

- **Process-to-team-size ratio.** Nine modules, eight new specialized agents, one CLI, and one plugin manifest contract is a substantial amount of structure for a 1–3 engineer team to build *and* maintain simultaneously. The Foundation Architecture document already flags this; this review confirms it remains the single largest cross-cutting risk and recommends introducing the ECC Agent System's roles incrementally (Responsibility Agent and Review & Validation Agent first, as previously noted) rather than all eight at once.
- **AI Layer as a single chokepoint.** Every module wanting AI capability routes through one shared service by design (ADR-008) — correct architecturally, but it means an AI Layer outage or cost-ceiling trip has platform-wide blast radius. The keyword-search fallback mitigates this for query answering specifically, but Publishing's draft-authoring and Events' logistics Q&A have no equivalent stated fallback behavior of their own.
- **Person as the largest privacy-sensitive surface.** Unifying identity into one canonical entity (correctly, per ADR-002) also means a single breach or misconfiguration now has platform-wide reach, where previously it would have been contained to whichever module's duplicate table was compromised. This trade-off is worth an explicit access-control design pass before Phase 1, not just an implicit assumption that "opt-in and GDPR-compliant" is sufficient.
- **Async connections are only real if the mechanism behind them is real.** The integration map marks most module-to-module connections "async (event-driven)," but no event/queue infrastructure has actually been specified yet. If these are implemented as direct synchronous calls under time pressure, the stated resilience property (downstream modules never blocking upstream ones) becomes false without anyone having decided that on purpose.

---

## Technical Debt

- **No shared Notification/Messaging infrastructure exists**, despite at least four modules (Events, Membership, Community, CRM) independently needing to send emails or notifications. This was never modeled as a domain entity or module — it is currently an implicit assumption inside each module's own API list (e.g., Events' "Participant Notification API," Membership's "Process Renewal" failure messaging, Community's "Generate Invitation"). Recommend adding a canonical `domain/notification/` entity, following the same pattern already used for `Payment` in ADR-002, before Phase 1 begins.
- **The live repository's original Engineering Audit and Security Audit P0 items predate this session's architecture work and their current status is unconfirmed.** Deleting the broken duplicate locale-routing file, adding a content-read caching layer, sanitizing slugs before filesystem access, and adding newsletter rate limiting were all identified as P0 in the very first phase of this session — before any of the subsequent product/architecture work began. Since Core Platform (which everything else depends on) is exactly where these live, their status should be confirmed, not assumed resolved, before Phase 1 implementation begins building on top of it.
- **The Plugin Architecture's manifest contract has only been spot-checked against 2 of the 9 MVP modules** (Events and Community, both confirmed to fit the manifest shape cleanly during this review). A full pass against all 9 — and ideally a forward-check against at least one V2 module's likely needs — is recommended before treating the contract as validated.

---

## Missing Components

- **Notification/Messaging shared infrastructure** (see Technical Debt above).
- **No data-retention/deletion policy for `AuditLog`.** GDPR erasure is already an explicit API in the Personalization/Membership specs, but `AuditLog` is defined as append-only and immutable by design (ADR-002's intent). These two properties are in direct tension for any audit entry that references a person who later exercises their right to erasure, and the architecture does not yet say which one wins, or how.
- **No explicit access-control statement for AI Layer's Moderator-Synthesis Assist endpoint.** It is described throughout as staff-facing, but no document states that it is *restricted* to staff — an omission worth closing before this becomes a real, callable API.

---

## Recommended Improvements

1. Rename Admin Portal's `ModerationQueueItem` out of existence; Admin Portal should reference Publishing's `ModerationQueueEntry` directly rather than defining its own.
2. Rename Admin Portal's `FellowshipNomination` out of existence; Admin Portal should reference Fellowship System's `FellowNomination` directly.
3. Add one sentence to both AI Layer's and Analytics' specs: AI Layer owns and writes the raw cost/usage ledger; Analytics reads and aggregates it, and defines no independent ledger of its own.
4. Correct Foundation Architecture Section 7's Community/Events row direction: Events → Community, not Community → Events.
5. Add the missing Membership → Analytics row to that same integration table.
6. Update Foundation Architecture's folder-structure section to use `architecture/` at repo root, matching this review's convention, rather than `docs/architecture/`.
7. Add a `domain/notification/` canonical entity to the Core Domain Model, mirroring `domain/payment/`'s pattern.
8. Resolve (or explicitly, deliberately defer with stated rationale) the `AuditLog`-vs-GDPR-erasure tension before any module that writes to `AuditLog` reaches Phase 1 implementation.
9. State explicitly that AI Layer's Moderator-Synthesis Assist endpoint is staff-only, not public.
10. Confirm (or re-open) the original Engineering/Security Audit's P0 items against the live repository before Phase 1 work begins on Core Platform.

---

## Open Questions

- Should Notification/Messaging be a `domain/` entity (parallel to `Payment`) or its own thin module? This review recommends the `domain/` entity pattern for consistency, but it is a genuine open call rather than a foregone conclusion.
- How should GDPR erasure interact with the append-only `AuditLog` principle — redaction-in-place with a documented exception, a separate erasure-tombstone pattern, or something else? This is as much a legal/policy decision as an engineering one and should not be resolved by an engineer's default assumption alone.
- Is the 1–3 engineer team assumption underlying the ECC Agent System and CLI investment still accurate? If the team is larger (or expected to grow faster) than assumed, the "introduce agents incrementally" recommendation in this review's Architectural Risks section may be overly conservative.

---

## Approval Checklist

- [ ] Moderation-queue entity duplication resolved (Publishing owns it; Admin Portal references it, does not redefine it)
- [ ] Fellowship-nomination entity duplication resolved (Fellowship System owns it; Admin Portal references it, does not redefine it)
- [ ] AI cost-tracking ownership stated explicitly (AI Layer owns the raw ledger; Analytics aggregates only)
- [ ] Integration map's Events↔Community connection direction corrected
- [ ] Integration map's Membership→Analytics connection added
- [ ] Folder-structure convention reconciled (`architecture/` at repo root, not `docs/architecture/`)
- [ ] Notification/Messaging gap addressed — either modeled as a `domain/` entity or explicitly accepted as a near-term gap with stated rationale
- [ ] `AuditLog` vs. GDPR-erasure tension resolved, or explicitly deferred with documented reasoning
- [ ] AI Layer's Moderator-Synthesis Assist endpoint explicitly documented as staff-only
- [ ] Original Engineering Audit / Security Audit P0 items confirmed fixed in the live repository, or explicitly re-sequenced against this Foundation's build order

---

## Production Readiness Score: 15 / 100

No application code has been written for any architecture produced this session. The live repository remains the original static site, plus whatever subset of the original P0 engineering/security fixes have or have not been applied (status unconfirmed — see Technical Debt). This score answers "if asked to serve real users today," not "is the plan good" — those are different questions, and the plan scores much higher on the second one.

## Implementation Readiness Score: 78 / 100

The plan is unusually thorough and has now been cross-checked three times this session, each pass catching real errors the previous one missed — a healthy sign, not a concerning one. The score is held out of the 90s specifically because this review just surfaced ten concrete, unresolved checklist items. Once those close, the honest score would move meaningfully higher; it is not being withheld out of general caution.

---

## Final Recommendation

**NO — requires additional architecture work.**

This is a narrow, fast-closing NO, not a fundamental one. All ten Approval Checklist items above are documentation-level corrections — renaming two duplicated entities to reference their real owners, stating one ownership rule in two module specs, fixing one arrow direction and adding one missing row in an integration table, reconciling one folder-path convention, modeling one missing shared entity, resolving one policy tension, adding one access-control sentence, and confirming the status of pre-existing audit findings. None require new research, new stakeholder input beyond the two genuinely open policy questions, or architectural redesign. Once closed, the honest recommendation flips to YES — this review exists to make sure that flip happens deliberately, with eyes open, rather than by default.
